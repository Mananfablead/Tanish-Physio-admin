import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cmsService from '../../services/cmsService';

// Async thunks
export const fetchHeroData = createAsyncThunk(
  'hero/fetchHeroData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cmsService.getHero();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateHeroData = createAsyncThunk(
  'hero/updateHeroData',
  async (heroData: any, { rejectWithValue }) => {
    try {
      const response = await cmsService.updateHero(heroData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const heroSlice = createSlice({
  name: 'hero',
  initialState: {
    data: {
      _id: '',
      heading: '',
      subHeading: '',
      description: '',
      ctaText: '',
      secondaryCtaText: '',
      image: '',
      isTherapistAvailable: false,
      trustedBy: '',
      certifiedTherapists: false,
      rating: '',
      features: [],
      isPublic: true
    },
    loading: false,
    error: null as string | null,
  },
  reducers: {
    clearHeroError: (state) => {
      state.error = null;
    },
    setHeroData: (state, action) => {
      state.data = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch hero data
      .addCase(fetchHeroData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHeroData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchHeroData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update hero data
      .addCase(updateHeroData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHeroData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateHeroData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearHeroError, setHeroData } = heroSlice.actions;
export default heroSlice.reducer;