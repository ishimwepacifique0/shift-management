"use client"

import * as React from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { CalendarView } from "@/components/scheduler/calendar-view"
import { FilterBar } from "@/components/scheduler/filter-bar"
import { AddShiftDrawer } from "@/components/scheduler/add-shift-drawer"
import { EditShiftDrawer } from "@/components/scheduler/edit-shift-drawer"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react"
import { fetchShifts, fetchShiftTypes, deleteShift } from "@/feature/shifts/shiftSlice"
import { fetchStaff, fetchStaffByCompany } from "@/feature/staff/staffSlice"
import { fetchClients, fetchClientsByCompany } from "@/feature/clients/clientSlice"
import { RootState, AppDispatch } from "@/lib/store"
import { Staff, Client, Shift } from "@/types"
import { startOfWeek } from "date-fns"
import ProtectedRoute from "@/components/protected-route"
import { toast } from "@/components/ui/use-toast"
import { shiftStaffAssignmentApi } from "@/lib/api/shiftStaffAssignmentApi"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

// Sample data


const getMondayOfCurrentWeek = (date: Date) => startOfWeek(date, { weekStartsOn: 1 })

const today = new Date()
const mondayOfThisWeek = getMondayOfCurrentWeek(today)


export default function SchedulerPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { shifts, shiftTypes, status: shiftsStatus, error: shiftsError } = useSelector((state: RootState) => state.shifts)
  const { staff, status: staffStatus, error: staffError } = useSelector((state: RootState) => state.staff)
  const { clients } = useSelector((state: RootState) => state.clients)
  const { isAuthenticated, user, status } = useSelector((state: RootState) => state.auth)

  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [clientFilter, setClientFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  // Filter shifts by company if user has company_id (client-side safety check)
  const filteredShifts = React.useMemo(() => {
    if (!shifts) return []
    
    // Additional client-side filter by company if needed
    if (user?.company_id) {
      return shifts.filter(shift => shift.company_id === user.company_id)
    }
    
    return shifts
  }, [shifts, user?.company_id])

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [initialDrawerDate, setInitialDrawerDate] = React.useState<Date | undefined>(undefined)
  const [initialDrawerStaffId, setInitialDrawerStaffId] = React.useState<string | undefined>(undefined)
  const [initialDrawerClientId, setInitialDrawerClientId] = React.useState<string | undefined>(undefined)

  const [isEditDrawerOpen, setIsEditDrawerOpen] = React.useState(false)
  const [selectedShift, setSelectedShift] = React.useState<Shift | null>(null)

  // Function to fetch shifts with current filters
  const fetchShiftsWithFilters = React.useCallback(() => {
    if (!isAuthenticated || !user) return

    const filters: any = {
      page: 1,
      limit: 100, // Get more shifts for the calendar view
    }

    // Add company filter if user has company_id
    if (user.company_id) {
      filters.company_id = user.company_id
    }

    // Add client filter
    if (clientFilter !== "all") {
      filters.client_id = parseInt(clientFilter)
    }

    // Add status filter
    if (statusFilter !== "all") {
      filters.status = statusFilter
    }

    // Add shift type filter
    if (typeFilter !== "all") {
      filters.shift_type_id = parseInt(typeFilter)
    }

    // Add date range filter (current week)
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
    weekStart.setHours(0, 0, 0, 0) // Set to start of day
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999) // Set to end of day
    
    filters.date_from = weekStart.toISOString()
    filters.date_to = weekEnd.toISOString()
    dispatch(fetchShifts(filters))
  }, [isAuthenticated, user, clientFilter, statusFilter, typeFilter, selectedDate, dispatch])

  useEffect(() => {
    if (isAuthenticated && user) {
      
      fetchShiftsWithFilters()
      dispatch(fetchShiftTypes())
      
      // Use the EXACT same logic as staff page
      if (user.company_id) {
        dispatch(fetchStaffByCompany({ companyId: user.company_id }))
        dispatch(fetchClientsByCompany({ companyId: user.company_id }))
      } else {
        // For SUPER_ADMIN users without company_id, fetch all staff
        dispatch(fetchStaff())
        dispatch(fetchClients())
      }
    }
  }, [dispatch, isAuthenticated, user])

  // Refetch shifts when filters change (removed fetchShiftsWithFilters from deps to avoid infinite loop)
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchShiftsWithFilters()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientFilter, statusFilter, typeFilter, selectedDate])

  const handleAddShiftClick = () => {
    setInitialDrawerDate(undefined)
    setInitialDrawerStaffId(undefined)
    setInitialDrawerClientId(undefined)
    setIsDrawerOpen(true)
  }

  const handleCellClick = (date: Date, staffId?: string, clientId?: string) => {
    setInitialDrawerDate(date)
    setInitialDrawerStaffId(staffId)
    setInitialDrawerClientId(clientId)
    setIsDrawerOpen(true)
  }

  const handleSaveShift = (newShiftData: Omit<Shift, "id">) => {
    // This would dispatch a createShift action
  }

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
    // Logic to collapse/expand the sidebar or calendar view
  }

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift)
    setIsEditDrawerOpen(true)
  }

  const handleDeleteShift = async (shift: Shift) => {
    if (!confirm("Are you sure you want to delete this shift? This action cannot be undone.")) {
      return
    }

    try {
      // Delete staff assignments first
      if (shift.shift_staff_assignments?.length) {
        for (const assignment of shift.shift_staff_assignments) {
          await shiftStaffAssignmentApi.delete(assignment.id)
        }
      }

      // Delete the shift
      await dispatch(deleteShift(shift.id)).unwrap()

      toast({
        title: "Success",
        description: "Shift deleted successfully",
      })

      // Refresh shifts with current filters
      fetchShiftsWithFilters()
    } catch (error: any) {
      let errorMessage = "Failed to delete shift"
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }

      toast({
        title: "Shift Deletion Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleShiftUpdated = () => {
    // Refresh shifts when a shift is updated
    fetchShiftsWithFilters()
  }


  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-screen">
            <FilterBar
              onAddShift={handleAddShiftClick}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              clientFilter={clientFilter}
              onClientFilterChange={setClientFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              onToggleCollapse={handleToggleCollapse}
              clients={clients}
              shiftTypes={shiftTypes}
            />

            <div className="flex-1 overflow-auto">
              {shiftsStatus === "loading" ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading shifts...</p>
                  </div>
                </div>
              ) : shiftsError ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-red-600">
                    <p>Error loading shifts: {shiftsError}</p>
                    <Button 
                      onClick={() => fetchShiftsWithFilters()} 
                      variant="outline" 
                      className="mt-4"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              ) : (
                <CalendarView
                  shifts={filteredShifts}
                  staff={staff}
                  clients={clients}
                  selectedWeek={selectedDate}
                  onCellClick={handleCellClick}
                  onEditShift={handleEditShift}
                  onDeleteShift={handleDeleteShift}
                  staffStatus={staffStatus}
                  staffError={staffError}
                />
              )}
            </div>
          </div>
        </SidebarInset>

        <AddShiftDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onSave={handleSaveShift}
          staff={staff}
          clients={clients}
          initialDate={initialDrawerDate}
          initialStaffId={initialDrawerStaffId}
          initialClientId={initialDrawerClientId}
        />

        <EditShiftDrawer
          isOpen={isEditDrawerOpen}
          onClose={() => {
            setIsEditDrawerOpen(false)
            setSelectedShift(null)
          }}
          shift={selectedShift}
          staff={staff}
          clients={clients}
          shiftTypes={shiftTypes}
          onShiftUpdated={handleShiftUpdated}
        />
      </SidebarProvider>
    </ProtectedRoute>
  )
}
