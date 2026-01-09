import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { API } from "@/api/apiClient";

/* =========================
   LOGIN
========================= */
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(API.LOGIN, credentials);

      // Ensure we have the token in the response
      const token = res.data.token || res.data.data?.token;

      console.log("token", token);
      if (token) {
        // token save
        localStorage.setItem("token", token);
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
   UPDATE PROFILE PICTURE
========================= */
export const updateProfilePicture = createAsyncThunk(
  "auth/updateProfilePicture",
  async (imageFile, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', imageFile);
      
      const res = await apiClient.put(API.UPDATE_PROFILE_PICTURE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Profile picture update failed");
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

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(API.LOGOUT);
      return res.data;
    } catch (err) {
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
      // If token is invalid or expired, remove it from localStorage
      if (
        err.response?.status === 401 &&
        err.response?.data?.message === "Invalid or expired token"
      ) {
        localStorage.removeItem("token");
        // Optionally redirect to login
        window.location.href = "/login";
      }
      return rejectWithValue(err.response?.data?.message || "Unauthorized");
    }
  }
);
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(API.UPDATE_PROFILE, profileData);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Profile update failed"
      );
    }
  }
);

/* =========================
   INITIAL STATE
========================= */
const initialState = {
  user: null,
  role: null,
  token: localStorage.getItem("token"), // ✅ IMPORTANT
  isAuthenticated: !!localStorage.getItem("token"),
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
      localStorage.removeItem("token");
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
      
      // UPDATE PROFILE PICTURE
      .addCase(updateProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfilePicture.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data?.profilePicture) {
          state.user.profilePicture = action.payload.data.profilePicture;
        }
      })
      .addCase(updateProfilePicture.rejected, (state, action) => {
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
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
