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
  filters: StaffFilters
}

const initialState: StaffState = {
  staff: [],
  selectedStaff: null,
  pagination: null,
  status: "idle",
  error: null,
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
  async (data: CreateStaffData) => {
    const response = await staffApi.createStaff(data)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || "Failed to create staff member")
  }
)

export const createCompanyStaff = createAsyncThunk(
  "staff/createCompanyStaff",
  async (data: CreateCompanyStaffData) => {
    const response = await staffApi.createCompanyStaff(data)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || "Failed to create staff member")
  }
)

export const updateStaff = createAsyncThunk(
  "staff/updateStaff",
  async ({ id, data }: { id: number; data: UpdateStaffData }) => {
    const response = await staffApi.updateStaff(id, data)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || "Failed to update staff member")
  }
)

export const deleteStaff = createAsyncThunk(
  "staff/deleteStaff",
  async (id: number) => {
    const response = await staffApi.deleteStaff(id)
    if (response.success) {
      return id
    }
    throw new Error(response.message || "Failed to delete staff member")
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaff.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.staff = action.payload.data || []
        state.pagination = action.payload.pagination
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch staff"
      })
      .addCase(fetchStaffByCompany.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchStaffByCompany.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.staff = action.payload.data || []
        state.pagination = action.payload.pagination
      })
      .addCase(fetchStaffByCompany.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch staff by company"
      })
      .addCase(fetchStaffById.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchStaffById.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.selectedStaff = action.payload
      })
      .addCase(fetchStaffById.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch staff member"
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.staff.unshift(action.payload)
        if (state.pagination) {
          state.pagination.total += 1
        }
      })
      .addCase(createCompanyStaff.fulfilled, (state, action) => {
        state.staff.unshift(action.payload)
        if (state.pagination) {
          state.pagination.total += 1
        }
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        const index = state.staff.findIndex(staff => staff.id === action.payload.id)
        if (index !== -1) {
          state.staff[index] = action.payload
        }
        if (state.selectedStaff?.id === action.payload.id) {
          state.selectedStaff = action.payload
        }
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.staff = state.staff.filter(staff => staff.id !== action.payload)
        if (state.pagination) {
          state.pagination.total -= 1
        }
        if (state.selectedStaff?.id === action.payload) {
          state.selectedStaff = null
        }
      })
  },
})

export const { setFilters, clearSelectedStaff, clearError } = staffSlice.actions
export default staffSlice.reducer