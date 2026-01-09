import axios from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration, etc.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token might be expired, clear it and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Create admin user
  createAdminUser: (userData) =>
    api.post('/auth/admin/create', userData),

  // Login user
  login: (credentials) =>
    api.post('/auth/login', credentials),

  // Register user
  register: (userData) =>
    api.post('/auth/register', userData),

  // Get user profile
  getProfile: () => api.get('/auth/profile'),

  // Update user profile
  updateProfile: (userData) =>
    api.put('/auth/profile', userData),
};

// Export the API instance
export default api;