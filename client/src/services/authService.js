import apiClient from './apiClient';
import { MALE_AVATAR } from '../constants/avatars';

const CURRENT_USER_KEY = 'fundcamp_current_user';
const TOKEN_KEY = 'fundcamp_token';

const formatUserData = (u) => {
  if (!u) return null;
  return {
    id: u.id,
    fullName: u.name || u.fullName || 'Campus Member',
    email: u.email,
    universityId: u.universityId || `STU-2026-${u.id || Math.floor(1000 + Math.random() * 9000)}`,
    department: u.department || 'Computer Science & Engineering',
    userType: u.userType || u.user_type || 'Student',
    avatar: u.avatar || MALE_AVATAR,
    joinedDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  };
};

export const authService = {
  // Login via POST /api/auth/login
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response.data.data;

      const formattedUser = formatUserData(user);

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(formattedUser));

      return { user: formattedUser, token };
    } catch (error) {
      throw error;
    }
  },

  // Register via POST /api/auth/register
  async register(userData) {
    try {
      const payload = {
        name: userData.fullName || userData.name,
        email: userData.email,
        password: userData.password,
        department: userData.department || 'Computer Science & Engineering',
        userType: userData.userType || 'Student',
        avatar: userData.avatar || null,
        universityId: userData.universityId || null,
      };

      const response = await apiClient.post('/auth/register', payload);
      const { token, user } = response.data.data;

      const formattedUser = formatUserData(user);

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(formattedUser));

      return { user: formattedUser, token };
    } catch (error) {
      throw error;
    }
  },

  // Logout
  async logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    return true;
  },

  // Get current logged in user (verifies token via GET /api/profile if token exists)
  async getCurrentUser() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      localStorage.removeItem(CURRENT_USER_KEY);
      return null;
    }

    try {
      const response = await apiClient.get('/profile');
      const user = response.data.data;
      const formattedUser = formatUserData(user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(formattedUser));
      return formattedUser;
    } catch (error) {
      // If token verification fails, return cached user if available, or clear storage
      const cached = localStorage.getItem(CURRENT_USER_KEY);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          // invalid json
        }
      }
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  },

  // Update Profile via PUT /api/profile
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/profile', {
        fullName: profileData.fullName || profileData.name,
        department: profileData.department,
        universityId: profileData.universityId,
        avatar: profileData.avatar
      });
      const user = response.data.data;
      const formattedUser = formatUserData(user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(formattedUser));
      return formattedUser;
    } catch (error) {
      const cached = localStorage.getItem(CURRENT_USER_KEY);
      const currentUser = cached ? JSON.parse(cached) : {};
      const updatedUser = formatUserData({ ...currentUser, ...profileData });
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    }
  },
};
