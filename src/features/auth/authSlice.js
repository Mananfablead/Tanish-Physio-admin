import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { API } from "@/api/apiClient";

/* =========================
   LOGIN
========================= */
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(API.LOGIN, {
        ...credentials,
        appType: 'admin'
      });

      // Ensure we have the token in the response
      const token = res.data.token || res.data.data?.token;

      console.log("token", token);
      if (token) {
        // Save admin-specific token
        localStorage.setItem("admin_token", token);
        // Remove any client token that might be present
        localStorage.removeItem("token");
      }
      console.log(res.data);
      return {
        user: res.data.data?.user || res.data.user,
        token: token,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

/* =========================
   CHANGE PASSWORD
========================= */
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(API.UPDATE_PASSWORD, passwordData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Password update failed");
    }
  }
);

/* =========================
   FORGOT PASSWORD
========================= */
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(API.FORGOT_PASSWORD, { email });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to send reset link");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(`${API.RESET_PASSWORD}/${token}`, { password });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to reset password");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await apiClient.post(API.LOGOUT);
      // Also dispatch the local logout action to clear the state
      dispatch(logout());
      return res.data;
    } catch (err) {
      // Even if backend logout fails, still clear local state
      dispatch(logout());
      return rejectWithValue("Logout failed");
    }
  }
);
/* =========================
   FETCH PROFILE
========================= */
export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(API.PROFILE);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Unauthorized");
    }
  }
);
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      // Check if profileData is FormData (for file uploads)
      const isFormData = profileData instanceof FormData;
      
      const config = isFormData ? {} : {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      const res = await apiClient.put(API.UPDATE_PROFILE, profileData, config);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Profile update failed"
      );
    }
  }
);

export const getPublicProfile = createAsyncThunk(
  "auth/getPublicProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(API.PUBLIC_PROFILE.replace(':userId', userId));
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch public profile");
    }
  }
);

// Validate token app type compatibility
export const validateTokenAppType = createAsyncThunk(
  "auth/validateTokenAppType",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // First check if we have an admin token
      const adminToken = localStorage.getItem("admin_token");
      const clientToken = localStorage.getItem("token");

      // If we have a client token but no admin token, this is wrong
      if (clientToken && !adminToken) {
        console.warn("❌ Client token found in admin app - forcing logout");
        dispatch(logout());
        return rejectWithValue("Client token detected in admin application");
      }

      // If we have no token at all
      if (!adminToken) {
        return rejectWithValue("No authentication token found");
      }

      // Validate the admin token with app type checking
      const res = await apiClient.post(API.VALIDATE_TOKEN, { appType: "admin" });

      // Check if the token is valid for admin app
      if (res.data.success && res.data.data?.appTypeCompatible === true) {
        console.log("✅ Admin token validated successfully");
        return res.data.data;
      } else {
        console.warn("❌ Token not valid for admin application");
        dispatch(logout());
        return rejectWithValue("Token not authorized for admin application");
      }
    } catch (err) {
      console.error("❌ Token validation failed:", err);
      dispatch(logout());
      return rejectWithValue(err.response?.data?.message || "Token validation failed");
    }
  }
);

/* =========================
   INITIAL STATE
========================= */
const initialState = {
  user: null,
  role: null,
  token: localStorage.getItem("admin_token"), //✅ Use admin-specific token
  isAuthenticated: !!localStorage.getItem("admin_token"),
  loading: false,
  error: null,
  forgotPasswordSuccess: null,
};

/* =========================
   SLICE
========================= */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("token"); // Remove any client token too
      sessionStorage.removeItem('csrfToken'); // Clear CSRF token
      state.user = null;
      state.role = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // PROFILE
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.role = action.payload.role;
        state.isAuthenticated = true;
      })

      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...state.user,
          ...action.payload.data, // ⭐ merge updated fields
        };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // GET PUBLIC PROFILE
      .addCase(getPublicProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPublicProfile.fulfilled, (state, action) => {
        state.loading = false;
        // Note: Public profile is typically used for displaying other users' info, not updating current user state
      })
      .addCase(getPublicProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // CHANGE PASSWORD
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // FORGOT PASSWORD
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.forgotPasswordSuccess = action.payload.message || "Password reset link has been sent to your email.";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // RESET PASSWORD
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.forgotPasswordSuccess = action.payload.message || "Password reset successfully!";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // TOKEN VALIDATION
      .addCase(validateTokenAppType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateTokenAppType.fulfilled, (state, action) => {
        state.loading = false;
        // Token is valid, no state changes needed
      })
      .addCase(validateTokenAppType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
