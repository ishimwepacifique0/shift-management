"use client"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { SchedulerRow } from "./scheduler-row"
import { SchedulerSkeleton } from "./scheduler-skeleton"
import type { Shift, Staff, Client } from "@/types"
import { startOfWeek, eachDayOfInterval, endOfWeek, format } from "date-fns"

interface CalendarViewProps {
  shifts: Shift[]
  staff: Staff[]
  clients: Client[]
  selectedWeek: Date
  onCellClick: (date: Date, staffId?: string, clientId?: string) => void
  onEditShift?: (shift: Shift) => void
  onDeleteShift?: (shift: Shift) => void
  staffStatus?: "idle" | "loading" | "succeeded" | "failed"
  staffError?: string | null
}

export function CalendarView({ shifts, staff, clients, selectedWeek, onCellClick, onEditShift, onDeleteShift, staffStatus, staffError }: CalendarViewProps) {
  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedWeek, { weekStartsOn: 1 }), // Monday
    end: endOfWeek(selectedWeek, { weekStartsOn: 1 }), // Sunday
  })



  return (
    <div className="flex-1 overflow-auto">
      <div className="grid grid-cols-8 border-b border-r">
        {/* Top-left search bar */}
        <div className="border-b border-r p-2 relative">
          <Input placeholder="Search by team, staff or client..." className="h-8 text-sm pl-8" />
          <Search className="h-4 text-muted-foreground w-4 -translate-y-1/2 absolute left-4 top-1/2" />
        </div>

        {/* Day headers */}
        {weekDays.map((day, index) => (
          <div key={index} className="border-b border-r p-2 text-center text-sm font-medium">
            <div>{format(day, "EEE").toUpperCase()}</div>
            <div className="text-muted-foreground text-xs">{format(day, "d")}</div>
          </div>
        ))}
      </div>


      {/* Staff Rows */}
      {staffStatus === "loading" ? (
        <SchedulerSkeleton selectedWeek={selectedWeek} />
      ) : staffStatus === "failed" ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="text-red-500 font-medium">Failed to load staff</div>
            {staffError && (
              <div className="text-sm text-muted-foreground mt-1">{staffError}</div>
            )}
          </div>
        </div>
      ) : staff.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="text-muted-foreground font-medium">No staff members found</div>
            <div className="text-sm text-muted-foreground mt-1">Add staff members to see them in the scheduler</div>
          </div>
        </div>
      ) : (
        staff.map((staffMember) => (
        <SchedulerRow
          key={staffMember.id}
          type="staff"
          data={staffMember}
          shifts={shifts.filter((shift) => 
            shift.shift_staff_assignments?.some(assignment => assignment.staff_id === staffMember.id)
          )}
          allStaff={staff}
          weekDays={weekDays}
          onCellClick={onCellClick}
          onEditShift={onEditShift}
          onDeleteShift={onDeleteShift}
        />
        ))
      )}

    </div>
  )
}
