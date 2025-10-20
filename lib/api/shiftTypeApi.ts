import { apiClient } from './axios'
import { ShiftType, ShiftTypeCreate, ShiftTypeUpdate } from '@/types'

export const shiftTypeApi = {
  // Get all shift types
  getAll: async (): Promise<ShiftType[]> => {
    console.log('shiftTypeApi.getAll - Making request to /shift-types')
    const response = await apiClient.get('/shift-types')
    console.log('shiftTypeApi.getAll - Response:', response.data)
    return response.data.data || response.data
  },

  // Get shift type by ID
  getById: async (id: number): Promise<ShiftType> => {
    const response = await apiClient.get(`/shift-types/${id}`)
    return response.data.data || response.data
  },

  // Create new shift type
  create: async (data: ShiftTypeCreate): Promise<ShiftType> => {
    const response = await apiClient.post('/shift-types', data)
    return response.data.data || response.data
  },

  // Update shift type
  update: async (id: number, data: ShiftTypeUpdate): Promise<ShiftType> => {
    const response = await apiClient.put(`/shift-types/${id}`, data)
    return response.data.data || response.data
  },

  // Delete shift type
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/shift-types/${id}`)
  },

  // Search shift types
  search: async (query: string): Promise<ShiftType[]> => {
    const response = await apiClient.get(`/shift-types/search?q=${encodeURIComponent(query)}`)
    return response.data.data || response.data
  },

  // Get paginated shift types
  getPaginated: async (page: number = 1, limit: number = 10): Promise<{
    data: ShiftType[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> => {
    const response = await apiClient.get(`/shift-types?page=${page}&limit=${limit}`)
    return response.data
  },

  // Get active shift types
  getActive: async (): Promise<ShiftType[]> => {
    console.log('shiftTypeApi.getActive - Making request to /shift-types/active')
    const response = await apiClient.get('/shift-types/active')
    console.log('shiftTypeApi.getActive - Response:', response.data)
    return response.data.data || response.data
  }
}
