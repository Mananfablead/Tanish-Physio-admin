import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { API } from "@/api/apiClient";

export const fetchSessions = createAsyncThunk(
  "sessions/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(API.SESSIONS);
      return res.data;
    } catch (err) {
      return rejectWithValue("Session fetch failed");
    }
  }
);

const sessionSlice = createSlice({
  name: "sessions",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default sessionSlice.reducer;
