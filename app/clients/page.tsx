"use client"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Users, UserCheck, UserX, CalendarCheck } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { DataTable } from "@/components/ui/data-table"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { fetchClients, fetchClientsByCompany, deleteClient } from "@/feature/clients/clientSlice"
import { RootState, AppDispatch } from "@/lib/store"
import { Client } from "@/types"
import ProtectedRoute from "@/components/protected-route"
import { useToast } from "@/hooks/use-toast"
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

export default function ClientsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { clients, status, error } = useSelector((state: RootState) => state.clients)
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const { toast } = useToast()
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [addClientDrawerOpen, setAddClientDrawerOpen] = useState(false)
  const [editClientDrawerOpen, setEditClientDrawerOpen] = useState(false)
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null)

  console.log('ClientsPage - Clients:', clients)

  useEffect(() => {
    if (isAuthenticated && user) {
      // Use company-specific endpoint if user has a company_id
      if (user.company_id) {
        dispatch(fetchClientsByCompany({ companyId: user.company_id })).catch((error) => {
          console.error('Failed to fetch clients by company:', error)
          toast({
            title: "Error",
            description: "Failed to load clients. Please try again.",
            variant: "destructive",
          })
        })
      } else {
        // For SUPER_ADMIN users without company_id, fetch all clients
        dispatch(fetchClients()).catch((error) => {
          console.error('Failed to fetch clients:', error)
          toast({
            title: "Error",
            description: "Failed to load clients. Please try again.",
            variant: "destructive",
          })
        })
      }
    }
  }, [dispatch, isAuthenticated, user, toast])

  const handleDeleteClient = async (client: Client) => {
    try {
      await dispatch(deleteClient(client.id)).unwrap()
      toast({
        title: "Client Deleted",
        description: `${client.first_name} ${client.last_name} has been permanently removed from the system.`,
      })
      setDeleteDialogOpen(false)
      setClientToDelete(null)
    } catch (error: any) {
      // Extract the real error message from the response
      let errorMessage = "Failed to delete client"
      
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      // Show the actual error message from the backend
      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive",
      })
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
              <p className="max-w-xs truncate">{row.additional_notes || 'No notes'}</p>
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
            onClick={() => openEditDialog(row)}
            title="Edit client"
            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          >
            <Edit className="h-4 w-4" />
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
              <Button onClick={() => setAddClientDrawerOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Client
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
                <div className="flex items-center justify-center h-32">
                  <div className="text-red-600">Error: {error}</div>
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
        onClose={() => setAddClientDrawerOpen(false)} 
      />

      {/* Edit Client Drawer */}
      <EditClientDrawer 
        client={clientToEdit}
        isOpen={editClientDrawerOpen} 
        onClose={() => {
          setEditClientDrawerOpen(false)
          setClientToEdit(null)
        }} 
      />
    </ProtectedRoute>
  )
}
