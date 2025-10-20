import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { careServiceApi } from "../../lib/api/careServiceApi"
import { CareService, CareServiceCreate, CareServiceUpdate } from "../../types"

type CareServiceState = {
  careServices: CareService[]
  activeCareServices: CareService[]
  selectedCareService: CareService | null
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
    serviceTypeId?: number
    priceBookId?: number
    isActive?: boolean
  }
}

const initialState: CareServiceState = {
  careServices: [],
  activeCareServices: [],
  selectedCareService: null,
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
export const fetchCareServices = createAsyncThunk(
  "careServices/fetchCareServices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await careServiceApi.getAll()
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || "Failed to fetch care services")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch care services")
    }
  }
)

export const fetchCareServicesPaginated = createAsyncThunk(
  "careServices/fetchCareServicesPaginated",
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const response = await careServiceApi.getPaginated(page, limit)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch care services")
    }
  }
)

export const fetchActiveCareServices = createAsyncThunk(
  "careServices/fetchActiveCareServices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await careServiceApi.getActive()
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || "Failed to fetch active care services")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch active care services")
    }
  }
)

export const searchCareServices = createAsyncThunk(
  "careServices/searchCareServices",
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await careServiceApi.search(query)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || "Failed to search care services")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to search care services")
    }
  }
)

export const fetchCareServiceById = createAsyncThunk(
  "careServices/fetchCareServiceById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await careServiceApi.getById(id)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || "Failed to fetch care service")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch care service")
    }
  }
)

export const createCareService = createAsyncThunk(
  "careServices/createCareService",
  async (data: CareServiceCreate, { rejectWithValue }) => {
    try {
      const response = await careServiceApi.create(data)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || "Failed to create care service")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create care service")
    }
  }
)

export const updateCareService = createAsyncThunk(
  "careServices/updateCareService",
  async ({ id, data }: { id: number; data: CareServiceUpdate }, { rejectWithValue }) => {
    try {
      const response = await careServiceApi.update(id, data)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || "Failed to update care service")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update care service")
    }
  }
)

export const deleteCareService = createAsyncThunk(
  "careServices/deleteCareService",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await careServiceApi.delete(id)
      if (response.success) {
        return id
      }
      return rejectWithValue(response.message || "Failed to delete care service")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete care service")
    }
  }
)

const careServiceSlice = createSlice({
  name: "careServices",
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
    },
    setFilters(state, action: PayloadAction<Partial<CareServiceState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters(state) {
      state.filters = { isActive: true }
      state.searchQuery = ""
    },
    setSelectedCareService(state, action: PayloadAction<CareService | null>) {
      state.selectedCareService = action.payload
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all care services
      .addCase(fetchCareServices.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchCareServices.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.careServices = action.payload
        state.error = null
      })
      .addCase(fetchCareServices.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      // Fetch paginated care services
      .addCase(fetchCareServicesPaginated.fulfilled, (state, action) => {
        state.careServices = action.payload.data
        state.pagination = action.payload.pagination
      })
      // Fetch active care services
      .addCase(fetchActiveCareServices.fulfilled, (state, action) => {
        state.activeCareServices = action.payload
      })
      // Search care services
      .addCase(searchCareServices.fulfilled, (state, action) => {
        state.careServices = action.payload
      })
      // Fetch care service by ID
      .addCase(fetchCareServiceById.fulfilled, (state, action) => {
        state.selectedCareService = action.payload
      })
      // Create care service
      .addCase(createCareService.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(createCareService.fulfilled, (state, action) => {
        state.status = "succeeded"
        if (Array.isArray(state.careServices)) {
          state.careServices.unshift(action.payload)
        } else {
          state.careServices = [action.payload]
        }
        state.error = null
      })
      .addCase(createCareService.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      // Update care service
      .addCase(updateCareService.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(updateCareService.fulfilled, (state, action) => {
        state.status = "succeeded"
        const index = state.careServices.findIndex(cs => cs.id === action.payload.id)
        if (index !== -1) {
          state.careServices[index] = action.payload
        }
        if (state.selectedCareService?.id === action.payload.id) {
          state.selectedCareService = action.payload
        }
        state.error = null
      })
      .addCase(updateCareService.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      // Delete care service
      .addCase(deleteCareService.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(deleteCareService.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.careServices = state.careServices.filter(cs => cs.id !== action.payload)
        if (state.selectedCareService?.id === action.payload) {
          state.selectedCareService = null
        }
        state.error = null
      })
      .addCase(deleteCareService.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
  },
})

export const {
  setSearchQuery,
  setFilters,
  clearFilters,
  setSelectedCareService,
  clearError,
} = careServiceSlice.actions

export default careServiceSlice.reducer
