"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/lib/store"
import { updateStaff } from "@/feature/staff/staffSlice"
import { Staff } from "@/types"

const editStaffSchema = z.object({
  qualifications: z.string().optional(),
  certifications: z.string().optional(),
  hourly_rate: z.coerce.number().min(0, "Hourly rate must be positive").optional(),
  max_hours_per_week: z.coerce.number().min(1, "Max hours must be at least 1").max(168, "Max hours cannot exceed 168").optional(),
  availability_notes: z.string().optional(),
  hire_date: z.string().optional(),
  termination_date: z.string().optional(),
  documents: z.string().optional(),
})

type EditStaffFormData = z.infer<typeof editStaffSchema>

interface EditStaffDrawerProps {
  staff: Staff | null
  isOpen: boolean
  onClose: () => void
}

export function EditStaffDrawer({ staff, isOpen, onClose }: EditStaffDrawerProps) {
  const { toast } = useToast()
  const dispatch = useDispatch<AppDispatch>()
  const { status } = useSelector((state: RootState) => state.staff)

  const form = useForm<EditStaffFormData>({
    resolver: zodResolver(editStaffSchema),
    defaultValues: {
      qualifications: "",
      certifications: "",
      hourly_rate: 0,
      max_hours_per_week: 40,
      availability_notes: "",
      hire_date: "",
      termination_date: "",
      documents: "",
    },
  })

  // Update form when staff data changes
  useEffect(() => {
    if (staff) {
      form.reset({
        qualifications: staff.qualifications || "",
        certifications: staff.certifications || "",
        hourly_rate: staff.hourly_rate || 0,
        max_hours_per_week: staff.max_hours_per_week || 40,
        availability_notes: staff.availability_notes || "",
        hire_date: staff.hire_date ? new Date(staff.hire_date).toISOString().split('T')[0] : "",
        termination_date: staff.termination_date ? new Date(staff.termination_date).toISOString().split('T')[0] : "",
        documents: staff.documents || "",
      })
    }
  }, [staff, form])

  async function onSubmit(values: EditStaffFormData) {
    if (!staff) return

    try {
      const updateData = {
        qualifications: values.qualifications || undefined,
        certifications: values.certifications || undefined,
        hourly_rate: values.hourly_rate || undefined,
        max_hours_per_week: values.max_hours_per_week || undefined,
        availability_notes: values.availability_notes || undefined,
        hire_date: values.hire_date ? new Date(values.hire_date).toISOString() : undefined,
        termination_date: values.termination_date ? new Date(values.termination_date).toISOString() : undefined,
        documents: values.documents || undefined,
      }

      console.log('Updating staff with data:', updateData)
      
      await dispatch(updateStaff({ id: staff.id, data: updateData })).unwrap()
      
      toast({
        title: "Success",
        description: `Staff member ${staff.user?.first_name} ${staff.user?.last_name} updated successfully.`,
      })
      
      form.reset()
      onClose()
    } catch (error: any) {
      console.error('Staff update error:', error)
      
      toast({
        title: "Error",
        description: error?.message || "Failed to update staff member",
        variant: "destructive",
      })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col h-full sm:max-w-[425px]">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Edit Staff Member</SheetTitle>
          <SheetDescription>
            Update the staff member's information. Changes will be saved immediately.
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
              {/* Staff Member Info (Read-only) */}
              {staff && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-gray-900 font-medium">Staff Member</h3>
                  <p className="text-gray-600 text-sm">
                    {staff.user?.first_name} {staff.user?.last_name}
                  </p>
                  <p className="text-gray-500 text-sm">{staff.user?.email}</p>
                </div>
              )}

              <FormField
                control={form.control}
                name="qualifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualifications</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter qualifications..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="certifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certifications</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter certifications..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hourly_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_hours_per_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Hours Per Week</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="40"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availability_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter availability notes..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hire_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hire Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="termination_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Termination Date (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documents</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter document information..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

              <SheetFooter className="flex-shrink-0 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={status === "loading"}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Updating..." : "Update Staff"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}