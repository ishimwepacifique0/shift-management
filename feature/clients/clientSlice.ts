import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { clientApi, ClientFilters, CreateClientData, UpdateClientData } from "../../lib/api/clientApi"
import { Client, PaginatedResponse } from "../../types"

type ClientState = {
  clients: Client[]
  selectedClient: Client | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  } | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  filters: ClientFilters
}

const initialState: ClientState = {
  clients: [],
  selectedClient: null,
  pagination: null,
  status: "idle",
  error: null,
  filters: {
    page: 1,
    limit: 10,
  },
}

export const fetchClients = createAsyncThunk(
  "clients/fetchClients",
  async (filters?: ClientFilters) => {
    const response = await clientApi.getClients(filters)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || "Failed to fetch clients")
  }
)

export const fetchClientsByCompany = createAsyncThunk(
  "clients/fetchClientsByCompany",
  async ({ companyId, filters }: { companyId: number; filters?: Omit<ClientFilters, 'company_id'> }) => {
    const response = await clientApi.getClientsByCompany(companyId, filters)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || "Failed to fetch clients by company")
  }
)

export const fetchClientById = createAsyncThunk(
  "clients/fetchClientById",
  async (id: number) => {
    const response = await clientApi.getClientById(id)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || "Failed to fetch client")
  }
)

export const createClient = createAsyncThunk(
  "clients/createClient",
  async (data: CreateClientData, { rejectWithValue }) => {
    try {
      const response = await clientApi.createClient(data)
      if (response.success) {
        // Return both data and message from backend
        return { data: response.data, message: response.message }
      }
      // If response is not successful, extract error message
      const errorMessage = response.error || response.message || "Failed to create client"
      return rejectWithValue({ message: errorMessage, error: response.error || errorMessage })
    } catch (error: any) {
      // Extract error message from axios error response
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          "Failed to create client"
      return rejectWithValue({ 
        message: errorMessage, 
        error: error?.response?.data?.error || errorMessage
      })
    }
  }
)

export const updateClient = createAsyncThunk(
  "clients/updateClient",
  async ({ id, data }: { id: number; data: UpdateClientData }, { rejectWithValue }) => {
    try {
      const response = await clientApi.updateClient(id, data)
      if (response.success) {
        // Return both data and message from backend
        return { data: response.data, message: response.message }
      }
      // If response is not successful, extract error message
      const errorMessage = response.error || response.message || "Failed to update client"
      return rejectWithValue({ message: errorMessage, error: response.error || errorMessage })
    } catch (error: any) {
      // Extract error message from axios error response
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          "Failed to update client"
      return rejectWithValue({ 
        message: errorMessage, 
        error: error?.response?.data?.error || errorMessage
      })
    }
  }
)

export const deleteClient = createAsyncThunk(
  "clients/deleteClient",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await clientApi.deleteClient(id)
      if (response.success) {
        // Return both id and message from backend
        return { id, message: response.message }
      }
      // If response is not successful, extract error message
      const errorMessage = response.error || response.message || "Failed to delete client"
      return rejectWithValue({ message: errorMessage, error: response.error || errorMessage })
    } catch (error: any) {
      // Extract error message from axios error response
      // The backend returns error in error.response.data.error
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          "Failed to delete client"
      return rejectWithValue({ 
        message: errorMessage, 
        error: error?.response?.data?.error || errorMessage
      })
    }
  }
)

const clientSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<ClientFilters>>) {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearSelectedClient(state) {
      state.selectedClient = null
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.status = "succeeded"
        if (action.payload) {
          state.clients = action.payload.data || []
          state.pagination = action.payload.pagination || null
        }
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch clients"
      })
      .addCase(fetchClientsByCompany.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchClientsByCompany.fulfilled, (state, action) => {
        state.status = "succeeded"
        if (action.payload) {
          state.clients = action.payload.data || []
          state.pagination = action.payload.pagination || null
        }
      })
      .addCase(fetchClientsByCompany.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch clients by company"
      })
      .addCase(fetchClientById.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.selectedClient = action.payload || null
      })
      .addCase(fetchClientById.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch client"
      })
      .addCase(createClient.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.status = "succeeded"
        if (action.payload?.data) {
          state.clients.unshift(action.payload.data)
          if (state.pagination) {
            state.pagination.total += 1
          }
        }
      })
      .addCase(createClient.rejected, (state, action) => {
        state.status = "failed"
        // Extract error message from rejectWithValue payload or error message
        const errorPayload = action.payload as { message?: string; error?: string } | undefined
        state.error = errorPayload?.error || errorPayload?.message || action.error.message || "Failed to create client"
      })
      .addCase(updateClient.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.status = "succeeded"
        if (action.payload?.data) {
          const index = state.clients.findIndex(client => client.id === action.payload!.data!.id)
          if (index !== -1) {
            state.clients[index] = action.payload.data
          }
          if (state.selectedClient?.id === action.payload.data.id) {
            state.selectedClient = action.payload.data
          }
        }
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.status = "failed"
        // Extract error message from rejectWithValue payload or error message
        const errorPayload = action.payload as { message?: string; error?: string } | undefined
        state.error = errorPayload?.error || errorPayload?.message || action.error.message || "Failed to update client"
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        if (action.payload?.id !== undefined) {
          state.clients = state.clients.filter(client => client.id !== action.payload.id)
          if (state.pagination) {
            state.pagination.total -= 1
          }
          if (state.selectedClient?.id === action.payload.id) {
            state.selectedClient = null
          }
        }
      })
  },
})

export const { setFilters, clearSelectedClient, clearError } = clientSlice.actions
export default clientSlice.reducer