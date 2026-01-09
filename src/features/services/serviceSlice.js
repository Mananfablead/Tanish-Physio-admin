import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { serviceAPI } from "@/api/apiClient";

/* ============================
   THUNKS
============================ */

export const fetchServices = createAsyncThunk(
  "services/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await serviceAPI.getAll();
      return res.data?.data?.services || res.data?.data || [];
    } catch (err) {
      return rejectWithValue("Services fetch failed");
    }
  }
);

export const fetchServiceById = createAsyncThunk(
  "services/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await serviceAPI.getById(id);
      return res.data?.data.service;
    } catch (err) {
      return rejectWithValue("Service fetch failed");
    }
  }
);

export const createService = createAsyncThunk(
  "services/create",
  async (serviceData, { rejectWithValue }) => {
    try {
      const res = await serviceAPI.create(serviceData);
      return res.data?.data;
   } catch (err) {
      console.error("API ERROR:", err.response?.data);
      return rejectWithValue(
        err.response?.data?.message || "Service creation failed"
      );
    }
  }
);

export const updateService = createAsyncThunk(
  "services/update",
  async ({ id, serviceData }, { rejectWithValue }) => {
    try {
      const res = await serviceAPI.update(id, serviceData);
      return res.data?.data;
    } catch (err) {
      return rejectWithValue("Service update failed");
    }
  }
);

export const deleteService = createAsyncThunk(
  "services/delete",
  async (id, { rejectWithValue }) => {
    try {
      await serviceAPI.delete(id);
      return id; // return deleted _id
    } catch (err) {
      return rejectWithValue("Service deletion failed");
    }
  }
);

/* ============================
   SLICE
============================ */

const serviceSlice = createSlice({
  name: "services",
  initialState: {
    list: [],
    currentService: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* ---------- FETCH ALL ---------- */
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- FETCH BY ID ---------- */
      .addCase(fetchServiceById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentService = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- CREATE ---------- */
      .addCase(createService.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })

      /* ---------- UPDATE ---------- */
      .addCase(updateService.fulfilled, (state, action) => {
        const updatedService = action.payload;
        if (!updatedService?._id) return;

        const index = state.list.findIndex(
          (service) => service._id === updatedService._id
        );

        if (index !== -1) {
          state.list[index] = updatedService;
        }

        if (state.currentService?._id === updatedService._id) {
          state.currentService = updatedService;
        }
      })

      /* ---------- DELETE ---------- */
      .addCase(deleteService.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.list = state.list.filter(
          (service) => service._id !== deletedId
        );

        if (state.currentService?._id === deletedId) {
          state.currentService = null;
        }
      });
  },
});

export default serviceSlice.reducer;
