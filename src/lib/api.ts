import axios from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log('ADMIN API_BASE_URL', API_BASE_URL);

// Export API_BASE_URL for use in other files
export { API_BASE_URL };

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CSRF cookies
});

// Request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token for state-changing requests (POST, PUT, DELETE, PATCH)
    const csrfToken = sessionStorage.getItem('csrfToken');
    if (csrfToken && ['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and CSRF errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token might be expired, clear it and redirect to login
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    
    // Handle CSRF token errors
    if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
      console.warn('CSRF token invalid, fetching new token...');
      
      try {
        // Try to fetch a new CSRF token
        const response = await axios.get(`${API_BASE_URL}/csrf-token`, {
          withCredentials: true,
        });
        
        if (response.data.success) {
          const newCsrfToken = response.data.csrfToken;
          sessionStorage.setItem('csrfToken', newCsrfToken);
          
          // Retry the original request with the new token
          if (error.config) {
            error.config.headers['X-CSRF-Token'] = newCsrfToken;
            return api.request(error.config);
          }
        }
      } catch (retryError) {
        console.error('Failed to refresh CSRF token:', retryError);
      }
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