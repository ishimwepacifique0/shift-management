import { apiClient } from './axios'
import { ApiResponse } from '@/types'

export interface ShiftAssignment {
  id: number
  shift_id: number
  staff_id: number
  assignment_status: "offered" | "accepted" | "declined" | "replaced"
  assigned_at?: string
  notes?: string
  staff: {
    id: number
    user: {
      first_name: string
      last_name: string
      email: string
      profile_picture?: string
    }
  }
}

export interface CreateAssignmentData {
  shift_id: number
  staff_id: number
  notes?: string
}

export interface UpdateAssignmentData {
  assignment_status?: "offered" | "accepted" | "declined" | "replaced"
  notes?: string
}

export const shiftAssignmentApi = {
  // Get assignments for a shift
  getShiftAssignments: async (shiftId: number): Promise<ApiResponse<ShiftAssignment[]>> => {
    const response = await apiClient.get(`/shift-staff-assignments/shift/${shiftId}`)
    return response.data
  },

  // Create new assignment
  createAssignment: async (data: CreateAssignmentData): Promise<ApiResponse<ShiftAssignment>> => {
    const response = await apiClient.post('/shift-staff-assignments', data)
    return response.data
  },

  // Update assignment
  updateAssignment: async (assignmentId: number, data: UpdateAssignmentData): Promise<ApiResponse<ShiftAssignment>> => {
    const response = await apiClient.put(`/shift-staff-assignments/${assignmentId}`, data)
    return response.data
  },

  // Delete assignment
  deleteAssignment: async (assignmentId: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/shift-staff-assignments/${assignmentId}`)
    return response.data
  },

  // Replace staff member
  replaceStaff: async (assignmentId: number, newStaffId: number, notes?: string): Promise<ApiResponse<ShiftAssignment>> => {
    const response = await apiClient.put(`/shift-staff-assignments/${assignmentId}/replace`, {
      new_staff_id: newStaffId,
      notes
    })
    return response.data
  },

  // Accept assignment
  acceptAssignment: async (assignmentId: number): Promise<ApiResponse<ShiftAssignment>> => {
    const response = await apiClient.put(`/shift-staff-assignments/${assignmentId}/accept`)
    return response.data
  },

  // Decline assignment
  declineAssignment: async (assignmentId: number, reason?: string): Promise<ApiResponse<ShiftAssignment>> => {
    const response = await apiClient.put(`/shift-staff-assignments/${assignmentId}/decline`, {
      reason
    })
    return response.data
  }
}
