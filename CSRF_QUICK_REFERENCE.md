# CSRF Quick Reference - Admin Panel

## 🎯 How to Use CSRF in Your Components

### ✅ Standard API Calls (AUTOMATIC - No Changes Needed)

```javascript
// Using apiClient
import apiClient from '@/api/apiClient';

await apiClient.post('/bookings', { data });
await apiClient.put('/users/123', { data });
await apiClient.delete('/sessions/456');
```

### ✅ Redux Actions (AUTOMATIC - No Changes Needed)

```javascript
import { loginUser, updateProfile } from '@/features/auth/authSlice';

dispatch(loginUser({ email, password }));
dispatch(updateProfile(userData));
```

### ⚠️ FormData with File Uploads (MANUAL - Add _csrf)

```javascript
import { useCsrf } from '@/context/CsrfContext';
import apiClient from '@/api/apiClient';

const MyForm = () => {
  const { csrfToken } = useCsrf();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('_csrf', csrfToken); // ← IMPORTANT!
    
    await apiClient.post('/upload', formData);
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
};
```

### 🔧 Manual Access to Token

```javascript
import { useCsrf } from '@/context/CsrfContext';

const Component = () => {
  const { 
    csrfToken,      // Current token
    isLoading,      // Loading state
    error,          // Error if any
    fetchCsrfToken  // Manual refresh
  } = useCsrf();
  
  // Use as needed
};
```

## 📋 Checklist for Existing Code

- [ ] **Direct apiClient calls** - No changes needed ✅
- [ ] **Redux actions** - No changes needed ✅
- [ ] **FormData uploads** - Add `formData.append('_csrf', csrfToken)` ⚠️
- [ ] **Manual axios/fetch** - Use apiClient instead or add headers manually ⚠️

## 🚨 Common Issues & Solutions

### Issue: "CSRF token invalid"

**Check:**
1. Is backend `/csrf-token` endpoint working?
2. Are cookies enabled? (`withCredentials: true`)
3. Try: `sessionStorage.clear()` and refresh

### Issue: Form not submitting

**Check:**
1. Is CSRF token loaded? `const { csrfToken, isLoading } = useCsrf();`
2. For FormData, did you append `_csrf`? `formData.append('_csrf', csrfToken)`
3. Check browser console for errors

### Issue: 403 Forbidden on POST/PUT

**Check:**
1. Network tab → Request Headers → Should have `X-CSRF-Token`
2. Verify token in sessionStorage: `sessionStorage.getItem('csrfToken')`
3. System should auto-refresh, but manual: `await fetchCsrfToken()`

## 🔍 Debugging Commands

```javascript
// Check if token exists
console.log('CSRF Token:', sessionStorage.getItem('csrfToken'));

// Force refresh token
const { fetchCsrfToken } = useCsrf();
await fetchCsrfToken();

// Clear token (for testing)
sessionStorage.removeItem('csrfToken');

// Check if CsrfProvider is wrapping app
// Look in main.tsx - should have <CsrfProvider><App /></CsrfProvider>
```

## 📦 What's Included

| Feature | Location | Auto/Manual |
|---------|----------|-------------|
| Token Fetch | `useCsrfToken` hook | ✅ Automatic |
| Token Storage | `sessionStorage` | ✅ Automatic |
| API Headers | `apiClient` interceptor | ✅ Automatic |
| Redux Integration | `authSlice` | ✅ Automatic |
| Auto Refresh | Response interceptor | ✅ Automatic |
| Logout Cleanup | `authSlice.logout` | ✅ Automatic |
| FormData Helper | `appendCsrfTokenToFormData` | ⚠️ Manual |
| Context Access | `useCsrf()` | ⚠️ Manual (when needed) |

## 💡 Best Practices

1. **Use apiClient** instead of raw axios
2. **Use Redux actions** for auth operations
3. **For file uploads**, remember to add `_csrf` to FormData
4. **Don't store tokens** in localStorage (use sessionStorage)
5. **Clear tokens on logout** (already handled automatically)

## 🎓 Learning by Example

See `src/components/ExampleCsrfForm.tsx` for complete working examples.

---

**Quick Start**: Just use `apiClient` like before - CSRF is automatic! 🎉

**Need FormData?** Import `useCsrf` and append token: `formData.append('_csrf', csrfToken)`
