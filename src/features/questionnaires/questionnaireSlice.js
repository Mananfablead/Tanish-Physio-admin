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

export const fetchActiveQuestionnaire = createAsyncThunk(
  "questionnaires/fetchActiveQuestionnaire",
  async (_, { rejectWithValue }) => {
    try {
      const response = await questionnaireAPI.getActive();
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

// Thunk to add a question by creating/updating a questionnaire
export const addQuestionToQuestionnaire = createAsyncThunk(
  "questionnaires/addQuestionToQuestionnaire",
  async ({ id, question }, { rejectWithValue }) => {
    try {
      // Get the current questionnaire
      const response = await questionnaireAPI.getById(id);
      const currentQuestionnaire = response.data.data;
      
      // Add the new question to the existing questions array
      const updatedQuestions = [...currentQuestionnaire.questions, question];
      
      // Update the entire questionnaire with the new question
      const updateData = {
        ...currentQuestionnaire,
        questions: updatedQuestions
      };
      
      const updateResponse = await questionnaireAPI.update(id, updateData);
      return updateResponse.data.data;
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
      
      // Fetch active questionnaire
      .addCase(fetchActiveQuestionnaire.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveQuestionnaire.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuestionnaire = action.payload;
        // Update questionnaires list if the active questionnaire is not already in the list
        const existingIndex = state.questionnaires.findIndex(q => q._id === action.payload._id);
        if (existingIndex === -1) {
          state.questionnaires.push(action.payload);
        } else {
          state.questionnaires[existingIndex] = action.payload;
        }
      })
      .addCase(fetchActiveQuestionnaire.rejected, (state, action) => {
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
      
      // Add question to questionnaire
      .addCase(addQuestionToQuestionnaire.fulfilled, (state, action) => {
        const index = state.questionnaires.findIndex(q => q._id === action.payload._id);
        if (index !== -1) {
          state.questionnaires[index] = action.payload;
        }
        if (state.currentQuestionnaire && state.currentQuestionnaire._id === action.payload._id) {
          state.currentQuestionnaire = action.payload;
        }
      })
      .addCase(addQuestionToQuestionnaire.rejected, (state, action) => {
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