import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cmsAPI } from '../../api/apiClient';

// Async thunks for CMS operations
export const fetchAllCmsData = createAsyncThunk(
  'cms/fetchAllCmsData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cmsAPI.getAllCmsData();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateHero = createAsyncThunk(
  'cms/updateHero',
  async (heroData, { rejectWithValue }) => {
    try {
      const response = await cmsAPI.updateHero(heroData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateStep = createAsyncThunk(
  'cms/updateStep',
  async ({ id, stepData }, { rejectWithValue }) => {
    try {
      const response = await cmsAPI.updateStep(id, stepData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createStep = createAsyncThunk(
  'cms/createStep',
  async (stepData, { rejectWithValue }) => {
    try {
      const response = await cmsAPI.createStep(stepData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteStep = createAsyncThunk(
  'cms/deleteStep',
  async (id, { rejectWithValue }) => {
    try {
      await cmsAPI.deleteStep(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateConditions = createAsyncThunk(
  'cms/updateConditions',
  async (conditionsData, { rejectWithValue }) => {
    try {
      const response = await cmsAPI.updateConditions(conditionsData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateWhyUs = createAsyncThunk(
  'cms/updateWhyUs',
  async (whyUsData, { rejectWithValue }) => {
    try {
      const response = await cmsAPI.updateWhyUs(whyUsData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateFaq = createAsyncThunk(
  'cms/updateFaq',
  async ({ id, faqData }, { rejectWithValue }) => {
    try {
      const response = await cmsAPI.updateFaq(id, faqData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createFaq = createAsyncThunk(
  'cms/createFaq',
  async (faqData, { rejectWithValue }) => {
    try {
      const response = await cmsAPI.createFaq(faqData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteFaq = createAsyncThunk(
  'cms/deleteFaq',
  async (id, { rejectWithValue }) => {
    try {
      await cmsAPI.deleteFaq(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTerms = createAsyncThunk(
  'cms/updateTerms',
  async (termsData, { rejectWithValue }) => {
    try {
      const response = await cmsAPI.updateTerms(termsData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateFeaturedTherapist = createAsyncThunk(
  'cms/updateFeaturedTherapist',
  async (therapistData, { rejectWithValue }) => {
    try {
      const response = await cmsAPI.updateFeaturedTherapist(therapistData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateContact = createAsyncThunk(
  'cms/updateContact',
  async (contactData, { rejectWithValue }) => {
    try {
      const response = await cmsAPI.updateContact(contactData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateAbout = createAsyncThunk(
  'cms/updateAbout',
  async (aboutData, { rejectWithValue }) => {
    try {
      const response = await cmsAPI.updateAbout(aboutData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const cmsSlice = createSlice({
  name: 'cms',
  initialState: {
    data: {
      hero: {},
      steps: [],
      conditions: {},
      whyUs: {},
      faq: [],
      terms: {},
      featuredTherapist: {},
      contact: {},
      about: {},
    },
    loading: {
      fetchAll: false,
      updateHero: false,
      updateStep: false,
      createStep: false,
      deleteStep: false,
      updateConditions: false,
      updateWhyUs: false,
      updateFaq: false,
      createFaq: false,
      deleteFaq: false,
      updateTerms: false,
      updateFeaturedTherapist: false,
      updateContact: false,
      updateAbout: false,
    },
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all CMS data
      .addCase(fetchAllCmsData.pending, (state) => {
        state.loading.fetchAll = true;
        state.error = null;
      })
      .addCase(fetchAllCmsData.fulfilled, (state, action) => {
        state.loading.fetchAll = false;
        state.data = {
          ...state.data,
          ...action.payload,
        };
      })
      .addCase(fetchAllCmsData.rejected, (state, action) => {
        state.loading.fetchAll = false;
        state.error = action.payload;
      })
      
      // Update hero
      .addCase(updateHero.pending, (state) => {
        state.loading.updateHero = true;
        state.error = null;
      })
      .addCase(updateHero.fulfilled, (state, action) => {
        state.loading.updateHero = false;
        state.data.hero = action.payload;
      })
      .addCase(updateHero.rejected, (state, action) => {
        state.loading.updateHero = false;
        state.error = action.payload;
      })
      
      // Update step
      .addCase(updateStep.pending, (state) => {
        state.loading.updateStep = true;
        state.error = null;
      })
      .addCase(updateStep.fulfilled, (state, action) => {
        state.loading.updateStep = false;
        const index = state.data.steps.findIndex(step => step._id === action.payload._id);
        if (index !== -1) {
          state.data.steps[index] = action.payload;
        }
      })
      .addCase(updateStep.rejected, (state, action) => {
        state.loading.updateStep = false;
        state.error = action.payload;
      })
      
      // Create step
      .addCase(createStep.pending, (state) => {
        state.loading.createStep = true;
        state.error = null;
      })
      .addCase(createStep.fulfilled, (state, action) => {
        state.loading.createStep = false;
        state.data.steps.push(action.payload);
      })
      .addCase(createStep.rejected, (state, action) => {
        state.loading.createStep = false;
        state.error = action.payload;
      })
      
      // Delete step
      .addCase(deleteStep.pending, (state) => {
        state.loading.deleteStep = true;
        state.error = null;
      })
      .addCase(deleteStep.fulfilled, (state, action) => {
        state.loading.deleteStep = false;
        state.data.steps = state.data.steps.filter(step => step._id !== action.payload);
      })
      .addCase(deleteStep.rejected, (state, action) => {
        state.loading.deleteStep = false;
        state.error = action.payload;
      })
      
      // Update conditions
      .addCase(updateConditions.pending, (state) => {
        state.loading.updateConditions = true;
        state.error = null;
      })
      .addCase(updateConditions.fulfilled, (state, action) => {
        state.loading.updateConditions = false;
        state.data.conditions = action.payload;
      })
      .addCase(updateConditions.rejected, (state, action) => {
        state.loading.updateConditions = false;
        state.error = action.payload;
      })
      
      // Update why us
      .addCase(updateWhyUs.pending, (state) => {
        state.loading.updateWhyUs = true;
        state.error = null;
      })
      .addCase(updateWhyUs.fulfilled, (state, action) => {
        state.loading.updateWhyUs = false;
        state.data.whyUs = action.payload;
      })
      .addCase(updateWhyUs.rejected, (state, action) => {
        state.loading.updateWhyUs = false;
        state.error = action.payload;
      })
      
      // Update FAQ
      .addCase(updateFaq.pending, (state) => {
        state.loading.updateFaq = true;
        state.error = null;
      })
      .addCase(updateFaq.fulfilled, (state, action) => {
        state.loading.updateFaq = false;
        const index = state.data.faq.findIndex(faq => faq._id === action.payload._id);
        if (index !== -1) {
          state.data.faq[index] = action.payload;
        }
      })
      .addCase(updateFaq.rejected, (state, action) => {
        state.loading.updateFaq = false;
        state.error = action.payload;
      })
      
      // Create FAQ
      .addCase(createFaq.pending, (state) => {
        state.loading.createFaq = true;
        state.error = null;
      })
      .addCase(createFaq.fulfilled, (state, action) => {
        state.loading.createFaq = false;
        state.data.faq.push(action.payload);
      })
      .addCase(createFaq.rejected, (state, action) => {
        state.loading.createFaq = false;
        state.error = action.payload;
      })
      
      // Delete FAQ
      .addCase(deleteFaq.pending, (state) => {
        state.loading.deleteFaq = true;
        state.error = null;
      })
      .addCase(deleteFaq.fulfilled, (state, action) => {
        state.loading.deleteFaq = false;
        state.data.faq = state.data.faq.filter(faq => faq._id !== action.payload);
      })
      .addCase(deleteFaq.rejected, (state, action) => {
        state.loading.deleteFaq = false;
        state.error = action.payload;
      })
      
      // Update terms
      .addCase(updateTerms.pending, (state) => {
        state.loading.updateTerms = true;
        state.error = null;
      })
      .addCase(updateTerms.fulfilled, (state, action) => {
        state.loading.updateTerms = false;
        state.data.terms = action.payload;
      })
      .addCase(updateTerms.rejected, (state, action) => {
        state.loading.updateTerms = false;
        state.error = action.payload;
      })
      
      // Update featured therapist
      .addCase(updateFeaturedTherapist.pending, (state) => {
        state.loading.updateFeaturedTherapist = true;
        state.error = null;
      })
      .addCase(updateFeaturedTherapist.fulfilled, (state, action) => {
        state.loading.updateFeaturedTherapist = false;
        state.data.featuredTherapist = action.payload;
      })
      .addCase(updateFeaturedTherapist.rejected, (state, action) => {
        state.loading.updateFeaturedTherapist = false;
        state.error = action.payload;
      })
      
      // Update contact
      .addCase(updateContact.pending, (state) => {
        state.loading.updateContact = true;
        state.error = null;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        state.loading.updateContact = false;
        state.data.contact = action.payload;
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.loading.updateContact = false;
        state.error = action.payload;
      })
      
      // Update about
      .addCase(updateAbout.pending, (state) => {
        state.loading.updateAbout = true;
        state.error = null;
      })
      .addCase(updateAbout.fulfilled, (state, action) => {
        state.loading.updateAbout = false;
        state.data.about = action.payload;
      })
      .addCase(updateAbout.rejected, (state, action) => {
        state.loading.updateAbout = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = cmsSlice.actions;
export default cmsSlice.reducer;