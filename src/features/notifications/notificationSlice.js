import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationAPI } from "@/api/apiClient";

// Fetch admin notifications only (admin app)
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await notificationAPI.getAdmin();
      // Handle the API response structure properly
      return res.data.data?.notifications || res.data.data || res.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Notification fetch failed");
    }
  }
);

// Send notification
export const sendNotification = createAsyncThunk(
  "notifications/send",
  async (notificationData, { rejectWithValue }) => {
    try {
      const res = await notificationAPI.send(notificationData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Notification send failed");
    }
  }
);

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      const res = await notificationAPI.markAsRead(id);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Mark as read failed");
    }
  }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await notificationAPI.delete(id);
      return id; // Return the ID of deleted notification
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Delete notification failed");
    }
  }
);

// Delete all notifications
export const deleteAllNotifications = createAsyncThunk(
  "notifications/deleteAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await notificationAPI.deleteAll();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Delete all notifications failed");
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Used for websocket notifications (header + notifications page)
    prependNotification: (state, action) => {
      const incoming = action.payload;
      if (!incoming) return;

      const incomingId = incoming._id || incoming.id;
      if (incomingId) {
        const exists = state.list.some(
          (n) => (n?._id || n?.id) === incomingId
        );
        if (exists) return;
      }

      state.list.unshift(incoming);
    },
    // Add a reducer to remove a specific notification
    removeNotification: (state, action) => {
      state.list = state.list.filter(notification =>
        notification._id !== action.payload && notification.id !== action.payload
      );
    },
    // Add a reducer to clear all notifications
    clearAllNotifications: (state) => {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Send notification
      .addCase(sendNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload); // Add to the beginning of the list
      })
      .addCase(sendNotification.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Mark notification as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(notification =>
          notification._id === action.payload._id || notification.id === action.payload.id
        );
        if (index !== -1) {
          state.list[index] = { ...state.list[index], read: true };
        }
      })
      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading = true;
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(notification =>
          notification._id !== action.payload && notification.id !== action.payload
        );
      })
      .addCase(deleteNotification.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete all notifications
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.loading = false;
        state.list = [];
      })
      .addCase(deleteAllNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAllNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, prependNotification, removeNotification, clearAllNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;