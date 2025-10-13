import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { shiftApi, ShiftFilters, CreateShiftData, UpdateShiftData } from "../../lib/api/shiftApi"
import { Shift, ShiftType, PaginatedResponse } from "../../types"

type ShiftState = {
  shifts: Shift[]
  shiftTypes: ShiftType[]
  selectedShift: Shift | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  } | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  filters: ShiftFilters
}

const initialState: ShiftState = {
  shifts: [],
  shiftTypes: [],
  selectedShift: null,
  pagination: null,
  status: "idle",
  error: null,
  filters: {
    page: 1,
    limit: 10,
  },
}

export const fetchShifts = createAsyncThunk(
  "shifts/fetchShifts",
  async (filters?: ShiftFilters) => {
    const response = await shiftApi.getShifts(filters)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || "Failed to fetch shifts")
  }
)

export const fetchShiftById = createAsyncThunk(
  "shifts/fetchShiftById",
  async (id: number) => {
    const response = await shiftApi.getShiftById(id)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || "Failed to fetch shift")
  }
)

export const fetchShiftTypes = createAsyncThunk(
  "shifts/fetchShiftTypes",
  async (companyId?: number) => {
    const response = await shiftApi.getShiftTypes(companyId)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || "Failed to fetch shift types")
  }
)

export const createShift = createAsyncThunk(
  "shifts/createShift",
  async (data: CreateShiftData) => {
    const response = await shiftApi.createShift(data)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || "Failed to create shift")
  }
)

export const updateShift = createAsyncThunk(
  "shifts/updateShift",
  async ({ id, data }: { id: number; data: UpdateShiftData }) => {
    const response = await shiftApi.updateShift(id, data)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || "Failed to update shift")
  }
)

export const deleteShift = createAsyncThunk(
  "shifts/deleteShift",
  async (id: number) => {
    const response = await shiftApi.deleteShift(id)
    if (response.success) {
      return id
    }
    throw new Error(response.message || "Failed to delete shift")
  }
)

const shiftSlice = createSlice({
  name: "shifts",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<ShiftFilters>>) {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearSelectedShift(state) {
      state.selectedShift = null
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShifts.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchShifts.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.shifts = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(fetchShifts.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch shifts"
      })
      .addCase(fetchShiftById.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchShiftById.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.selectedShift = action.payload
      })
      .addCase(fetchShiftById.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch shift"
      })
      .addCase(fetchShiftTypes.fulfilled, (state, action) => {
        state.shiftTypes = action.payload
      })
      .addCase(createShift.fulfilled, (state, action) => {
        state.shifts.unshift(action.payload)
        if (state.pagination) {
          state.pagination.total += 1
        }
      })
      .addCase(updateShift.fulfilled, (state, action) => {
        const index = state.shifts.findIndex(shift => shift.id === action.payload.id)
        if (index !== -1) {
          state.shifts[index] = action.payload
        }
        if (state.selectedShift?.id === action.payload.id) {
          state.selectedShift = action.payload
        }
      })
      .addCase(deleteShift.fulfilled, (state, action) => {
        state.shifts = state.shifts.filter(shift => shift.id !== action.payload)
        if (state.pagination) {
          state.pagination.total -= 1
        }
        if (state.selectedShift?.id === action.payload) {
          state.selectedShift = null
        }
      })
  },
})

export const { setFilters, clearSelectedShift, clearError } = shiftSlice.actions
export default shiftSlice.reducer