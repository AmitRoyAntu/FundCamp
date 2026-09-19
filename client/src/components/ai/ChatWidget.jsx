import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import Button from '../common/Button';
import { aiService } from '../../services/aiService';

const MAX_INPUT_CHARS = 500;
const MAX_HISTORY_TURNS = 6; // mirrors the server's cap

const GREETING = {
  isGreeting: true,
  role: 'assistant',
  content: "Hi! I'm the FundCamp assistant. Ask me about campaigns on the platform, or how donating works.",
};

const SUGGESTIONS = [
  'Which medical campaigns are still open?',
  'How do I donate to a campaign?',
  'Which campaigns are verified by the university?',
  'What research projects need funding right now?',
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  // Keep the newest message in view as the transcript grows.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending, isOpen]);

  // Escape closes the panel, matching the behaviour of the shared Modal.
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const send = async (text) => {
    const question = String(text ?? input).trim();
    if (!question || isSending) return;

    setError('');
    setInput('');

    // Prior turns only — the new question travels separately so the server can
    // sanitize history independently of the current message. The synthetic greeting
    // is excluded so the model sees a coherent conversation.
    const history = messages
      .filter((entry) => !entry.isGreeting)
      .slice(-MAX_HISTORY_TURNS)
      .map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setIsSending(true);

    try {
      const data = await aiService.askAssistant(question, history);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data?.reply || 'I could not generate a reply just now.' },
      ]);
    } catch (err) {
      // apiClient already reduced this to a user-safe message.
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    send();
  };

  const showSuggestions = messages.length === 1 && !isSending;

  return (
    <>
      {isOpen && (
        <section
          role="dialog"
          aria-label="FundCamp assistant"
          className="fixed bottom-24 right-4 sm:right-6 z-40 flex w-[calc(100vw-2rem)] sm:w-96 flex-col overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-2xl"
          style={{ maxHeight: 'min(32rem, calc(100vh - 8rem))' }}
        >
          <header className="flex items-center justify-between gap-2 border-b border-[#E5E7EB] bg-[#007979] px-4 py-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-white">Campus Assistant</h2>
              <p className="truncate text-xs text-white/80">Ask about campaigns and donations</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
              className="cursor-pointer rounded-lg p-1.5 text-white/90 transition-colors hover:bg-white/15"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[#FFFDF8] p-4">
            {messages.map((entry, index) => (
              <div
                key={`${entry.role}-${index}`}
                className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <p
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    entry.role === 'user'
                      ? 'bg-[#007979] text-white'
                      : 'border border-[#E5E7EB] bg-white text-[#1F2937]'
                  }`}
                >
                  {entry.content}
                </p>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <p className="flex items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#6B7280]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Thinking...
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

          {showSuggestions && (
            <div className="flex flex-wrap gap-1.5 border-t border-[#E5E7EB] bg-white px-3 pt-3">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  className="cursor-pointer rounded-full border border-[#24B1B1]/40 bg-[#24B1B1]/5 px-2.5 py-1 text-xs text-[#007979] transition-colors hover:bg-[#24B1B1]/15"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-white p-3">
            <input
              type="text"
              value={input}
              maxLength={MAX_INPUT_CHARS}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about campaigns..."
              aria-label="Your question"
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#1F2937] placeholder-[#6B7280] transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#24B1B1]"
            />
            <Button
              type="submit"
              size="sm"
              icon={Send}
              isDisabled={!input.trim() || isSending}
              className="shrink-0"
            >
              Send
            </Button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
        aria-expanded={isOpen}
        className="fixed bottom-6 right-4 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#007979] text-white shadow-lg transition-all duration-200 hover:bg-[#006363] hover:shadow-xl active:scale-95 sm:right-6"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}
