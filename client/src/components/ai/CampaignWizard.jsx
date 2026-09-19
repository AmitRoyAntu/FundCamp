import React, { useState } from 'react';
import { Sparkles, Loader2, Check, Send, X, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import { aiService } from '../../services/aiService';
import { CAMPAIGN_CATEGORIES } from '../../constants/categories';

const MAX_IDEA_CHARS = 500;
const MAX_TAGS = 8;
// Mirrors the create form's own rules, so a suggestion that satisfies these needs no
// correction after it is applied.
const TITLE_MIN_CHARS = 10;
const DESCRIPTION_MIN_CHARS = 30;

// Fixed, rendered client-side. There is no reason to spend a model call asking a
// question whose answer never changes — the first API call happens once the creator
// has actually told us something.
const OPENING_QUESTION = 'What type of campaign do you want to create?';

const formatList = (items) => {
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
};

/**
 * Conversational front door to the create form.
 *
 * Asks one question, takes a short free-text idea, and returns an editable draft of the
 * four fields the creator needs to get started. Nothing reaches the form until they
 * click apply — the same rule the previous panel followed.
 */
export default function CampaignWizard({
  draft,
  onApplyTitle,
  onApplyCategory,
  onApplyDescription,
  onApplyTags,
}) {
  const [idea, setIdea] = useState('');
  const [askedIdea, setAskedIdea] = useState('');
  const [fields, setFields] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState('');

  const generate = async (ideaText) => {
    const text = String(ideaText ?? idea).trim();
    if (!text || isLoading) return;

    setError('');
    setApplied('');
    setIdea('');
    setAskedIdea(text);
    setIsLoading(true);

    try {
      // The current draft rides along as context, but on a fresh form only `idea` is set.
      const response = await aiService.suggestCampaignCopy({ ...draft, idea: text });

      // The endpoint fails soft: a 200 with success:false means the model produced
      // something unusable. Treat it as a retryable message, not a crash.
      if (!response?.success || !response.data) {
        setFields(null);
        setError(response?.error || 'Could not generate suggestions. Please try again.');
        return;
      }

      const data = response.data;
      setFields({
        title: data.title || '',
        // Empty when the model named a category outside the allowed list — the select
        // then shows a placeholder and the creator picks one.
        category: data.category || '',
        description: data.description || '',
        tags: Array.isArray(data.tags) ? data.tags.slice(0, MAX_TAGS) : [],
      });
    } catch (err) {
      // apiClient already reduced this to a user-safe message.
      setFields(null);
      setError(err?.message || 'Could not generate suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const update = (key, value) => setFields((prev) => (prev ? { ...prev, [key]: value } : prev));

  const addTag = () => {
    const clean = tagInput.replace(/^#/, '').trim();
    if (!clean) return;
    if (fields.tags.some((tag) => tag.toLowerCase() === clean.toLowerCase())) {
      setTagInput('');
      return;
    }
    if (fields.tags.length >= MAX_TAGS) return;
    update('tags', [...fields.tags, clean]);
    setTagInput('');
  };

  const removeTag = (tagToRemove) =>
    update(
      'tags',
      fields.tags.filter((tag) => tag !== tagToRemove)
    );

  const applyAll = () => {
    // Only ever write values we actually have. Applying an empty field would silently
    // wipe something the creator had already typed into the form.
    const written = [];

    if (fields.title) {
      onApplyTitle(fields.title);
      written.push('title');
    }
    if (fields.category) {
      onApplyCategory(fields.category);
      written.push('category');
    }
    if (fields.description) {
      onApplyDescription(fields.description);
      written.push('description');
    }
    if (fields.tags.length > 0) {
      onApplyTags(fields.tags);
      written.push('tags');
    }

    setApplied(
      written.length
        ? `Added ${formatList(written)} to your form.`
        : 'Nothing to add — the assistant returned no usable fields.'
    );
  };

  const titleShort = fields?.title && fields.title.trim().length < TITLE_MIN_CHARS;
  const descriptionShort =
    fields?.description && fields.description.trim().length < DESCRIPTION_MIN_CHARS;

  return (
    <div className="space-y-4 rounded-2xl border border-[#24B1B1]/30 bg-[#24B1B1]/5 p-5">
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#007979]" />
        <div>
          <p className="text-sm font-bold text-[#1F2937]">Campaign Writing Assistant</p>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            Describe your idea in a sentence and get a starting draft. Nothing is added to
            your form until you accept it.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-start">
          <p className="max-w-[85%] rounded-2xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm leading-relaxed text-[#1F2937]">
            {OPENING_QUESTION}
          </p>
        </div>

        {askedIdea && (
          <div className="flex justify-end">
            <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-[#007979] px-3.5 py-2.5 text-sm leading-relaxed text-white">
              {askedIdea}
            </p>
          </div>
        )}

        {fields && !isLoading && (
          <div className="flex justify-start">
            <p className="max-w-[85%] rounded-2xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm leading-relaxed text-[#1F2937]">
              Here's a draft. Edit anything you like, then add it to your form.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <p className="flex items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#6B7280]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Drafting your campaign...
            </p>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <p className="max-w-[85%] rounded-2xl border border-[#DC2626]/30 bg-[#DC2626]/5 px-3.5 py-2.5 text-sm text-[#DC2626]">
              {error}
            </p>
          </div>
        )}
      </div>

      {fields && !isLoading && (
        <div className="space-y-4 border-t border-[#24B1B1]/20 pt-4">
          {/* Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#1F2937]">Title</label>
              <span
                className={`text-[11px] ${titleShort ? 'text-[#E37434]' : 'text-[#6B7280]'}`}
              >
                {fields.title.trim().length} chars
              </span>
            </div>
            <input
              type="text"
              value={fields.title}
              onChange={(event) => update('title', event.target.value)}
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] transition-all focus:outline-none focus:ring-2 focus:ring-[#24B1B1]"
            />
            {titleShort && (
              <p className="text-[11px] text-[#E37434]">
                The form needs at least {TITLE_MIN_CHARS} characters — add a little detail.
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1F2937]">Category</label>
            <select
              value={fields.category}
              onChange={(event) => update('category', event.target.value)}
              className="w-full cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] transition-all focus:outline-none focus:ring-2 focus:ring-[#24B1B1]"
            >
              <option value="">Choose a category</option>
              {CAMPAIGN_CATEGORIES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {!fields.category && (
              <p className="text-[11px] text-[#E37434]">
                The assistant could not pick a category — choose one before applying.
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#1F2937]">Description</label>
              <span
                className={`text-[11px] ${descriptionShort ? 'text-[#E37434]' : 'text-[#6B7280]'}`}
              >
                {fields.description.trim().length} chars
              </span>
            </div>
            <textarea
              rows={6}
              value={fields.description}
              onChange={(event) => update('description', event.target.value)}
              className="w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm leading-relaxed text-[#1F2937] transition-all focus:outline-none focus:ring-2 focus:ring-[#24B1B1]"
            />
            {descriptionShort && (
              <p className="text-[11px] text-[#E37434]">
                The form needs at least {DESCRIPTION_MIN_CHARS} characters.
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1F2937]">
              Tags ({fields.tags.length}/{MAX_TAGS})
            </label>
            {fields.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {fields.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#007979]/20 bg-[#007979]/10 px-2.5 py-1 text-xs font-semibold text-[#007979]"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      title={`Remove #${tag}`}
                      className="cursor-pointer rounded-full p-0.5 text-[#007979] transition-colors hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {fields.tags.length < MAX_TAGS && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ',') {
                      event.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add a tag and press Enter"
                  className="flex-1 rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs text-[#1F2937] transition-all focus:outline-none focus:ring-2 focus:ring-[#24B1B1]"
                />
                <Button type="button" variant="outline" size="sm" icon={Plus} onClick={addTag}>
                  Add
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              icon={Check}
              onClick={applyAll}
              isDisabled={!fields.title && !fields.category && !fields.description && !fields.tags.length}
            >
              Use suggestions in form
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              icon={RefreshCw}
              onClick={() => generate(askedIdea)}
            >
              Regenerate
            </Button>
          </div>

          <p className="flex items-start gap-1.5 text-xs text-[#6B7280]">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            AI-generated draft. Review and edit it before publishing — you are responsible
            for the accuracy of your campaign.
          </p>
        </div>
      )}

      {applied && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-[#16A34A]">
          <Check className="h-3.5 w-3.5" />
          {applied}
        </p>
      )}

      {/* Deliberately NOT a <form>: this component renders inside the create page's own
          <form>, and a nested form is invalid HTML whose submit event is unreliable —
          a submit button here silently does nothing. The button is type="button" so it
          cannot submit the surrounding campaign form either. */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={idea}
          maxLength={MAX_IDEA_CHARS}
          onChange={(event) => setIdea(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              generate();
            }
          }}
          placeholder={fields ? 'Describe another idea...' : 'e.g. our robotics lab needs microcontrollers'}
          aria-label="Describe your campaign idea"
          className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#1F2937] placeholder-[#6B7280] transition-all hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#24B1B1]"
        />
        <Button
          type="button"
          size="sm"
          icon={isLoading ? undefined : Send}
          isDisabled={!idea.trim() || isLoading}
          onClick={() => generate()}
          className="shrink-0"
        >
          Generate
        </Button>
      </div>
    </div>
  );
}
