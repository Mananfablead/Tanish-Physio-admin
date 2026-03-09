# CSRF Token Fix - "invalid csrf token" Error

## Problem
Getting error: `{success: false, message: "invalid csrf token", error: null, statusCode: 403}`

## Root Cause
The CSRF cookie was configured with `domain: 'localhost'` which can cause issues when the frontend runs on different ports. Also, the admin apiClient was missing `withCredentials: true`.

## Fixes Applied

### Backend (server.js)
1. **Removed explicit domain from CSRF cookie** - Let browser use default domain behavior
   ```javascript
   // Before
   cookie: {
     domain: 'localhost',  // ← This was causing issues
     path: '/',
     ...
   }
   
   // After
   cookie: {
     // No domain specified - uses current host
     path: '/',
     ...
   }
   ```

2. **Added debug logging** to track cookies and headers
   ```javascript
   console.log('   Origin:', req.get('origin'));
   console.log('   X-CSRF-Token header:', req.headers['x-csrf-token']);
   ```

### Frontend (Admin Panel)

1. **apiClient.js** - Added `withCredentials: true`
   ```javascript
   const apiClient = axios.create({
     baseURL: import.meta.env.VITE_API_BASE_URL,
     withCredentials: true, // ← IMPORTANT for CSRF cookies
   });
   ```

2. **lib/api.ts** - Added `withCredentials: true`
   ```javascript
   const api = axios.create({
     baseURL: API_BASE_URL,
     withCredentials: true, // ← IMPORTANT for CSRF cookies
   });
   ```

## Testing Steps

### Step 1: Restart Backend Server
```bash
cd Tanish-Video-Physio-Backend
npm start
```

Watch for these logs in backend console:
```
🍪 [DEBUG] GET /api/csrf-token
   Origin: http://localhost:8080
   Cookies received: {}
   Cookie header: Present
   X-CSRF-Token header: Not present
```

### Step 2: Clear Admin Browser Data
In admin panel browser console:
```javascript
sessionStorage.clear();
localStorage.clear();
document.cookie = "";
location.reload();
```

### Step 3: Test Login
Try logging into the admin panel. Check console for:
```javascript
ADMIN API_BASE_URL http://localhost:5000/api
```

### Step 4: Debug if Still Failing

Run the test script in browser console:
```javascript
// Copy contents from: test-csrf-debug.js
// Or just run:
testCsrfToken();
```

Check network tab for:
1. **GET /api/csrf-token** 
   - Status: 200
   - Response: `{success: true, csrfToken: "..."}`
   - Set-Cookie header present with `csrftoken`

2. **POST /api/auth/login**
   - Request Headers should include:
     - `Cookie: csrftoken=...`
     - `X-CSRF-Token: ...`

## Common Issues & Solutions

### Issue 1: Cookie not being set
**Check:** Backend logs show `Cookies received: {}`

**Solution:** 
- Verify `withCredentials: true` in apiClient
- Check CORS allows credentials: `credentials: true`
- Verify ALLOWED_ORIGINS includes `http://localhost:8080`

### Issue 2: Cookie sent but empty
**Check:** Backend logs show `csrftoken` is undefined

**Solution:**
- Clear all cookies and sessionStorage
- Restart backend server
- Check cookie domain/path settings

### Issue 3: Token mismatch
**Check:** Backend logs show different values for header vs cookie

**Solution:**
- Verify frontend is sending same token in both places
- Check auto-refresh logic isn't creating race conditions

### Issue 4: Port mismatch
**Check:** Origins don't match

**Solution:**
- Admin panel: `http://localhost:8080`
- Backend: `http://localhost:5000`
- Both must be in ALLOWED_ORIGINS

## Quick Debug Commands

### Backend Console
Look for these patterns:
```
✅ GOOD:
🍪 [DEBUG] GET /api/csrf-token
   Origin: http://localhost:8080
   Cookies received: {"csrftoken":"abc123..."}
   X-CSRF-Token header: abc123...

❌ BAD:
🍪 [DEBUG] GET /api/csrf-token
   Origin: null  ← Problem!
   Cookies received: {}  ← Problem!
```

### Frontend Console
```javascript
// Check if token exists
console.log('CSRF Token:', sessionStorage.getItem('csrfToken'));

// Check cookies
console.log('Cookies:', document.cookie);

// Force refresh
const { fetchCsrfToken } = useCsrf();
await fetchCsrfToken();
```

## Expected Flow

1. **App loads** → CsrfProvider fetches `/api/csrf-token`
2. **Backend responds** → Sets `csrftoken` cookie + returns token in JSON
3. **Frontend stores** → Saves token in sessionStorage
4. **Login attempt** → Sends both cookie AND `X-CSRF-Token` header
5. **Backend validates** → Compares cookie vs header → Match ✅
6. **Login succeeds** → Returns auth token

## Files Changed

### Backend
- ✅ `server.js` - Removed cookie domain, added debug logging

### Frontend (Admin)
- ✅ `src/api/apiClient.js` - Added `withCredentials: true`
- ✅ `src/lib/api.ts` - Added `withCredentials: true`

## Verification Checklist

- [ ] Backend restarted
- [ ] Browser cache cleared
- [ ] `withCredentials: true` in both apiClient files
- [ ] Backend logs show correct origin (`http://localhost:8080`)
- [ ] Backend logs show cookie being received
- [ ] Backend logs show X-CSRF-Token header matching cookie
- [ ] Login successful

## Next Steps

If still failing after these fixes:

1. **Check backend logs** - Share the 🍪 [DEBUG] output
2. **Check network tab** - Screenshot of failed request headers
3. **Run test script** - Share output from `testCsrfToken()`
4. **Verify client works** - Confirm client panel CSRF still works

---

**Status**: Ready for testing
**Date**: March 6, 2026
