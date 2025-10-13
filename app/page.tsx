"use client"

import * as React from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { CalendarView } from "@/components/scheduler/calendar-view"
import { FilterBar } from "@/components/scheduler/filter-bar"
import { AddShiftDrawer } from "@/components/scheduler/add-shift-drawer"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react"
import { fetchShifts, fetchShiftTypes } from "@/feature/shifts/shiftSlice"
import { fetchStaff } from "@/feature/staff/staffSlice"
import { fetchClients } from "@/feature/clients/clientSlice"
import { RootState, AppDispatch } from "@/lib/store"
import { Staff, Client, Shift } from "@/types"
import { startOfWeek } from "date-fns"
import ProtectedRoute from "@/components/protected-route"

// Sample data


const getMondayOfCurrentWeek = (date: Date) => startOfWeek(date, { weekStartsOn: 1 })

const today = new Date()
const mondayOfThisWeek = getMondayOfCurrentWeek(today)


export default function SchedulerPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { shifts, shiftTypes } = useSelector((state: RootState) => state.shifts)
  const { staff } = useSelector((state: RootState) => state.staff)
  const { clients } = useSelector((state: RootState) => state.clients)

  // Debug logging for data loading
  useEffect(() => {
    console.log('SchedulerPage - Staff:', staff)
    console.log('SchedulerPage - Clients:', clients)
    console.log('SchedulerPage - Staff count:', staff?.length)
    console.log('SchedulerPage - Clients count:', clients?.length)
  }, [staff, clients])

  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [clientFilter, setClientFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [initialDrawerDate, setInitialDrawerDate] = React.useState<Date | undefined>(undefined)
  const [initialDrawerStaffId, setInitialDrawerStaffId] = React.useState<string | undefined>(undefined)
  const [initialDrawerClientId, setInitialDrawerClientId] = React.useState<string | undefined>(undefined)

  const { isAuthenticated, user, status } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (isAuthenticated && user && status === 'succeeded') {
      dispatch(fetchShifts())
      dispatch(fetchStaff())
      dispatch(fetchClients())
      dispatch(fetchShiftTypes())
    }
  }, [dispatch, isAuthenticated, user, status])

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
            />

            <div className="flex-1 overflow-hidden">
              <CalendarView
                shifts={shifts}
                staff={staff}
                clients={clients}
                selectedWeek={selectedDate}
                onCellClick={handleCellClick}
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
      </SidebarProvider>
    </ProtectedRoute>
  )
}
