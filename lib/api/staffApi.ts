import { apiClient } from './axios'
import PathVariable from '../../types/pathVaribale'
import { ApiResponse, PaginatedResponse, Staff } from '../../types'

export interface CreateStaffData {
  company_id: number
  user_id: number
  qualifications?: string
  certifications?: string
  hourly_rate?: number
  max_hours_per_week?: number
  availability_notes?: string
  hire_date?: string
  termination_date?: string
  documents?: string
}

export interface CreateCompanyStaffData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  company_id?: number // Optional for SUPER_ADMIN users
  qualifications?: string
  certifications?: string
  hourly_rate?: number
  max_hours_per_week?: number
  availability_notes?: string
  hire_date?: string
  termination_date?: string
  documents?: string
}

export interface UpdateStaffData extends Partial<CreateStaffData> {
  is_active?: boolean
}

export interface StaffFilters {
  page?: number
  limit?: number
  search?: string
  companyId?: string
  isActive?: boolean
  hasUser?: boolean
}

export const staffApi = {
  getStaff: async (filters?: StaffFilters): Promise<ApiResponse<PaginatedResponse<Staff>>> => {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.companyId) params.append('companyId', filters.companyId)
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())
    if (filters?.hasUser !== undefined) params.append('hasUser', filters.hasUser.toString())

    const response = await apiClient.get(`${PathVariable.STAFF}?${params.toString()}`)
    return response.data
  },

  getStaffById: async (id: number): Promise<ApiResponse<Staff>> => {
    const response = await apiClient.get(`${PathVariable.STAFF_BY_ID}/${id}`)
    return response.data
  },

  getStaffByCompany: async (companyId: number, filters?: Omit<StaffFilters, 'companyId'>): Promise<ApiResponse<PaginatedResponse<Staff>>> => {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())

    const response = await apiClient.get(`${PathVariable.STAFF_BY_COMPANY}/${companyId}?${params.toString()}`)
    return response.data
  },

  createStaff: async (data: CreateStaffData): Promise<ApiResponse<Staff>> => {
    const response = await apiClient.post(PathVariable.STAFF, data)
    return response.data
  },

  updateStaff: async (id: number, data: UpdateStaffData): Promise<ApiResponse<Staff>> => {
    const response = await apiClient.put(`${PathVariable.STAFF_BY_ID}/${id}`, data)
    return response.data
  },

  deleteStaff: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`${PathVariable.STAFF_BY_ID}/${id}`)
    return response.data
  },

  // Company-specific staff creation (automatically uses user's company_id)
  createCompanyStaff: async (data: CreateCompanyStaffData): Promise<ApiResponse<Staff>> => {
    const response = await apiClient.post(PathVariable.COMPANY_STAFF, data)
    return response.data
  }
}