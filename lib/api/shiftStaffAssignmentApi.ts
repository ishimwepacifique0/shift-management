import { apiClient } from './axios'
import { ApiResponse } from '../../types'

export interface ShiftStaffAssignmentCreate {
  shift_id: number
  staff_id: number
  assignment_status: string
  notes?: string
  start_time?: string
  end_time?: string
}

export interface ShiftStaffAssignment {
  id: number
  company_id: number
  shift_id: number
  staff_id: number
  assignment_status: string
  assigned_by: number
  notes?: string
  start_time?: string
  end_time?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export const shiftStaffAssignmentApi = {
  create: async (data: ShiftStaffAssignmentCreate): Promise<ApiResponse<ShiftStaffAssignment>> => {
    const response = await apiClient.post('/shift-staff-assignments', data)
    return response.data
  },

  getAll: async (): Promise<ApiResponse<ShiftStaffAssignment[]>> => {
    const response = await apiClient.get('/shift-staff-assignments')
    return response.data
  },

  getByShiftId: async (shiftId: number): Promise<ApiResponse<ShiftStaffAssignment[]>> => {
    const response = await apiClient.get(`/shift-staff-assignments/shift/${shiftId}`)
    return response.data
  },

  update: async (id: number, data: Partial<ShiftStaffAssignmentCreate>): Promise<ApiResponse<ShiftStaffAssignment>> => {
    const response = await apiClient.put(`/shift-staff-assignments/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/shift-staff-assignments/${id}`)
    return response.data
  }
}
