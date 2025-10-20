"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/lib/store"
import { updateShiftType } from "@/feature/shiftTypes/shiftTypeSlice"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Edit } from "lucide-react"
import { ShiftType } from "@/types"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  duration_hours: z.number().min(0.5, "Duration must be at least 0.5 hours").max(24, "Duration cannot exceed 24 hours"),
  hourly_rate: z.number().min(0, "Hourly rate must be positive").max(999.99, "Hourly rate cannot exceed $999.99"),
  is_active: z.boolean().default(true),
})

type FormData = z.infer<typeof formSchema>

interface EditShiftTypeDrawerProps {
  shiftType: ShiftType | null
  isOpen: boolean
  onClose: () => void
}

export function EditShiftTypeDrawer({ shiftType, isOpen, onClose }: EditShiftTypeDrawerProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      duration_hours: 8,
      hourly_rate: 25.00,
      is_active: true,
    },
  })

  useEffect(() => {
    if (shiftType && isOpen) {
      form.reset({
        name: shiftType.name,
        description: shiftType.description || "",
        duration_hours: shiftType.duration_hours,
        hourly_rate: shiftType.hourly_rate,
        is_active: shiftType.is_active,
      })
    }
  }, [shiftType, isOpen, form])

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const onSubmit = async (data: FormData) => {
    if (!shiftType) return

    setIsSubmitting(true)
    try {
      await dispatch(updateShiftType({ id: shiftType.id, data })).unwrap()
      
      toast({
        title: "Shift Type Updated",
        description: `${data.name} has been successfully updated.`,
      })
      
      onClose()
    } catch (error: any) {
      let errorMessage = "Failed to update shift type"
      
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!shiftType) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[400px] sm:w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Shift Type</DialogTitle>
          <DialogDescription>
            Update the details of this shift type.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shift Type Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Morning Shift, Night Shift" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe this shift type..." 
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Hours) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="24"
                        placeholder="8"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                    <FormLabel>Hourly Rate ($) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        min="0"
                        max="999.99"
                        placeholder="25.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Make this shift type available for use
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Edit className="h-4 w-4 mr-2" />
                {isSubmitting ? "Updating..." : "Update Shift Type"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
