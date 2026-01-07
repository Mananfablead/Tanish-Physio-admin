import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { API } from "@/api/apiClient";

export const fetchServices = createAsyncThunk(
  "services/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(API.SERVICES);
      return res.data;
    } catch (err) {
      return rejectWithValue("Services fetch failed");
    }
  }
);

const serviceSlice = createSlice({
  name: "services",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default serviceSlice.reducer;
