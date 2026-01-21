import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { API } from "@/api/apiClient";

/* ============================
   THUNKS (API NORMALIZED)
============================ */

/**
 * Fetch all users
 * API → data.users (ARRAY)
 */
export const fetchUsers = createAsyncThunk(
  "users/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(API.USERS);
      return res.data?.data?.users || []; // ✅ FIXED
    } catch (err) {
      return rejectWithValue("Users fetch failed");
    }
  }
);

/**
 * Fetch user by ID
 * API → data (USER OBJECT)
 */
export const fetchUserById = createAsyncThunk(
  "users/fetchById",
  async (userId, { rejectWithValue }) => {
    try {
      const url = API.USER_BY_ID.replace(":id", userId);
      const res = await apiClient.get(url);
      return res.data?.data;
    } catch (err) {
      return rejectWithValue("User fetch by ID failed");
    }
  }
);

/**
 * Update user
 * API → data (UPDATED USER OBJECT)
 */
export const updateUser = createAsyncThunk(
  "users/update",
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const url = API.USER_BY_ID.replace(":id", userId);
      const res = await apiClient.put(url, userData);
      return res.data?.data;
    } catch (err) {
      return rejectWithValue("User update failed");
    }
  }
);

/**
 * Delete user
 * Return deleted user ID
 */
export const deleteUser = createAsyncThunk(
  "users/delete",
  async (userId, { rejectWithValue }) => {
    try {
      const url = API.USER_BY_ID.replace(":id", userId);
      await apiClient.delete(url);
      return userId; // ✅ return ID only
    } catch (err) {
      return rejectWithValue("User delete failed");
    }
  }
);

/* ============================
   SLICE
============================ */

const userSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
    selectedUser: null, // User object when selected, null when none
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* ---------- FETCH USERS ---------- */
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload; // payload = users[]
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- FETCH USER BY ID ---------- */
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;

        const user = action.payload;
        if (!user) return;

        // ✅ THIS IS THE KEY LINE
        state.selectedUser = user;

        // (optional but recommended)
        const index = state.list.findIndex((u) => u._id === user._id);

        if (index !== -1) {
          state.list[index] = user;
        } else {
          state.list.push(user);
        }
      })

      /* ---------- UPDATE USER ---------- */
    .addCase(updateUser.pending, (state) => {
  state.loading = true;
  state.error = null;
})

.addCase(updateUser.fulfilled, (state, action) => {
  state.loading = false;

  const updatedUser = action.payload;
  if (!updatedUser) return;

  // ✅ UPDATE selectedUser (THIS FIXES UI)
  state.selectedUser = updatedUser;

  // ✅ UPDATE list ALSO
  const index = state.list.findIndex((u) => u._id === updatedUser._id);
  if (index !== -1) {
    state.list[index] = updatedUser;
  } else {
    state.list.push(updatedUser);
  }
})

.addCase(updateUser.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})

      /* ---------- DELETE USER ---------- */
      .addCase(deleteUser.fulfilled, (state, action) => {
        const userId = action.payload;
        state.list = state.list.filter((user) => user._id !== userId);
      });
  },
});

export default userSlice.reducer;
