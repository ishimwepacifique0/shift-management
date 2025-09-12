export interface Staff {
  id: string
  name: string
  initials: string
  photo?: string
  roles: string[]
  email: string
  phone: string
  weeklyHours: number
  monthlyHours: number
  status: "active" | "inactive"
}

export interface Client {
  id: string
  name: string
  photo?: string
  needs: string[]
  preferences: string[]
  contactInfo: {
    email: string
    phone: string
    address: string
  }
  status: "active" | "inactive"
}

export interface Shift {
  id: string
  title: string
  startTime: string
  endTime: string
  date: string
  type: "Support Coordination" | "Night Shift" | "Standard" | "Emergency"
  status: "Vacant" | "Scheduled" | "Completed" | "Cancelled"
  assignedStaff: string[]
  clientId?: string
  isRecurring: boolean
  recurringPattern?: "weekly" | "monthly"
  notes?: string
  location?: string // Added location field
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
