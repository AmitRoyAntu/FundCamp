import { authService } from './authService';

export const profileService = {
  async getUserProfile() {
    return await authService.getCurrentUser();
  },

  async updateProfile(profileData) {
    return await authService.updateProfile(profileData);
  }
};
