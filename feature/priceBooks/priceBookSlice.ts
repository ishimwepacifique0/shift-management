import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { priceBookApi } from "../../lib/api/priceBookApi"
import { PriceBook, PriceBookCreate, PriceBookUpdate } from "../../types"

type PriceBookState = {
  priceBooks: PriceBook[]
  activePriceBooks: PriceBook[]
  selectedPriceBook: PriceBook | null
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
    serviceTypeId?: number
    dayOfWeek?: string
  }
}

const initialState: PriceBookState = {
  priceBooks: [],
  activePriceBooks: [],
  selectedPriceBook: null,
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
export const fetchPriceBooks = createAsyncThunk(
  "priceBooks/fetchPriceBooks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await priceBookApi.getAll()
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || "Failed to fetch price books")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch price books")
    }
  }
)

export const fetchPriceBooksPaginated = createAsyncThunk(
  "priceBooks/fetchPriceBooksPaginated",
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const response = await priceBookApi.getPaginated(page, limit)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || "Failed to fetch price books")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch price books")
    }
  }
)

export const fetchActivePriceBooks = createAsyncThunk(
  "priceBooks/fetchActivePriceBooks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await priceBookApi.getActive()
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || "Failed to fetch active price books")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch active price books")
    }
  }
)

export const fetchPriceBookById = createAsyncThunk(
  "priceBooks/fetchPriceBookById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await priceBookApi.getById(id)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || "Failed to fetch price book")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch price book")
    }
  }
)

export const createPriceBook = createAsyncThunk(
  "priceBooks/createPriceBook",
  async (data: PriceBookCreate, { rejectWithValue }) => {
    try {
      const response = await priceBookApi.create(data)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || "Failed to create price book")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create price book")
    }
  }
)

export const updatePriceBook = createAsyncThunk(
  "priceBooks/updatePriceBook",
  async ({ id, data }: { id: number; data: PriceBookUpdate }, { rejectWithValue }) => {
    try {
      const response = await priceBookApi.update(id, data)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || "Failed to update price book")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update price book")
    }
  }
)

export const deletePriceBook = createAsyncThunk(
  "priceBooks/deletePriceBook",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await priceBookApi.delete(id)
      if (response.success) {
        return id
      }
      return rejectWithValue(response.message || "Failed to delete price book")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete price book")
    }
  }
)

export const searchPriceBooks = createAsyncThunk(
  "priceBooks/searchPriceBooks",
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await priceBookApi.search(query)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message || "Failed to search price books")
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to search price books")
    }
  }
)

const priceBookSlice = createSlice({
  name: "priceBooks",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<PriceBookState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = { isActive: true }
      state.searchQuery = ""
    },
    setSelectedPriceBook: (state, action: PayloadAction<PriceBook | null>) => {
      state.selectedPriceBook = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch price books
      .addCase(fetchPriceBooks.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchPriceBooks.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.priceBooks = action.payload
        state.error = null
      })
      .addCase(fetchPriceBooks.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      // Fetch active price books
      .addCase(fetchActivePriceBooks.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchActivePriceBooks.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.activePriceBooks = action.payload
        state.error = null
      })
      .addCase(fetchActivePriceBooks.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      // Fetch price book by ID
      .addCase(fetchPriceBookById.fulfilled, (state, action) => {
        state.selectedPriceBook = action.payload
      })
      // Create price book
      .addCase(createPriceBook.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(createPriceBook.fulfilled, (state, action) => {
        state.status = "succeeded"
        if (Array.isArray(state.priceBooks)) {
          state.priceBooks.unshift(action.payload)
        } else {
          state.priceBooks = [action.payload]
        }
        state.error = null
      })
      .addCase(createPriceBook.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      // Update price book
      .addCase(updatePriceBook.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(updatePriceBook.fulfilled, (state, action) => {
        state.status = "succeeded"
        const index = state.priceBooks.findIndex(pb => pb.id === action.payload.id)
        if (index !== -1) {
          state.priceBooks[index] = action.payload
        }
        state.error = null
      })
      .addCase(updatePriceBook.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      // Delete price book
      .addCase(deletePriceBook.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(deletePriceBook.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.priceBooks = state.priceBooks.filter(pb => pb.id !== action.payload)
        state.activePriceBooks = state.activePriceBooks.filter(pb => pb.id !== action.payload)
        state.error = null
      })
      .addCase(deletePriceBook.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      // Search price books
      .addCase(searchPriceBooks.fulfilled, (state, action) => {
        state.priceBooks = action.payload
      })
  },
})

export const {
  setSearchQuery,
  setFilters,
  clearFilters,
  setSelectedPriceBook,
  clearError,
} = priceBookSlice.actions

export default priceBookSlice.reducer
