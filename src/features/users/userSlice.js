import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { API } from "@/api/apiClient";

export const fetchUsers = createAsyncThunk(
  "users/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(API.USERS);
      return res.data;
    } catch (err) {
      return rejectWithValue("Users fetch failed");
    }
  }
);

export const addUser = createAsyncThunk(
  "users/add",
  async (data, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(API.USERS, data);
      return res.data;
    } catch (err) {
      return rejectWithValue("Add user failed");
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.list.push(action.payload);
      });
  },
});

export default userSlice.reducer;
