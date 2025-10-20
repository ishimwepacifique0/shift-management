"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/lib/store"
import { updateServiceType, clearError } from "@/feature/serviceTypes/serviceTypeSlice"
import { ServiceType } from "@/types"

const editServiceTypeSchema = z.object({
  name: z.string().min(2, "Service type name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  is_active: z.boolean().default(true),
})

type EditServiceTypeFormData = z.infer<typeof editServiceTypeSchema>

interface EditServiceTypeDrawerProps {
  serviceType: ServiceType | null
  isOpen: boolean
  onClose: () => void
}

export function EditServiceTypeDrawer({ serviceType, isOpen, onClose }: EditServiceTypeDrawerProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { status, error } = useSelector((state: RootState) => state.serviceTypes)

  const form = useForm<EditServiceTypeFormData>({
    resolver: zodResolver(editServiceTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
    },
  })

  // Update form when serviceType changes
  useEffect(() => {
    if (serviceType) {
      form.reset({
        name: serviceType.name,
        description: serviceType.description || "",
        is_active: serviceType.is_active,
      })
    }
  }, [serviceType, form])

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
      dispatch(clearError())
    }
  }, [error, toast, dispatch])

  const onSubmit = async (data: EditServiceTypeFormData) => {
    if (!serviceType) return

    try {
      const serviceTypeData = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        is_active: data.is_active,
      }

      const result = await dispatch(updateServiceType({ 
        id: serviceType.id, 
        data: serviceTypeData 
      }))
      
      if (updateServiceType.fulfilled.match(result)) {
        toast({
          title: "Success",
          description: "Service type updated successfully",
        })
        onClose()
      } else if (updateServiceType.rejected.match(result)) {
        toast({
          title: "Error",
          description: result.payload as string || "Failed to update service type",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error updating service type:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to update service type",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  if (!serviceType) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[400px] sm:w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Service Type</DialogTitle>
          <DialogDescription>
            Update the service type information. Changes will be reflected across all care services.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter service type name" {...field} />
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
                        placeholder="Enter service type description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description of the service type
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Enable this service type for use in care services
                      </FormDescription>
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
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={status === "loading"}>
                Cancel
              </Button>
              <Button type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Updating..." : "Update Service Type"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}