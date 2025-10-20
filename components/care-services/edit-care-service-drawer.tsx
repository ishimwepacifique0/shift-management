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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/lib/store"
import { updateCareService, clearError } from "@/feature/careServices/careServiceSlice"
import { usePriceBooks } from "@/hooks/use-price-books"
import { useServiceTypes } from "@/hooks/use-service-types"
import { CareService } from "@/types"

const editCareServiceSchema = z.object({
  name: z.string().min(2, "Care service name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  price_book_id: z.string().optional(),
  service_type_id: z.string().optional(),
  is_active: z.boolean().default(true),
})

type EditCareServiceFormData = z.infer<typeof editCareServiceSchema>

interface EditCareServiceDrawerProps {
  careService: CareService | null
  isOpen: boolean
  onClose: () => void
}

export function EditCareServiceDrawer({ careService, isOpen, onClose }: EditCareServiceDrawerProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { status, error } = useSelector((state: RootState) => state.careServices)
  const { activePriceBooks } = usePriceBooks()
  const { activeServiceTypes } = useServiceTypes()

  const form = useForm<EditCareServiceFormData>({
    resolver: zodResolver(editCareServiceSchema),
    defaultValues: {
      name: "",
      description: "",
      price_book_id: "",
      service_type_id: "",
      is_active: true,
    },
  })

  // Update form when careService changes
  useEffect(() => {
    if (careService) {
      form.reset({
        name: careService.name,
        description: careService.description || "",
        price_book_id: careService.price_book_id?.toString() || "",
        service_type_id: careService.service_type_id?.toString() || "",
        is_active: careService.is_active,
      })
    }
  }, [careService, form])

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

  const onSubmit = async (data: EditCareServiceFormData) => {
    if (!careService) return

    try {
      const careServiceData = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        price_book_id: data.price_book_id && data.price_book_id !== "none" ? parseInt(data.price_book_id) : undefined,
        service_type_id: data.service_type_id && data.service_type_id !== "none" ? parseInt(data.service_type_id) : undefined,
        is_active: data.is_active,
      }

      const result = await dispatch(updateCareService({ 
        id: careService.id, 
        data: careServiceData 
      }))
      
      if (updateCareService.fulfilled.match(result)) {
        toast({
          title: "Success",
          description: "Care service updated successfully",
        })
        onClose()
      } else if (updateCareService.rejected.match(result)) {
        toast({
          title: "Error",
          description: result.payload as string || "Failed to update care service",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error updating care service:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to update care service",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  if (!careService) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[400px] sm:w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Care Service</DialogTitle>
          <DialogDescription>
            Update the care service information. Changes will be reflected across all shifts.
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
                    <FormLabel>Care Service Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter care service name" {...field} />
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
                        placeholder="Enter care service description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description of the care service
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="service_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No service type</SelectItem>
                        {activeServiceTypes?.map((serviceType) => (
                          <SelectItem key={serviceType.id} value={serviceType.id.toString()}>
                            {serviceType.name}
                            {serviceType.description && ` - ${serviceType.description}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Optional service type classification
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price_book_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Book</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select price book" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No price book</SelectItem>
                        {activePriceBooks?.map((priceBook) => (
                          <SelectItem key={priceBook.id} value={priceBook.id.toString()}>
                            {priceBook.name} - ${priceBook.rate_per_hour.toFixed(2)}/hr
                            {priceBook.day_of_week && ` (${priceBook.day_of_week})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Optional pricing rate for this service
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
                        Enable this care service for use in shifts
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
                {status === "loading" ? "Updating..." : "Update Care Service"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}