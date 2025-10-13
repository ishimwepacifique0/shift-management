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
  async (data: CreateClientData) => {
    const response = await clientApi.createClient(data)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || "Failed to create client")
  }
)

export const updateClient = createAsyncThunk(
  "clients/updateClient",
  async ({ id, data }: { id: number; data: UpdateClientData }) => {
    const response = await clientApi.updateClient(id, data)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || "Failed to update client")
  }
)

export const deleteClient = createAsyncThunk(
  "clients/deleteClient",
  async (id: number) => {
    const response = await clientApi.deleteClient(id)
    if (response.success) {
      return id
    }
    throw new Error(response.message || "Failed to delete client")
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
        state.clients = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch clients"
      })
      .addCase(fetchClientById.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.selectedClient = action.payload
      })
      .addCase(fetchClientById.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch client"
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.clients.unshift(action.payload)
        if (state.pagination) {
          state.pagination.total += 1
        }
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.clients.findIndex(client => client.id === action.payload.id)
        if (index !== -1) {
          state.clients[index] = action.payload
        }
        if (state.selectedClient?.id === action.payload.id) {
          state.selectedClient = action.payload
        }
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.clients = state.clients.filter(client => client.id !== action.payload)
        if (state.pagination) {
          state.pagination.total -= 1
        }
        if (state.selectedClient?.id === action.payload) {
          state.selectedClient = null
        }
      })
  },
})

export const { setFilters, clearSelectedClient, clearError } = clientSlice.actions
export default clientSlice.reducer