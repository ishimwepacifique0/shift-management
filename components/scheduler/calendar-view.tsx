"use client"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { SchedulerRow } from "./scheduler-row"
import type { Shift, Staff, Client } from "@/types"
import { startOfWeek, eachDayOfInterval, endOfWeek, format } from "date-fns"

interface CalendarViewProps {
  shifts: Shift[]
  staff: Staff[]
  clients: Client[]
  selectedWeek: Date
  onCellClick: (date: Date, staffId?: string, clientId?: string) => void
}

export function CalendarView({ shifts, staff, clients, selectedWeek, onCellClick }: CalendarViewProps) {
  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedWeek, { weekStartsOn: 1 }), // Monday
    end: endOfWeek(selectedWeek, { weekStartsOn: 1 }), // Sunday
  })

  return (
    <div className="flex-1 overflow-auto">
      <div className="grid grid-cols-8 border-b border-r">
        {/* Top-left search bar */}
        <div className="p-2 border-r border-b relative">
          <Input placeholder="Search by team, staff or client..." className="pl-8 h-8 text-sm" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Day headers */}
        {weekDays.map((day, index) => (
          <div key={index} className="p-2 font-medium text-sm text-center border-r border-b">
            <div>{format(day, "EEE").toUpperCase()}</div>
            <div className="text-xs text-muted-foreground">{format(day, "d")}</div>
          </div>
        ))}
      </div>

      {/* Vacant Shift Row */}
      <SchedulerRow
        type="vacant"
        shifts={shifts.filter((s) => s.status === "Vacant")} // Pass all vacant shifts, row component will filter by day
        allStaff={staff}
        weekDays={weekDays}
        onCellClick={onCellClick}
      />

      {/* Staff Rows */}
      {staff.map((staffMember) => (
        <SchedulerRow
          key={staffMember.id}
          type="staff"
          data={staffMember}
          shifts={shifts.filter((s) => s.assignedStaff.includes(staffMember.id))} // Pass all shifts for this staff, row component will filter by day
          allStaff={staff}
          weekDays={weekDays}
          onCellClick={onCellClick}
        />
      ))}

      {/* Clients Rows */}
      {clients.map((client) => (
        <SchedulerRow
          key={client.id}
          type="client"
          data={client}
          shifts={shifts.filter((s) => s.clientId === client.id)} // Pass all shifts for this client, row component will filter by day
          allStaff={staff}
          weekDays={weekDays}
          onCellClick={onCellClick}
        />
      ))}
    </div>
  )
}
