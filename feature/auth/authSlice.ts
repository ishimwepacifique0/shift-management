import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { authApi } from "../../lib/api/authApi"
import { User } from "../../types"
import Cookies from "js-cookie"

type AuthState = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  isInitialized: boolean
  permissions: string[]
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  status: "idle",
  error: null,
  isInitialized: false,
  permissions: [],
}

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }) => {
    const response = await authApi.login(credentials)
    if (response.success) {
      return { 
        token: response.data.token, 
        user: response.data.user,
        permissions: response.data.permissions
      }
    }
    throw new Error(response.message || "Login failed")
  },
)

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await authApi.logout()
  } catch (error) {
    // Even if logout fails on server, we should clear local state
    console.error('Logout error:', error)
  }
  return Promise.resolve()
})

export const getCurrentUser = createAsyncThunk("auth/getCurrentUser", async () => {
  const response = await authApi.getCurrentUser()
  if (response.success) {
    return response.data
  }
  throw new Error(response.message || "Failed to get current user")
})

export const initializeAuth = createAsyncThunk("auth/initialize", async () => {
  // This is a synchronous operation to load from storage
  return Promise.resolve()
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; user: User; permissions?: string[] }>) {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      if (action.payload.permissions) {
        state.permissions = action.payload.permissions
      }
    },
    loadFromStorage(state) {
      if (typeof window !== "undefined") {
        const token = Cookies.get("token") || null
        const user = Cookies.get("user") || null
        if (token && user) {
          try {
            const parsedUser = JSON.parse(user)
            state.token = token
            state.user = parsedUser
            state.isAuthenticated = true
          } catch (error) {
            // If parsing fails, clear invalid data
            Cookies.remove("token")
            Cookies.remove("user")
          }
        }
      }
      state.isInitialized = true
    },
    clearCredentials(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.permissions = []
      if (typeof window !== "undefined") {
        Cookies.remove("token")
        Cookies.remove("user")
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.isAuthenticated = true
        state.token = action.payload.token
        state.user = action.payload.user
        state.permissions = action.payload.permissions
        if (typeof window !== "undefined") {
          Cookies.set("token", action.payload.token, { sameSite: "lax" })
          Cookies.set("user", JSON.stringify(action.payload.user), { sameSite: "lax" })
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Login failed"
        state.isAuthenticated = false
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = "idle"
        state.isAuthenticated = false
        state.token = null
        state.user = null
        state.permissions = []
        if (typeof window !== "undefined") {
          Cookies.remove("token")
          Cookies.remove("user")
        }
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.permissions = []
        if (typeof window !== "undefined") {
          Cookies.remove("token")
          Cookies.remove("user")
        }
      })
      .addCase(initializeAuth.fulfilled, (state) => {
        state.isInitialized = true
      })
  },
})

export const { setCredentials, loadFromStorage, clearCredentials } = authSlice.actions
export default authSlice.reducer



