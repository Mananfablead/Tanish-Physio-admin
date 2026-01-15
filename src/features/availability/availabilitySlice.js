import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { availabilityAPI } from "@/api/apiClient";

/* =========================
   GET ALL AVAILABILITY
========================= */
export const getAllAvailability = createAsyncThunk(
  "availability/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await availabilityAPI.getAll();
      return response.data.data?.availability || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch availability");
    }
  }
);

/* =========================
   GET AVAILABILITY BY THERAPIST
========================= */
export const getAvailabilityByTherapist = createAsyncThunk(
  "availability/getByTherapist",
  async (therapistId, { rejectWithValue }) => {
    try {
      const response = await availabilityAPI.getByTherapist(therapistId);
      return response.data.data?.availability || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch availability for therapist");
    }
  }
);

/* =========================
   CREATE AVAILABILITY
========================= */
export const createAvailability = createAsyncThunk(
  "availability/create",
  async (availabilityData, { rejectWithValue }) => {
    try {
      const response = await availabilityAPI.create(availabilityData);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create availability");
    }
  }
);

/* =========================
   UPDATE AVAILABILITY
========================= */
export const updateAvailability = createAsyncThunk(
  "availability/update",
  async ({ id, availabilityData }, { rejectWithValue }) => {
    try {
      const response = await availabilityAPI.update(id, availabilityData);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update availability");
    }
  }
);

/* =========================
   DELETE AVAILABILITY
========================= */
export const deleteAvailability = createAsyncThunk(
  "availability/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await availabilityAPI.delete(id);
      return id; // Return the ID of the deleted item
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete availability");
    }
  }
);

/* =========================
   BULK UPDATE AVAILABILITY
========================= */
export const bulkUpdateAvailability = createAsyncThunk(
  "availability/bulkUpdate",
  async (bulkData, { rejectWithValue }) => {
    try {
      const response = await availabilityAPI.bulkUpdate(bulkData);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to bulk update availability");
    }
  }
);

/* =========================
   INITIAL STATE
========================= */
const initialState = {
  availability: [],
  loading: false,
  error: null,
  selectedAvailability: null,
};

/* =========================
   SLICE
========================= */
const availabilitySlice = createSlice({
  name: "availability",
  initialState,
  reducers: {
    clearAvailabilityError: (state) => {
      state.error = null;
    },
    setSelectedAvailability: (state, action) => {
      state.selectedAvailability = action.payload;
    },
    clearSelectedAvailability: (state) => {
      state.selectedAvailability = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET ALL AVAILABILITY
      .addCase(getAllAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.availability = action.payload;
      })
      .addCase(getAllAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET AVAILABILITY BY THERAPIST
      .addCase(getAvailabilityByTherapist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailabilityByTherapist.fulfilled, (state, action) => {
        state.loading = false;
        state.availability = action.payload;
      })
      .addCase(getAvailabilityByTherapist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE AVAILABILITY
      .addCase(createAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.availability.push(action.payload);
      })
      .addCase(createAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE AVAILABILITY
      .addCase(updateAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAvailability.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.availability.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.availability[index] = action.payload;
        }
      })
      .addCase(updateAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE AVAILABILITY
      .addCase(deleteAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.availability = state.availability.filter(item => item._id !== action.payload);
      })
      .addCase(deleteAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // BULK UPDATE AVAILABILITY
      .addCase(bulkUpdateAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUpdateAvailability.fulfilled, (state, action) => {
        state.loading = false;
        // Replace the entire availability array with the updated data
        state.availability = action.payload;
      })
      .addCase(bulkUpdateAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearAvailabilityError, 
  setSelectedAvailability, 
  clearSelectedAvailability 
} = availabilitySlice.actions;

export default availabilitySlice.reducer;