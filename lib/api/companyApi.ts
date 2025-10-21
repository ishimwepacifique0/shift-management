import { apiClient } from './axios'
import { ApiResponse, Company } from '../../types'

export interface CompanyUpdateData {
  name?: string
  email?: string
  phone_number?: string
  location?: string
  representative_name?: string
  is_active?: boolean
}

export interface CompanyStats {
  totalUsers: number
  totalClients: number
  totalStaff: number
  totalShifts: number
  activeShifts: number
  totalServices: number
}

export const companyApi = {
  getCompany: async (companyId: number): Promise<ApiResponse<Company>> => {
    const response = await apiClient.get(`/admin/companies/${companyId}`)
    return response.data
  },

  updateCompany: async (companyId: number, data: CompanyUpdateData): Promise<ApiResponse<Company>> => {
    const response = await apiClient.put(`/admin/companies/${companyId}`, data)
    return response.data
  },

  updateCompanySettings: async (companyId: number, settings: CompanyUpdateData): Promise<ApiResponse<Company>> => {
    const response = await apiClient.put(`/admin/companies/${companyId}/settings`, settings)
    return response.data
  },

  getCompanyStats: async (companyId: number): Promise<ApiResponse<CompanyStats>> => {
    const response = await apiClient.get(`/admin/companies/${companyId}/statistics`)
    return response.data
  }
}
