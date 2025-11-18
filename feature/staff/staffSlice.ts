import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { staffApi, StaffFilters, CreateStaffData, CreateCompanyStaffData, UpdateStaffData } from "../../lib/api/staffApi"
import { Staff, PaginatedResponse } from "../../types"

type StaffState = {
  staff: Staff[]
  selectedStaff: Staff | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  } | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  errorSource: "fetch" | "create" | "update" | "delete" | null
  filters: StaffFilters
}

const initialState: StaffState = {
  staff: [],
  selectedStaff: null,
  pagination: null,
  status: "idle",
  error: null,
  errorSource: null,
  filters: {
    page: 1,
    limit: 10,
    isActive: true,
  },
}

export const fetchStaff = createAsyncThunk(
  "staff/fetchStaff",
  async (filters?: StaffFilters) => {
    const response = await staffApi.getStaff(filters)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || "Failed to fetch staff")
  }
)

export const fetchStaffByCompany = createAsyncThunk(
  "staff/fetchStaffByCompany",
  async ({ companyId, filters }: { companyId: number; filters?: Omit<StaffFilters, 'companyId'> }) => {
    const response = await staffApi.getStaffByCompany(companyId, filters)
    console.log('fetchStaffByCompany - Response:', response)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || "Failed to fetch staff by company")
  }
)

export const fetchStaffById = createAsyncThunk(
  "staff/fetchStaffById",
  async (id: number) => {
    const response = await staffApi.getStaffById(id)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || "Failed to fetch staff member")
  }
)

export const createStaff = createAsyncThunk(
  "staff/createStaff",
  async (data: CreateStaffData, { rejectWithValue }) => {
    try {
      const response = await staffApi.createStaff(data)
      if (response.success) {
        // Return both data and message from backend
        return { data: response.data, message: response.message }
      }
      // If response is not successful, extract error message
      const errorMessage = response.error || response.message || "Failed to create staff member"
      return rejectWithValue({ message: errorMessage, error: response.error || errorMessage })
    } catch (error: any) {
      // Extract error message from axios error response
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          "Failed to create staff member"
      return rejectWithValue({ 
        message: errorMessage, 
        error: error?.response?.data?.error || errorMessage
      })
    }
  }
)

export const createCompanyStaff = createAsyncThunk(
  "staff/createCompanyStaff",
  async (data: CreateCompanyStaffData, { rejectWithValue }) => {
    try {
      const response = await staffApi.createCompanyStaff(data)
      if (response.success) {
        // Return both data and message from backend
        return { data: response.data, message: response.message }
      }
      // If response is not successful, extract error message
      const errorMessage = response.error || response.message || "Failed to create staff member"
      return rejectWithValue({ message: errorMessage, error: response.error || errorMessage })
    } catch (error: any) {
      // Extract error message from axios error response
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          "Failed to create staff member"
      return rejectWithValue({ 
        message: errorMessage, 
        error: error?.response?.data?.error || errorMessage
      })
    }
  }
)

export const updateStaff = createAsyncThunk(
  "staff/updateStaff",
  async ({ id, data }: { id: number; data: UpdateStaffData }, { rejectWithValue }) => {
    try {
      const response = await staffApi.updateStaff(id, data)
      if (response.success) {
        // Return both data and message from backend
        return { data: response.data, message: response.message }
      }
      // If response is not successful, extract error message
      const errorMessage = response.error || response.message || "Failed to update staff member"
      return rejectWithValue({ message: errorMessage, error: response.error || errorMessage })
    } catch (error: any) {
      // Extract error message from axios error response
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          "Failed to update staff member"
      return rejectWithValue({ 
        message: errorMessage, 
        error: error?.response?.data?.error || errorMessage
      })
    }
  }
)

export const deleteStaff = createAsyncThunk(
  "staff/deleteStaff",
  async (id: number, { rejectWithValue }) => {
    try {
      // Use company staff endpoint for hard delete (removes both staff and user)
      const response = await staffApi.deleteCompanyStaff(id)
      if (response.success) {
        // Return both id and message from backend
        return { id, message: response.message }
      }
      // If response is not successful, extract error message
      const errorMessage = response.error || response.message || "Failed to delete staff member"
      return rejectWithValue({ message: errorMessage, error: response.error || errorMessage })
    } catch (error: any) {
      // Extract error message from axios error response
      // The backend returns error in error.response.data.error
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          "Failed to delete staff member"
      return rejectWithValue({ 
        message: errorMessage, 
        error: error?.response?.data?.error || errorMessage
      })
    }
  }
)

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<StaffFilters>>) {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearSelectedStaff(state) {
      state.selectedStaff = null
    },
    clearError(state) {
      state.error = null
      state.errorSource = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaff.pending, (state) => {
        state.status = "loading"
        state.error = null
        state.errorSource = null
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.error = null
        state.errorSource = null
        if (action.payload) {
          state.staff = action.payload.data || []
          state.pagination = action.payload.pagination || null
        }
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch staff"
        state.errorSource = "fetch"
      })
      .addCase(fetchStaffByCompany.pending, (state) => {
        state.status = "loading"
        state.error = null
        state.errorSource = null
      })
      .addCase(fetchStaffByCompany.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.error = null
        state.errorSource = null
        if (action.payload) {
          state.staff = action.payload.data || []
          state.pagination = action.payload.pagination || null
        }
      })
      .addCase(fetchStaffByCompany.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch staff by company"
        state.errorSource = "fetch"
      })
      .addCase(fetchStaffById.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchStaffById.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.selectedStaff = action.payload || null
      })
      .addCase(fetchStaffById.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch staff member"
      })
      .addCase(createStaff.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.status = "succeeded"
        if (action.payload?.data) {
          state.staff.unshift(action.payload.data)
          if (state.pagination) {
            state.pagination.total += 1
          }
        }
      })
      .addCase(createStaff.rejected, (state, action) => {
        state.status = "failed"
        // Extract error message from rejectWithValue payload or error message
        const errorPayload = action.payload as { message?: string; error?: string } | undefined
        state.error = errorPayload?.error || errorPayload?.message || action.error.message || "Failed to create staff member"
        state.errorSource = "create"
      })
      .addCase(createCompanyStaff.pending, (state) => {
        state.status = "loading"
        // Don't clear error on pending, let drawer handle its own errors
      })
      .addCase(createCompanyStaff.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.error = null
        state.errorSource = null
        if (action.payload?.data) {
          state.staff.unshift(action.payload.data)
          if (state.pagination) {
            state.pagination.total += 1
          }
        }
      })
      .addCase(createCompanyStaff.rejected, (state, action) => {
        state.status = "failed"
        // Extract error message from rejectWithValue payload or error message
        const errorPayload = action.payload as { message?: string; error?: string } | undefined
        state.error = errorPayload?.error || errorPayload?.message || action.error.message || "Failed to create staff member"
        state.errorSource = "create"
      })
      .addCase(updateStaff.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        state.status = "succeeded"
        if (action.payload?.data) {
          const index = state.staff.findIndex(staff => staff.id === action.payload!.data!.id)
          if (index !== -1) {
            state.staff[index] = action.payload.data
          }
          if (state.selectedStaff?.id === action.payload.data.id) {
            state.selectedStaff = action.payload.data
          }
        }
      })
      .addCase(updateStaff.rejected, (state, action) => {
        state.status = "failed"
        // Extract error message from rejectWithValue payload or error message
        const errorPayload = action.payload as { message?: string; error?: string } | undefined
        state.error = errorPayload?.error || errorPayload?.message || action.error.message || "Failed to update staff member"
        state.errorSource = "update"
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        if (action.payload?.id !== undefined) {
          state.staff = state.staff.filter(staff => staff.id !== action.payload.id)
          if (state.pagination) {
            state.pagination.total -= 1
          }
          if (state.selectedStaff?.id === action.payload.id) {
            state.selectedStaff = null
          }
        }
      })
  },
})

export const { setFilters, clearSelectedStaff, clearError } = staffSlice.actions
export default staffSlice.reducer