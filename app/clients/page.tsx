"use client"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Users, UserCheck, UserX, CalendarCheck, Upload, Eye, Loader2 } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { DataTable } from "@/components/ui/data-table"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState, useCallback } from "react"
import { fetchClients, fetchClientsByCompany, deleteClient } from "@/feature/clients/clientSlice"
import { RootState, AppDispatch } from "@/lib/store"
import { Client } from "@/types"
import ProtectedRoute from "@/components/protected-route"
import { toast } from "react-toastify"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AddClientDrawer } from "@/components/add-client-drawer"
import { EditClientDrawer } from "@/components/edit-client-drawer"
import { DocumentUploadModal } from "@/components/document-upload-modal"
import { clientApi } from "@/lib/api/clientApi"

export default function ClientsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { clients, status, error } = useSelector((state: RootState) => state.clients)
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [addClientDrawerOpen, setAddClientDrawerOpen] = useState(false)
  const [editClientDrawerOpen, setEditClientDrawerOpen] = useState(false)
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [clientForUpload, setClientForUpload] = useState<Client | null>(null)

  const loadClients = useCallback(async () => {
    if (!isAuthenticated || !user) return
    
    try {
      if (user.company_id) {
        await dispatch(fetchClientsByCompany({ companyId: user.company_id })).unwrap()
      } else {
        await dispatch(fetchClients()).unwrap()
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Failed to load clients. Please try again."
      toast.error(errorMessage)
    }
  }, [dispatch, isAuthenticated, user])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  const handleDeleteClient = async (client: Client) => {
    try {
      const result = await dispatch(deleteClient(client.id)).unwrap()
      console.log("Client deleted successfully")
      
      // Use backend message if available, otherwise use custom message
      const successMessage = result?.message || `${client.first_name} ${client.last_name} has been permanently removed from the system.`
      
      toast.success(successMessage)
      setDeleteDialogOpen(false)
      setClientToDelete(null)
      // Refresh clients list after deletion
      loadClients()
    } catch (error: any) {
      // Extract the real error message from the response
      // When using rejectWithValue with unwrap(), the error IS the rejected value
      let errorMessage = "Failed to delete client"
      
      // When using rejectWithValue, unwrap() throws the rejected value directly
      // So error will be { message: "...", error: "..." }
      // Priority: error.error > error.message (if not generic) > error.response.data.error > error.response.data.message
      
      if (error?.error && typeof error.error === 'string') {
        errorMessage = error.error
      } else if (error?.message && typeof error.message === 'string') {
        // Only use message if it's not a generic axios error
        if (!error.message.includes("Request failed with status code") && 
            !error.message.includes("Request failed")) {
          errorMessage = error.message
        }
      }
      
      // Check if it's nested in payload (shouldn't happen with unwrap, but just in case)
      if (errorMessage === "Failed to delete client" && error?.payload) {
        if (error.payload.error) {
          errorMessage = error.payload.error
        } else if (error.payload.message) {
          errorMessage = error.payload.message
        }
      }
      
      // Check axios error structure (if error wasn't caught by rejectWithValue)
      if (errorMessage === "Failed to delete client") {
        if (error?.response?.data?.error) {
          errorMessage = error.response.data.error
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.data?.error) {
          errorMessage = error.data.error
        } else if (error?.data?.message) {
          errorMessage = error.data.message
        }
      }
      
      // Show the actual error message from the backend
      toast.error(errorMessage)
      setDeleteDialogOpen(false)
      setClientToDelete(null)
    }
  }

  const openDeleteDialog = (client: Client) => {
    setClientToDelete(client)
    setDeleteDialogOpen(true)
  }

  const openEditDialog = (client: Client) => {
    setClientToEdit(client)
    setEditClientDrawerOpen(true)
  }

  const totalClients = clients.length
  const activeClients = clients.filter((c) => c.is_active).length
  const inactiveClients = totalClients - activeClients
  const clientsWithShifts = 0 // This would need to be calculated from shifts
  const isCreatingClient = status === "loading" && addClientDrawerOpen

  const clientColumns = [
        {
          key: "name",
          header: "Name",
          render: (row: Client) => (
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={`/placeholder.svg?height=32&width=32&query=${row.first_name}`} />
                <AvatarFallback>
                  {row.first_name[0]}{row.last_name[0]}
                </AvatarFallback>
              </Avatar>
              {row.first_name} {row.last_name}
            </div>
          ),
        },
        {
          key: "contactInfo",
          header: "Contact Info",
          render: (row: Client) => (
            <div className="text-sm">
              <p>{row.email}</p>
              <p className="text-muted-foreground">{row.phone}</p>
            </div>
          ),
        },
        {
          key: "additional_notes",
          header: "Notes",
          render: (row: Client) => (
            <div className="text-sm">
              <p className="max-w-xs truncate">{row.additional_notes?.slice(0, 20) + (row.additional_notes?.length && row.additional_notes?.length > 50 ? '...' : '') || 'No notes'}</p>
            </div>
          ),
        },
    {
      key: "status",
      header: "Status",
      render: (row: Client) => (
        <Badge variant={row.is_active ? "default" : "secondary"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Client) => (
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = `/clients/${row.id}`}
            title="View details"
            className="text-purple-600 hover:bg-purple-50 hover:text-purple-700"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => openEditDialog(row)}
            title="Edit client"
            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setClientForUpload(row)
              setUploadModalOpen(true)
            }}
            title="Upload documents"
            className="text-green-600 hover:bg-green-50 hover:text-green-700"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => openDeleteDialog(row)}
            title="Delete client"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-screen">
            <div className="flex border-b justify-between p-6 items-center">
              <div>
                <h1 className="text-3xl font-bold">Client Management</h1>
                <p className="text-muted-foreground">Manage your clients and their service needs</p>
              </div>
              <Button 
                onClick={() => setAddClientDrawerOpen(true)}
                disabled={isCreatingClient}
              >
                {isCreatingClient ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </>
                )}
              </Button>
            </div>

            <div className="flex-1 p-6">
              <div className="grid gap-6 lg:grid-cols-4 mb-6 md:grid-cols-2">
                <StatsCard title="Total Clients" value={totalClients} description="All registered clients" icon={Users} />
                <StatsCard
                  title="Active Clients"
                  value={activeClients}
                  description="Currently receiving services"
                  icon={UserCheck}
                />
                <StatsCard
                  title="Inactive Clients"
                  value={inactiveClients}
                  description="Not currently active"
                  icon={UserX}
                />
                <StatsCard
                  title="Clients with Shifts"
                  value={clientsWithShifts}
                  description="Clients with scheduled shifts"
                  icon={CalendarCheck}
                />
              </div>

              {status === "loading" ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">Loading clients...</div>
                </div>
              ) : status === "failed" && error ? (
                <div className="flex flex-col items-center justify-center h-32 space-y-4">
                  <div className="text-red-600 font-medium">Error loading clients</div>
                  <div className="text-sm text-muted-foreground">{error}</div>
                  <Button 
                    variant="outline" 
                    onClick={() => loadClients()}
                    size="sm"
                  >
                    Try Again
                  </Button>
                </div>
              ) : clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 space-y-4">
                  <Users className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <div className="text-lg font-medium text-muted-foreground">No clients found</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Get started by adding your first client
                    </div>
                  </div>
                  <Button 
                    onClick={() => setAddClientDrawerOpen(true)}
                    disabled={isCreatingClient}
                  >
                    {isCreatingClient ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Client
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <DataTable columns={clientColumns} data={clients} />
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {clientToDelete?.first_name} {clientToDelete?.last_name}? 
              This action cannot be undone and will permanently remove the client from your system.
              <br /><br />
              <strong>Warning:</strong> This will completely remove the client and their associated data.
              <br /><br />
              <strong>Note:</strong> Clients with active shift assignments cannot be deleted. 
              If this client has active assignments, you'll need to reassign or complete their shifts first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => clientToDelete && handleDeleteClient(clientToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Client Drawer */}
      <AddClientDrawer 
        isOpen={addClientDrawerOpen} 
        onClose={() => {
          setAddClientDrawerOpen(false)
          // Refresh clients list after adding
          loadClients()
        }}
        onSuccess={() => {
          // Refresh clients list after successful creation
          loadClients()
        }}
      />

      {/* Edit Client Drawer */}
      <EditClientDrawer 
        client={clientToEdit}
        isOpen={editClientDrawerOpen} 
        onClose={() => {
          setEditClientDrawerOpen(false)
          setClientToEdit(null)
        }}
        onSuccess={() => {
          // Refresh clients list after successful update
          loadClients()
        }}
      />

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false)
          setClientForUpload(null)
        }}
        onUpload={async (files, category) => {
          if (!clientForUpload) return
          try {
            const response = await clientApi.uploadClientDocuments(clientForUpload.id, files, category)
            if (response.success) {
              toast.success(`${files.length} document(s) uploaded successfully`)
              // Refresh clients list
              loadClients()
            }
          } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to upload documents"
            toast.error(errorMessage)
            throw error
          }
        }}
        title="Upload Client Documents"
        description="Select a category and upload documents for this client"
      />
    </ProtectedRoute>
  )
}
