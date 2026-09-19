// OpenAI-compatible client for the FundCamp AI assistant.
//
// This is the only module that knows which provider backs the assistant. Everything
// else deals in system prompts and message arrays, so swapping providers later is a
// change here rather than a rewrite anywhere else.
//
// Config is read lazily, per call — never at import time. A missing key must never
// stop the server from booting, because CI and the deploy workflow both run
// `docker compose up --wait` against a .env.example that deliberately ships no key.

const DEFAULTS = {
  BASE_URL: 'https://api.groq.com/openai/v1',
  MODEL: 'openai/gpt-oss-120b',
  // The models this has run against (deepseek-v4-flash, gpt-oss-120b) are reasoning
  // models: they emit reasoning tokens before the real answer, and those count against
  // max_tokens. At 400 the helper truncated mid-reasoning roughly half the time and
  // returned empty content. 1500 leaves room for both; actual usage averages ~600, and
  // billing follows real tokens, not the cap.
  MAX_TOKENS: 1500,
  TIMEOUT_MS: 20000,
};

const readConfig = () => ({
  baseUrl: String(process.env.AI_BASE_URL || DEFAULTS.BASE_URL).replace(/\/+$/, ''),
  model: process.env.AI_MODEL || DEFAULTS.MODEL,
  apiKey: process.env.AI_API_KEY || '',
  enabled: String(process.env.AI_ENABLED || '').toLowerCase() === 'true',
  maxTokens: Number.parseInt(process.env.AI_MAX_TOKENS, 10) || DEFAULTS.MAX_TOKENS,
  timeoutMs: Number.parseInt(process.env.AI_TIMEOUT_MS, 10) || DEFAULTS.TIMEOUT_MS,
});

/**
 * Error carrying the HTTP status the browser should see. `logDetail` holds upstream
 * output for server-side logging only and is never sent to the client.
 */
export class AiError extends Error {
  constructor(message, status = 502, logDetail = '') {
    super(message);
    this.name = 'AiError';
    this.status = status;
    this.logDetail = logDetail;
  }
}

/** True only when the assistant is both switched on and has a key. Checked per request. */
export const isConfigured = () => {
  const { apiKey, enabled } = readConfig();
  return enabled && apiKey.trim() !== '';
};

/**
 * One chat completion.
 *
 * `messages` must already be sanitized by the caller — this function performs no
 * role filtering of its own. `system` is always inserted server-side.
 *
 * With `jsonMode`, we ask for a JSON object via response_format and retry once
 * without it if the provider rejects the parameter. Whether AgentRouter honours it
 * is unverified, so we must not depend on it.
 */
export const chatComplete = async ({ system, messages, jsonMode = false }) => {
  const config = readConfig();

  if (!config.enabled) {
    throw new AiError('The assistant is currently unavailable.', 503);
  }
  if (!config.apiKey.trim()) {
    throw new AiError('The assistant is not configured.', 503);
  }

  const buildPayload = (withJsonMode) => {
    const payload = {
      model: config.model,
      messages: [...(system ? [{ role: 'system', content: system }] : []), ...messages],
      max_tokens: config.maxTokens,
      temperature: 0.4,
    };
    if (withJsonMode) payload.response_format = { type: 'json_object' };
    return payload;
  };

  const send = async (payload) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs);
    try {
      return await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  };

  let response;
  try {
    response = await send(buildPayload(jsonMode));

    // Some OpenAI-compatible providers 400 on response_format. Retry once without it
    // rather than failing the request over an optional optimisation.
    if (jsonMode && response.status === 400) {
      response = await send(buildPayload(false));
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new AiError('The assistant took too long to respond. Please try again.', 504);
    }
    throw new AiError('Could not reach the assistant service. Please try again.', 502, error.message);
  }

  if (!response.ok) {
    // Read the body for server-side logging only — upstream errors can echo back
    // request details we don't want to hand to the browser.
    const detail = await response.text().catch(() => '');
    const isRateLimited = response.status === 429;
    throw new AiError(
      isRateLimited
        ? 'The assistant is busy right now. Please try again shortly.'
        : 'The assistant service returned an error. Please try again.',
      isRateLimited ? 429 : 502,
      `HTTP ${response.status}: ${detail.slice(0, 500)}`
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new AiError('The assistant returned an unreadable response. Please try again.', 502, error.message);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || content.trim() === '') {
    throw new AiError(
      'The assistant returned an empty response. Please try again.',
      502,
      JSON.stringify(data).slice(0, 500)
    );
  }

  return { content: content.trim(), usage: data.usage || null };
};
