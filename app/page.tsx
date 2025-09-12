"use client"

import * as React from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { CalendarView } from "@/components/scheduler/calendar-view"
import { FilterBar } from "@/components/scheduler/filter-bar"
import { AddShiftDrawer } from "@/components/scheduler/add-shift-drawer"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import type { Staff, Client, Shift } from "@/types"
import { startOfWeek } from "date-fns"

// Sample data
const sampleStaff: Staff[] = [
  {
    id: "1",
    name: "Gerald Hall",
    initials: "GH",
    roles: ["Support Worker", "Team Lead"],
    email: "gerald@shiftcare.com",
    phone: "+1234567890",
    weeklyHours: 22,
    monthlyHours: 88,
    status: "active",
  },
  {
    id: "2",
    name: "Glen Giles",
    initials: "GG",
    roles: ["Support Worker"],
    email: "glen@shiftcare.com",
    phone: "+1234567891",
    weeklyHours: 12,
    monthlyHours: 48,
    status: "active",
  },
  {
    id: "3",
    name: "Tammy Baker",
    initials: "TB",
    roles: ["Coordinator", "Support Worker"],
    email: "tammy@shiftcare.com",
    phone: "+1234567892",
    weeklyHours: 21,
    monthlyHours: 84,
    status: "active",
  },
  {
    id: "4",
    name: "Yusaf Faizan",
    initials: "YF",
    roles: ["Support Worker"],
    email: "yusaf@shiftcare.com",
    phone: "+1234567893",
    weeklyHours: 0,
    monthlyHours: 0,
    status: "inactive",
  },
  {
    id: "5",
    name: "Harry Peterson",
    initials: "HP",
    roles: ["Support Worker"],
    email: "harry@shiftcare.com",
    phone: "+1234567894",
    weeklyHours: 30,
    monthlyHours: 120,
    status: "active",
  },
  {
    id: "6",
    name: "Tasha Vega",
    initials: "TV",
    roles: ["Support Worker"],
    email: "tasha@shiftcare.com",
    phone: "+1234567895",
    weeklyHours: 25,
    monthlyHours: 100,
    status: "active",
  },
]

const sampleClients: Client[] = [
  {
    id: "c1",
    name: "Macquarie House",
    needs: ["Mobility Support", "Personal Care"],
    preferences: ["Morning shifts preferred"],
    contactInfo: {
      email: "macquarie@example.com",
      phone: "+1234567896",
      address: "123 Main St",
    },
    status: "active",
  },
]

const getMondayOfCurrentWeek = (date: Date) => startOfWeek(date, { weekStartsOn: 1 })

const today = new Date()
const mondayOfThisWeek = getMondayOfCurrentWeek(today)

const initialShifts: Shift[] = [
  {
    id: "s1",
    title: "Support Coordination",
    startTime: "10:00",
    endTime: "17:00",
    date: mondayOfThisWeek.toISOString().split("T")[0], // Monday
    type: "Support Coordination",
    status: "Scheduled",
    assignedStaff: ["1", "5"], // Gerald Hall, Harry Peterson
    clientId: undefined,
    isRecurring: true,
    recurringPattern: "weekly",
    notes: "Regular weekly session",
    location: "Client's Home",
  },
  {
    id: "s2",
    title: "Support Coordination",
    startTime: "10:00",
    endTime: "17:00",
    date: new Date(mondayOfThisWeek.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Wednesday
    type: "Support Coordination",
    status: "Scheduled",
    assignedStaff: ["1", "5"], // Gerald Hall, Harry Peterson
    clientId: undefined,
    isRecurring: true,
    recurringPattern: "weekly",
    notes: "Regular weekly session",
    location: "Office",
  },
  {
    id: "s3",
    title: "Standard",
    startTime: "10:00",
    endTime: "11:00",
    date: new Date(mondayOfThisWeek.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Thursday
    type: "Standard",
    status: "Scheduled",
    assignedStaff: ["6"], // Tasha Vega
    clientId: undefined,
    isRecurring: false,
    notes: "Morning check-in",
    location: "Client's Home",
  },
  {
    id: "s4",
    title: "Night Shift",
    startTime: "20:00",
    endTime: "08:00",
    date: new Date(mondayOfThisWeek.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Thursday
    type: "Night Shift",
    status: "Scheduled",
    assignedStaff: ["5"], // Harry Peterson
    clientId: undefined,
    isRecurring: false,
    notes: "Overnight care",
    location: "Client's Home",
  },
  {
    id: "s5",
    title: "Support Coordination",
    startTime: "10:00",
    endTime: "17:00",
    date: new Date(mondayOfThisWeek.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Friday
    type: "Support Coordination",
    status: "Scheduled",
    assignedStaff: ["1", "5"], // Gerald Hall, Harry Peterson
    clientId: undefined,
    isRecurring: true,
    recurringPattern: "weekly",
    notes: "Regular weekly session",
    location: "Office",
  },
  {
    id: "s6",
    title: "Support Coordination",
    startTime: "10:00",
    endTime: "17:00",
    date: new Date(mondayOfThisWeek.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Friday
    type: "Support Coordination",
    status: "Scheduled",
    assignedStaff: ["3"], // Tammy Baker
    clientId: undefined,
    isRecurring: true,
    recurringPattern: "weekly",
    notes: "Regular weekly session",
    location: "Client's Home",
  },
  {
    id: "s7",
    title: "Vacant Shift",
    startTime: "09:00",
    endTime: "13:00",
    date: new Date(mondayOfThisWeek.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Tuesday
    type: "Standard",
    status: "Vacant",
    assignedStaff: [],
    clientId: undefined,
    isRecurring: false,
    notes: "Urgent cover needed",
    location: "Client's Home",
  },
]

export default function SchedulerPage() {
  const [shifts, setShifts] = React.useState<Shift[]>(initialShifts)
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [clientFilter, setClientFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [isCollapsed, setIsCollapsed] = React.useState(false) // State for collapse button

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [initialDrawerDate, setInitialDrawerDate] = React.useState<Date | undefined>(undefined)
  const [initialDrawerStaffId, setInitialDrawerStaffId] = React.useState<string | undefined>(undefined)
  const [initialDrawerClientId, setInitialDrawerClientId] = React.useState<string | undefined>(undefined)

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
    const newShift: Shift = {
      ...newShiftData,
      id: `s${shifts.length + 1}`, // Simple ID generation for demo
    }
    setShifts((prevShifts) => [...prevShifts, newShift])
  }

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
    // Logic to collapse/expand the sidebar or calendar view
    console.log("Toggle collapse clicked")
  }

  return (
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
              staff={sampleStaff}
              clients={sampleClients}
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
        staff={sampleStaff}
        clients={sampleClients}
        initialDate={initialDrawerDate}
        initialStaffId={initialDrawerStaffId}
        initialClientId={initialDrawerClientId}
      />
    </SidebarProvider>
  )
}
