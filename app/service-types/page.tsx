"use client"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Tag, X, Tags, CheckCircle } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { DataTable } from "@/components/ui/data-table"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { fetchServiceTypes, fetchActiveServiceTypes, deleteServiceType } from "@/feature/serviceTypes/serviceTypeSlice"
import { RootState, AppDispatch } from "@/lib/store"
import { ServiceType } from "@/types"
import ProtectedRoute from "@/components/protected-route"
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
import { useToast } from "@/hooks/use-toast"
import { AddServiceTypeDrawer } from "@/components/service-types/add-service-type-drawer"
import { EditServiceTypeDrawer } from "@/components/service-types/edit-service-type-drawer"

export default function ServiceTypesPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { serviceTypes, activeServiceTypes, status, error } = useSelector((state: RootState) => state.serviceTypes)
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const { toast } = useToast()
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [serviceTypeToDelete, setServiceTypeToDelete] = useState<ServiceType | null>(null)
  const [addServiceTypeDrawerOpen, setAddServiceTypeDrawerOpen] = useState(false)
  const [editServiceTypeDrawerOpen, setEditServiceTypeDrawerOpen] = useState(false)
  const [serviceTypeToEdit, setServiceTypeToEdit] = useState<ServiceType | null>(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchServiceTypes()).catch((error) => {
        console.error("Error fetching service types:", error)
        toast({
          title: "Error",
          description: "Failed to load service types. Please try again.",
          variant: "destructive",
        })
      })
      dispatch(fetchActiveServiceTypes())
    }
  }, [dispatch, isAuthenticated, user, toast])

  // Debug logging
  useEffect(() => {
    console.log("Service Types State:", { serviceTypes, activeServiceTypes, status, error })
  }, [serviceTypes, activeServiceTypes, status, error])

  const handleDeleteServiceType = async (serviceType: ServiceType) => {
    try {
      await dispatch(deleteServiceType(serviceType.id)).unwrap()
      toast({
        title: "Service Type Deleted",
        description: `${serviceType.name} has been permanently removed from the system.`,
      })
      setDeleteDialogOpen(false)
      setServiceTypeToDelete(null)
    } catch (error: any) {
      let errorMessage = "Failed to delete service type"
      
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive",
      })
      setDeleteDialogOpen(false)
      setServiceTypeToDelete(null)
    }
  }

  const openDeleteDialog = (serviceType: ServiceType) => {
    setServiceTypeToDelete(serviceType)
    setDeleteDialogOpen(true)
  }

  const openEditDialog = (serviceType: ServiceType) => {
    setServiceTypeToEdit(serviceType)
    setEditServiceTypeDrawerOpen(true)
  }

  const totalServiceTypes = serviceTypes?.length || 0
  const activeServiceTypesCount = activeServiceTypes?.length || 0
  const inactiveServiceTypesCount = totalServiceTypes - activeServiceTypesCount


  const serviceTypeColumns = [
    {
      key: "name",
      header: "Service Type Name",
      render: (row: ServiceType) => (
        <div className="flex items-center">
          <Tag className="h-4 w-4 mr-2 text-blue-500" />
          {row.name}
        </div>
      ),
    },
    { 
      key: "description", 
      header: "Description",
      render: (row: ServiceType) => (
        <div className="max-w-[200px] truncate">
          {row.description || "No description"}
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (row: ServiceType) => (
        <Badge variant={row.is_active ? "default" : "secondary"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (row: ServiceType) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: ServiceType) => (
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => openEditDialog(row)}
            title="Edit service type"
            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => openDeleteDialog(row)}
            title="Delete service type"
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
          <div className="flex flex-col h-screen overflow-hidden">
            <div className="flex border-b justify-between p-6 items-center flex-shrink-0">
              <div>
                <h1 className="text-3xl font-bold">Service Types Management</h1>
                <p className="text-muted-foreground">Manage your company's service type categories</p>
              </div>
              <Button onClick={() => setAddServiceTypeDrawerOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Service Type
              </Button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid gap-6 lg:grid-cols-4 mb-6 md:grid-cols-2">
                <StatsCard
                  title="Total Types"
                  value={totalServiceTypes}
                  description="All service types"
                  icon={Tags}
                />
                <StatsCard
                  title="Active Types"
                  value={activeServiceTypesCount}
                  description="Available for use"
                  icon={CheckCircle}
                />
                <StatsCard 
                  title="Inactive Types" 
                  value={inactiveServiceTypesCount} 
                  description="Not currently active" 
                  icon={X} 
                />
                <StatsCard
                  title="Categories"
                  value="0"
                  description="Different categories"
                  icon={Tag}
                />
              </div>

              {status === "loading" ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">Loading service types...</div>
                </div>
              ) : status === "failed" && error ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-red-600">Error: {error}</div>
                </div>
              ) : (serviceTypes && serviceTypes.length > 0) ? (
                <DataTable columns={serviceTypeColumns} data={serviceTypes} />
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No Service Types Found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get started by creating your first service type
                  </p>
                  <Button onClick={() => setAddServiceTypeDrawerOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service Type
                  </Button>
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {serviceTypeToDelete?.name}? 
              This action cannot be undone and will permanently remove the service type from the system.
              <br /><br />
              <strong>Warning:</strong> This will completely remove the service type.
              <br /><br />
              <strong>Note:</strong> Service types with associated care services cannot be deleted. 
              If this service type has associated care services, you'll need to reassign or remove those services first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => serviceTypeToDelete && handleDeleteServiceType(serviceTypeToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Service Type Drawer */}
      <AddServiceTypeDrawer 
        isOpen={addServiceTypeDrawerOpen} 
        onClose={() => setAddServiceTypeDrawerOpen(false)} 
      />

      {/* Edit Service Type Drawer */}
      <EditServiceTypeDrawer 
        serviceType={serviceTypeToEdit}
        isOpen={editServiceTypeDrawerOpen} 
        onClose={() => {
          setEditServiceTypeDrawerOpen(false)
          setServiceTypeToEdit(null)
        }} 
      />
    </ProtectedRoute>
  )
}
