import { authService } from './authService';
import apiClient from './apiClient';

export const profileService = {
  async getUserProfile() {
    return await authService.getCurrentUser();
  },

  async updateProfile(profileData) {
    return await authService.updateProfile(profileData);
  },

  async getUserContributions() {
    try {
      const response = await apiClient.get('/profile/contributions');
      return response.data.data || { totalContributed: 0, uniqueCampaignsCount: 0, contributions: [] };
    } catch (err) {
      console.warn('Failed to fetch contributions:', err);
      return { totalContributed: 0, uniqueCampaignsCount: 0, contributions: [] };
    }
  },

  async getCreatorAnalytics() {
    try {
      const response = await apiClient.get('/profile/analytics');
      return response.data.data || { totalRaised: 0, totalGoal: 0, totalBackers: 0, campaigns: [], recentDonations: [], fundingTimeline: [] };
    } catch (err) {
      console.warn('Failed to fetch creator analytics:', err);
      return { totalRaised: 0, totalGoal: 0, totalBackers: 0, campaigns: [], recentDonations: [], fundingTimeline: [] };
    }
  }
};
