"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Edit, Repeat, Trash2, MoreVertical } from "lucide-react"
import type { Shift, Staff, Client } from "@/types"

interface SchedulerRowProps {
  type: "vacant" | "staff" | "client"
  data?: Staff | Client
  shifts: Shift[]
  allStaff: Staff[]
  weekDays: Date[]
  onCellClick: (date: Date, staffId?: string, clientId?: string) => void
  onEditShift?: (shift: Shift) => void
  onDeleteShift?: (shift: Shift) => void
}

const getShiftColor = (status: Shift["status"]) => {
  switch (status) {
    case "draft":
      return "bg-gray-100 border-gray-200 text-gray-800"
    case "published":
      return "bg-purple-100 border-purple-200 text-purple-800"
    case "assigned":
      return "bg-yellow-100 border-yellow-200 text-yellow-800"
    case "in_progress":
      return "bg-orange-100 border-orange-200 text-orange-800"
    case "completed":
      return "bg-green-100 border-green-200 text-green-800"
    case "cancelled":
      return "bg-red-100 border-red-200 text-red-800"
    default:
      return "bg-gray-100 border-gray-200 text-gray-800"
  }
}


export function SchedulerRow({ type, data, shifts, allStaff, weekDays, onCellClick, onEditShift, onDeleteShift }: SchedulerRowProps) {
  const renderLeftColumn = () => {
    if (type === "vacant") {
      return (
        <div className="flex p-2 items-center">
          <Badge variant="destructive" className="mr-2">
            VS
          </Badge>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Vacant Shift</span>
            <span className="text-muted-foreground text-xs">No vacant shift at the moment</span>
          </div>
        </div>
      )
    } else if (type === "staff" && data) {
      const staffMember = data as Staff
      return (
        <div className="flex p-2 items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={staffMember.user.profile_picture || `/placeholder.svg?height=32&width=32&query=${staffMember.user.first_name}`} />
            <AvatarFallback>
              {`${staffMember.user.first_name} ${staffMember.user.last_name}`
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{`${staffMember.user.first_name} ${staffMember.user.last_name}`}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Edit Staff</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    } else if (type === "client" && data) {
      const client = data as Client
      return (
        <div className="flex p-2 items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={`/placeholder.svg?height=32&width=32&query=${client.first_name}`} />
            <AvatarFallback>
              {`${client.first_name} ${client.last_name}`
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{`${client.first_name} ${client.last_name}`}</span>
            <span className="text-muted-foreground text-xs">Client</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Edit Client</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="flex border-r border-slate-200 dark:border-slate-700 items-center min-h-[80px] px-2 py-1 bg-slate-50/50 dark:bg-slate-800/50">
        {renderLeftColumn()}
      </div>
      {weekDays.map((day, dayIndex) => {
        const dayShifts = shifts.filter((shift) => {
          const shiftDate = new Date(shift.start_time)
          return shiftDate.toDateString() === day.toDateString()
        })

        return (
          <div
            key={dayIndex}
            className="border-r border-slate-200 dark:border-slate-700 p-1 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/20 min-h-[80px] transition-colors relative group"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onCellClick(
                day,
                type === "staff" ? (data as Staff).id.toString() : undefined,
                type === "client" ? (data as Client).id.toString() : undefined,
              )
            }}
          >
            {/* Empty cell indicator */}
            {dayShifts.length === 0 && (
              <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                Click to add shift
              </div>
            )}
            
            <div className="flex flex-col gap-1">
              {dayShifts.map((shift) => (
                <Card key={shift.id} className={`${getShiftColor(shift.status)} hover:shadow-md transition-shadow`}>
                  <CardContent className="p-2">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-xs">
                            {new Date(shift.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(shift.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          <span className="text-xs">
                            {shift.care_service?.name || shift.notes || 'Shift'}
                          </span>
                          <span className="text-xs">
                            {shift.status}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {shift.is_recurring && <Repeat className="h-3 w-3" />}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-4 p-0 w-4 hover:bg-white/50"
                            onClick={(e) => {
                              e.stopPropagation()
                              onEditShift?.(shift)
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-4 p-0 w-4 hover:bg-white/50"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteShift?.(shift)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
