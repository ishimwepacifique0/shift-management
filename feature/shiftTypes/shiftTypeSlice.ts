import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { shiftTypeApi } from '@/lib/api/shiftTypeApi'
import { ShiftType, ShiftTypeCreate, ShiftTypeUpdate } from '@/types'

interface ShiftTypeState {
  shiftTypes: ShiftType[]
  activeShiftTypes: ShiftType[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  searchQuery: string
  filters: {
    isActive?: boolean
  }
  selectedShiftType: ShiftType | null
}

const initialState: ShiftTypeState = {
  shiftTypes: [],
  activeShiftTypes: [],
  status: 'idle',
  error: null,
  searchQuery: '',
  filters: {},
  selectedShiftType: null,
}

// Async thunks
export const fetchShiftTypes = createAsyncThunk(
  'shiftTypes/fetchShiftTypes',
  async (_, { rejectWithValue }) => {
    try {
      console.log('fetchShiftTypes - Calling API...')
      const response = await shiftTypeApi.getAll()
      console.log('fetchShiftTypes - API response:', response)
      return response
    } catch (error) {
      console.error('fetchShiftTypes - API error:', error)
      return rejectWithValue(error)
    }
  }
)

export const fetchActiveShiftTypes = createAsyncThunk(
  'shiftTypes/fetchActiveShiftTypes',
  async (_, { rejectWithValue }) => {
    try {
      console.log('fetchActiveShiftTypes - Calling API...')
      const response = await shiftTypeApi.getActive()
      console.log('fetchActiveShiftTypes - API response:', response)
      return response
    } catch (error) {
      console.error('fetchActiveShiftTypes - API error:', error)
      return rejectWithValue(error)
    }
  }
)

export const createShiftType = createAsyncThunk(
  'shiftTypes/createShiftType',
  async (shiftTypeData: ShiftTypeCreate) => {
    const response = await shiftTypeApi.create(shiftTypeData)
    return response
  }
)

export const updateShiftType = createAsyncThunk(
  'shiftTypes/updateShiftType',
  async ({ id, data }: { id: number; data: ShiftTypeUpdate }) => {
    const response = await shiftTypeApi.update(id, data)
    return response
  }
)

export const deleteShiftType = createAsyncThunk(
  'shiftTypes/deleteShiftType',
  async (id: number) => {
    await shiftTypeApi.delete(id)
    return id
  }
)

export const searchShiftTypes = createAsyncThunk(
  'shiftTypes/searchShiftTypes',
  async (query: string) => {
    const response = await shiftTypeApi.search(query)
    return response
  }
)

const shiftTypeSlice = createSlice({
  name: 'shiftTypes',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setFilters: (state, action: PayloadAction<{ isActive?: boolean }>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
    },
    setSelectedShiftType: (state, action: PayloadAction<ShiftType | null>) => {
      state.selectedShiftType = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch shift types
      .addCase(fetchShiftTypes.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchShiftTypes.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.shiftTypes = action.payload
        state.error = null
      })
      .addCase(fetchShiftTypes.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to fetch shift types'
      })
      // Fetch active shift types
      .addCase(fetchActiveShiftTypes.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchActiveShiftTypes.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.activeShiftTypes = action.payload
        state.error = null
      })
      .addCase(fetchActiveShiftTypes.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to fetch active shift types'
      })
      // Create shift type
      .addCase(createShiftType.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(createShiftType.fulfilled, (state, action) => {
        state.status = 'succeeded'
        if (Array.isArray(state.shiftTypes)) {
          state.shiftTypes.unshift(action.payload)
        } else {
          state.shiftTypes = [action.payload]
        }
        if (action.payload.is_active) {
          if (Array.isArray(state.activeShiftTypes)) {
            state.activeShiftTypes.unshift(action.payload)
          } else {
            state.activeShiftTypes = [action.payload]
          }
        }
        state.error = null
      })
      .addCase(createShiftType.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to create shift type'
      })
      // Update shift type
      .addCase(updateShiftType.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updateShiftType.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.shiftTypes.findIndex(st => st.id === action.payload.id)
        if (index !== -1) {
          state.shiftTypes[index] = action.payload
        }
        const activeIndex = state.activeShiftTypes.findIndex(st => st.id === action.payload.id)
        if (action.payload.is_active) {
          if (activeIndex !== -1) {
            state.activeShiftTypes[activeIndex] = action.payload
          } else {
            state.activeShiftTypes.unshift(action.payload)
          }
        } else {
          if (activeIndex !== -1) {
            state.activeShiftTypes.splice(activeIndex, 1)
          }
        }
        state.error = null
      })
      .addCase(updateShiftType.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to update shift type'
      })
      // Delete shift type
      .addCase(deleteShiftType.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(deleteShiftType.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.shiftTypes = state.shiftTypes.filter(st => st.id !== action.payload)
        state.activeShiftTypes = state.activeShiftTypes.filter(st => st.id !== action.payload)
        state.error = null
      })
      .addCase(deleteShiftType.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to delete shift type'
      })
      // Search shift types
      .addCase(searchShiftTypes.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(searchShiftTypes.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.shiftTypes = action.payload
        state.error = null
      })
      .addCase(searchShiftTypes.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to search shift types'
      })
  },
})

export const {
  setSearchQuery,
  setFilters,
  clearFilters,
  setSelectedShiftType,
  clearError,
} = shiftTypeSlice.actions

export default shiftTypeSlice.reducer
