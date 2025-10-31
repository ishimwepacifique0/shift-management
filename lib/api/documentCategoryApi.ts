import { apiClient } from './axios'
import { ApiResponse } from '../types'

export interface DocumentCategory {
  id: number
  company_id: number
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DocumentCategoryCreate {
  name: string
  description?: string
  is_active?: boolean
}

export interface DocumentCategoryUpdate {
  name?: string
  description?: string
  is_active?: boolean
}

export const documentCategoryApi = {
  getCategories: async (): Promise<ApiResponse<DocumentCategory[]>> => {
    const response = await apiClient.get('/document-categories')
    return response.data
  },

  getCategoryById: async (id: number): Promise<ApiResponse<DocumentCategory>> => {
    const response = await apiClient.get(`/document-categories/${id}`)
    return response.data
  },

  createCategory: async (data: DocumentCategoryCreate): Promise<ApiResponse<DocumentCategory>> => {
    const response = await apiClient.post('/document-categories', data)
    return response.data
  },

  updateCategory: async (id: number, data: DocumentCategoryUpdate): Promise<ApiResponse<DocumentCategory>> => {
    const response = await apiClient.put(`/document-categories/${id}`, data)
    return response.data
  },

  deleteCategory: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/document-categories/${id}`)
    return response.data
  },
}

