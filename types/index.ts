export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  date_of_birth: string
  profile_picture?: string
  user_type: "ADMIN" | "STAFF" | "CLIENT"
  company_id?: number
  is_active: boolean
  last_login_at?: string
  email_verified: boolean
  created_at: string
  updated_at: string
  staff?: Staff
}

export interface Staff {
  id: number
  user_id: number
  company_id: number
  qualifications?: string
  certifications?: string
  hourly_rate?: number
  max_hours_per_week?: number
  availability_notes?: string
  hire_date?: string
  termination_date?: string
  documents?: string
  is_active: boolean
  created_at: string
  updated_at: string
  user: User
}

export interface Client {
  id: number
  company_id: number
  first_name: string
  last_name: string
  date_of_birth?: string
  gender?: string
  ndis_number?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  additional_notes?: string
  is_active: boolean
  email?: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface Shift {
  id: number
  company_id: number
  client_id: number
  shift_type_id: number
  care_service_id: number
  start_time: string
  end_time: string
  is_recurring: boolean
  recurrence_rule?: string
  notes?: string
  location?: string
  status: "draft" | "published" | "assigned" | "in_progress" | "completed" | "cancelled"
  instructions?: string
  break_minutes: number
  price_book_id?: number
  is_active: boolean
  created_at: string
  updated_at: string
  client?: Client
  shift_type?: ShiftType
  care_service?: any // Add proper type if needed
  price_book?: any // Add proper type if needed
  shift_staff_assignments?: ShiftStaffAssignment[]
}

export interface ShiftType {
  id: number
  company_id: number
  name: string
  description: string
  duration_hours: number
  hourly_rate: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ShiftStaffAssignment {
  id: number
  company_id: number
  shift_id: number
  staff_id: number
  assignment_status: "offered" | "accepted" | "declined" | "replaced"
  assigned_by: number
  assigned_at?: string
  notes?: string
  created_at: string
  updated_at: string
  staff: Staff
}

export interface Company {
  id: number
  name: string
  address: string
  phone: string
  email: string
  website?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  clientId: string
  shifts: string[]
  totalHours: number
  totalAmount: number
  status: "draft" | "sent" | "paid" | "overdue"
  createdAt: string
  dueDate: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
