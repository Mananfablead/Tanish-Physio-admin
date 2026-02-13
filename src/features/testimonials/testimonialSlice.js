import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { testimonialAPI } from '../../api/apiClient';

// Async thunks for testimonial operations
export const fetchTestimonials = createAsyncThunk(
  'testimonials/fetchTestimonials',
  async ({ search = '', status = 'all' }) => {
    const params = {};
    if (search) params.search = search;
    if (status && status !== 'all') params.status = status;
    const response = await testimonialAPI.getAll(params);
    return response.data.data;
  }
);

export const fetchTestimonialStats = createAsyncThunk(
  'testimonials/fetchTestimonialStats',
  async () => {
    const response = await testimonialAPI.getStats();
    return response.data.data;
  }
);

export const fetchTestimonialById = createAsyncThunk(
  'testimonials/fetchTestimonialById',
  async (id) => {
    const response = await testimonialAPI.getById(id);
    return response.data.data;
  }
);

export const createTestimonial = createAsyncThunk(
  'testimonials/createTestimonial',
  async (testimonialData, { rejectWithValue }) => {
    try {
      const response = await testimonialAPI.create(testimonialData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTestimonial = createAsyncThunk(
  'testimonials/updateTestimonial',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await testimonialAPI.update(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTestimonialStatus = createAsyncThunk(
  'testimonials/updateTestimonialStatus',
  async ({ id, status }) => {
    const response = await testimonialAPI.updateStatus(id, status);
    return response.data.data;
  }
);

export const toggleTestimonialFeatured = createAsyncThunk(
  'testimonials/toggleTestimonialFeatured',
  async (id) => {
    const response = await testimonialAPI.toggleFeatured(id);
    return response.data.data;
  }
);

export const deleteTestimonial = createAsyncThunk(
  'testimonials/deleteTestimonial',
  async (id) => {
    await testimonialAPI.delete(id);
    return id;
  }
);

const testimonialSlice = createSlice({
  name: 'testimonials',
  initialState: {
    testimonials: [],
    stats: {
      total: 0,
      pending: 0,
      approved: 0,
      featured: 0
    },
    selectedTestimonial: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedTestimonial: (state) => {
      state.selectedTestimonial = null;
    },
    resetTestimonials: (state) => {
      state.testimonials = [];
      state.stats = {
        total: 0,
        pending: 0,
        approved: 0,
        featured: 0
      };
      state.selectedTestimonial = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch testimonials
      .addCase(fetchTestimonials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestimonials.fulfilled, (state, action) => {
        state.loading = false;
        state.testimonials = action.payload.map(testimonial => ({
          ...testimonial,
          id: testimonial._id || testimonial.id
        }));
      })
      .addCase(fetchTestimonials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetch testimonial stats
      .addCase(fetchTestimonialStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchTestimonialStats.rejected, (state, action) => {
        state.error = action.error.message;
      })
      
      // Fetch single testimonial
      .addCase(fetchTestimonialById.fulfilled, (state, action) => {
        state.selectedTestimonial = {
          ...action.payload,
          id: action.payload._id || action.payload.id
        };
      })
      .addCase(fetchTestimonialById.rejected, (state, action) => {
        state.error = action.error.message;
      })
      
      // Create testimonial
      .addCase(createTestimonial.fulfilled, (state, action) => {
        state.testimonials.push({
          ...action.payload,
          id: action.payload._id || action.payload.id
        });
      })
      .addCase(createTestimonial.rejected, (state, action) => {
        state.error = action.error.message;
      })
      
      // Update testimonial
      .addCase(updateTestimonial.fulfilled, (state, action) => {
        const index = state.testimonials.findIndex(t => t.id === action.payload.id || t.id === action.payload._id);
        if (index !== -1) {
          state.testimonials[index] = {
            ...action.payload,
            id: action.payload._id || action.payload.id
          };
        }
        // Also update if it's the selected testimonial
        if (state.selectedTestimonial && (state.selectedTestimonial.id === action.payload.id || state.selectedTestimonial.id === action.payload._id)) {
          state.selectedTestimonial = {
            ...action.payload,
            id: action.payload._id || action.payload.id
          };
        }
      })
      .addCase(updateTestimonial.rejected, (state, action) => {
        state.error = action.error.message;
      })
      
      // Update testimonial status
      .addCase(updateTestimonialStatus.fulfilled, (state, action) => {
        const index = state.testimonials.findIndex(t => t.id === action.payload.id || t.id === action.payload._id);
        if (index !== -1) {
          state.testimonials[index] = {
            ...action.payload,
            id: action.payload._id || action.payload.id
          };
        }
        // Also update if it's the selected testimonial
        if (state.selectedTestimonial && (state.selectedTestimonial.id === action.payload.id || state.selectedTestimonial.id === action.payload._id)) {
          state.selectedTestimonial = {
            ...action.payload,
            id: action.payload._id || action.payload.id
          };
        }
      })
      .addCase(updateTestimonialStatus.rejected, (state, action) => {
        state.error = action.error.message;
      })
      
      // Toggle featured status
      .addCase(toggleTestimonialFeatured.fulfilled, (state, action) => {
        const index = state.testimonials.findIndex(t => t.id === action.payload.id || t.id === action.payload._id);
        if (index !== -1) {
          state.testimonials[index] = {
            ...action.payload,
            id: action.payload._id || action.payload.id
          };
        }
        // Also update if it's the selected testimonial
        if (state.selectedTestimonial && (state.selectedTestimonial.id === action.payload.id || state.selectedTestimonial.id === action.payload._id)) {
          state.selectedTestimonial = {
            ...action.payload,
            id: action.payload._id || action.payload.id
          };
        }
      })
      .addCase(toggleTestimonialFeatured.rejected, (state, action) => {
        state.error = action.error.message;
      })
      
      // Delete testimonial
      .addCase(deleteTestimonial.fulfilled, (state, action) => {
        state.testimonials = state.testimonials.filter(t => t.id !== action.payload);
      })
      .addCase(deleteTestimonial.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const { clearSelectedTestimonial, resetTestimonials } = testimonialSlice.actions;

export default testimonialSlice.reducer;