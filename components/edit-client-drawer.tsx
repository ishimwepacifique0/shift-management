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
import { updateClient } from "@/feature/clients/clientSlice"
import { Client } from "@/types"

const editClientSchema = z.object({
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
  is_active: z.boolean().optional(),
})

type EditClientFormData = z.infer<typeof editClientSchema>

interface EditClientDrawerProps {
  client: Client | null
  isOpen: boolean
  onClose: () => void
}

export function EditClientDrawer({ client, isOpen, onClose }: EditClientDrawerProps) {
  const { toast } = useToast()
  const dispatch = useDispatch<AppDispatch>()
  const { status } = useSelector((state: RootState) => state.clients)

  const form = useForm<EditClientFormData>({
    resolver: zodResolver(editClientSchema),
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
      is_active: true,
    },
  })

  // Update form when client data changes
  useEffect(() => {
    if (client) {
      form.reset({
        first_name: client.first_name || "",
        last_name: client.last_name || "",
        date_of_birth: client.date_of_birth ? new Date(client.date_of_birth).toISOString().split('T')[0] : "",
        gender: client.gender || "",
        ndis_number: client.ndis_number || "",
        emergency_contact_name: client.emergency_contact_name || "",
        emergency_contact_phone: client.emergency_contact_phone || "",
        additional_notes: client.additional_notes || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        is_active: client.is_active,
      })
    }
  }, [client, form])

  async function onSubmit(values: EditClientFormData) {
    if (!client) return

    try {
      const updateData = {
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
        is_active: values.is_active,
      }

      console.log('Updating client with data:', updateData)
      
      await dispatch(updateClient({ id: client.id, data: updateData })).unwrap()
      
      toast({
        title: "Success",
        description: `Client ${values.first_name} ${values.last_name} updated successfully.`,
      })
      
      form.reset()
      onClose()
    } catch (error: any) {
      console.error('Client update error:', error)
      
      toast({
        title: "Error",
        description: error?.message || "Failed to update client",
        variant: "destructive",
      })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col h-full sm:max-w-[540px]">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="text-2xl font-bold">Edit Client</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Update the client's information. Changes will be saved immediately.
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {/* Client Info (Read-only) */}
                {client && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-gray-900 font-medium">Client Information</h3>
                    <p className="text-gray-600 text-sm">
                      ID: {client.id} | Company ID: {client.company_id}
                    </p>
                  </div>
                )}

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
                  {status === "loading" ? "Updating..." : "Update Client"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}