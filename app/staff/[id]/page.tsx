"use client"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useParams, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { fetchStaffById } from "@/feature/staff/staffSlice"
import { RootState, AppDispatch } from "@/lib/store"
import { Staff, ShiftStaffAssignment } from "@/types"
import ProtectedRoute from "@/components/protected-route"
import { useToast } from "@/hooks/use-toast"
import { DocumentUploadModal } from "@/components/document-upload-modal"
import { staffApi } from "@/lib/api/staffApi"
import { shiftStaffAssignmentApi } from "@/lib/api/shiftStaffAssignmentApi"
import { ArrowLeft, Upload, FileText, Clock, CheckCircle, XCircle, AlertCircle, Download, Calendar, User, Mail, Phone, Briefcase, DollarSign } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { format } from "date-fns"

export default function StaffDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { selectedStaff, status } = useSelector((state: RootState) => state.staff)
  const { user } = useSelector((state: RootState) => state.auth)
  const { toast } = useToast()
  
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [shifts, setShifts] = useState<ShiftStaffAssignment[]>([])
  const [shiftsLoading, setShiftsLoading] = useState(false)
  const [selectedShiftStatus, setSelectedShiftStatus] = useState<string>("all")
  const [selectedShiftsForInvoice, setSelectedShiftsForInvoice] = useState<number[]>([])

  const staffId = params?.id ? parseInt(params.id as string) : null

  useEffect(() => {
    if (staffId) {
      dispatch(fetchStaffById(staffId)).catch((error) => {
        toast({
          title: "Error",
          description: "Failed to load staff member details.",
          variant: "destructive",
        })
      })
    }
  }, [dispatch, staffId, toast])

  useEffect(() => {
    if (staffId) {
      loadShifts()
    }
  }, [staffId, selectedShiftStatus])

  const loadShifts = async () => {
    if (!staffId) return
    
    try {
      setShiftsLoading(true)
      const response = await shiftStaffAssignmentApi.getByStaff(staffId)
      if (response.success) {
        let filteredShifts = response.data
        
        // Filter by status if not "all"
        if (selectedShiftStatus !== "all") {
          filteredShifts = filteredShifts.filter(assignment => {
            const shiftStatus = assignment.shift?.status || ""
            return shiftStatus === selectedShiftStatus
          })
        }
        
        setShifts(filteredShifts)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load shifts.",
        variant: "destructive",
      })
    } finally {
      setShiftsLoading(false)
    }
  }

  const handleDocumentUpload = async (files: File[], category: string) => {
    if (!staffId) return
    try {
      const response = await staffApi.uploadStaffDocuments(staffId, files, category)
      if (response.success) {
        toast({
          title: "Documents Uploaded",
          description: `${files.length} document(s) uploaded successfully`,
        })
        // Reload staff data
        dispatch(fetchStaffById(staffId))
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to upload documents"
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    }
  }

  const parseDocuments = (documentsJson?: string | null) => {
    if (!documentsJson) return []
    try {
      return JSON.parse(documentsJson)
    } catch {
      return []
    }
  }

  const getDocumentsByCategory = (documents: any[]) => {
    const grouped: Record<string, any[]> = {}
    documents.forEach((doc) => {
      const category = doc.category || "General"
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(doc)
    })
    return grouped
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
      case "assigned":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "in_progress":
      case "assigned":
        return <Clock className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatEmploymentType = (type?: string) => {
    if (!type) return "Not specified"
    return type.split("_").map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(" ")
  }

  const calculateHours = (startTime: string, endTime: string, breakMinutes: number = 0) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    return (diffHours - breakMinutes / 60).toFixed(2)
  }

  const getCompletedShifts = () => {
    return shifts.filter(assignment => assignment.shift?.status === "completed")
  }

  const generateInvoice = () => {
    const completedShifts = getCompletedShifts()
    if (completedShifts.length === 0) {
      toast({
        title: "No Shifts",
        description: "No completed shifts available for invoicing.",
        variant: "destructive",
      })
      return
    }

    // Calculate total hours and amount
    let totalHours = 0
    let totalAmount = 0

    completedShifts.forEach(assignment => {
      const shift = assignment.shift
      if (shift) {
        const hours = parseFloat(calculateHours(shift.start_time, shift.end_time, shift.break_minutes))
        totalHours += hours
        
        // Calculate amount based on hourly rate or price book
        const rate = shift.price_book?.rate_per_hour || shift.shift_type?.hourly_rate || selectedStaff?.hourly_rate || 0
        totalAmount += hours * rate
      }
    })

    // Create invoice data
    const invoiceData = {
      staffId: staffId,
      staffName: `${selectedStaff?.user.first_name} ${selectedStaff?.user.last_name}`,
      shifts: completedShifts.map(a => ({
        id: a.shift?.id,
        date: a.shift?.start_time,
        hours: calculateHours(a.shift?.start_time || "", a.shift?.end_time || "", a.shift?.break_minutes || 0),
        rate: a.shift?.price_book?.rate_per_hour || a.shift?.shift_type?.hourly_rate || selectedStaff?.hourly_rate || 0,
        amount: parseFloat(calculateHours(a.shift?.start_time || "", a.shift?.end_time || "", a.shift?.break_minutes || 0)) * 
                (a.shift?.price_book?.rate_per_hour || a.shift?.shift_type?.hourly_rate || selectedStaff?.hourly_rate || 0),
        client: a.shift?.client,
      })),
      totalHours: totalHours.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      generatedDate: new Date().toISOString(),
    }

    // Generate and download invoice as JSON (you can enhance this to generate PDF)
    const blob = new Blob([JSON.stringify(invoiceData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `invoice_${selectedStaff?.user.first_name}_${selectedStaff?.user.last_name}_${format(new Date(), "yyyy-MM-dd")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Invoice Generated",
      description: `Invoice generated for ${completedShifts.length} completed shift(s).`,
    })
  }

  const shiftColumns = [
    {
      key: "shift_date",
      header: "Date",
      render: (row: ShiftStaffAssignment) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          {row.shift ? format(new Date(row.shift.start_time), "MMM dd, yyyy") : "N/A"}
        </div>
      ),
    },
    {
      key: "time",
      header: "Time",
      render: (row: ShiftStaffAssignment) => (
        row.shift ? (
          <div>
            {format(new Date(row.shift.start_time), "HH:mm")} - {format(new Date(row.shift.end_time), "HH:mm")}
          </div>
        ) : "N/A"
      ),
    },
    {
      key: "client",
      header: "Client",
      render: (row: ShiftStaffAssignment) => (
        row.shift?.client ? `${row.shift.client.first_name} ${row.shift.client.last_name}` : "N/A"
      ),
    },
    {
      key: "hours",
      header: "Hours",
      render: (row: ShiftStaffAssignment) => (
        row.shift ? calculateHours(row.shift.start_time, row.shift.end_time, row.shift.break_minutes || 0) + "h" : "N/A"
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: ShiftStaffAssignment) => {
        const shiftStatus = row.shift?.status || "unknown"
        return (
          <Badge className={getStatusColor(shiftStatus)}>
            <span className="flex items-center gap-1">
              {getStatusIcon(shiftStatus)}
              {shiftStatus.charAt(0).toUpperCase() + shiftStatus.slice(1)}
            </span>
          </Badge>
        )
      },
    },
    {
      key: "assignment_status",
      header: "Assignment",
      render: (row: ShiftStaffAssignment) => (
        <Badge variant={row.assignment_status === "accepted" ? "default" : "secondary"}>
          {row.assignment_status.charAt(0).toUpperCase() + row.assignment_status.slice(1)}
        </Badge>
      ),
    },
  ]

  if (status === "loading" || !selectedStaff) {
    return (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <div className="flex items-center justify-center h-screen">
              <div className="text-muted-foreground">Loading staff member details...</div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    )
  }

  const documents = parseDocuments(selectedStaff.documents)
  const documentsByCategory = getDocumentsByCategory(documents)
  const completedShiftsCount = getCompletedShifts().length

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <div className="flex border-b justify-between p-6 items-center flex-shrink-0">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.push("/staff")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedStaff.user.profile_picture} />
                    <AvatarFallback>
                      {selectedStaff.user.first_name[0]}{selectedStaff.user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-3xl font-bold">
                      {selectedStaff.user.first_name} {selectedStaff.user.last_name}
                    </h1>
                    <p className="text-muted-foreground">Staff Member Details</p>
                  </div>
                </div>
              </div>
              <Badge variant={selectedStaff.is_active ? "default" : "secondary"}>
                {selectedStaff.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="shifts">
                    Shifts
                    {shifts.length > 0 && (
                      <Badge variant="secondary" className="ml-2">{shifts.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="invoice">
                    Invoice
                    {completedShiftsCount > 0 && (
                      <Badge variant="secondary" className="ml-2">{completedShiftsCount}</Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Email:</span>
                          <span>{selectedStaff.user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Phone:</span>
                          <span>{selectedStaff.user.phone || "Not provided"}</span>
                        </div>
                        {selectedStaff.user.address && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium">Address:</span>
                            <span>{selectedStaff.user.address}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Employment Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Employment Type:</span>
                          <span>{formatEmploymentType(selectedStaff.employment_type)}</span>
                        </div>
                        {selectedStaff.hourly_rate && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Hourly Rate:</span>
                            <span>${selectedStaff.hourly_rate}/hr</span>
                          </div>
                        )}
                        {selectedStaff.max_hours_per_week && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Max Hours/Week:</span>
                            <span>{selectedStaff.max_hours_per_week}h</span>
                          </div>
                        )}
                        {selectedStaff.hire_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Hire Date:</span>
                            <span>{format(new Date(selectedStaff.hire_date), "MMM dd, yyyy")}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {selectedStaff.qualifications && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Qualifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {selectedStaff.qualifications}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {selectedStaff.certifications && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Certifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {selectedStaff.certifications}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {selectedStaff.availability_notes && (
                      <Card className="md:col-span-2">
                        <CardHeader>
                          <CardTitle>Availability Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {selectedStaff.availability_notes}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <CardDescription>Manage staff documents by category</CardDescription>
                    <Button onClick={() => setUploadModalOpen(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Button>
                  </div>

                  {Object.keys(documentsByCategory).length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">No documents uploaded yet</p>
                        <Button onClick={() => setUploadModalOpen(true)}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Documents
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(documentsByCategory).map(([category, docs]) => (
                        <Card key={category}>
                          <CardHeader>
                            <CardTitle>{category}</CardTitle>
                            <CardDescription>{docs.length} document(s)</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {docs.map((doc: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                      <p className="font-medium">{doc.filename || "Document"}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {doc.mimetype} • {(doc.size / 1024).toFixed(2)} KB
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(doc.url, "_blank")}
                                  >
                                    View
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Shifts Tab */}
                <TabsContent value="shifts" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button
                        variant={selectedShiftStatus === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedShiftStatus("all")}
                      >
                        All
                      </Button>
                      <Button
                        variant={selectedShiftStatus === "completed" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedShiftStatus("completed")}
                      >
                        Completed
                      </Button>
                      <Button
                        variant={selectedShiftStatus === "in_progress" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedShiftStatus("in_progress")}
                      >
                        In Progress
                      </Button>
                      <Button
                        variant={selectedShiftStatus === "cancelled" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedShiftStatus("cancelled")}
                      >
                        Cancelled
                      </Button>
                    </div>
                  </div>

                  {shiftsLoading ? (
                    <Card>
                      <CardContent className="flex items-center justify-center py-12">
                        <div className="text-muted-foreground">Loading shifts...</div>
                      </CardContent>
                    </Card>
                  ) : shifts.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No shifts found</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-0">
                        <DataTable columns={shiftColumns} data={shifts} />
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Invoice Tab */}
                <TabsContent value="invoice" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Invoice Generation</CardTitle>
                      <CardDescription>
                        Generate invoice for completed shifts
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Completed Shifts</p>
                          <p className="text-sm text-muted-foreground">
                            {completedShiftsCount} shift(s) available for invoicing
                          </p>
                        </div>
                        <Button
                          onClick={generateInvoice}
                          disabled={completedShiftsCount === 0}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Generate Invoice
                        </Button>
                      </div>

                      {completedShiftsCount > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Shift Summary</h4>
                          <div className="space-y-1">
                            {getCompletedShifts().map((assignment) => {
                              const shift = assignment.shift
                              if (!shift) return null
                              const hours = parseFloat(calculateHours(shift.start_time, shift.end_time, shift.break_minutes || 0))
                              const rate = shift.price_book?.rate_per_hour || shift.shift_type?.hourly_rate || selectedStaff?.hourly_rate || 0
                              const amount = hours * rate
                              return (
                                <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div>
                                    <p className="font-medium">
                                      {format(new Date(shift.start_time), "MMM dd, yyyy")}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {shift.client ? `${shift.client.first_name} ${shift.client.last_name}` : "N/A"}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">{hours}h × ${rate}/hr</p>
                                    <p className="text-sm text-muted-foreground">${amount.toFixed(2)}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleDocumentUpload}
        title="Upload Staff Documents"
        description="Select a category and upload documents for this staff member"
      />
    </ProtectedRoute>
  )
}

