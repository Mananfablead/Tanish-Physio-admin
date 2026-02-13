import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { bookingAPI } from "@/api/apiClient";

// Fetch all bookings
export const fetchBookings = createAsyncThunk(
  "bookings/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await bookingAPI.getAll();
      // Handle the API response structure properly
      return res.data.data?.bookings || res.data.data || res.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Booking fetch failed");
    }
  }
);

// Fetch booking by ID
export const fetchBookingById = createAsyncThunk(
  "bookings/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await bookingAPI.getById(id);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Booking fetch by ID failed");
    }
  }
);

// Create booking
export const createBooking = createAsyncThunk(
  "bookings/create",
  async (bookingData, { rejectWithValue }) => {
    try {
      const res = await bookingAPI.create(bookingData);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Booking creation failed");
    }
  }
);

// Update booking
export const updateBooking = createAsyncThunk(
  "bookings/update",
  async ({ id, bookingData }, { rejectWithValue }) => {
    try {
      const res = await bookingAPI.update(id, bookingData);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Booking update failed");
    }
  }
);

// Delete booking
export const deleteBooking = createAsyncThunk(
  "bookings/delete",
  async (id, { rejectWithValue }) => {
    try {
      await bookingAPI.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Booking deletion failed");
    }
  }
);

// Reschedule booking
export const rescheduleBooking = createAsyncThunk(
  "bookings/reschedule",
  async ({ id, scheduleData }, { rejectWithValue }) => {
    try {
      const res = await bookingAPI.update(id, {
        scheduledDate: scheduleData.date,
        scheduledTime: scheduleData.time,
        timeSlot: scheduleData.timeSlot,
        status: 'scheduled'
      });
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Booking rescheduling failed");
    }
  }
);

const bookingSlice = createSlice({
  name: "bookings",
  initialState: {
    list: [],
    singleBooking: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSingleBooking: (state) => {
      state.singleBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all bookings
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch booking by ID
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.singleBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create booking
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update booking
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(booking => booking.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        // Update single booking if it matches
        if (state.singleBooking && state.singleBooking.id === action.payload.id) {
          state.singleBooking = action.payload;
        }
      })
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete booking
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(booking => booking.id !== action.payload);
      })
      .addCase(deleteBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reschedule booking
      .addCase(rescheduleBooking.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(booking => booking.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        // Update single booking if it matches
        if (state.singleBooking && state.singleBooking.id === action.payload.id) {
          state.singleBooking = action.payload;
        }
      })
      .addCase(rescheduleBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(rescheduleBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSingleBooking } = bookingSlice.actions;
export default bookingSlice.reducer;