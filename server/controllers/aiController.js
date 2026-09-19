// HTTP handlers for the AI assistant.
//
// Two endpoints sharing one core: a public supporter assistant grounded in approved
// campaigns, and an authenticated campaign writing helper. Neither can write anything —
// there is no path from here to a mutation, by design.

import { isConfigured, chatComplete, AiError } from '../services/aiService.js';
import {
  SUPPORTER_SYSTEM_PROMPT,
  HELPER_SYSTEM_PROMPT,
  CAMPAIGN_CATEGORIES,
  buildSupporterContext,
  buildCampaignHelperContext,
} from '../services/aiContext.js';

const MAX_MESSAGE_CHARS = 500;
const MAX_HISTORY_TURNS = 6;
const MAX_HISTORY_CHARS = 4000;
const MAX_TAGS = 8; // must match the create-campaign form's own limit

const squash = (text, limit) => String(text || '').replace(/\s+/g, ' ').trim().slice(0, limit);

/**
 * Rebuild the conversation history from untrusted client input.
 *
 * The client supplies this array, so it may contain a `system`, `developer`, or `tool`
 * role aimed at overriding our instructions. We never forward it as-is: only
 * `user`/`assistant` with plain string content survive, and the real system prompt is
 * inserted server-side where a client can never occupy that slot.
 */
const sanitizeHistory = (raw) => {
  if (!Array.isArray(raw)) return [];

  const cleaned = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    if (item.role !== 'user' && item.role !== 'assistant') continue;
    if (typeof item.content !== 'string') continue; // rejects multimodal array payloads
    const content = item.content.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!content) continue;
    cleaned.push({ role: item.role, content });
  }

  // Keep the most recent turns, then enforce a total character budget oldest-first.
  const capped = cleaned.slice(-MAX_HISTORY_TURNS);
  let total = capped.reduce((sum, entry) => sum + entry.content.length, 0);
  while (capped.length > 1 && total > MAX_HISTORY_CHARS) {
    total -= capped.shift().content.length;
  }
  return capped;
};

/** Try the raw string, then a fenced code block. No further guessing (see plan). */
const parseJsonLoose = (text) => {
  const raw = String(text || '').trim();
  const fenced = raw.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);

  for (const candidate of [raw, fenced ? fenced[1].trim() : null]) {
    if (!candidate) continue;
    try {
      return JSON.parse(candidate);
    } catch {
      // fall through to the next candidate
    }
  }
  return null;
};

/**
 * Keep only the four fields we asked for, normalised to what the form can accept.
 *
 * `category` is matched case-insensitively against the known list and emitted in its
 * canonical casing. Anything else is dropped to an empty string — the create form's
 * Category control is built from that same list, so an unrecognised value would be
 * written into the form as an option the user cannot see or re-select.
 */
const normalizeSuggestions = (parsed) => {
  if (!parsed || typeof parsed !== 'object') return null;

  const title = typeof parsed.title === 'string' ? squash(parsed.title, 120) : '';
  const description =
    typeof parsed.description === 'string' ? parsed.description.trim().slice(0, 1500) : '';

  const rawCategory = typeof parsed.category === 'string' ? parsed.category.trim() : '';
  const category =
    CAMPAIGN_CATEGORIES.find((name) => name.toLowerCase() === rawCategory.toLowerCase()) || '';

  const tags = [];
  const seen = new Set();
  if (Array.isArray(parsed.tags)) {
    for (const entry of parsed.tags) {
      if (typeof entry !== 'string') continue;
      const tag = entry.replace(/^#/, '').trim();
      if (!tag || seen.has(tag.toLowerCase())) continue;
      seen.add(tag.toLowerCase());
      tags.push(tag);
      if (tags.length >= MAX_TAGS) break;
    }
  }

  if (!title && !description && !category && tags.length === 0) return null;
  return { title, category, description, tags };
};

const respondUnavailable = (res) =>
  res.status(503).json({
    success: false,
    message: 'Assistant unavailable',
    error: 'The assistant is currently unavailable. Please try again later.',
  });

/** Map service errors to client-safe responses. Upstream detail is logged, never sent. */
const handleAiError = (error, res, label) => {
  if (error instanceof AiError) {
    if (error.logDetail) console.error(`[ai] ${label} upstream:`, error.logDetail);
    return res.status(error.status).json({
      success: false,
      message: label,
      error: error.message,
    });
  }
  console.error(`[ai] ${label} unexpected:`, error);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: 'Something went wrong. Please try again.',
  });
};

/**
 * POST /api/ai/assistant — public, anonymous traffic allowed.
 *
 * Carries no user identity into the model: the context is public campaign rows only,
 * never donations, emails, or university IDs.
 */
export const assistant = async (req, res) => {
  try {
    const { message, history } = req.body || {};

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'Please type a question.',
      });
    }

    if (!isConfigured()) return respondUnavailable(res);

    const question = message.trim().slice(0, MAX_MESSAGE_CHARS);
    const turns = sanitizeHistory(history);

    // A follow-up like "which of those is closest to its goal?" only retrieves
    // anything sensible if the previous question is included, so retrieval sees both.
    const lastUserTurn = [...turns].reverse().find((entry) => entry.role === 'user');
    const retrievalQuery = [lastUserTurn?.content, question].filter(Boolean).join(' ');
    const context = await buildSupporterContext(retrievalQuery);

    const { content } = await chatComplete({
      system: SUPPORTER_SYSTEM_PROMPT.replace('{context}', context.text),
      messages: [...turns, { role: 'user', content: question }],
    });

    return res.status(200).json({
      success: true,
      message: 'Assistant reply generated',
      data: { reply: content, matchedCampaigns: context.matched },
    });
  } catch (error) {
    return handleAiError(error, res, 'Assistant');
  }
};

/**
 * POST /api/ai/campaign-helper — authenticated.
 *
 * Suggests a title, category, description, and tags from the creator's short idea (and
 * whatever draft they already have). Nothing is persisted: this returns text and the
 * client decides whether to apply it.
 */
export const campaignHelper = async (req, res) => {
  try {
    const { idea, title, description, category, tags, goalAmount } = req.body || {};

    // `idea` is the wizard's normal entry point, so an otherwise empty form is valid —
    // only a request with no starting point at all is rejected.
    const hasDraft = [idea, title, description, category].some(
      (value) => typeof value === 'string' && value.trim()
    );
    if (!hasDraft) {
      return res.status(400).json({
        success: false,
        message: 'Nothing to work with',
        error: 'Describe your campaign idea first, then ask for suggestions.',
      });
    }

    if (!isConfigured()) return respondUnavailable(res);

    const numericGoal = Number(goalAmount);
    const context = buildCampaignHelperContext({
      idea: typeof idea === 'string' ? idea.trim().slice(0, MAX_MESSAGE_CHARS) : '',
      title,
      description,
      category,
      tags,
      goalAmount: Number.isFinite(numericGoal) && numericGoal > 0 ? numericGoal : null,
    });

    const { content } = await chatComplete({
      system: HELPER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: context }],
      jsonMode: true,
    });

    const suggestions = normalizeSuggestions(parseJsonLoose(content));
    if (!suggestions) {
      // Fail soft: the form stays untouched and the page keeps working.
      console.error('[ai] Campaign helper returned unusable output:', content.slice(0, 300));
      return res.status(200).json({
        success: false,
        message: 'Could not generate suggestions',
        error: 'The assistant returned something unusable. Please try again.',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Suggestions generated',
      data: suggestions,
    });
  } catch (error) {
    return handleAiError(error, res, 'Campaign helper');
  }
};
