/**
 * CSRF Protection Utilities
 * 
 * These utilities help manage CSRF tokens in forms and API requests
 */

import api from '../lib/api';

/**
 * Get the current CSRF token from sessionStorage
 */
export const getCsrfToken = (): string | null => {
  return sessionStorage.getItem('csrfToken') || null;
};

/**
 * Fetch a new CSRF token from the server
 */
export const fetchNewCsrfToken = async (): Promise<string> => {
  try {
    const response = await api.get('/csrf-token', {
      withCredentials: true,
    });
    
    if (response.data.success) {
      const token = response.data.csrfToken;
      sessionStorage.setItem('csrfToken', token);
      return token;
    }
    
    throw new Error('Failed to get CSRF token');
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
};

/**
 * Clear the CSRF token (useful on logout)
 */
export const clearCsrfToken = (): void => {
  sessionStorage.removeItem('csrfToken');
};

/**
 * Get CSRF headers for manual API requests
 * Returns an object with the X-CSRF-Token header
 */
export const getCsrfHeaders = (): Record<string, string> => {
  const token = getCsrfToken();
  
  if (!token) {
    console.warn('No CSRF token found. Consider fetching one first.');
    return {};
  }
  
  return {
    'X-CSRF-Token': token,
  };
};

/**
 * Helper function to include CSRF token in form data submissions
 * This is useful when submitting forms with multipart/form-data
 */
export const appendCsrfTokenToFormData = (formData: FormData): FormData => {
  const token = getCsrfToken();
  
  if (token) {
    formData.append('_csrf', token);
  } else {
    console.warn('No CSRF token found. Consider fetching one first.');
  }
  
  return formData;
};

/**
 * Initialize CSRF protection - should be called on app startup
 * Fetches and stores the CSRF token
 */
export const initializeCsrf = async (): Promise<string> => {
  try {
    // Check if we already have a token
    const existingToken = getCsrfToken();
    if (existingToken) {
      return existingToken;
    }
    
    // Fetch a new token
    return await fetchNewCsrfToken();
  } catch (error) {
    console.error('Failed to initialize CSRF protection:', error);
    throw error;
  }
};

export default {
  getCsrfToken,
  fetchNewCsrfToken,
  clearCsrfToken,
  getCsrfHeaders,
  appendCsrfTokenToFormData,
  initializeCsrf,
};
