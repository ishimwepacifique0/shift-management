import { apiClient } from './axios'
import PathVariable from '../../types/pathVaribale'
import { ApiResponse, PaginatedResponse, Shift, ShiftType } from '../../types'

export interface CreateShiftData {
  company_id: number
  client_id: number
  care_service_id: number
  shift_type_id?: number
  start_time: string
  end_time: string
  notes?: string
  location?: string
  status?: string
  instructions?: string
  is_recurring?: boolean
  recurrence_rule?: string
  break_minutes?: number
  price_book_id?: number
  assigned_staff_id?: number
}

export interface UpdateShiftData extends Partial<CreateShiftData> {
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}

export interface ShiftFilters {
  page?: number
  limit?: number
  search?: string
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  client_id?: number
  staff_id?: number
  company_id?: number
  shift_type_id?: number
  date_from?: string
  date_to?: string
}

export interface CreateShiftTypeData {
  company_id: number
  name: string
  description: string
  duration_hours: number
  hourly_rate: number
}

export interface UpdateShiftTypeData extends Partial<CreateShiftTypeData> {
  is_active?: boolean
}

export const shiftApi = {
  getShifts: async (filters?: ShiftFilters): Promise<ApiResponse<PaginatedResponse<Shift>>> => {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.client_id) params.append('client_id', filters.client_id.toString())
    if (filters?.staff_id) params.append('staff_id', filters.staff_id.toString())
    if (filters?.company_id) params.append('company_id', filters.company_id.toString())
    if (filters?.shift_type_id) params.append('shift_type_id', filters.shift_type_id.toString())
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)

    const response = await apiClient.get(`${PathVariable.SHIFTS}?${params.toString()}`)
    return response.data
  },

  getShiftById: async (id: number): Promise<ApiResponse<Shift>> => {
    const response = await apiClient.get(`${PathVariable.SHIFT_BY_ID}/${id}`)
    return response.data
  },

  getShiftsByStaff: async (staffId: number, filters?: Omit<ShiftFilters, 'staff_id'>): Promise<ApiResponse<PaginatedResponse<Shift>>> => {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.client_id) params.append('client_id', filters.client_id.toString())
    if (filters?.company_id) params.append('company_id', filters.company_id.toString())
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)

    const response = await apiClient.get(`${PathVariable.SHIFTS_BY_STAFF}/${staffId}?${params.toString()}`)
    return response.data
  },

  getShiftsByClient: async (clientId: number, filters?: Omit<ShiftFilters, 'client_id'>): Promise<ApiResponse<PaginatedResponse<Shift>>> => {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.staff_id) params.append('staff_id', filters.staff_id.toString())
    if (filters?.company_id) params.append('company_id', filters.company_id.toString())
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)

    const response = await apiClient.get(`${PathVariable.SHIFTS_BY_CLIENT}/${clientId}?${params.toString()}`)
    return response.data
  },

  createShift: async (data: CreateShiftData): Promise<ApiResponse<Shift>> => {
    const response = await apiClient.post(PathVariable.SHIFTS, data)
    return response.data
  },

  updateShift: async (id: number, data: UpdateShiftData): Promise<ApiResponse<Shift>> => {
    const response = await apiClient.put(`${PathVariable.SHIFT_BY_ID}/${id}`, data)
    return response.data
  },

  deleteShift: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`${PathVariable.SHIFT_BY_ID}/${id}`)
    return response.data
  },

  // Shift Types
  getShiftTypes: async (companyId?: number): Promise<ApiResponse<ShiftType[]>> => {
    const params = companyId ? `?company_id=${companyId}` : ''
    const response = await apiClient.get(`/shift-types${params}`)
    return response.data
  },

  createShiftType: async (data: CreateShiftTypeData): Promise<ApiResponse<ShiftType>> => {
    const response = await apiClient.post('/shift-types', data)
    return response.data
  },

  updateShiftType: async (id: number, data: UpdateShiftTypeData): Promise<ApiResponse<ShiftType>> => {
    const response = await apiClient.put(`/shift-types/${id}`, data)
    return response.data
  },

  deleteShiftType: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/shift-types/${id}`)
    return response.data
  }
}