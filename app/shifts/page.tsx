"use client"

import * as React from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { fetchShifts, fetchShiftTypes } from "@/feature/shifts/shiftSlice"
import { fetchStaff, fetchStaffByCompany } from "@/feature/staff/staffSlice"
import { fetchClients, fetchClientsByCompany } from "@/feature/clients/clientSlice"
import { RootState, AppDispatch } from "@/lib/store"
import ProtectedRoute from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Users, MapPin, Edit, Trash2, UserPlus, UserMinus, Eye, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { format, parseISO } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { shiftAssignmentApi, CreateAssignmentData } from "@/lib/api/shiftAssignmentApi"

interface ShiftWithDetails {
  id: number
  company_id: number
  client_id: number
  shift_type_id: number
  care_service_id: number
  start_time: string
  end_time: string
  is_recurring: boolean
  recurrence_rule?: string
  notes?: string
  location?: string
  status: "draft" | "published" | "assigned" | "in_progress" | "completed" | "cancelled"
  instructions?: string
  break_minutes: number
  price_book_id?: number
  is_active: boolean
  created_at: string
  updated_at: string
  client?: {
    id: number
    first_name: string
    last_name: string
    email?: string
    phone?: string
  }
  shift_type?: {
    id: number
    name: string
    description: string
  }
  care_service?: {
    id: number
    name: string
    description?: string
  }
  shift_staff_assignments?: Array<{
    id: number
    staff_id: number
    assignment_status: "offered" | "accepted" | "declined" | "replaced"
    assigned_at?: string
    notes?: string
    staff: {
      id: number
      user: {
        first_name: string
        last_name: string
        email: string
        profile_picture?: string
      }
    }
  }>
}

export default function ShiftsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { shifts, shiftTypes } = useSelector((state: RootState) => state.shifts)
  const { staff } = useSelector((state: RootState) => state.staff)
  const { clients } = useSelector((state: RootState) => state.clients)
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedShift, setSelectedShift] = useState<ShiftWithDetails | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false)
  const [isReplaceOpen, setIsReplaceOpen] = useState(false)
  const [selectedStaffId, setSelectedStaffId] = useState<string>("")
  const [assignmentNotes, setAssignmentNotes] = useState("")
  const [assigning, setAssigning] = useState(false)
  const [replacing, setReplacing] = useState(false)
  const [assignmentToReplace, setAssignmentToReplace] = useState<any>(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchData()
    }
  }, [isAuthenticated, user])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      if (user?.company_id) {
        await Promise.all([
          dispatch(fetchShifts({ company_id: user.company_id, limit: 100 })),
          dispatch(fetchShiftTypes()),
          dispatch(fetchStaffByCompany({ companyId: user.company_id })),
          dispatch(fetchClientsByCompany({ companyId: user.company_id }))
        ])
      } else {
        await Promise.all([
          dispatch(fetchShifts({ limit: 100 })),
          dispatch(fetchShiftTypes()),
          dispatch(fetchStaff()),
          dispatch(fetchClients())
        ])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to load shift data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "published":
        return "bg-purple-100 text-purple-800"
      case "assigned":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredShifts = shifts?.filter((shift) => {
    const matchesSearch = searchTerm === "" || 
      shift.client?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.client?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.care_service?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || shift.status === statusFilter
    
    return matchesSearch && matchesStatus
  }) || []

  const handleViewDetails = (shift: ShiftWithDetails) => {
    setSelectedShift(shift)
    setIsDetailsOpen(true)
  }

  const handleAssignStaff = (shift: ShiftWithDetails) => {
    setSelectedShift(shift)
    setSelectedStaffId("")
    setAssignmentNotes("")
    setIsAssignmentOpen(true)
  }

  const handleReplaceStaffClick = (shift: ShiftWithDetails, assignment: any) => {
    setSelectedShift(shift)
    setAssignmentToReplace(assignment)
    setSelectedStaffId(assignment.staff_id.toString())
    setAssignmentNotes("")
    setIsReplaceOpen(true)
  }

  const handleCreateAssignment = async () => {
    if (!selectedShift || !selectedStaffId) {
      toast({
        title: "Error",
        description: "Please select a staff member",
        variant: "destructive",
      })
      return
    }

    try {
      setAssigning(true)
      const assignmentData: CreateAssignmentData = {
        shift_id: selectedShift.id,
        staff_id: parseInt(selectedStaffId),
        notes: assignmentNotes || undefined
      }

      const response = await shiftAssignmentApi.createAssignment(assignmentData)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Staff member assigned to shift successfully",
        })
        setIsAssignmentOpen(false)
        setSelectedStaffId("")
        setAssignmentNotes("")
        fetchData() // Refresh data
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to assign staff member",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error('Error assigning staff:', error)
      toast({
        title: "Error",
        description: "Failed to assign staff member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAssigning(false)
    }
  }

  const handleReplaceStaff = async (assignmentId: number, newStaffId: number) => {
    try {
      setReplacing(true)
      const response = await shiftAssignmentApi.replaceStaff(assignmentId, newStaffId, assignmentNotes)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Staff member replaced successfully",
        })
        setIsReplaceOpen(false)
        setSelectedStaffId("")
        setAssignmentNotes("")
        setAssignmentToReplace(null)
        fetchData() // Refresh data
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to replace staff member",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error('Error replacing staff:', error)
      toast({
        title: "Error",
        description: "Failed to replace staff member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setReplacing(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-slate-600">Loading shifts...</p>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-screen">
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm border-b">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Shift Management</h1>
                <p className="text-slate-600 dark:text-slate-400">View and manage all shifts and assignments</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={fetchData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Go to Scheduler
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800 border-b">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search shifts by client name or service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by status" />
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
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6">
              {filteredShifts.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Shifts Found</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {searchTerm || statusFilter !== "all" 
                      ? "No shifts match your current filters" 
                      : "No shifts have been created yet"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredShifts.map((shift) => (
                    <Card key={shift.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {shift.client?.first_name} {shift.client?.last_name}
                          </CardTitle>
                          <Badge className={getStatusColor(shift.status)}>
                            {shift.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          {shift.care_service?.name || 'Care Service'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Time Information */}
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-slate-500" />
                          <span>
                            {format(parseISO(shift.start_time), 'MMM dd, yyyy')} • {' '}
                            {format(parseISO(shift.start_time), 'HH:mm')} - {format(parseISO(shift.end_time), 'HH:mm')}
                          </span>
                        </div>

                        {/* Location */}
                        {shift.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-slate-500" />
                            <span>{shift.location}</span>
                          </div>
                        )}

                        {/* Staff Assignments */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-slate-500" />
                            <span className="font-medium">Assigned Staff:</span>
                          </div>
                          {shift.shift_staff_assignments?.length ? (
                            <div className="space-y-1">
                              {shift.shift_staff_assignments.map((assignment) => (
                                <div 
                                  key={assignment.id} 
                                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                                  onClick={() => handleReplaceStaffClick(shift, assignment)}
                                >
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={assignment.staff.user.profile_picture} />
                                    <AvatarFallback className="text-xs">
                                      {assignment.staff.user.first_name[0]}{assignment.staff.user.last_name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">
                                    {assignment.staff.user.first_name} {assignment.staff.user.last_name}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {assignment.assignment_status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">No staff assigned</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(shift)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignStaff(shift)}
                            className="flex-1"
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Assign
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SidebarInset>

        {/* Shift Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Shift Details</DialogTitle>
              <DialogDescription>
                Complete information about this shift
              </DialogDescription>
            </DialogHeader>
            {selectedShift && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Client</Label>
                    <p className="text-sm text-slate-600">
                      {selectedShift.client?.first_name} {selectedShift.client?.last_name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Service</Label>
                    <p className="text-sm text-slate-600">
                      {selectedShift.care_service?.name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Start Time</Label>
                    <p className="text-sm text-slate-600">
                      {format(parseISO(selectedShift.start_time), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">End Time</Label>
                    <p className="text-sm text-slate-600">
                      {format(parseISO(selectedShift.end_time), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>

                {/* Staff Assignments */}
                <div>
                  <Label className="text-sm font-medium">Staff Assignments</Label>
                  {selectedShift.shift_staff_assignments?.length ? (
                    <div className="mt-2 space-y-2">
                      {selectedShift.shift_staff_assignments.map((assignment) => (
                        <div 
                          key={assignment.id} 
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                          onClick={() => {
                            setIsDetailsOpen(false)
                            handleReplaceStaffClick(selectedShift, assignment)
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={assignment.staff.user.profile_picture} />
                              <AvatarFallback>
                                {assignment.staff.user.first_name[0]}{assignment.staff.user.last_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {assignment.staff.user.first_name} {assignment.staff.user.last_name}
                              </p>
                              <p className="text-sm text-slate-500">{assignment.staff.user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                          <Badge variant="outline">{assignment.assignment_status}</Badge>
                            <span className="text-xs text-slate-500">Click to replace</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 mt-2">No staff assigned to this shift</p>
                  )}
                </div>

                {/* Notes and Instructions */}
                {(selectedShift.notes || selectedShift.instructions) && (
                  <div className="space-y-4">
                    {selectedShift.notes && (
                      <div>
                        <Label className="text-sm font-medium">Notes</Label>
                        <p className="text-sm text-slate-600 mt-1">{selectedShift.notes}</p>
                      </div>
                    )}
                    {selectedShift.instructions && (
                      <div>
                        <Label className="text-sm font-medium">Instructions</Label>
                        <p className="text-sm text-slate-600 mt-1">{selectedShift.instructions}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Staff Assignment Dialog */}
        <Dialog open={isAssignmentOpen} onOpenChange={setIsAssignmentOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Staff to Shift</DialogTitle>
              <DialogDescription>
                Assign or replace staff members for this shift
              </DialogDescription>
            </DialogHeader>
            {selectedShift && (
              <div className="space-y-4">
                <div>
                  <Label>Select Staff Member</Label>
                  <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff?.map((staffMember) => (
                        <SelectItem key={staffMember.id} value={staffMember.id.toString()}>
                          {staffMember.user.first_name} {staffMember.user.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assignment Notes</Label>
                  <Textarea 
                    placeholder="Add any notes for this assignment..." 
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={handleCreateAssignment}
                    disabled={assigning}
                  >
                    {assigning ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assign Staff
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsAssignmentOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Replace Staff Dialog */}
        <Dialog open={isReplaceOpen} onOpenChange={setIsReplaceOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Replace Staff Member</DialogTitle>
              <DialogDescription>
                Choose a new staff member to replace the current assignment
              </DialogDescription>
            </DialogHeader>
            {selectedShift && assignmentToReplace && (
              <div className="space-y-4">
                {/* Current Assignment Info */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <Label className="text-sm font-medium text-slate-600">Current Assignment</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={assignmentToReplace.staff.user.profile_picture} />
                      <AvatarFallback>
                        {assignmentToReplace.staff.user.first_name[0]}{assignmentToReplace.staff.user.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {assignmentToReplace.staff.user.first_name} {assignmentToReplace.staff.user.last_name}
                      </p>
                      <p className="text-sm text-slate-500">{assignmentToReplace.staff.user.email}</p>
                    </div>
                    <Badge variant="outline">{assignmentToReplace.assignment_status}</Badge>
                  </div>
                </div>

                <div>
                  <Label>Select New Staff Member</Label>
                  <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff?.map((staffMember) => (
                        <SelectItem key={staffMember.id} value={staffMember.id.toString()}>
                          {staffMember.user.first_name} {staffMember.user.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Replacement Notes</Label>
                  <Textarea 
                    placeholder="Add any notes for this replacement..." 
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => handleReplaceStaff(assignmentToReplace.id, parseInt(selectedStaffId))}
                    disabled={replacing || !selectedStaffId}
                  >
                    {replacing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Replacing...
                      </>
                    ) : (
                      <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    Replace Staff
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsReplaceOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
