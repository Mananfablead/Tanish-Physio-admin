import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { reportAPI } from "@/api/apiClient";

export const fetchDashboard = createAsyncThunk(
  "dashboard/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await reportAPI.getDashboardReport();
      // Provide default structure if data is missing
      const data = res.data.data || {};
      return {
        stats: data.stats || {},
        revenueChart: data.revenueChart || [],
        sessionsChart: data.sessionsChart || [],
        userGrowthChart: data.userGrowthChart || [],
        recentActivity: data.recentActivity || [],
        upcomingSessions: data.upcomingSessions || []
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Dashboard load failed");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: {
      stats: {},
      revenueChart: [],
      sessionsChart: [],
      userGrowthChart: [],
      recentActivity: [],
      upcomingSessions: []
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.stats = null;
      });
  },
});

export default dashboardSlice.reducer;
