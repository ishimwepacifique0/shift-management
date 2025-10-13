import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { userApi, UserFilters, CreateUserData } from "../../lib/api/userApi"
import { User, PaginatedResponse } from "../../types"

type UserState = {
  users: User[]
  selectedUser: User | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  } | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  filters: UserFilters
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  pagination: null,
  status: "idle",
  error: null,
  filters: {
    page: 1,
    limit: 100,
    is_active: true,
  },
}

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (filters?: UserFilters) => {
    const response = await userApi.getUsers(filters)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || "Failed to fetch users")
  }
)

export const fetchUsersNotStaff = createAsyncThunk(
  "users/fetchUsersNotStaff",
  async (companyId: number) => {
    const response = await userApi.getUsersNotStaff(companyId)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || "Failed to fetch users not staff")
  }
)

export const createUser = createAsyncThunk(
  "users/createUser",
  async (data: CreateUserData) => {
    const response = await userApi.createUser(data)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || "Failed to create user")
  }
)

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<UserFilters>>) {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearSelectedUser(state) {
      state.selectedUser = null
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.users = action.payload.data || []
        state.pagination = action.payload.pagination
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch users"
      })
      .addCase(fetchUsersNotStaff.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchUsersNotStaff.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.users = action.payload || []
      })
      .addCase(fetchUsersNotStaff.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch users not staff"
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.unshift(action.payload)
        if (state.pagination) {
          state.pagination.total += 1
        }
      })
  },
})

export const { setFilters, clearSelectedUser, clearError } = userSlice.actions
export default userSlice.reducer