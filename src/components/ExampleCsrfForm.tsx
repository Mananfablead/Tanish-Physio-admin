/**
 * Example CSRF Form Component for Admin Panel
 * 
 * This demonstrates how to properly use CSRF tokens in forms
 */

import React from 'react';
import { useCsrf } from '@/context/CsrfContext';
import apiClient from '@/api/apiClient';

export const CsrfFormExample = () => {
  const { csrfToken, isLoading, error, fetchCsrfToken } = useCsrf();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Method 1: Using apiClient (CSRF token automatically added via interceptor)
    try {
      const response = await apiClient.post('/some-endpoint', {
        data: 'your-data',
      });
      console.log('Success:', response.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSubmitWithFormData = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Method 2: Manual FormData with CSRF token
    const formData = new FormData();
    formData.append('data', 'your-data');
    formData.append('_csrf', csrfToken); // Add CSRF token to FormData
    
    try {
      const response = await apiClient.post('/some-endpoint', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Success:', response.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (isLoading) {
    return <div>Loading CSRF token...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error loading CSRF token: {error.message}</p>
        <button onClick={fetchCsrfToken}>Retry</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>CSRF Protected Form</h3>
      <p>CSRF Token is automatically included in API requests</p>
      
      {/* Your form fields here */}
      
      <button type="submit">Submit</button>
    </form>
  );
};

export default CsrfFormExample;
