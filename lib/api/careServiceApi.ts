import { apiClient } from './axios'
import { CareService, CareServiceCreate, CareServiceUpdate, ApiResponse, PaginatedResponse } from '../../types'

export const careServiceApi = {
  // Get all care services
  getAll: async (): Promise<ApiResponse<CareService[]>> => {
    const response = await apiClient.get('/care-services')
    return response.data
  },

  // Get paginated care services
  getPaginated: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<CareService>> => {
    const response = await apiClient.get(`/care-services/paginated?page=${page}&limit=${limit}`)
    return response.data
  },

  // Get active care services
  getActive: async (): Promise<ApiResponse<CareService[]>> => {
    const response = await apiClient.get('/care-services/active')
    return response.data
  },

  // Search care services
  search: async (query: string): Promise<ApiResponse<CareService[]>> => {
    const response = await apiClient.get(`/care-services/search?q=${encodeURIComponent(query)}`)
    return response.data
  },

  // Get care services by price book
  getByPriceBook: async (priceBookId: number): Promise<ApiResponse<CareService[]>> => {
    const response = await apiClient.get(`/care-services/price-book/${priceBookId}`)
    return response.data
  },

  // Get care services by service type
  getByServiceType: async (serviceTypeId: number): Promise<ApiResponse<CareService[]>> => {
    const response = await apiClient.get(`/care-services/service-type/${serviceTypeId}`)
    return response.data
  },

  // Get care service by ID
  getById: async (id: number): Promise<ApiResponse<CareService>> => {
    const response = await apiClient.get(`/care-services/${id}`)
    return response.data
  },

  // Create new care service
  create: async (data: CareServiceCreate): Promise<ApiResponse<CareService>> => {
    const response = await apiClient.post('/care-services', data)
    return response.data
  },

  // Update care service
  update: async (id: number, data: CareServiceUpdate): Promise<ApiResponse<CareService>> => {
    const response = await apiClient.put(`/care-services/${id}`, data)
    return response.data
  },

  // Delete care service
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/care-services/${id}`)
    return response.data
  },
}
