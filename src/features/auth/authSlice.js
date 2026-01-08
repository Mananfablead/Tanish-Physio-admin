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

      console.log("token", token)
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
      return res.data;
    } catch (err) {
      // If token is invalid or expired, remove it from localStorage
      if (err.response?.status === 401 && err.response?.data?.message === "Invalid or expired token") {
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
      return rejectWithValue("Profile update failed");
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
      .addCase(updateProfile.fulfilled, (state, action) => {
  state.user = action.payload;
})
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
