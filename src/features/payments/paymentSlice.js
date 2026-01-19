import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentAPI } from '../../api/apiClient';

// Async thunks for payment operations
export const fetchAllPayments = createAsyncThunk(
  'payments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPaymentOrder = createAsyncThunk(
  'payments/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.createOrder(orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'payments/verify',
  async (verificationData, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.verify(verificationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createSubscriptionOrder = createAsyncThunk(
  'payments/createSubscriptionOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.createSubscriptionOrder(orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const verifySubscriptionPayment = createAsyncThunk(
  'payments/verifySubscription',
  async (verificationData, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.verifySubscription(verificationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state
const initialState = {
  payments: [],
  currentPayment: null,
  loading: false,
  error: null,
  success: false,
};

// Payment slice
const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setCurrentPayment: (state, action) => {
      state.currentPayment = action.payload;
    },
    resetPaymentState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.currentPayment = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all payments
      .addCase(fetchAllPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.data?.payments || action.payload.payments || action.payload || [];
        state.success = true;
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create payment order
      .addCase(createPaymentOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
        state.success = true;
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify payment
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
        state.success = true;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create subscription order
      .addCase(createSubscriptionOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createSubscriptionOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
        state.success = true;
      })
      .addCase(createSubscriptionOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify subscription payment
      .addCase(verifySubscriptionPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(verifySubscriptionPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
        state.success = true;
      })
      .addCase(verifySubscriptionPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { 
  clearErrors, 
  clearSuccess, 
  setCurrentPayment, 
  resetPaymentState 
} = paymentSlice.actions;

// Export reducer
export default paymentSlice.reducer;