"use client"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Heart, HeartHandshake, HeartOff, Tag } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { DataTable } from "@/components/ui/data-table"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { fetchCareServices, fetchActiveCareServices, deleteCareService } from "@/feature/careServices/careServiceSlice"
import { RootState, AppDispatch } from "@/lib/store"
import { CareService } from "@/types"
import { useServiceTypes } from "@/hooks/use-service-types"
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
import { AddCareServiceDrawer } from "@/components/care-services/add-care-service-drawer"
import { EditCareServiceDrawer } from "@/components/care-services/edit-care-service-drawer"


export default function CareServicesPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { careServices, activeCareServices, status, error } = useSelector((state: RootState) => state.careServices)
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const { serviceTypes } = useServiceTypes()
  const { toast } = useToast()
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [careServiceToDelete, setCareServiceToDelete] = useState<CareService | null>(null)
  const [addCareServiceDrawerOpen, setAddCareServiceDrawerOpen] = useState(false)
  const [editCareServiceDrawerOpen, setEditCareServiceDrawerOpen] = useState(false)
  const [careServiceToEdit, setCareServiceToEdit] = useState<CareService | null>(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchCareServices()).catch((error) => {
        toast({
          title: "Error",
          description: "Failed to load care services. Please try again.",
          variant: "destructive",
        })
      })
      dispatch(fetchActiveCareServices())
    }
  }, [dispatch, isAuthenticated, user, toast])

  const handleDeleteCareService = async (careService: CareService) => {
    try {
      await dispatch(deleteCareService(careService.id)).unwrap()
      toast({
        title: "Care Service Deleted",
        description: `${careService.name} has been permanently removed from the system.`,
      })
      setDeleteDialogOpen(false)
      setCareServiceToDelete(null)
    } catch (error: any) {
      let errorMessage = "Failed to delete care service"
      
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
      setCareServiceToDelete(null)
    }
  }

  const openDeleteDialog = (careService: CareService) => {
    setCareServiceToDelete(careService)
    setDeleteDialogOpen(true)
  }

  const openEditDialog = (careService: CareService) => {
    setCareServiceToEdit(careService)
    setEditCareServiceDrawerOpen(true)
  }

  const totalCareServices = careServices?.length || 0
  const activeCareServicesCount = activeCareServices?.length || 0
  const inactiveCareServicesCount = totalCareServices - activeCareServicesCount

  // Helper function to get service type name
  const getServiceTypeName = (serviceTypeId?: number) => {
    if (!serviceTypeId) return "Not assigned"
    const serviceType = serviceTypes?.find(st => st.id === serviceTypeId)
    return serviceType?.name || "Unknown service type"
  }

  const careServiceColumns = [
    {
      key: "name",
      header: "Service Name",
      render: (row: CareService) => (
        <div className="flex items-center">
          <Heart className="h-4 w-4 mr-2 text-red-500" />
          {row.name}
        </div>
      ),
    },
    { 
      key: "description", 
      header: "Description",
      render: (row: CareService) => (
        <div className="max-w-[200px] truncate">
          {row.description || "No description"}
        </div>
      )
    },
    {
      key: "service_type",
      header: "Service Type",
      render: (row: CareService) => {
        if (row.service_type?.name) {
          return row.service_type.name
        }
        return getServiceTypeName(row.service_type_id)
      },
    },
    {
      key: "price_book",
      header: "Price Book",
      render: (row: CareService) => {
        if (row.price_book?.name) {
          return `${row.price_book.name} ($${row.price_book.rate_per_hour}/hr)`
        }
        return "Not assigned"
      },
    },
    {
      key: "status",
      header: "Status",
      render: (row: CareService) => (
        <Badge variant={row.is_active ? "default" : "secondary"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: CareService) => (
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => openEditDialog(row)}
            title="Edit care service"
            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => openDeleteDialog(row)}
            title="Delete care service"
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
                <h1 className="text-3xl font-bold">Care Services Management</h1>
                <p className="text-muted-foreground">Manage your company's care services and pricing</p>
              </div>
              <Button onClick={() => setAddCareServiceDrawerOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Care Service
              </Button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid gap-6 lg:grid-cols-4 mb-6 md:grid-cols-2">
                <StatsCard
                  title="Total Services"
                  value={totalCareServices}
                  description="All care services"
                  icon={Heart}
                />
                <StatsCard
                  title="Active Services"
                  value={activeCareServicesCount}
                  description="Available for shifts"
                  icon={HeartHandshake}
                />
                <StatsCard 
                  title="Inactive Services" 
                  value={inactiveCareServicesCount} 
                  description="Not currently active" 
                  icon={HeartOff} 
                />
                <StatsCard
                  title="Service Types"
                  value={serviceTypes?.length || 0}
                  description="Different categories"
                  icon={Tag}
                />
              </div>

              {status === "loading" ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">Loading care services...</div>
                </div>
              ) : status === "failed" && error ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-red-600">Error: {error}</div>
                </div>
              ) : (careServices && careServices.length > 0) ? (
                <DataTable columns={careServiceColumns} data={careServices} />
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No Care Services Found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get started by creating your first care service
                  </p>
                  <Button onClick={() => setAddCareServiceDrawerOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Care Service
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
            <AlertDialogTitle>Delete Care Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {careServiceToDelete?.name}? 
              This action cannot be undone and will permanently remove the care service from the system.
              <br /><br />
              <strong>Warning:</strong> This will completely remove the care service.
              <br /><br />
              <strong>Note:</strong> Care services with active shift assignments cannot be deleted. 
              If this care service has active assignments, you'll need to reassign or complete those shifts first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => careServiceToDelete && handleDeleteCareService(careServiceToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Care Service Drawer */}
      <AddCareServiceDrawer 
        isOpen={addCareServiceDrawerOpen} 
        onClose={() => setAddCareServiceDrawerOpen(false)} 
      />

      {/* Edit Care Service Drawer */}
      <EditCareServiceDrawer 
        careService={careServiceToEdit}
        isOpen={editCareServiceDrawerOpen} 
        onClose={() => {
          setEditCareServiceDrawerOpen(false)
          setCareServiceToEdit(null)
        }} 
      />
    </ProtectedRoute>
  )
}
