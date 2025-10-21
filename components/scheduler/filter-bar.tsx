"use client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Plus, ArrowDownAZ, ChevronLeft, ChevronRight, Shrink } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SidebarTrigger } from "@/components/ui/sidebar"
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
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm border-b border-slate-200 dark:border-slate-700 gap-4">
      {/* Left side - Filters */}
      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
        <SidebarTrigger className="mr-2" />
        <Select value={clientFilter} onValueChange={onClientFilterChange}>
          <SelectTrigger className="w-[140px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600">
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

        <Button variant="outline" size="icon" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600">
          <ArrowDownAZ className="h-4 w-4" />
          <span className="sr-only">Sort A-Z</span>
        </Button>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[140px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="w-[140px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600">
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

        <Button variant="outline" size="icon" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600" onClick={onToggleCollapse}>
          <Shrink className="h-4 w-4" />
          <span className="sr-only">Collapse</span>
        </Button>
      </div>

      {/* Right side - Navigation and Actions */}
      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
        <span className="font-medium text-sm text-slate-700 dark:text-slate-300">{format(currentWeekStart, "MMMM yyyy")}</span>

        <Select defaultValue="weekly">
          <SelectTrigger className="w-[120px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600">
            <SelectValue placeholder="Weekly" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600">
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
          <Button variant="outline" size="icon" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous week</span>
          </Button>
          <Button variant="outline" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600" onClick={handleThisWeek}>
            This week
          </Button>
          <Button variant="outline" size="icon" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next week</span>
          </Button>
        </div>

        <Button onClick={onAddShift} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Shift
        </Button>
      </div>
    </div>
  )
}
