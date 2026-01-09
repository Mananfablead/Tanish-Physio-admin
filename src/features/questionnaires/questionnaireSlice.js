import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { questionnaireAPI } from "@/api/apiClient";

// Async thunks for questionnaire operations
export const fetchQuestionnaires = createAsyncThunk(
  "questionnaires/fetchQuestionnaires",
  async (_, { rejectWithValue }) => {
    try {
      const response = await questionnaireAPI.getAll();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchQuestionnaireById = createAsyncThunk(
  "questionnaires/fetchQuestionnaireById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await questionnaireAPI.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createQuestionnaire = createAsyncThunk(
  "questionnaires/createQuestionnaire",
  async (questionnaireData, { rejectWithValue }) => {
    try {
      const response = await questionnaireAPI.create(questionnaireData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateQuestionnaire = createAsyncThunk(
  "questionnaires/updateQuestionnaire",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await questionnaireAPI.update(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateQuestions = createAsyncThunk(
  "questionnaires/updateQuestions",
  async ({ id, questions }, { rejectWithValue }) => {
    try {
      const response = await questionnaireAPI.updateQuestions(id, questions);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteQuestionnaire = createAsyncThunk(
  "questionnaires/deleteQuestionnaire",
  async (id, { rejectWithValue }) => {
    try {
      const response = await questionnaireAPI.delete(id);
      return id; // Return id to remove from state
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const activateQuestionnaire = createAsyncThunk(
  "questionnaires/activateQuestionnaire",
  async (id, { rejectWithValue }) => {
    try {
      const response = await questionnaireAPI.activate(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state
const initialState = {
  questionnaires: [],
  currentQuestionnaire: null,
  loading: false,
  error: null,
};

// Questionnaire slice
const questionnaireSlice = createSlice({
  name: "questionnaires",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentQuestionnaire: (state, action) => {
      state.currentQuestionnaire = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all questionnaires
      .addCase(fetchQuestionnaires.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestionnaires.fulfilled, (state, action) => {
        state.loading = false;
        state.questionnaires = action.payload;
      })
      .addCase(fetchQuestionnaires.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single questionnaire
      .addCase(fetchQuestionnaireById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestionnaireById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuestionnaire = action.payload;
      })
      .addCase(fetchQuestionnaireById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create questionnaire
      .addCase(createQuestionnaire.fulfilled, (state, action) => {
        state.questionnaires.push(action.payload);
      })
      .addCase(createQuestionnaire.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Update questionnaire
      .addCase(updateQuestionnaire.fulfilled, (state, action) => {
        const index = state.questionnaires.findIndex(q => q._id === action.payload._id);
        if (index !== -1) {
          state.questionnaires[index] = action.payload;
        }
        if (state.currentQuestionnaire && state.currentQuestionnaire._id === action.payload._id) {
          state.currentQuestionnaire = action.payload;
        }
      })
      .addCase(updateQuestionnaire.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Update questions
      .addCase(updateQuestions.fulfilled, (state, action) => {
        const index = state.questionnaires.findIndex(q => q._id === action.payload._id);
        if (index !== -1) {
          state.questionnaires[index] = action.payload;
        }
        if (state.currentQuestionnaire && state.currentQuestionnaire._id === action.payload._id) {
          state.currentQuestionnaire = action.payload;
        }
      })
      .addCase(updateQuestions.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Delete questionnaire
      .addCase(deleteQuestionnaire.fulfilled, (state, action) => {
        state.questionnaires = state.questionnaires.filter(q => q._id !== action.payload);
        if (state.currentQuestionnaire && state.currentQuestionnaire._id === action.payload) {
          state.currentQuestionnaire = null;
        }
      })
      .addCase(deleteQuestionnaire.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Activate questionnaire
      .addCase(activateQuestionnaire.fulfilled, (state, action) => {
        // Deactivate all other questionnaires and activate the selected one
        state.questionnaires = state.questionnaires.map(q => ({
          ...q,
          isActive: q._id === action.payload._id
        }));
        
        if (state.currentQuestionnaire && state.currentQuestionnaire._id === action.payload._id) {
          state.currentQuestionnaire = action.payload;
        }
      })
      .addCase(activateQuestionnaire.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentQuestionnaire } = questionnaireSlice.actions;

export default questionnaireSlice.reducer;