import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cmsService from '../../services/cmsService';

// Async thunks
export const fetchStepsData = createAsyncThunk(
  'steps/fetchStepsData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cmsService.getSteps();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createStepData = createAsyncThunk(
  'steps/createStepData',
  async (stepData: any, { rejectWithValue }) => {
    try {
      const response = await cmsService.createStep(stepData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateStepData = createAsyncThunk(
  'steps/updateStepData',
  async ({ id, stepData }: { id: string; stepData: any }, { rejectWithValue }) => {
    try {
      const response = await cmsService.updateStep(id, stepData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteStepData = createAsyncThunk(
  'steps/deleteStepData',
  async (id: string, { rejectWithValue }) => {
    try {
      await cmsService.deleteStep(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const stepsSlice = createSlice({
  name: 'steps',
  initialState: {
    data: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {
    clearStepsError: (state) => {
      state.error = null;
    },
    setStepsData: (state, action) => {
      state.data = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch steps data
      .addCase(fetchStepsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStepsData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchStepsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create step
      .addCase(createStepData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStepData.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(createStepData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update step
      .addCase(updateStepData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStepData.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.findIndex((step: any) => step._id === action.payload._id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(updateStepData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete step
      .addCase(deleteStepData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStepData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((step: any) => step._id !== action.payload);
      })
      .addCase(deleteStepData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearStepsError, setStepsData } = stepsSlice.actions;
export default stepsSlice.reducer;