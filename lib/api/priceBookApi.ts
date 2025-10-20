import { apiClient } from './axios'
import { ApiResponse, PaginatedResponse } from '../../types'

export interface PriceBook {
  id: number
  company_id: number
  name: string
  rate_per_hour: number
  service_type_id?: number
  day_of_week?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PriceBookCreate {
  name: string
  rate_per_hour: number
  service_type_id?: number
  day_of_week?: string
  notes?: string
  is_active?: boolean
}

export interface PriceBookUpdate {
  name?: string
  rate_per_hour?: number
  service_type_id?: number
  day_of_week?: string
  notes?: string
  is_active?: boolean
}

export const priceBookApi = {
  // Get all price books
  getAll: async (): Promise<ApiResponse<PriceBook[]>> => {
    const response = await apiClient.get('/price-books')
    return response.data
  },

  // Get paginated price books
  getPaginated: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<PriceBook>> => {
    const response = await apiClient.get(`/price-books/paginated?page=${page}&limit=${limit}`)
    return response.data
  },

  // Get active price books
  getActive: async (): Promise<ApiResponse<PriceBook[]>> => {
    const response = await apiClient.get('/price-books/active')
    return response.data
  },

  // Get price books by service type
  getByServiceType: async (serviceTypeId: number): Promise<ApiResponse<PriceBook[]>> => {
    const response = await apiClient.get(`/price-books/service-type/${serviceTypeId}`)
    return response.data
  },

  // Get price books by day of week
  getByDayOfWeek: async (dayOfWeek: string): Promise<ApiResponse<PriceBook[]>> => {
    const response = await apiClient.get(`/price-books/day/${dayOfWeek}`)
    return response.data
  },

  // Search price books
  search: async (query: string): Promise<ApiResponse<PriceBook[]>> => {
    const response = await apiClient.get(`/price-books/search?q=${encodeURIComponent(query)}`)
    return response.data
  },

  // Get price book by ID
  getById: async (id: number): Promise<ApiResponse<PriceBook>> => {
    const response = await apiClient.get(`/price-books/${id}`)
    return response.data
  },

  // Create new price book
  create: async (data: PriceBookCreate): Promise<ApiResponse<PriceBook>> => {
    const response = await apiClient.post('/price-books', data)
    return response.data
  },

  // Update price book
  update: async (id: number, data: PriceBookUpdate): Promise<ApiResponse<PriceBook>> => {
    const response = await apiClient.put(`/price-books/${id}`, data)
    return response.data
  },

  // Delete price book
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/price-books/${id}`)
    return response.data
  },
}
