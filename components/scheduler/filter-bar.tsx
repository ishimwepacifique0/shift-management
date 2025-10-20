"use client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Plus, ArrowDownAZ, ChevronLeft, ChevronRight, Shrink } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, startOfWeek, addWeeks, subWeeks } from "date-fns"

interface FilterBarProps {
  onAddShift: () => void
  selectedDate: Date
  onDateChange: (date: Date) => void
  clientFilter: string
  onClientFilterChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  typeFilter: string
  onTypeFilterChange: (value: string) => void
  onToggleCollapse: () => void
  clients: any[]
  shiftTypes: any[]
}

export function FilterBar({
  onAddShift,
  selectedDate,
  onDateChange,
  clientFilter,
  onClientFilterChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  onToggleCollapse,
  clients,
  shiftTypes,
}: FilterBarProps) {
  const currentWeekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }) // Monday

  const handlePrevWeek = () => {
    onDateChange(subWeeks(selectedDate, 1))
  }

  const handleNextWeek = () => {
    onDateChange(addWeeks(selectedDate, 1))
  }

  const handleThisWeek = () => {
    onDateChange(new Date())
  }

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center space-x-2">
        <Select value={clientFilter} onValueChange={onClientFilterChange}>
          <SelectTrigger className="w-[140px] bg-transparent">
            <SelectValue placeholder="Client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients?.map((client) => (
              <SelectItem key={client.id} value={client.id.toString()}>
                {client.first_name} {client.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" className="bg-transparent">
          <ArrowDownAZ className="h-4 w-4" />
          <span className="sr-only">Sort A-Z</span>
        </Button>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[140px] bg-transparent">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="vacant">Vacant</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="w-[140px] bg-transparent">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {shiftTypes?.map((type) => (
              <SelectItem key={type.id} value={type.id.toString()}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" className="bg-transparent" onClick={onToggleCollapse}>
          <Shrink className="h-4 w-4" />
          <span className="sr-only">Collapse</span>
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <span className="font-medium text-sm">{format(currentWeekStart, "MMMM yyyy")}</span>

        <Select defaultValue="weekly">
          <SelectTrigger className="w-[120px] bg-transparent">
            <SelectValue placeholder="Weekly" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="bg-transparent">
              <CalendarIcon className="h-4 w-4" />
              <span className="sr-only">Select Date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateChange(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <div className="flex items-center space-x-1">
          <Button variant="outline" size="icon" className="bg-transparent" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous week</span>
          </Button>
          <Button variant="outline" className="bg-transparent" onClick={handleThisWeek}>
            This week
          </Button>
          <Button variant="outline" size="icon" className="bg-transparent" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next week</span>
          </Button>
        </div>

        <Button onClick={onAddShift}>
          <Plus className="mr-2 h-4 w-4" />
          Add Shift
        </Button>
      </div>
    </div>
  )
}
