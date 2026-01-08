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

      // token save
      localStorage.setItem("token", res.data.token);
      console.log(res.data.data);
      return {
        user: res.data.data.user,
        token: res.data.data.token,
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
  "auth/profile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(API.PROFILE);
      return res.data;
    } catch (err) {
      return rejectWithValue("Unauthorized");
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
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.role = action.payload.role;
        state.isAuthenticated = true;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
