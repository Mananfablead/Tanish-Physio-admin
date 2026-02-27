import axios from 'axios';


// Create separate axios instances for admin and client
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Admin API client - uses admin token
const adminApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Client API client - uses client token
const clientApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Admin token interceptor
adminApiClient.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('admin_token');
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

// Client token interceptor
clientApiClient.interceptors.request.use((config) => {
  const clientToken = localStorage.getItem('client_token');
  if (clientToken) {
    config.headers.Authorization = `Bearer ${clientToken}`;
  }
  return config;
});

// Admin token expiration interceptor
adminApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.dispatchEvent(new CustomEvent('adminTokenExpired'));
      // Redirect to admin login
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Client token expiration interceptor
clientApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('client_token');
      window.dispatchEvent(new CustomEvent('clientTokenExpired'));
      // Redirect to client login
      window.location.href = '/client/login';
    }
    return Promise.reject(error);
  }
);

// Admin Authentication APIs
export const adminAuthAPI = {
  // Admin login - only works with admin credentials
  login: (credentials: { email: string; password: string }) => {
    return adminApiClient.post("/auth/admin/login", credentials);
  },

  // Admin logout
  logout: () => {
    return adminApiClient.post("/auth/admin/logout");
  },

  // Get admin profile
  getProfile: () => {
    return adminApiClient.get("/auth/admin/profile");
  },

  // Update admin profile
  updateProfile: (userData: any) => {
    return adminApiClient.put("/auth/admin/profile", userData);
  },

  // Change admin password
  changePassword: (passwordData: {
    oldPassword: string;
    newPassword: string;
  }) => {
    return adminApiClient.put("/auth/admin/change-password", passwordData);
  },

  // Forgot password
  forgotPassword: (email: string) => {
    return adminApiClient.post("/auth/admin/forgot-password", { email });
  },

  // Reset password
  resetPassword: (token: string, password: string) => {
    return adminApiClient.post(`/auth/admin/reset-password/${token}`, {
      password,
    });
  },

  // Verify admin token
  verifyToken: () => {
    return adminApiClient.get("/auth/admin/verify-token");
  },

  // Validate admin token with app type checking
  validateToken: (appType?: "admin") => {
    const data = appType ? { appType } : {};
    return adminApiClient.post("/auth/validate-token", data);
  },
};

// Client Authentication APIs
export const clientAuthAPI = {
  // Client login - only works with client credentials
  login: (credentials: { email: string; password: string }) => {
    return clientApiClient.post("/auth/client/login", credentials);
  },

  // Client logout
  logout: () => {
    return clientApiClient.post("/auth/client/logout");
  },

  // Get client profile
  getProfile: () => {
    return clientApiClient.get("/auth/client/profile");
  },

  // Update client profile
  updateProfile: (userData: any) => {
    return clientApiClient.put("/auth/client/profile", userData);
  },

  // Change client password
  changePassword: (passwordData: {
    oldPassword: string;
    newPassword: string;
  }) => {
    return clientApiClient.put("/auth/client/change-password", passwordData);
  },

  // Forgot password
  forgotPassword: (email: string) => {
    return clientApiClient.post("/auth/client/forgot-password", { email });
  },

  // Reset password
  resetPassword: (token: string, password: string) => {
    return clientApiClient.post(`/auth/client/reset-password/${token}`, {
      password,
    });
  },

  // Verify client token
  verifyToken: () => {
    return clientApiClient.get("/auth/client/verify-token");
  },

  // Validate client token with app type checking
  validateToken: (appType?: "client") => {
    const data = appType ? { appType } : {};
    return clientApiClient.post("/auth/validate-token", data);
  },
};

// Token utility functions
export const tokenUtils = {
  // Store admin token
  storeAdminToken: (token: string) => {
    localStorage.setItem('admin_token', token);
  },

  // Get admin token
  getAdminToken: (): string | null => {
    return localStorage.getItem('admin_token');
  },

  // Remove admin token
  removeAdminToken: () => {
    localStorage.removeItem('admin_token');
  },

  // Store client token
  storeClientToken: (token: string) => {
    localStorage.setItem('client_token', token);
  },

  // Get client token
  getClientToken: (): string | null => {
    return localStorage.getItem('client_token');
  },

  // Remove client token
  removeClientToken: () => {
    localStorage.removeItem('client_token');
  },

  // Clear all tokens
  clearAllTokens: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('client_token');
    localStorage.removeItem('token'); // Legacy token
  },

  // Check if admin is authenticated
  isAdminAuthenticated: (): boolean => {
    return !!localStorage.getItem('admin_token');
  },

  // Check if client is authenticated
  isClientAuthenticated: (): boolean => {
    return !!localStorage.getItem('client_token');
  }
};

export { adminApiClient, clientApiClient };