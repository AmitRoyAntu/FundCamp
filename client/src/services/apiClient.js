import axios from 'axios';

// Create an Axios instance pointing to the Express backend API
const baseURL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach bearer token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fundcamp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error message handling.
//
// Controllers put a short label in `message` ("Login failed", "Assistant") and the
// human-readable text in `error` ("Invalid credentials"). Prefer `error`, or every
// failure surfaces its label instead of something a user can act on.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const simulateNetworkDelay = (ms = 200) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default apiClient;

