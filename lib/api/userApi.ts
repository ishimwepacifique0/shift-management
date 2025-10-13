import { apiClient } from './axios'
import PathVariable from '../../types/pathVaribale'
import { ApiResponse, PaginatedResponse, User } from '../../types'

export interface UserFilters {
  page?: number
  limit?: number
  search?: string
  company_id?: number
  is_active?: boolean
}

export interface CreateUserData {
  company_id: number
  first_name: string
  last_name: string
  email: string
  password: string
  role_id: number
  phone?: string
  address?: string
  date_of_birth?: string
  profile_picture?: string
}

export const userApi = {
  createUser: async (data: CreateUserData): Promise<ApiResponse<User>> => {
    const response = await apiClient.post(PathVariable.USERS, data)
    return response.data
  },

  getUsers: async (filters?: UserFilters): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.company_id) params.append('company_id', filters.company_id.toString())
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString())

    const response = await apiClient.get(`${PathVariable.USERS}?${params.toString()}`)
    return response.data
  },

  getUsersByCompany: async (companyId: number, filters?: Omit<UserFilters, 'company_id'>): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString())

    const response = await apiClient.get(`${PathVariable.USERS_BY_COMPANY}/${companyId}?${params.toString()}`)
    return response.data
  },

  getUsersNotStaff: async (companyId: number): Promise<ApiResponse<User[]>> => {
    // This endpoint might not exist, so we'll use the regular users endpoint
    // and filter on the frontend
    const response = await apiClient.get(`${PathVariable.USERS}?company_id=${companyId}&is_active=true`)
    return response.data
  }
}