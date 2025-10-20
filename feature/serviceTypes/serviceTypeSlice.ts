import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { serviceTypeApi } from "../../lib/api/serviceTypeApi"
import { ServiceType, ServiceTypeCreate, ServiceTypeUpdate } from "../../types"

type ServiceTypeState = {
  serviceTypes: ServiceType[]
  activeServiceTypes: ServiceType[]
  selectedServiceType: ServiceType | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  searchQuery: string
  filters: {
    isActive?: boolean
  }
}

const initialState: ServiceTypeState = {
  serviceTypes: [],
  activeServiceTypes: [],
  selectedServiceType: null,
  status: "idle",
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  searchQuery: "",
  filters: {
    isActive: true,
  },
}

// Async thunks
export const fetchServiceTypes = createAsyncThunk(
  "serviceTypes/fetchServiceTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await serviceTypeApi.getAll()
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || "Failed to fetch service types")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch service types")
    }
  }
)

export const fetchServiceTypesPaginated = createAsyncThunk(
  "serviceTypes/fetchServiceTypesPaginated",
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const response = await serviceTypeApi.getPaginated(page, limit)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch service types")
    }
  }
)

export const fetchActiveServiceTypes = createAsyncThunk(
  "serviceTypes/fetchActiveServiceTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await serviceTypeApi.getActive()
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || "Failed to fetch active service types")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch active service types")
    }
  }
)

export const searchServiceTypes = createAsyncThunk(
  "serviceTypes/searchServiceTypes",
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await serviceTypeApi.search(query)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || "Failed to search service types")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to search service types")
    }
  }
)

export const fetchServiceTypeById = createAsyncThunk(
  "serviceTypes/fetchServiceTypeById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await serviceTypeApi.getById(id)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || "Failed to fetch service type")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch service type")
    }
  }
)

export const createServiceType = createAsyncThunk(
  "serviceTypes/createServiceType",
  async (data: ServiceTypeCreate, { rejectWithValue }) => {
    try {
      const response = await serviceTypeApi.create(data)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || "Failed to create service type")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create service type")
    }
  }
)

export const updateServiceType = createAsyncThunk(
  "serviceTypes/updateServiceType",
  async ({ id, data }: { id: number; data: ServiceTypeUpdate }, { rejectWithValue }) => {
    try {
      const response = await serviceTypeApi.update(id, data)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || "Failed to update service type")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update service type")
    }
  }
)

export const deleteServiceType = createAsyncThunk(
  "serviceTypes/deleteServiceType",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await serviceTypeApi.delete(id)
      if (response.success) {
        return id
      }
      return rejectWithValue(response.message || "Failed to delete service type")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete service type")
    }
  }
)

const serviceTypeSlice = createSlice({
  name: "serviceTypes",
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
    },
    setFilters(state, action: PayloadAction<Partial<ServiceTypeState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters(state) {
      state.filters = { isActive: true }
      state.searchQuery = ""
    },
    setSelectedServiceType(state, action: PayloadAction<ServiceType | null>) {
      state.selectedServiceType = action.payload
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all service types
      .addCase(fetchServiceTypes.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchServiceTypes.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.serviceTypes = action.payload
        state.error = null
      })
      .addCase(fetchServiceTypes.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      // Fetch paginated service types
      .addCase(fetchServiceTypesPaginated.fulfilled, (state, action) => {
        state.serviceTypes = action.payload.data
        state.pagination = action.payload.pagination
      })
      // Fetch active service types
      .addCase(fetchActiveServiceTypes.fulfilled, (state, action) => {
        state.activeServiceTypes = action.payload
      })
      // Search service types
      .addCase(searchServiceTypes.fulfilled, (state, action) => {
        state.serviceTypes = action.payload
      })
      // Fetch service type by ID
      .addCase(fetchServiceTypeById.fulfilled, (state, action) => {
        state.selectedServiceType = action.payload
      })
      // Create service type
      .addCase(createServiceType.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(createServiceType.fulfilled, (state, action) => {
        state.status = "succeeded"
        if (Array.isArray(state.serviceTypes)) {
          state.serviceTypes.unshift(action.payload)
        } else {
          state.serviceTypes = [action.payload]
        }
        state.error = null
      })
      .addCase(createServiceType.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      // Update service type
      .addCase(updateServiceType.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(updateServiceType.fulfilled, (state, action) => {
        state.status = "succeeded"
        const index = state.serviceTypes.findIndex(st => st.id === action.payload.id)
        if (index !== -1) {
          state.serviceTypes[index] = action.payload
        }
        if (state.selectedServiceType?.id === action.payload.id) {
          state.selectedServiceType = action.payload
        }
        state.error = null
      })
      .addCase(updateServiceType.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      // Delete service type
      .addCase(deleteServiceType.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(deleteServiceType.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.serviceTypes = state.serviceTypes.filter(st => st.id !== action.payload)
        if (state.selectedServiceType?.id === action.payload) {
          state.selectedServiceType = null
        }
        state.error = null
      })
      .addCase(deleteServiceType.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
  },
})

export const {
  setSearchQuery,
  setFilters,
  clearFilters,
  setSelectedServiceType,
  clearError,
} = serviceTypeSlice.actions

export default serviceTypeSlice.reducer
