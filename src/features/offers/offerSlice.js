import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { offersApi } from '../../api/offersApi';

// Get all offers
export const getAllOffers = createAsyncThunk(
  'offers/getAllOffers',
  async ({ params = {}, signal }, { rejectWithValue }) => {
    try {
      const response = await offersApi.getAllOffers(params, { signal });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get offer by ID
export const getOfferById = createAsyncThunk(
  'offers/getOfferById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await offersApi.getOfferById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create offer
export const createOffer = createAsyncThunk(
  'offers/createOffer',
  async (offerData, { rejectWithValue }) => {
    try {
      const response = await offersApi.createOffer(offerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update offer
export const updateOffer = createAsyncThunk(
  'offers/updateOffer',
  async ({ id, offerData }, { rejectWithValue }) => {
    try {
      const response = await offersApi.updateOffer(id, offerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete offer
export const deleteOffer = createAsyncThunk(
  'offers/deleteOffer',
  async (id, { rejectWithValue }) => {
    try {
      const response = await offersApi.deleteOffer(id);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Validate offer
export const validateOffer = createAsyncThunk(
  'offers/validateOffer',
  async (offerData, { rejectWithValue }) => {
    try {
      const response = await offersApi.validateOffer(offerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  offers: [],
  offer: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 1,
};

const offerSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearOffer: (state) => {
      state.offer = null;
    },
    resetOffers: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all offers
      .addCase(getAllOffers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.offers = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getAllOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })

      // Get offer by ID
      .addCase(getOfferById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOfferById.fulfilled, (state, action) => {
        state.loading = false;
        state.offer = action.payload.data;
      })
      .addCase(getOfferById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })

      // Create offer
      .addCase(createOffer.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.offers.push(action.payload.data);
      })
      .addCase(createOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })

      // Update offer
      .addCase(updateOffer.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOffer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.offers.findIndex(offer => offer._id === action.payload.data._id);
        if (index !== -1) {
          state.offers[index] = action.payload.data;
        }
        if (state.offer && state.offer._id === action.payload.data._id) {
          state.offer = action.payload.data;
        }
      })
      .addCase(updateOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })

      // Delete offer
      .addCase(deleteOffer.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.offers = state.offers.filter(offer => offer._id !== action.payload.id);
      })
      .addCase(deleteOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })

      // Validate offer
      .addCase(validateOffer.pending, (state) => {
        state.loading = true;
      })
      .addCase(validateOffer.fulfilled, (state, action) => {
        state.loading = false;
        // Validation doesn't modify state, just returns validation result
      })
      .addCase(validateOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      });
  },
});

export const { clearError, clearOffer, resetOffers } = offerSlice.actions;

export default offerSlice.reducer;