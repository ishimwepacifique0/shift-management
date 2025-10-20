import { apiClient } from './axios'
import { ServiceType, ApiResponse, PaginatedResponse } from '../../types'

export interface ServiceTypeCreate {
  name: string
  description?: string
  is_active?: boolean
}

export interface ServiceTypeUpdate {
  name?: string
  description?: string
  is_active?: boolean
}

export const serviceTypeApi = {
  // Get all service types
  getAll: async (): Promise<ApiResponse<ServiceType[]>> => {
    const response = await apiClient.get('/service-types')
    return response.data
  },

  // Get paginated service types
  getPaginated: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<ServiceType>> => {
    const response = await apiClient.get(`/service-types/paginated?page=${page}&limit=${limit}`)
    return response.data
  },

  // Get active service types
  getActive: async (): Promise<ApiResponse<ServiceType[]>> => {
    const response = await apiClient.get('/service-types/active')
    return response.data
  },

  // Search service types
  search: async (query: string): Promise<ApiResponse<ServiceType[]>> => {
    const response = await apiClient.get(`/service-types/search?q=${encodeURIComponent(query)}`)
    return response.data
  },

  // Get service type by ID
  getById: async (id: number): Promise<ApiResponse<ServiceType>> => {
    const response = await apiClient.get(`/service-types/${id}`)
    return response.data
  },

  // Create new service type
  create: async (data: ServiceTypeCreate): Promise<ApiResponse<ServiceType>> => {
    const response = await apiClient.post('/service-types', data)
    return response.data
  },

  // Update service type
  update: async (id: number, data: ServiceTypeUpdate): Promise<ApiResponse<ServiceType>> => {
    const response = await apiClient.put(`/service-types/${id}`, data)
    return response.data
  },

  // Delete service type
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/service-types/${id}`)
    return response.data
  },
}
