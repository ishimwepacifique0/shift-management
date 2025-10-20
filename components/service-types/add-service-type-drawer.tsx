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
import { createServiceType, clearError } from "@/feature/serviceTypes/serviceTypeSlice"

const addServiceTypeSchema = z.object({
  name: z.string().min(2, "Service type name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  is_active: z.boolean().default(true),
})

type AddServiceTypeFormData = z.infer<typeof addServiceTypeSchema>

interface AddServiceTypeDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function AddServiceTypeDrawer({ isOpen, onClose }: AddServiceTypeDrawerProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { status, error } = useSelector((state: RootState) => state.serviceTypes)

  const form = useForm<AddServiceTypeFormData>({
    resolver: zodResolver(addServiceTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
    },
  })

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

  const onSubmit = async (data: AddServiceTypeFormData) => {
    try {
      const serviceTypeData = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        is_active: data.is_active,
      }

      const result = await dispatch(createServiceType(serviceTypeData))
      
      if (createServiceType.fulfilled.match(result)) {
        toast({
          title: "Success",
          description: "Service type created successfully",
        })
        form.reset()
        onClose()
      } else if (createServiceType.rejected.match(result)) {
        toast({
          title: "Error",
          description: result.payload as string || "Failed to create service type",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error creating service type:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to create service type",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    form.reset({
      name: "",
      description: "",
      is_active: true,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[400px] sm:w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Service Type</DialogTitle>
          <DialogDescription>
            Create a new service type category for your company. This will be available for care services.
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
                {status === "loading" ? "Creating..." : "Create Service Type"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}