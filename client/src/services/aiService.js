import apiClient from './apiClient';

// AI responses are slow — the model reasons before answering, and a cold request has
// been measured at ~8s. apiClient's default 10s is too tight for that, and it must stay
// above the server's own AI_TIMEOUT_MS (20s) so the server hits its timeout first and
// returns a readable error instead of the client aborting with a bare timeout message.
const AI_TIMEOUT_MS = 30000;

// AI assistant API wrapper.
//
// Note the two different failure shapes:
//   - askAssistant throws on failure — the API returns a real error status and
//     apiClient's interceptor converts it into an Error with a user-safe message.
//   - suggestCampaignCopy resolves with { success: false } when the model produced
//     something unusable, because that is a retryable annoyance rather than an error.
export const aiService = {
  // POST /api/ai/assistant — public, rate limited per IP
  async askAssistant(message, history = []) {
    const response = await apiClient.post(
      '/ai/assistant',
      { message, history },
      { timeout: AI_TIMEOUT_MS }
    );
    return response.data.data;
  },

  // POST /api/ai/campaign-helper — authenticated
  //
  // `idea` is the creator's short answer to the wizard's opening question and is the
  // normal entry point, so it is valid to send it with every other field empty.
  async suggestCampaignCopy({ idea, title, description, category, tags, goalAmount }) {
    const response = await apiClient.post(
      '/ai/campaign-helper',
      { idea, title, description, category, tags, goalAmount },
      { timeout: AI_TIMEOUT_MS }
    );
    return response.data;
  },
};
