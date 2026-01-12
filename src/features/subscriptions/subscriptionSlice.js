import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { subscriptionAPI } from "@/api/apiClient";

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

// Admin subscription plan operations
export const fetchAllSubscriptionPlans = createAsyncThunk(
  "subscriptions/fetchAllPlans",
  async (_, { rejectWithValue }) => {
    try {
      const res = await subscriptionAPI.getAllPlans();
      return res.data.data?.plans || res.data.data || res.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "All subscription plans fetch failed");
    }
  }
);

export const fetchSubscriptionPlanById = createAsyncThunk(
  "subscriptions/fetchPlanById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await subscriptionAPI.getPlanById(id);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Subscription plan fetch by ID failed");
    }
  }
);

export const createSubscriptionPlan = createAsyncThunk(
  "subscriptions/createPlan",
  async (planData, { rejectWithValue }) => {
    try {
      const res = await subscriptionAPI.createPlan(planData);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Subscription plan creation failed");
    }
  }
);

export const updateSubscriptionPlan = createAsyncThunk(
  "subscriptions/updatePlan",
  async ({ id, planData }, { rejectWithValue }) => {
    try {
      const res = await subscriptionAPI.updatePlan(id, planData);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Subscription plan update failed");
    }
  }
);

export const deleteSubscriptionPlan = createAsyncThunk(
  "subscriptions/deletePlan",
  async (id, { rejectWithValue }) => {
    try {
      await subscriptionAPI.deletePlan(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Subscription plan deletion failed");
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
      // Fetch subscription plans
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
      
      // Create subscription order
      .addCase(createSubscriptionOrder.fulfilled, (state, action) => {
        state.order = action.payload;
      })
      .addCase(createSubscriptionOrder.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Admin operations for subscription plans
      .addCase(fetchAllSubscriptionPlans.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllSubscriptionPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchAllSubscriptionPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchSubscriptionPlanById.fulfilled, (state, action) => {
        // Add or update specific plan in the state
        const planIndex = state.plans.findIndex(p => p.id === action.payload.id);
        if (planIndex >= 0) {
          state.plans[planIndex] = action.payload;
        } else {
          state.plans.push(action.payload);
        }
      })
      .addCase(fetchSubscriptionPlanById.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      .addCase(createSubscriptionPlan.fulfilled, (state, action) => {
        state.plans.push(action.payload);
      })
      .addCase(createSubscriptionPlan.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      .addCase(updateSubscriptionPlan.fulfilled, (state, action) => {
        const planIndex = state.plans.findIndex(p => p.id === action.payload.id);
        if (planIndex >= 0) {
          state.plans[planIndex] = action.payload;
        }
      })
      .addCase(updateSubscriptionPlan.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      .addCase(deleteSubscriptionPlan.fulfilled, (state, action) => {
        state.plans = state.plans.filter(p => p.id !== action.payload);
      })
      .addCase(deleteSubscriptionPlan.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearOrder, clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;