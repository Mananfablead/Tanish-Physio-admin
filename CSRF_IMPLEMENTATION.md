# CSRF Token Implementation Guide - Admin Panel

This guide explains the CSRF (Cross-Site Request Forgery) protection implementation in the Tanish Physio Admin panel.

## Overview

The admin panel now has full CSRF protection matching the client application's implementation. All state-changing requests (POST, PUT, DELETE, PATCH) automatically include CSRF tokens.

## Files Created/Modified

### New Files:
1. **`src/hooks/useCsrfToken.ts`** - Custom React hook for CSRF token management
2. **`src/context/CsrfContext.tsx`** - Context provider for global CSRF access
3. **`src/utils/csrf.ts`** - Utility functions for CSRF operations
4. **`src/components/ExampleCsrfForm.tsx`** - Example usage of CSRF in forms

### Modified Files:
1. **`src/lib/api.ts`** - Added CSRF interceptors and exported API_BASE_URL
2. **`src/api/apiClient.js`** - Added CSRF token to request/response interceptors
3. **`src/main.tsx`** - Wrapped app with CsrfProvider
4. **`src/features/auth/authSlice.js`** - Clear CSRF token on logout

## How It Works

### 1. Automatic Token Fetching
When the admin app loads, it automatically fetches a CSRF token from the backend and stores it in `sessionStorage`.

```typescript
// In main.tsx - App is wrapped with CsrfProvider
<CsrfProvider>
  <App />
</CsrfProvider>
```

### 2. Automatic Token Inclusion
All API requests automatically include the CSRF token in headers:

```javascript
// apiClient.js interceptor
if (csrfToken && ['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
  config.headers['X-CSRF-Token'] = csrfToken;
}
```

### 3. Automatic Token Refresh
If a CSRF token becomes invalid, the system automatically fetches a new one and retries the request.

## Usage Examples

### Example 1: Regular API Calls (Automatic)

```javascript
import apiClient from '@/api/apiClient';

// CSRF token is automatically included
const response = await apiClient.post('/bookings', bookingData);
```

### Example 2: Using Redux Actions (Automatic)

```javascript
import { loginUser } from '@/features/auth/authSlice';

// CSRF token is automatically included
dispatch(loginUser({ email, password }));
```

### Example 3: FormData with File Uploads

```javascript
import { useCsrf } from '@/context/CsrfContext';
import apiClient from '@/api/apiClient';

const MyForm = () => {
  const { csrfToken } = useCsrf();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('_csrf', csrfToken); // Include CSRF token
    
    await apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
};
```

### Example 4: Manual Header (If Needed)

```javascript
import { getCsrfHeaders } from '@/utils/csrf';

const headers = getCsrfHeaders();
// Returns: { 'X-CSRF-Token': 'your-token-here' }

await fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    ...headers,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

## Key Functions

### Hook: `useCsrf`

Access CSRF token and related functions anywhere in your app:

```typescript
import { useCsrf } from '@/context/CsrfContext';

const { 
  csrfToken,      // Current token string
  isLoading,      // Loading state
  error,          // Error object if fetch failed
  fetchCsrfToken, // Function to manually fetch new token
  getToken,       // Get token from storage or fetch
  clearToken      // Clear token (used on logout)
} = useCsrf();
```

### Utilities: `src/utils/csrf.ts`

```typescript
import { 
  getCsrfToken,           // Get token from sessionStorage
  fetchNewCsrfToken,      // Fetch new token from server
  clearCsrfToken,         // Clear token from storage
  getCsrfHeaders,         // Get headers object with token
  appendCsrfTokenToFormData, // Add token to FormData
  initializeCsrf          // Initialize on app startup
} from '@/utils/csrf';
```

## Security Notes

1. **Token Storage**: CSRF tokens are stored in `sessionStorage` (cleared when browser tab closes)
2. **Automatic Cleanup**: Tokens are automatically cleared on logout
3. **HttpOnly Cookie**: Backend also sets an HttpOnly cookie as additional security
4. **Validation**: All state-changing requests validate the CSRF token server-side

## Troubleshooting

### Issue: "CSRF token invalid" errors

**Solution:**
- Check that the backend `/csrf-token` endpoint is accessible
- Ensure cookies are being sent (`withCredentials: true`)
- Try clearing sessionStorage and refreshing: `sessionStorage.clear()`

### Issue: Forms not submitting

**Solution:**
- Verify CSRF token is loaded: `const { csrfToken, isLoading } = useCsrf();`
- Check browser console for errors
- For FormData, ensure you're appending `_csrf` field

### Issue: Token expiration

**Solution:**
- The system automatically refreshes expired tokens
- If manual refresh needed: `await fetchCsrfToken();`

## Testing

To verify CSRF is working:

1. Open browser DevTools → Network tab
2. Make any POST/PUT/DELETE request
3. Check request headers for `X-CSRF-Token`
4. Token should match value in `sessionStorage.getItem('csrfToken')`

## Migration Checklist

For existing admin components:

- [ ] No changes needed for Redux actions (automatic)
- [ ] No changes needed for apiClient usage (automatic)
- [ ] Update manual FormData submissions to include `_csrf`
- [ ] Replace any direct axios calls with apiClient
- [ ] Test all form submissions work correctly

## Backend Requirements

Ensure backend has:
- ✅ CSRF token endpoint: `GET /csrf-token`
- ✅ CSRF validation middleware for state-changing routes
- ✅ Cookie-based token storage with `httpOnly: true`
- ✅ Token validation from both header (`X-CSRF-Token`) and form data (`_csrf`)

## Summary

The admin panel now has enterprise-grade CSRF protection that:
- ✅ Automatically fetches and manages tokens
- ✅ Seamlessly integrates with all API requests
- ✅ Provides manual utilities when needed
- ✅ Auto-refreshes expired tokens
- ✅ Clears tokens on logout
- ✅ Matches client implementation for consistency

No code changes are needed for most existing functionality. Everything works automatically! 🎉
