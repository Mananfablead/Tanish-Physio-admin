import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api';

/**
 * Custom hook for CSRF token management
 * Automatically fetches and stores CSRF token, and provides it for form submissions
 */
export const useCsrfToken = () => {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch CSRF token from backend
   * The token is automatically stored in a cookie by the server
   */
  const fetchCsrfToken = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/csrf-token`, {
        withCredentials: true, // Important for cookies
      });
      
      if (response.data.success) {
        const token = response.data.csrfToken;
        setCsrfToken(token);
        
        // Also store in sessionStorage as backup
        sessionStorage.setItem('csrfToken', token);
        
        return token;
      } else {
        throw new Error('Failed to get CSRF token');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      console.error('Error fetching CSRF token:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get CSRF token from storage or fetch if not available
   */
  const getToken = useCallback(() => {
    // Try to get from state first
    if (csrfToken) {
      return csrfToken;
    }
    
    // Then try sessionStorage
    const stored = sessionStorage.getItem('csrfToken');
    if (stored) {
      setCsrfToken(stored);
      return stored;
    }
    
    // If not available, fetch new one
    fetchCsrfToken();
    return null;
  }, [csrfToken, fetchCsrfToken]);

  /**
   * Clear CSRF token (useful on logout)
   */
  const clearToken = useCallback(() => {
    setCsrfToken('');
    sessionStorage.removeItem('csrfToken');
  }, []);

  // Fetch token on mount
  useEffect(() => {
    fetchCsrfToken();
  }, [fetchCsrfToken]);

  return {
    csrfToken,
    isLoading,
    error,
    fetchCsrfToken,
    getToken,
    clearToken,
  };
};

export default useCsrfToken;
