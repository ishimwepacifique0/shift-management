"use client"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Clock, ClockCheck, ClockX, Calendar } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { DataTable } from "@/components/ui/data-table"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { fetchShiftTypes, fetchActiveShiftTypes, deleteShiftType } from "@/feature/shiftTypes/shiftTypeSlice"
import { RootState, AppDispatch } from "@/lib/store"
import { ShiftType } from "@/types"
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
import { AddShiftTypeDrawer } from "@/components/shift-types/add-shift-type-drawer"
import { EditShiftTypeDrawer } from "@/components/shift-types/edit-shift-type-drawer"

export default function ShiftTypesPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { shiftTypes, activeShiftTypes, status, error } = useSelector((state: RootState) => state.shiftTypes)
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const { toast } = useToast()
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [shiftTypeToDelete, setShiftTypeToDelete] = useState<ShiftType | null>(null)
  const [addShiftTypeDrawerOpen, setAddShiftTypeDrawerOpen] = useState(false)
  const [editShiftTypeDrawerOpen, setEditShiftTypeDrawerOpen] = useState(false)
  const [shiftTypeToEdit, setShiftTypeToEdit] = useState<ShiftType | null>(null)

  useEffect(() => {
    console.log('ShiftTypesPage - Auth state:', { isAuthenticated, user, companyId: user?.company_id })
    if (isAuthenticated && user && user.company_id) {
      console.log('Fetching shift types for company:', user.company_id)
      dispatch(fetchShiftTypes()).catch((error) => {
        console.error('Error fetching shift types:', error)
        toast({
          title: "Error",
          description: "Failed to load shift types. Please try again.",
          variant: "destructive",
        })
      })
      dispatch(fetchActiveShiftTypes())
    } else if (isAuthenticated && user && !user.company_id) {
      console.error('User is authenticated but has no company_id')
      toast({
        title: "Error",
        description: "User is not associated with a company.",
        variant: "destructive",
      })
    }
  }, [dispatch, isAuthenticated, user, toast])

  const handleDeleteShiftType = async (shiftType: ShiftType) => {
    try {
      await dispatch(deleteShiftType(shiftType.id)).unwrap()
      toast({
        title: "Shift Type Deleted",
        description: `${shiftType.name} has been permanently removed from the system.`,
      })
      setDeleteDialogOpen(false)
      setShiftTypeToDelete(null)
    } catch (error: any) {
      let errorMessage = "Failed to delete shift type"
      
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
      setShiftTypeToDelete(null)
    }
  }

  const openDeleteDialog = (shiftType: ShiftType) => {
    setShiftTypeToDelete(shiftType)
    setDeleteDialogOpen(true)
  }

  const openEditDialog = (shiftType: ShiftType) => {
    setShiftTypeToEdit(shiftType)
    setEditShiftTypeDrawerOpen(true)
  }

  const totalShiftTypes = shiftTypes?.length || 0
  const activeShiftTypesCount = activeShiftTypes?.length || 0
  const inactiveShiftTypesCount = totalShiftTypes - activeShiftTypesCount

  const shiftTypeColumns = [
    {
      key: "name",
      header: "Shift Type Name",
      render: (row: ShiftType) => (
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-blue-500" />
          {row.name}
        </div>
      ),
    },
    { 
      key: "description", 
      header: "Description",
      render: (row: ShiftType) => (
        <div className="max-w-[200px] truncate">
          {row.description || "No description"}
        </div>
      )
    },
    {
      key: "duration_hours",
      header: "Duration (Hours)",
      render: (row: ShiftType) => (
        <div className="text-center">
          {row.duration_hours}h
        </div>
      ),
    },
    {
      key: "hourly_rate",
      header: "Hourly Rate",
      render: (row: ShiftType) => (
        <div className="text-right font-medium">
          ${row.hourly_rate.toFixed(2)}/hr
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: ShiftType) => (
        <Badge variant={row.is_active ? "default" : "secondary"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: ShiftType) => (
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => openEditDialog(row)}
            title="Edit shift type"
            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => openDeleteDialog(row)}
            title="Delete shift type"
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
                <h1 className="text-3xl font-bold">Shift Types Management</h1>
                <p className="text-muted-foreground">Manage your company's shift types and scheduling</p>
              </div>
              <Button onClick={() => setAddShiftTypeDrawerOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Shift Type
              </Button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid gap-6 lg:grid-cols-4 mb-6 md:grid-cols-2">
                <StatsCard
                  title="Total Types"
                  value={totalShiftTypes}
                  description="All shift types"
                  icon={Clock}
                />
                <StatsCard
                  title="Active Types"
                  value={activeShiftTypesCount}
                  description="Available for shifts"
                  icon={ClockCheck}
                />
                <StatsCard 
                  title="Inactive Types" 
                  value={inactiveShiftTypesCount} 
                  description="Not currently active" 
                  icon={ClockX} 
                />
                <StatsCard
                  title="Avg Duration"
                  value={shiftTypes?.length ? (shiftTypes.reduce((sum, st) => sum + st.duration_hours, 0) / shiftTypes.length).toFixed(1) + "h" : "0h"}
                  description="Average shift duration"
                  icon={Calendar}
                />
              </div>

              {status === "loading" ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">Loading shift types...</div>
                </div>
              ) : status === "failed" && error ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-red-600">Error: {error}</div>
                </div>
              ) : (shiftTypes && shiftTypes.length > 0) ? (
                <DataTable columns={shiftTypeColumns} data={shiftTypes} />
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No Shift Types Found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get started by creating your first shift type
                  </p>
                  <Button onClick={() => setAddShiftTypeDrawerOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Shift Type
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
            <AlertDialogTitle>Delete Shift Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {shiftTypeToDelete?.name}? 
              This action cannot be undone and will permanently remove the shift type from the system.
              <br /><br />
              <strong>Warning:</strong> This will completely remove the shift type.
              <br /><br />
              <strong>Note:</strong> Shift types with active shift assignments cannot be deleted. 
              If this shift type has active assignments, you'll need to reassign or complete those shifts first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => shiftTypeToDelete && handleDeleteShiftType(shiftTypeToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Shift Type Drawer */}
      <AddShiftTypeDrawer 
        isOpen={addShiftTypeDrawerOpen} 
        onClose={() => setAddShiftTypeDrawerOpen(false)} 
      />

      {/* Edit Shift Type Drawer */}
      <EditShiftTypeDrawer 
        shiftType={shiftTypeToEdit}
        isOpen={editShiftTypeDrawerOpen} 
        onClose={() => {
          setEditShiftTypeDrawerOpen(false)
          setShiftTypeToEdit(null)
        }} 
      />
    </ProtectedRoute>
  )
}
