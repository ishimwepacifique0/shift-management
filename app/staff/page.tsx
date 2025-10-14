"use client"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Users, UserCheck, UserX, Clock } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { DataTable } from "@/components/ui/data-table"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { fetchStaff, fetchStaffByCompany, deleteStaff } from "@/feature/staff/staffSlice"
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
import { useToast } from "@/hooks/use-toast"
import { AddStaffDrawer } from "@/components/add-staff-drawer"
import { EditStaffDrawer } from "@/components/edit-staff-drawer"

export default function StaffPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { staff, status, error } = useSelector((state: RootState) => state.staff)
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const { toast } = useToast()
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null)
  const [addStaffDrawerOpen, setAddStaffDrawerOpen] = useState(false)
  const [editStaffDrawerOpen, setEditStaffDrawerOpen] = useState(false)
  const [staffToEdit, setStaffToEdit] = useState<Staff | null>(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      // Use company-specific endpoint if user has a company_id
      if (user.company_id) {
        dispatch(fetchStaffByCompany({ companyId: user.company_id })).catch((error) => {
          toast({
            title: "Error",
            description: "Failed to load staff members. Please try again.",
            variant: "destructive",
          })
        })
      } else {
        // For SUPER_ADMIN users without company_id, fetch all staff
        dispatch(fetchStaff()).catch((error) => {
          toast({
            title: "Error",
            description: "Failed to load staff members. Please try again.",
            variant: "destructive",
          })
        })
      }
    }
  }, [dispatch, isAuthenticated, user, toast])

  const handleDeleteStaff = async (staffMember: Staff) => {
    try {
      await dispatch(deleteStaff(staffMember.id)).unwrap()
      toast({
        title: "Staff Member Deleted",
        description: `${staffMember.user.first_name} ${staffMember.user.last_name} and their user account have been permanently removed from the system.`,
      })
      setDeleteDialogOpen(false)
      setStaffToDelete(null)
    } catch (error: any) {
      // Extract the real error message from the response
      let errorMessage = "Failed to delete staff member"
      
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
            onClick={() => openEditDialog(row)}
            title="Edit staff member"
            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          >
            <Edit className="h-4 w-4" />
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
          <div className="flex flex-col h-screen">
            <div className="flex border-b justify-between p-6 items-center">
              <div>
                <h1 className="text-3xl font-bold">Staff Management</h1>
                <p className="text-muted-foreground">Manage your team members and their assignments</p>
              </div>
              <Button onClick={() => setAddStaffDrawerOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </div>

            <div className="flex-1 p-6">
              <div className="grid gap-6 lg:grid-cols-4 mb-6 md:grid-cols-2">
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

              {status === "loading" ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">Loading staff members...</div>
                </div>
              ) : status === "failed" && error ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-red-600">Error: {error}</div>
                </div>
              ) : (
                <DataTable columns={staffColumns} data={staff} />
              )}
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
        onClose={() => setAddStaffDrawerOpen(false)} 
      />

      {/* Edit Staff Drawer */}
      <EditStaffDrawer 
        staff={staffToEdit}
        isOpen={editStaffDrawerOpen} 
        onClose={() => {
          setEditStaffDrawerOpen(false)
          setStaffToEdit(null)
        }} 
      />
    </ProtectedRoute>
  )
}
