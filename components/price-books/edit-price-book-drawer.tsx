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
import { updatePriceBook, clearError } from "@/feature/priceBooks/priceBookSlice"
import { useServiceTypes } from "@/hooks/use-service-types"
import { PriceBook } from "@/types"

const editPriceBookSchema = z.object({
  name: z.string().min(2, "Price book name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  rate_per_hour: z.number().min(0.01, "Rate must be greater than $0.01").max(999.99, "Rate must be less than $1000"),
  service_type_id: z.string().optional(),
  day_of_week: z.string().optional(),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
  is_active: z.boolean().default(true),
})

type EditPriceBookFormData = z.infer<typeof editPriceBookSchema>

interface EditPriceBookDrawerProps {
  priceBook: PriceBook | null
  isOpen: boolean
  onClose: () => void
}

export function EditPriceBookDrawer({ priceBook, isOpen, onClose }: EditPriceBookDrawerProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { status, error } = useSelector((state: RootState) => state.priceBooks)
  const { activeServiceTypes } = useServiceTypes()

  const form = useForm<EditPriceBookFormData>({
    resolver: zodResolver(editPriceBookSchema),
    defaultValues: {
      name: "",
      rate_per_hour: 0.01,
      service_type_id: "",
      day_of_week: "",
      notes: "",
      is_active: true,
    },
  })

  // Update form when priceBook changes
  useEffect(() => {
    if (priceBook) {
      form.reset({
        name: priceBook.name,
        rate_per_hour: priceBook.rate_per_hour,
        service_type_id: priceBook.service_type_id?.toString() || "",
        day_of_week: priceBook.day_of_week || "",
        notes: priceBook.notes || "",
        is_active: priceBook.is_active,
      })
    }
  }, [priceBook, form])

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

  const onSubmit = async (data: EditPriceBookFormData) => {
    if (!priceBook) return

    try {
      const priceBookData = {
        name: data.name.trim(),
        rate_per_hour: data.rate_per_hour,
        service_type_id: data.service_type_id && data.service_type_id !== "none" ? parseInt(data.service_type_id) : undefined,
        day_of_week: data.day_of_week && data.day_of_week !== "none" ? data.day_of_week : undefined,
        notes: data.notes?.trim() || undefined,
        is_active: data.is_active,
      }

      const result = await dispatch(updatePriceBook({ 
        id: priceBook.id, 
        data: priceBookData 
      }))
      
      if (updatePriceBook.fulfilled.match(result)) {
        toast({
          title: "Success",
          description: "Price book updated successfully",
        })
        onClose()
      } else if (updatePriceBook.rejected.match(result)) {
        toast({
          title: "Error",
          description: result.payload as string || "Failed to update price book",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error updating price book:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to update price book",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  if (!priceBook) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[400px] sm:w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Price Book</DialogTitle>
          <DialogDescription>
            Update the pricing rate information. Changes will be reflected across all care services.
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
                    <FormLabel>Price Book Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter price book name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rate_per_hour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Per Hour *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0.01" 
                        placeholder="25.00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0.01)}
                      />
                    </FormControl>
                    <FormDescription>
                      Hourly rate in dollars
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
                name="day_of_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day of week" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Any day</SelectItem>
                        <SelectItem value="Monday">Monday</SelectItem>
                        <SelectItem value="Tuesday">Tuesday</SelectItem>
                        <SelectItem value="Wednesday">Wednesday</SelectItem>
                        <SelectItem value="Thursday">Thursday</SelectItem>
                        <SelectItem value="Friday">Friday</SelectItem>
                        <SelectItem value="Saturday">Saturday</SelectItem>
                        <SelectItem value="Sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Optional day-specific pricing
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter additional notes"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional notes about this pricing rate
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
                        Enable this price book for use in care services
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
                {status === "loading" ? "Updating..." : "Update Price Book"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
