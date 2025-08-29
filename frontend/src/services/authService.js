import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      return {
        user: response.data,
        token: response.data.token
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/api/auth/register', userData);
      return {
        user: response.data,
        token: response.data.token
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user data');
    }
  },

  async promoteToAdmin(secretCode) {
    try {
      const response = await api.post('/api/auth/promote-admin', { secretCode });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to promote to admin');
    }
  },

  async updateProfile(userData) {
    try {
      const response = await api.put('/api/auth/profile', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  }
};

export default api;
