import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { subscriptionAPI } from "@/api/apiClient";

export const fetchSubscriptionPlans = createAsyncThunk(
  "subscriptions/fetchPlans",
  async (_, { rejectWithValue }) => {
    try {
      const res = await subscriptionAPI.getPlans();
      return res.data.data.plans;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Subscription plans fetch failed");
    }
  }
);

export const createSubscriptionOrder = createAsyncThunk(
  "subscriptions/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const res = await subscriptionAPI.createOrder(orderData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Subscription order creation failed");
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscriptions",
  initialState: {
    plans: [],
    loading: false,
    error: null,
    order: null,
  },
  reducers: {
    clearOrder: (state) => {
      state.order = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionPlans.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubscriptionPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSubscriptionOrder.fulfilled, (state, action) => {
        state.order = action.payload;
      })
      .addCase(createSubscriptionOrder.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearOrder, clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;