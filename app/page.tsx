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

// Sample data


const getMondayOfCurrentWeek = (date: Date) => startOfWeek(date, { weekStartsOn: 1 })

const today = new Date()
const mondayOfThisWeek = getMondayOfCurrentWeek(today)


export default function SchedulerPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { shifts, shiftTypes } = useSelector((state: RootState) => state.shifts)
  const { staff, status: staffStatus, error: staffError } = useSelector((state: RootState) => state.staff)
  const { clients } = useSelector((state: RootState) => state.clients)

  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [clientFilter, setClientFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  // Filter shifts based on selected filters
  const filteredShifts = shifts?.filter((shift) => {
    if (clientFilter !== "all" && shift.client_id?.toString() !== clientFilter) return false
    if (statusFilter !== "all" && shift.status !== statusFilter) return false
    if (typeFilter !== "all" && shift.shift_type_id?.toString() !== typeFilter) return false
    return true
  }) || []

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [initialDrawerDate, setInitialDrawerDate] = React.useState<Date | undefined>(undefined)
  const [initialDrawerStaffId, setInitialDrawerStaffId] = React.useState<string | undefined>(undefined)
  const [initialDrawerClientId, setInitialDrawerClientId] = React.useState<string | undefined>(undefined)

  const [isEditDrawerOpen, setIsEditDrawerOpen] = React.useState(false)
  const [selectedShift, setSelectedShift] = React.useState<Shift | null>(null)

  const { isAuthenticated, user, status } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('SchedulerPage - Fetching data for user:', user)
      
      dispatch(fetchShifts())
      dispatch(fetchShiftTypes())
      
      // Use the EXACT same logic as staff page
      if (user.company_id) {
        console.log('SchedulerPage - Fetching company-specific data for company ID:', user.company_id)
        dispatch(fetchStaffByCompany({ companyId: user.company_id }))
        dispatch(fetchClientsByCompany({ companyId: user.company_id }))
      } else {
        console.log('SchedulerPage - Fetching all data for SUPER_ADMIN user')
        // For SUPER_ADMIN users without company_id, fetch all staff
        dispatch(fetchStaff())
        dispatch(fetchClients())
      }
    }
  }, [dispatch, isAuthenticated, user])

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
    console.log("Save shift:", newShiftData)
  }

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
    // Logic to collapse/expand the sidebar or calendar view
    console.log("Toggle collapse clicked")
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

      // Refresh shifts
      dispatch(fetchShifts())
    } catch (error: any) {
      console.error("Error deleting shift:", error)
      
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
    dispatch(fetchShifts())
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

            <div className="flex-1 overflow-hidden">
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
