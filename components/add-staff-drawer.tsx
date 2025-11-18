"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PlusCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDispatch, useSelector } from "react-redux"
import { createCompanyStaff } from "@/feature/staff/staffSlice"
import { AppDispatch, RootState } from "@/lib/store"
import { toast } from "react-toastify"

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
  employment_type: z.enum(['PART_TIME', 'FULL_TIME', 'CASUAL', 'CONTRACTOR', 'OTHER']).optional(),
})

type FormData = z.infer<typeof formSchema>

interface AddStaffDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AddStaffDrawer({
  isOpen,
  onClose,
  onSuccess,
}: AddStaffDrawerProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { status } = useSelector((state: RootState) => state.staff)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  // Check if user has company ID - check multiple possible locations
  // User can have company_id directly, or through staff relationship
  const companyId = user?.company_id || 
                    user?.staff?.company_id || 
                    (user as any)?.companyId || 
                    undefined
  const hasCompanyId = !!companyId
  
  // Debug: Log user data to help troubleshoot
  React.useEffect(() => {
    if (isOpen && user) {
    }
  }, [isOpen, user, companyId, hasCompanyId])
  
  // Track if we're creating (combine local state with Redux status)
  const isCreating = isSubmitting || (status === "loading" && isOpen)
  
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
      employment_type: undefined,
    },
  })

  async function onSubmit(values: FormData) {
    try {
      // Check if company ID exists (should already be checked, but double-check for safety)
      if (!companyId) {
        toast.error("Your user account must be associated with a company to create staff members. Please contact your administrator.")
        return
      }
      
      setIsSubmitting(true)
      
      console.log('Creating staff with company ID:', companyId)
      console.log('User data:', user)
      
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
        employment_type: values.employment_type || undefined,
      }
      
      console.log('Staff creation data:', staffData)
      
      // Create staff - no retry, just show error if it fails
      const creationResult = await dispatch(createCompanyStaff(staffData)).unwrap()
      const createdStaff = creationResult?.data || creationResult
      const actualEmail = (createdStaff as any)?.user?.email || staffData.email
      
      // Use backend message if available, otherwise use custom message
      const successMessage = creationResult?.message || `${values.first_name} ${values.last_name} has been successfully added to your team. Login credentials: ${actualEmail} / Test@123`
      
      toast.success(successMessage)
      form.reset()
      setIsSubmitting(false)
      onClose()
      // Call onSuccess callback to refresh the staff list
      onSuccess?.()
    } catch (error: any) {
      setIsSubmitting(false)
      console.error('Staff creation error:', error)
      
      // Extract the real error message from the response
      // Priority: error.error > error.message (if not generic) > error.response.data.error > error.response.data.message
      let errorMessage = "Failed to create staff member"
      
      // Check rejectWithValue structure (when using unwrap())
      if (error?.error && typeof error.error === 'string') {
        errorMessage = error.error
      } else if (error?.message && typeof error.message === 'string') {
        // Only use message if it's not a generic axios error
        if (!error.message.includes("Request failed with status code") && 
            !error.message.includes("Request failed")) {
          errorMessage = error.message
        }
      }
      
      // Check axios error structure
      if (errorMessage === "Failed to create staff member") {
        if (error?.response?.data?.error) {
          errorMessage = error.response.data.error
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.data?.error) {
          errorMessage = error.data.error
        } else if (error?.data?.message) {
          errorMessage = error.data.message
        }
      }
      
      // Show the actual error message from the backend
      toast.error(errorMessage)
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
        employment_type: undefined,
      })
      // Reset submitting state when drawer opens
      setIsSubmitting(false)
    }
  }, [isOpen, form])
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col w-[400px] font-sans sm:w-[540px]">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-2xl font-bold">Add New Staff Member</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Create a new user account and add them as a staff member. Default password will be "Test@123".
          </SheetDescription>
        </SheetHeader>
        {!hasCompanyId && (
          <Alert variant="destructive" className="mx-6 mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Company Account Required</AlertTitle>
            <AlertDescription>
              Your user account must be associated with a company to create staff members. Please contact your administrator.
            </AlertDescription>
          </Alert>
        )}
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
                      <Input placeholder="Enter first name" {...field} disabled={!hasCompanyId} />
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
                      <Input placeholder="Enter last name" {...field} disabled={!hasCompanyId} />
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
                    <Input type="email" placeholder="Enter email address" {...field} disabled={!hasCompanyId} />
                  </FormControl>
                  <FormDescription>
                    Please ensure this email is unique and not already registered.
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
                    <Input type="tel" placeholder="Enter phone number" {...field} disabled={!hasCompanyId} />
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
                      disabled={!hasCompanyId}
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
                      disabled={!hasCompanyId}
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
                        disabled={!hasCompanyId}
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
                        disabled={!hasCompanyId}
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
                      disabled={!hasCompanyId}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!hasCompanyId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FULL_TIME">Full Time</SelectItem>
                      <SelectItem value="PART_TIME">Part Time</SelectItem>
                      <SelectItem value="CASUAL">Casual</SelectItem>
                      <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
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
                      disabled={!hasCompanyId}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="border-t mt-4 pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!hasCompanyId || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Staff Member
                  </>
                )}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}