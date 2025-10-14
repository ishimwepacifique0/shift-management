"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useDispatch, useSelector } from "react-redux"
import { createCompanyStaff } from "@/feature/staff/staffSlice"
import { AppDispatch, RootState } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  // User details
  first_name: z.string().min(1, { message: "First name is required." }),
  last_name: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().optional(),
  
  // Staff details
  qualifications: z.string().optional(),
  certifications: z.string().optional(),
  hourly_rate: z.number().min(0, { message: "Hourly rate must be positive." }).optional(),
  max_hours_per_week: z.number().min(0, { message: "Max hours must be positive." }).optional(),
  availability_notes: z.string().optional(),
  hire_date: z.string().optional(),
  documents: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface AddStaffDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function AddStaffDrawer({
  isOpen,
  onClose,
}: AddStaffDrawerProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { user } = useSelector((state: RootState) => state.auth)
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      qualifications: "",
      certifications: "",
      hourly_rate: 0,
      max_hours_per_week: 40,
      availability_notes: "",
      hire_date: "",
      documents: "",
    },
  })

  async function onSubmit(values: FormData) {
    try {
      // Get company ID from authenticated user
      const companyId = user?.company_id || 1 // Fallback to company ID 1 if not available
      
      console.log('Creating staff with company ID:', companyId)
      console.log('User data:', user)
      
      // Generate unique identifiers for email conflicts
      const timestamp = Date.now()
      const randomSuffix = Math.floor(Math.random() * 1000)
      
      // Create staff with user data in one operation (company staff endpoint handles both)
      const staffData = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone || undefined,
        company_id: companyId, // Include company_id for SUPER_ADMIN users
        qualifications: values.qualifications || undefined,
        certifications: values.certifications || undefined,
        hourly_rate: values.hourly_rate || undefined,
        max_hours_per_week: values.max_hours_per_week || undefined,
        availability_notes: values.availability_notes || undefined,
        hire_date: values.hire_date ? new Date(values.hire_date).toISOString() : undefined,
        documents: values.documents || undefined,
      }
      
      console.log('Staff creation data:', staffData)
      
      let attempts = 0
      const maxAttempts = 3
      let createdStaff
      
      while (attempts < maxAttempts) {
        try {
          attempts++
          console.log(`Staff creation attempt ${attempts}:`, staffData.email)
          createdStaff = await dispatch(createCompanyStaff(staffData)).unwrap()
          console.log('Created staff:', createdStaff)
          break // Success, exit loop
        } catch (userError: any) {
          console.log(`Attempt ${attempts} failed:`, userError?.message)
          
          // If email already exists and we haven't exceeded max attempts
          if ((userError?.message?.includes('email') || 
               userError?.message?.includes('already exists') || 
               userError?.message?.includes('Record already exists')) && 
              attempts < maxAttempts) {
            
            // Generate a unique email for retry
            const uniqueEmail = `${values.first_name.toLowerCase()}.${values.last_name.toLowerCase()}.${timestamp}.${randomSuffix}.${attempts}@company.com`
            staffData.email = uniqueEmail
            console.log(`Retrying with unique email: ${uniqueEmail}`)
            continue // Try again with new email
          } else {
            // Either not an email error or max attempts reached
            throw userError
          }
        }
      }
      
      // If we get here and createdStaff is still undefined, something went wrong
      if (!createdStaff) {
        throw new Error('Failed to create staff after multiple attempts')
      }
      
      const actualEmail = createdStaff.user?.email || staffData.email
      toast({
        title: "Staff Member Created",
        description: `${values.first_name} ${values.last_name} has been successfully added to your team. Login credentials: ${actualEmail} / Test@123`,
      })
      form.reset()
      onClose()
    } catch (error: any) {
      console.error('Staff creation error:', error)
      
      // Extract the real error message from the response
      let errorMessage = "Failed to create staff member"
      
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      // Show the actual error message from the backend
      toast({
        title: "Staff Creation Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        qualifications: "",
        certifications: "",
        hourly_rate: 0,
        max_hours_per_week: 40,
        availability_notes: "",
        hire_date: "",
        documents: "",
      })
    }
  }, [isOpen, form])
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col w-[400px] font-sans sm:w-[540px]">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-2xl font-bold">Add New Staff Member</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Create a new user account and add them as a staff member. Default password will be "Test@123". 
            If the email already exists, a unique email will be generated automatically.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 grid gap-6 overflow-y-auto py-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
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
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormDescription>
                    If this email already exists, a unique email will be generated automatically.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="qualifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualifications</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., RN License, CPR Certified"
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
                      placeholder="e.g., First Aid, Medication Administration"
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
                name="hourly_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="25.00"
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
                name="max_hours_per_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Hours/Week</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="40"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
              name="availability_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Available weekdays 9-5, weekends as needed"
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
                    <Input
                      placeholder="URL or reference to documents"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="border-t mt-4 pt-4">
              <Button type="submit" className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}