"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Edit, Repeat, Trash2, MoreVertical, Users } from "lucide-react"
import type { Shift, Staff, Client } from "@/types"

interface SchedulerRowProps {
  type: "vacant" | "staff" | "client"
  data?: Staff | Client
  shifts: Shift[]
  allStaff: Staff[]
  weekDays: Date[]
  onCellClick: (date: Date, staffId?: string, clientId?: string) => void
}

const getShiftColor = (status: Shift["status"]) => {
  switch (status) {
    case "Vacant":
      return "bg-red-100 border-red-200 text-red-800"
    case "Scheduled":
      return "bg-blue-100 border-blue-200 text-blue-800"
    case "Completed":
      return "bg-green-100 border-green-200 text-green-800"
    case "Cancelled":
      return "bg-gray-100 border-gray-200 text-gray-800"
    default:
      return "bg-gray-100 border-gray-200 text-gray-800"
  }
}

const getStaffInitials = (staffIds: string[], allStaff: Staff[]) => {
  return staffIds
    .map((id) => {
      const staffMember = allStaff.find((s) => s.id === id)
      return staffMember?.initials || "??"
    })
    .join(", ")
}

export function SchedulerRow({ type, data, shifts, allStaff, weekDays, onCellClick }: SchedulerRowProps) {
  const renderLeftColumn = () => {
    if (type === "vacant") {
      return (
        <div className="flex items-center p-2">
          <Badge variant="destructive" className="mr-2">
            VS
          </Badge>
          <div className="flex flex-col">
            <span className="font-medium text-sm">Vacant Shift</span>
            <span className="text-xs text-muted-foreground">No vacant shift at the moment</span>
          </div>
        </div>
      )
    } else if (type === "staff" && data) {
      const staffMember = data as Staff
      return (
        <div className="flex items-center p-2">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={staffMember.photo || `/placeholder.svg?height=32&width=32&query=${staffMember.name}`} />
            <AvatarFallback>{staffMember.initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{staffMember.name}</span>
            <span className="text-xs text-muted-foreground">{staffMember.weeklyHours} Hours</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto h-6 w-6">
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
        <div className="flex items-center p-2">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={client.photo || `/placeholder.svg?height=32&width=32&query=${client.name}`} />
            <AvatarFallback>
              {client.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{client.name}</span>
            <span className="text-xs text-muted-foreground">Client</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto h-6 w-6">
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
    <div className="grid grid-cols-8 border-b">
      <div className="border-r min-h-[80px] flex items-center px-2 py-1">{renderLeftColumn()}</div>
      {weekDays.map((day, dayIndex) => {
        const dayShifts = shifts.filter((shift) => {
          const shiftDate = new Date(shift.date)
          return shiftDate.toDateString() === day.toDateString()
        })

        return (
          <div
            key={dayIndex}
            className="p-1 border-r min-h-[80px] hover:bg-muted/50 cursor-pointer"
            onClick={() =>
              onCellClick(
                day,
                type === "staff" ? (data as Staff).id : undefined,
                type === "client" ? (data as Client).id : undefined,
              )
            }
          >
            {dayShifts.map((shift) => (
              <Card key={shift.id} className={`mb-1 ${getShiftColor(shift.status)}`}>
                <CardContent className="p-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">
                        {shift.startTime} - {shift.endTime}
                      </span>
                      <div className="flex gap-1">
                        {shift.isRecurring && <Repeat className="h-3 w-3" />}
                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs font-medium">{shift.title}</div>

                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span className="text-xs">{getStaffInitials(shift.assignedStaff, allStaff)}</span>
                    </div>

                    {shift.status === "Vacant" && (
                      <Badge variant="secondary" className="text-xs bg-red-200 text-red-800">
                        Vacant
                      </Badge>
                    )}
                    {shift.status === "Scheduled" && (
                      <Badge variant="secondary" className="text-xs bg-blue-200 text-blue-800">
                        Scheduled
                      </Badge>
                    )}
                    {shift.status === "Completed" && (
                      <Badge variant="secondary" className="text-xs bg-green-200 text-green-800">
                        Completed
                      </Badge>
                    )}
                    {shift.status === "Cancelled" && (
                      <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-800">
                        Cancelled
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      })}
    </div>
  )
}
