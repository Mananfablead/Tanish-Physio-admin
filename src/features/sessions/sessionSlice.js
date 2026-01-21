import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { sessionAPI } from "@/api/apiClient";

// Fetch all sessions
export const fetchSessions = createAsyncThunk(
  "sessions/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await sessionAPI.getAll();
      return res.data.data.sessions || [];
    } catch (err) {
      return rejectWithValue("Session fetch failed");
    }
  }
);

// Fetch upcoming sessions
export const fetchUpcomingSessions = createAsyncThunk(
  "sessions/fetchUpcoming",
  async (_, { rejectWithValue }) => {
    try {
      const res = await sessionAPI.getUpcoming();
      return res.data.data.sessions || [];
    } catch (err) {
      return rejectWithValue("Upcoming session fetch failed");
    }
  }
);

// Fetch all upcoming sessions
export const fetchAllUpcomingSessions = createAsyncThunk(
  "sessions/fetchAllUpcoming",
  async (_, { rejectWithValue }) => {
    try {
      const res = await sessionAPI.getAllUpcoming();
      return res.data.data.sessions || [];
    } catch (err) {
      return rejectWithValue("All upcoming sessions fetch failed");
    }
  }
);

// Fetch session by ID
export const fetchSessionById = createAsyncThunk(
  "sessions/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await sessionAPI.getById(id);
      return res.data.data;
    } catch (err) {
      return rejectWithValue("Session fetch by ID failed");
    }
  }
);

// Create session
export const createSession = createAsyncThunk(
  "sessions/create",
  async (sessionData, { rejectWithValue }) => {
    try {
      const res = await sessionAPI.create(sessionData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue("Session creation failed");
    }
  }
);

// Update session
export const updateSession = createAsyncThunk(
  "sessions/update",
  async ({ id, sessionData }, { rejectWithValue }) => {
    try {
      const res = await sessionAPI.update(id, sessionData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue("Session update failed");
    }
  }
);

// Delete session
export const deleteSession = createAsyncThunk(
  "sessions/delete",
  async (id, { rejectWithValue }) => {
    try {
      await sessionAPI.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue("Session deletion failed");
    }
  }
);

// Delete session by admin
export const deleteSessionById = createAsyncThunk(
  "sessions/deleteById",
  async (id, { rejectWithValue }) => {
    try {
      await sessionAPI.deleteById(id);
      return id;
    } catch (err) {
      return rejectWithValue("Session deletion failed");
    }
  }
);

// Reschedule session
export const rescheduleSession = createAsyncThunk(
  "sessions/reschedule",
  async ({ id, sessionData }, { rejectWithValue }) => {
    try {
      const res = await sessionAPI.reschedule(id, sessionData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue("Session reschedule failed");
    }
  }
);

// Update session status
export const updateSessionStatus = createAsyncThunk(
  "sessions/updateStatus",
  async ({ id, status, notes }, { rejectWithValue }) => {
    try {
      const res = await sessionAPI.updateStatus(id, { status, notes });
      return res.data.data;
    } catch (err) {
      return rejectWithValue("Session status update failed");
    }
  }
);

const sessionSlice = createSlice({
  name: "sessions",
  initialState: {
    list: [],
    singleSession: null,
    loading: false,
    error: null,
    upcomingSessions: [],
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSingleSession: (state) => {
      state.singleSession = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all sessions
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch upcoming sessions
      .addCase(fetchUpcomingSessions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUpcomingSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingSessions = action.payload;
      })
      .addCase(fetchUpcomingSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch session by ID
      .addCase(fetchSessionById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSessionById.fulfilled, (state, action) => {
        state.loading = false;
        state.singleSession = action.payload;
      })
      .addCase(fetchSessionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create session
      .addCase(createSession.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update session
      .addCase(updateSession.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(session => session._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        // Update single session if it matches
        if (state.singleSession && state.singleSession._id === action.payload._id) {
          state.singleSession = action.payload;
        }
      })
      .addCase(updateSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete session
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(session => session._id !== action.payload);
      })
      .addCase(deleteSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Reschedule session
      .addCase(rescheduleSession.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(session => session._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        // Update single session if it matches
        if (state.singleSession && state.singleSession._id === action.payload._id) {
          state.singleSession = action.payload;
        }
      })
      .addCase(rescheduleSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(rescheduleSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete session by ID
      .addCase(deleteSessionById.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(session => session._id !== action.payload);
      })
      .addCase(deleteSessionById.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSessionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update session status
      .addCase(updateSessionStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(session => session._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        // Update single session if it matches
        if (state.singleSession && state.singleSession._id === action.payload._id) {
          state.singleSession = action.payload;
        }
      })
      .addCase(updateSessionStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSessionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch all upcoming sessions
      .addCase(fetchAllUpcomingSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingSessions = action.payload;
      })
      .addCase(fetchAllUpcomingSessions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllUpcomingSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default sessionSlice.reducer;
