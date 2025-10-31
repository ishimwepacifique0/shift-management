"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/lib/store"
import { fetchClientById } from "@/feature/clients/clientSlice"
import ProtectedRoute from "@/components/protected-route"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { DocumentUploadModal } from "@/components/document-upload-modal"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Calendar, MapPin, Info, XCircle, CheckCircle, Loader2, ArrowLeft, Phone, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { clientApi } from "@/lib/api/clientApi"
import { shiftApi } from "@/lib/api/shiftApi"
import { format } from "date-fns"
import Link from "next/link"

interface Document {
  url: string
  public_id: string
  filename: string
  mimetype: string
  size: number
  category: string
  uploaded_at: string
}

export default function ClientDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const { selectedClient: client, status, error } = useSelector((state: RootState) => state.clients)
  const { user } = useSelector((state: RootState) => state.auth)
  const { toast } = useToast()

  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [clientShifts, setClientShifts] = useState<any[]>([])
  const [shiftsStatus, setShiftsStatus] = useState<"idle" | "loading" | "succeeded" | "failed">("idle")

  useEffect(() => {
    if (id) {
      dispatch(fetchClientById(Number(id)))
      fetchShifts(Number(id))
    }
  }, [id, dispatch])

  const fetchShifts = async (clientId: number) => {
    setShiftsStatus("loading")
    try {
      const response = await shiftApi.getShiftsByClient(clientId, { limit: 100 })
      if (response.success) {
        setClientShifts(response.data.data || [])
        setShiftsStatus("succeeded")
      } else {
        throw new Error(response.message || "Failed to fetch client shifts")
      }
    } catch (err: any) {
      console.error("Failed to fetch client shifts:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to load client shifts.",
        variant: "destructive",
      })
      setShiftsStatus("failed")
    }
  }

  const handleDocumentUpload = async (files: File[], category: string) => {
    if (!client) return
    try {
      const response = await clientApi.uploadClientDocuments(client.id, files, category)
      if (response.success) {
        toast({
          title: "Documents Uploaded",
          description: `${files.length} document(s) uploaded successfully`,
        })
        dispatch(fetchClientById(client.id)) // Refresh client data to show new documents
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

  if (status === "loading" || shiftsStatus === "loading") {
    return (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <div className="flex items-center justify-center h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading client details...</span>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    )
  }

  if (status === "failed" || !client) {
    return (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <div className="flex items-center justify-center h-screen">
              <div className="text-red-600 text-lg">Error: {error || "Client not found."}</div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    )
  }

  const parsedDocuments: Document[] = client.documents ? JSON.parse(client.documents) : []
  const documentsByCategory = parsedDocuments.reduce((acc, doc) => {
    (acc[doc.category] = acc[doc.category] || []).push(doc)
    return acc
  }, {} as Record<string, Document[]>)

  const completedShifts = clientShifts.filter(shift => shift.status === "completed")
  const inProgressShifts = clientShifts.filter(shift => shift.status === "in_progress" || shift.status === "assigned")
  const cancelledShifts = clientShifts.filter(shift => shift.status === "cancelled")

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-screen overflow-hidden">
            <div className="flex border-b justify-between p-6 items-center flex-shrink-0">
              <div className="flex items-center gap-4">
                <Link href="/clients">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Clients
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold">Client Profile: {client.first_name} {client.last_name}</h1>
                  <p className="text-muted-foreground">Detailed information and management for {client.first_name}</p>
                </div>
              </div>
              <Button onClick={() => setUploadModalOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid gap-6 lg:grid-cols-3 mb-6">
                <Card className="lg:col-span-1">
                  <CardHeader className="flex flex-row items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={`/placeholder.svg?height=64&width=64&query=${client.first_name}`} />
                      <AvatarFallback>{client.first_name[0]}{client.last_name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl">{client.first_name} {client.last_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{client.email || "No email"}</p>
                      <Badge variant={client.is_active ? "default" : "secondary"} className="mt-1">
                        {client.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {client.phone && (
                      <div className="flex items-center">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Phone: {client.phone}</span>
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Email: {client.email}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Address: {client.address}</span>
                      </div>
                    )}
                    {client.date_of_birth && (
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Date of Birth: {format(new Date(client.date_of_birth), "PPP")}</span>
                      </div>
                    )}
                    {client.gender && (
                      <div className="flex items-center">
                        <Info className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Gender: {client.gender}</span>
                      </div>
                    )}
                    {client.ndis_number && (
                      <div className="flex items-center">
                        <Info className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">NDIS Number: {client.ndis_number}</span>
                      </div>
                    )}
                    {client.emergency_contact_name && (
                      <div className="flex items-center">
                        <Info className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Emergency Contact: {client.emergency_contact_name}</span>
                        {client.emergency_contact_phone && (
                          <span className="text-sm ml-1">({client.emergency_contact_phone})</span>
                        )}
                      </div>
                    )}
                    {client.additional_notes && (
                      <div className="flex items-start">
                        <Info className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                        <span className="text-sm">Notes: {client.additional_notes}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(documentsByCategory).length > 0 ? (
                      <Tabs defaultValue={Object.keys(documentsByCategory)[0]} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          {Object.keys(documentsByCategory).map((category) => (
                            <TabsTrigger key={category} value={category}>
                              {category} ({documentsByCategory[category].length})
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {Object.keys(documentsByCategory).map((category) => (
                          <TabsContent key={category} value={category} className="mt-4">
                            <div className="grid gap-2">
                              {documentsByCategory[category].map((doc, index) => (
                                <div key={index} className="flex items-center justify-between rounded-md border p-3">
                                  <div className="flex items-center">
                                    <FileText className="mr-2 h-5 w-5 text-primary" />
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline">
                                      {doc.filename}
                                    </a>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(doc.uploaded_at), "PPP")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    ) : (
                      <p className="text-muted-foreground">No documents uploaded yet.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Shift History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="in-progress">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="in-progress">In Progress ({inProgressShifts.length})</TabsTrigger>
                      <TabsTrigger value="completed">Completed ({completedShifts.length})</TabsTrigger>
                      <TabsTrigger value="cancelled">Cancelled ({cancelledShifts.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="in-progress" className="mt-4">
                      {inProgressShifts.length > 0 ? (
                        <div className="grid gap-4">
                          {inProgressShifts.map((shift) => (
                            <ShiftCard key={shift.id} shift={shift} />
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No in-progress shifts.</p>
                      )}
                    </TabsContent>
                    <TabsContent value="completed" className="mt-4">
                      {completedShifts.length > 0 ? (
                        <div className="grid gap-4">
                          {completedShifts.map((shift) => (
                            <ShiftCard key={shift.id} shift={shift} />
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No completed shifts.</p>
                      )}
                    </TabsContent>
                    <TabsContent value="cancelled" className="mt-4">
                      {cancelledShifts.length > 0 ? (
                        <div className="grid gap-4">
                          {cancelledShifts.map((shift) => (
                            <ShiftCard key={shift.id} shift={shift} />
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No cancelled shifts.</p>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleDocumentUpload}
        title="Upload Client Documents"
        description={`Upload documents for ${client.first_name} ${client.last_name}`}
      />
    </ProtectedRoute>
  )
}

interface ShiftCardProps {
  shift: any
}

const ShiftCard = ({ shift }: ShiftCardProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "in_progress":
      case "assigned":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{shift.care_service?.name || "Care Service"}</CardTitle>
          {getStatusBadge(shift.status)}
        </div>
        <p className="text-sm text-muted-foreground">
          {format(new Date(shift.start_time), "PPP p")} - {format(new Date(shift.end_time), "PPP p")}
        </p>
      </CardHeader>
      <CardContent className="grid gap-2">
        {shift.location && (
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            {shift.location}
          </div>
        )}
        {shift.shift_type && (
          <div className="flex items-center text-sm">
            <Info className="mr-2 h-4 w-4 text-muted-foreground" />
            Shift Type: {shift.shift_type.name || "N/A"}
          </div>
        )}
        {shift.notes && (
          <div className="flex items-start text-sm">
            <Info className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
            Notes: {shift.notes}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

