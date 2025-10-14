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
import { createClient } from "@/feature/clients/clientSlice"

const addClientSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  ndis_number: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  additional_notes: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type AddClientFormData = z.infer<typeof addClientSchema>

interface AddClientDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function AddClientDrawer({ isOpen, onClose }: AddClientDrawerProps) {
  const { toast } = useToast()
  const dispatch = useDispatch<AppDispatch>()
  const { status } = useSelector((state: RootState) => state.clients)
  const { user } = useSelector((state: RootState) => state.auth)

  const form = useForm<AddClientFormData>({
    resolver: zodResolver(addClientSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      date_of_birth: "",
      gender: "",
      ndis_number: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      additional_notes: "",
      email: "",
      phone: "",
      address: "",
    },
  })

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (!isOpen) {
      form.reset()
    }
  }, [isOpen, form])

  async function onSubmit(values: AddClientFormData) {
    try {
      const companyId = user?.company_id || 1 // Fallback to company ID 1 if not available
      
      console.log('Creating client with company ID:', companyId)
      console.log('User data:', user)
      
      const clientData = {
        first_name: values.first_name,
        last_name: values.last_name,
        date_of_birth: values.date_of_birth ? new Date(values.date_of_birth).toISOString() : undefined,
        gender: values.gender || undefined,
        ndis_number: values.ndis_number || undefined,
        emergency_contact_name: values.emergency_contact_name || undefined,
        emergency_contact_phone: values.emergency_contact_phone || undefined,
        additional_notes: values.additional_notes || undefined,
        email: values.email || undefined,
        phone: values.phone || undefined,
        address: values.address || undefined,
        company_id: companyId,
      }
      
      console.log('Client creation data:', clientData)
      
      await dispatch(createClient(clientData)).unwrap()
      
      toast({
        title: "Client Created",
        description: `${values.first_name} ${values.last_name} has been successfully added to your client list.`,
      })
      
      form.reset()
      onClose()
    } catch (error: any) {
      console.error('Client creation error:', error)
      
      // Extract the real error message from the response
      let errorMessage = "Failed to create client"
      
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      // Show the actual error message from the backend
      toast({
        title: "Client Creation Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col h-full sm:max-w-[540px]">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="text-2xl font-bold">Add New Client</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Add a new client to your company. All fields marked with * are required.
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date_of_birth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Male, Female, Other" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contact Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter full address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* NDIS Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">NDIS Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="ndis_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NDIS Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter NDIS number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Emergency Contact</h3>
                  
                  <FormField
                    control={form.control}
                    name="emergency_contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter emergency contact name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergency_contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter emergency contact phone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Additional Notes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Additional Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="additional_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter any additional notes, care requirements, or special instructions"
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Include any special care requirements, medical conditions, or other important information.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                  {status === "loading" ? "Creating..." : "Create Client"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}