import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { therapistAPI } from "@/api/apiClient";

// Fetch all therapists
export const fetchTherapists = createAsyncThunk(
  "therapists/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await therapistAPI.getAll();
      // Handle the API response structure properly
      return res.data.data?.therapists || res.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Therapist fetch failed");
    }
  }
);

// Fetch therapist by ID
export const fetchTherapistById = createAsyncThunk(
  "therapists/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await therapistAPI.getById(id);
      // Handle the API response structure properly
      return res.data.data?.therapist || res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Therapist fetch by ID failed");
    }
  }
);

// Create therapist
export const createTherapist = createAsyncThunk(
  "therapists/create",
  async (therapistData, { rejectWithValue }) => {
    try {
      // Ensure the therapist data has all required fields
      const completeTherapistData = {
        name: therapistData.name,
        email: therapistData.email,
        title: therapistData.title,
        specialty: therapistData.specialty,
        bio: therapistData.bio,
        education: therapistData.education,
        experience: therapistData.experience,
        languages: therapistData.languages || [],
        sessionTypes: therapistData.sessionTypes || ["1-on-1"],
        licenseNumber: therapistData.licenseNumber,
        licenseExpiry: therapistData.licenseExpiry,
        hourlyRate: therapistData.hourlyRate,
        ...therapistData
      };
      
      const res = await therapistAPI.create(completeTherapistData);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Therapist creation failed");
    }
  }
);

// Update therapist
export const updateTherapist = createAsyncThunk(
  "therapists/update",
  async ({ id, therapistData }, { rejectWithValue }) => {
    try {
      // Ensure the therapist data has all required fields
      const completeTherapistData = {
        name: therapistData.name,
        email: therapistData.email,
        title: therapistData.title,
        specialty: therapistData.specialty,
        bio: therapistData.bio,
        education: therapistData.education,
        experience: therapistData.experience,
        languages: therapistData.languages || [],
        sessionTypes: therapistData.sessionTypes || ["1-on-1"],
        licenseNumber: therapistData.licenseNumber,
        licenseExpiry: therapistData.licenseExpiry,
        hourlyRate: therapistData.hourlyRate,
        ...therapistData
      };
      
      const res = await therapistAPI.update(id, completeTherapistData);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Therapist update failed");
    }
  }
);

// Delete therapist
export const deleteTherapist = createAsyncThunk(
  "therapists/delete",
  async (id, { rejectWithValue }) => {
    try {
      await therapistAPI.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Therapist deletion failed");
    }
  }
);

const therapistSlice = createSlice({
  name: "therapists",
  initialState: {
    list: [],
    singleTherapist: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSingleTherapist: (state) => {
      state.singleTherapist = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all therapists
      .addCase(fetchTherapists.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTherapists.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchTherapists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch therapist by ID
      .addCase(fetchTherapistById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTherapistById.fulfilled, (state, action) => {
        state.loading = false;
        state.singleTherapist = action.payload;
      })
      .addCase(fetchTherapistById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create therapist
      .addCase(createTherapist.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createTherapist.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTherapist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update therapist
      .addCase(updateTherapist.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(therapist => therapist.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        // Update single therapist if it matches
        if (state.singleTherapist && state.singleTherapist.id === action.payload.id) {
          state.singleTherapist = action.payload;
        }
      })
      .addCase(updateTherapist.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTherapist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete therapist
      .addCase(deleteTherapist.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(therapist => therapist.id !== action.payload);
      })
      .addCase(deleteTherapist.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTherapist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSingleTherapist } = therapistSlice.actions;
export default therapistSlice.reducer;