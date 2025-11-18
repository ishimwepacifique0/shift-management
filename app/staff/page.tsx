"use client"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Users, UserCheck, UserX, Clock, Upload, Eye, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { StatsCard } from "@/components/stats-card"
import { DataTable } from "@/components/ui/data-table"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState, useCallback } from "react"
import { fetchStaff, fetchStaffByCompany, deleteStaff, clearError } from "@/feature/staff/staffSlice"
import { RootState, AppDispatch } from "@/lib/store"
import { Staff } from "@/types"
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
import { toast } from "react-toastify"
import { AddStaffDrawer } from "@/components/add-staff-drawer"
import { EditStaffDrawer } from "@/components/edit-staff-drawer"
import { DocumentUploadModal } from "@/components/document-upload-modal"
import { staffApi } from "@/lib/api/staffApi"

export default function StaffPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { staff, status, error, errorSource } = useSelector((state: RootState) => state.staff)
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null)
  const [addStaffDrawerOpen, setAddStaffDrawerOpen] = useState(false)
  const [editStaffDrawerOpen, setEditStaffDrawerOpen] = useState(false)

  // Clear errors when opening drawers to prevent create/update errors from showing on main page
  useEffect(() => {
    // Clear create/update errors when opening drawers
    // This prevents errors from create/update operations from showing on the main page
    if ((addStaffDrawerOpen || editStaffDrawerOpen) && (errorSource === "create" || errorSource === "update")) {
      dispatch(clearError())
    }
  }, [addStaffDrawerOpen, editStaffDrawerOpen, errorSource, dispatch])
  const [staffToEdit, setStaffToEdit] = useState<Staff | null>(null)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [staffForUpload, setStaffForUpload] = useState<Staff | null>(null)

  const loadStaff = useCallback(async () => {
    if (!isAuthenticated || !user) return
    
    try {
      if (user.company_id) {
        await dispatch(fetchStaffByCompany({ companyId: user.company_id })).unwrap()
      } else {
        await dispatch(fetchStaff()).unwrap()
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to load staff members. Please try again."
      toast.error(errorMessage)
    }
  }, [dispatch, isAuthenticated, user])

  useEffect(() => {
    loadStaff()
  }, [loadStaff])

  const handleDeleteStaff = async (staffMember: Staff) => {
    try {
      const result = await dispatch(deleteStaff(staffMember.id)).unwrap()
      
      // Use backend message if available, otherwise use custom message
      const successMessage = result?.message || `${staffMember.user.first_name} ${staffMember.user.last_name} and their user account have been permanently removed from the system.`
      
      toast.success(successMessage)
      setDeleteDialogOpen(false)
      setStaffToDelete(null)
      // Refresh staff list after deletion
      loadStaff()
    } catch (error: any) {
      // Extract the real error message from the response
      // When using rejectWithValue with unwrap(), the error IS the rejected value
      let errorMessage = "Failed to delete staff member"
      
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
      if (errorMessage === "Failed to delete staff member" && error?.payload) {
        if (error.payload.error) {
          errorMessage = error.payload.error
        } else if (error.payload.message) {
          errorMessage = error.payload.message
        }
      }
      
      // Check axios error structure (if error wasn't caught by rejectWithValue)
      if (errorMessage === "Failed to delete staff member") {
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
      setStaffToDelete(null)
    }
  }

  const openDeleteDialog = (staffMember: Staff) => {
    setStaffToDelete(staffMember)
    setDeleteDialogOpen(true)
  }

  const openEditDialog = (staffMember: Staff) => {
    setStaffToEdit(staffMember)
    setEditStaffDrawerOpen(true)
  }

  const totalStaff = staff.length
  const activeStaff = staff.filter((s) => s.is_active).length
  const inactiveStaff = totalStaff - activeStaff
  const averageWeeklyHours = "0" // This would need to be calculated from shifts
  // Check if we're creating staff: loading status with drawer open and not from fetch
  // This ensures the button shows feedback when creating staff
  const isCreatingStaff = status === "loading" && addStaffDrawerOpen && errorSource !== "fetch"

  const staffColumns = [
    {
      key: "name",
      header: "Name",
      render: (row: Staff) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={row.user.profile_picture || `/placeholder.svg?height=32&width=32&query=${row.user.first_name}`} />
            <AvatarFallback>
              {row.user.first_name[0]}{row.user.last_name[0]}
            </AvatarFallback>
          </Avatar>
          {row.user.first_name} {row.user.last_name}
        </div>
      ),
    },
    { 
      key: "email", 
      header: "Email",
      render: (row: Staff) => row.user.email
    },
    { 
      key: "phone", 
      header: "Phone",
      render: (row: Staff) => row.user.phone
    },
    {
      key: "qualifications",
      header: "Qualifications",
      render: (row: Staff) => (
        <div className="max-w-[200px] truncate">
          {row.qualifications || "Not specified"}
        </div>
      ),
    },
    {
      key: "hourly_rate",
      header: "Hourly Rate",
      render: (row: Staff) => row.hourly_rate ? `$${row.hourly_rate}/hr` : "Not set",
    },
    {
      key: "status",
      header: "Status",
      render: (row: Staff) => (
        <Badge variant={row.is_active ? "default" : "secondary"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Staff) => (
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push(`/staff/${row.id}`)}
            title="View details"
            className="text-purple-600 hover:bg-purple-50 hover:text-purple-700"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => openEditDialog(row)}
            title="Edit staff member"
            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setStaffForUpload(row)
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
            title="Delete staff member"
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
          <div className="flex flex-col h-[calc(100vh-3.5rem)]">
            <div className="flex border-b justify-between p-4 md:p-6 items-center flex-shrink-0 bg-background">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Staff Management</h1>
                <p className="text-sm md:text-base text-muted-foreground">Manage your team members and their assignments</p>
              </div>
              <Button 
                onClick={() => setAddStaffDrawerOpen(true)}
                disabled={isCreatingStaff}
                className="shrink-0"
              >
                {isCreatingStaff ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Add Staff Member</span>
                    <span className="sm:hidden">Add</span>
                  </>
                )}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                <StatsCard
                  title="Total Staff"
                  value={totalStaff}
                  description="All registered staff members"
                  icon={Users}
                />
                <StatsCard
                  title="Active Staff"
                  value={activeStaff}
                  description="Currently active for shifts"
                  icon={UserCheck}
                />
                <StatsCard title="Inactive Staff" value={inactiveStaff} description="Not currently active" icon={UserX} />
                <StatsCard
                  title="Avg. Weekly Hours"
                  value={`${averageWeeklyHours}h`}
                  description="Average hours per active staff"
                  icon={Clock}
                />
              </div>

              <div className="w-full overflow-x-auto">
                {status === "loading" && !addStaffDrawerOpen && !editStaffDrawerOpen ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-muted-foreground">Loading staff members...</div>
                  </div>
                ) : status === "failed" && error && errorSource === "fetch" ? (
                  <div className="flex flex-col items-center justify-center h-32 space-y-4">
                    <div className="text-red-600 font-medium">Error loading staff members</div>
                    <div className="text-sm text-muted-foreground">{error}</div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        dispatch(clearError())
                        loadStaff()
                      }}
                      size="sm"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : staff.length === 0 && status !== "loading" ? (
                  <div className="flex flex-col items-center justify-center h-32 space-y-4">
                    <Users className="h-12 w-12 text-muted-foreground" />
                    <div className="text-center">
                      <div className="text-lg font-medium text-muted-foreground">No staff members found</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Get started by adding your first staff member
                      </div>
                    </div>
                    <Button 
                      onClick={() => setAddStaffDrawerOpen(true)}
                      disabled={isCreatingStaff}
                    >
                      {isCreatingStaff ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Staff Member
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="w-full min-w-0">
                    <DataTable columns={staffColumns} data={staff} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {staffToDelete?.user.first_name} {staffToDelete?.user.last_name}? 
              This action cannot be undone and will permanently delete both the staff record and their user account.
              <br /><br />
              <strong>Warning:</strong> This will completely remove the staff member and their login access.
              <br /><br />
              <strong>Note:</strong> Staff members with active shift assignments cannot be deleted. 
              If this staff member has active assignments, you'll need to reassign or complete their shifts first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => staffToDelete && handleDeleteStaff(staffToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Staff Drawer */}
      <AddStaffDrawer 
        isOpen={addStaffDrawerOpen} 
        onClose={() => {
          setAddStaffDrawerOpen(false)
          // Clear any create errors when closing drawer
          if (errorSource === "create") {
            dispatch(clearError())
          }
        }} 
        onSuccess={() => {
          // Refresh staff list after successful creation
          loadStaff()
        }}
      />

      {/* Edit Staff Drawer */}
      <EditStaffDrawer 
        staff={staffToEdit}
        isOpen={editStaffDrawerOpen} 
        onClose={() => {
          setEditStaffDrawerOpen(false)
          setStaffToEdit(null)
          // Clear any update errors when closing drawer
          if (errorSource === "update") {
            dispatch(clearError())
          }
        }}
        onSuccess={() => {
          // Refresh staff list after successful update
          loadStaff()
        }}
      />

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false)
          setStaffForUpload(null)
        }}
        onUpload={async (files, category) => {
          if (!staffForUpload) return
          try {
            const response = await staffApi.uploadStaffDocuments(staffForUpload.id, files, category)
            if (response.success) {
              toast.success(`${files.length} document(s) uploaded successfully`)
              // Refresh staff list
              loadStaff()
            }
          } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to upload documents"
            toast.error(errorMessage)
            throw error
          }
        }}
        title="Upload Staff Documents"
        description="Select a category and upload documents for this staff member"
      />
    </ProtectedRoute>
  )
}
