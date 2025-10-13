import { apiClient } from './axios'
import PathVariable from '../../types/pathVaribale'
import { ApiResponse, PaginatedResponse, Client } from '../../types'

export interface CreateClientData {
  first_name: string
  last_name: string
  date_of_birth?: string
  gender?: string
  ndis_number?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  additional_notes?: string
  email?: string
  phone?: string
  address?: string
  company_id: number
}

export interface UpdateClientData extends Partial<CreateClientData> {
  is_active?: boolean
}

export interface ClientFilters {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'inactive'
  company_id?: number
}

export const clientApi = {
  getClients: async (filters?: ClientFilters): Promise<ApiResponse<PaginatedResponse<Client>>> => {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.company_id) params.append('company_id', filters.company_id.toString())

    const response = await apiClient.get(`${PathVariable.CLIENTS}?${params.toString()}`)
    return response.data
  },

  getClientById: async (id: number): Promise<ApiResponse<Client>> => {
    const response = await apiClient.get(`${PathVariable.CLIENT_BY_ID}/${id}`)
    return response.data
  },

  getClientsByCompany: async (companyId: number, filters?: Omit<ClientFilters, 'company_id'>): Promise<ApiResponse<PaginatedResponse<Client>>> => {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.status) params.append('status', filters.status)

    const response = await apiClient.get(`${PathVariable.CLIENTS_BY_COMPANY}/${companyId}?${params.toString()}`)
    return response.data
  },

  createClient: async (data: CreateClientData): Promise<ApiResponse<Client>> => {
    const response = await apiClient.post(PathVariable.CLIENTS, data)
    return response.data
  },

  updateClient: async (id: number, data: UpdateClientData): Promise<ApiResponse<Client>> => {
    const response = await apiClient.put(`${PathVariable.CLIENT_BY_ID}/${id}`, data)
    return response.data
  },

  deleteClient: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`${PathVariable.CLIENT_BY_ID}/${id}`)
    return response.data
  }
}