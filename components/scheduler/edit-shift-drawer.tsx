"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Clock, User, Building, Trash2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/lib/store"
import { updateShift, deleteShift } from "@/feature/shifts/shiftSlice"
import { shiftStaffAssignmentApi } from "@/lib/api/shiftStaffAssignmentApi"
import { Shift, Staff, Client } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"

const editShiftSchema = z.object({
  shift_type_id: z.string().optional(),
  client_id: z.string().min(1, "Client is required"),
  staffId: z.string().optional(),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
})

type EditShiftFormData = z.infer<typeof editShiftSchema>

interface EditShiftDrawerProps {
  isOpen: boolean
  onClose: () => void
  shift: Shift | null
  staff: Staff[]
  clients: Client[]
  shiftTypes: any[]
  onShiftUpdated?: () => void
}

export function EditShiftDrawer({
  isOpen,
  onClose,
  shift,
  staff,
  clients,
  shiftTypes,
  onShiftUpdated,
}: EditShiftDrawerProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<EditShiftFormData>({
    resolver: zodResolver(editShiftSchema),
    defaultValues: {
      shift_type_id: "",
      client_id: "",
      staffId: "none",
      start_time: "",
      end_time: "",
      status: "scheduled",
      notes: "",
    },
  })

  // Update form when shift changes
  React.useEffect(() => {
    if (shift) {
      const currentStaffAssignment = shift.shift_staff_assignments?.[0]
      form.reset({
        shift_type_id: shift.shift_type_id?.toString() || "none",
        client_id: shift.client_id?.toString() || "",
        staffId: currentStaffAssignment?.staff_id?.toString() || "none",
        start_time: shift.start_time ? format(new Date(shift.start_time), "HH:mm") : "",
        end_time: shift.end_time ? format(new Date(shift.end_time), "HH:mm") : "",
        status: shift.status || "scheduled",
        notes: shift.notes || "",
      })
    }
  }, [shift, form])

  const onSubmit = async (values: EditShiftFormData) => {
    if (!shift) return

    try {
      setIsLoading(true)

      // Prepare shift data
      const shiftData = {
        shift_type_id: values.shift_type_id && values.shift_type_id !== "none" ? parseInt(values.shift_type_id) : undefined,
        client_id: parseInt(values.client_id),
        start_time: new Date(`${format(new Date(), "yyyy-MM-dd")} ${values.start_time}`).toISOString(),
        end_time: new Date(`${format(new Date(), "yyyy-MM-dd")} ${values.end_time}`).toISOString(),
        status: values.status as "in_progress" | "completed" | "cancelled" | "scheduled",
        notes: values.notes || undefined,
      }

      // Update the shift
      await dispatch(updateShift({ id: shift.id, data: shiftData })).unwrap()

      // Handle staff assignment
      const currentStaffAssignment = shift.shift_staff_assignments?.[0]
      
      if (values.staffId && values.staffId !== "none" && values.staffId !== currentStaffAssignment?.staff_id?.toString()) {
        // Delete existing assignment if it exists
        if (currentStaffAssignment) {
          await shiftStaffAssignmentApi.delete(currentStaffAssignment.id)
        }
        
        // Create new assignment
        const assignmentData = {
          shift_id: shift.id,
          staff_id: parseInt(values.staffId),
          assignment_status: "assigned",
          start_time: shiftData.start_time,
          end_time: shiftData.end_time,
        }
        await shiftStaffAssignmentApi.create(assignmentData)
      } else if ((!values.staffId || values.staffId === "none") && currentStaffAssignment) {
        // Remove staff assignment if no staff selected
        await shiftStaffAssignmentApi.delete(currentStaffAssignment.id)
      }

      toast({
        title: "Success",
        description: "Shift updated successfully",
      })

      onShiftUpdated?.()
      onClose()
    } catch (error: any) {
      console.error("Error updating shift:", error)
      
      let errorMessage = "Failed to update shift"
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }

      toast({
        title: "Shift Update Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!shift) return

    if (!confirm("Are you sure you want to delete this shift? This action cannot be undone.")) {
      return
    }

    try {
      setIsLoading(true)
      
      // Delete staff assignments first
      if (shift.shift_staff_assignments?.length) {
        for (const assignment of shift.shift_staff_assignments) {
          await shiftStaffAssignmentApi.delete(assignment.id)
        }
      }

      // Delete the shift
      await dispatch(deleteShift(shift.id)).unwrap()

      toast({
        title: "Success",
        description: "Shift deleted successfully",
      })

      onShiftUpdated?.()
      onClose()
    } catch (error: any) {
      console.error("Error deleting shift:", error)
      
      let errorMessage = "Failed to delete shift"
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }

      toast({
        title: "Shift Deletion Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const activeStaff = staff?.filter((s) => s.is_active) || []
  const activeClients = clients?.filter((c) => c.is_active) || []

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-w-2xl mx-auto">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Edit Shift
          </DrawerTitle>
          <DrawerDescription>
            Update shift details and assignments
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shift Type */}
            <div className="space-y-2">
              <Label htmlFor="shift_type_id">Shift Type</Label>
              <Select
                value={form.watch("shift_type_id")}
                onValueChange={(value) => form.setValue("shift_type_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shift type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No shift type</SelectItem>
                  {shiftTypes && shiftTypes.length > 0 ? (
                    shiftTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                        {type.description && ` - ${type.description}`}
                        {` (${type.duration_hours}h - $${type.hourly_rate}/hr)`}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.shift_type_id && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.shift_type_id.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.status.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client */}
            <div className="space-y-2">
              <Label htmlFor="client_id" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Client
              </Label>
              <Select
                value={form.watch("client_id")}
                onValueChange={(value) => form.setValue("client_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {activeClients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.first_name} {client.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.client_id && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.client_id.message}
                </p>
              )}
            </div>

            {/* Staff */}
            <div className="space-y-2">
              <Label htmlFor="staffId" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Staff Member
              </Label>
              <Select
                value={form.watch("staffId")}
                onValueChange={(value) => form.setValue("staffId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No staff assigned</SelectItem>
                  {activeStaff.map((staffMember) => (
                    <SelectItem key={staffMember.id} value={staffMember.id.toString()}>
                      {staffMember.user?.first_name} {staffMember.user?.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.staffId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.staffId.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                {...form.register("start_time")}
                className={cn(
                  form.formState.errors.start_time && "border-red-500"
                )}
              />
              {form.formState.errors.start_time && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.start_time.message}
                </p>
              )}
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                {...form.register("end_time")}
                className={cn(
                  form.formState.errors.end_time && "border-red-500"
                )}
              />
              {form.formState.errors.end_time && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.end_time.message}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              {...form.register("notes")}
              rows={3}
            />
          </div>
        </form>

        <DrawerFooter className="flex-row justify-between">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Shift
          </Button>
          
          <div className="flex gap-2">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? "Updating..." : "Update Shift"}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
