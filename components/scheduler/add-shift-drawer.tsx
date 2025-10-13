"use client"

import { FormDescription } from "@/components/ui/form"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import type { Staff, Client, Shift } from "@/types"
import { useDispatch, useSelector } from "react-redux"
import { createShift } from "@/feature/shifts/shiftSlice"
import { AppDispatch, RootState } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type FormData = {
  clientId: string
  staffId: string
  careServiceId: string
  shiftTypeId?: string
  date: Date
  startTime: string
  endTime: string
  status?: "draft" | "published" | "assigned" | "in_progress" | "completed" | "cancelled"
  isRecurring?: boolean
  recurrenceRule?: string
  notes?: string
  location?: string
  instructions?: string
}

const formSchema = z.object({
  clientId: z.string().min(1, { message: "Please select a client." }),
  staffId: z.string().min(1, { message: "Please select a staff member." }),
  careServiceId: z.string().min(1, { message: "Please select a care service." }),
  shiftTypeId: z.string().optional(),
  date: z.date({ required_error: "A date is required." }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:MM)." }),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:MM)." }),
  status: z.enum(["draft", "published", "assigned", "in_progress", "completed", "cancelled"]).default("draft"),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.string().optional(),
  notes: z.string().optional(),
  location: z.string().optional(),
  instructions: z.string().optional(),
})

interface AddShiftDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (shift: Omit<Shift, "id">) => void
  staff: Staff[]
  clients: Client[]
  initialDate?: Date
  initialStaffId?: string
  initialClientId?: string
}

export function AddShiftDrawer({
  isOpen,
  onClose,
  onSave,
  staff,
  clients,
  initialDate,
  initialStaffId,
  initialClientId,
}: AddShiftDrawerProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { user } = useSelector((state: RootState) => state.auth)
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      clientId: initialClientId || "",
      staffId: initialStaffId || "",
      careServiceId: "",
      shiftTypeId: "",
      date: initialDate || new Date(),
      startTime: "09:00",
      endTime: "17:00",
      status: "draft",
      isRecurring: false,
      recurrenceRule: "",
      notes: "",
      location: "",
      instructions: "",
    },
  })

  const isRecurring = form.watch("isRecurring")

  // Debug logging
  React.useEffect(() => {
    console.log('AddShiftDrawer - Clients:', clients)
    console.log('AddShiftDrawer - Staff:', staff)
    console.log('AddShiftDrawer - Clients count:', clients?.length)
    console.log('AddShiftDrawer - Staff count:', staff?.length)
  }, [clients, staff])

  async function onSubmit(values: FormData) {
    try {
      const companyId = user?.company_id || 1 // Get from user context or fallback
      
      console.log('Creating shift with company ID:', companyId)
      console.log('Selected client:', values.clientId)
      console.log('Selected staff:', values.staffId)
      
      const shiftData = {
        company_id: companyId,
        client_id: parseInt(values.clientId),
        care_service_id: parseInt(values.careServiceId),
        shift_type_id: values.shiftTypeId ? parseInt(values.shiftTypeId) : undefined,
        start_time: new Date(`${format(values.date, "yyyy-MM-dd")}T${values.startTime}:00.000Z`).toISOString(),
        end_time: new Date(`${format(values.date, "yyyy-MM-dd")}T${values.endTime}:00.000Z`).toISOString(),
        status: values.staffId ? "assigned" : "draft", // Auto-assign if staff is selected
        is_recurring: values.isRecurring || false,
        recurrence_rule: values.isRecurring ? values.recurrenceRule : undefined,
        notes: values.notes || undefined,
        location: values.location || undefined,
        instructions: values.instructions || undefined,
        break_minutes: 0,
        is_active: true,
      }
      
      console.log('Shift creation data:', shiftData)
      
      const createdShift = await dispatch(createShift(shiftData)).unwrap()
      
      // If staff is selected, create staff assignment
      if (values.staffId) {
        // Note: Staff assignment might need to be handled separately depending on backend API
        console.log('Staff assignment needed for staff ID:', values.staffId)
      }
      
      toast({
        title: "Success",
        description: `Shift created successfully for ${clients.find(c => c.id.toString() === values.clientId)?.first_name} ${clients.find(c => c.id.toString() === values.clientId)?.last_name}`,
      })
      
      form.reset()
      onClose()
    } catch (error: any) {
      console.error('Failed to create shift:', error)
      
      const errorMessage = error?.message || "Failed to create shift"
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        clientId: initialClientId || "",
        staffId: initialStaffId || "",
        careServiceId: "",
        shiftTypeId: "",
        date: initialDate || new Date(),
        startTime: "09:00",
        endTime: "17:00",
        status: "draft",
        isRecurring: false,
        recurrenceRule: "",
        notes: "",
        location: "",
        instructions: "",
      })
    }
  }, [isOpen, initialDate, initialStaffId, initialClientId, form])

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col w-[400px] font-sans sm:w-[540px]">
        {" "}
        {/* Apply font-sans here */}
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-2xl font-bold">Add New Shift</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Fill in the details to create a new shift.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 grid gap-6 overflow-y-auto py-6">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={clients.length === 0 ? "Loading clients..." : "Select a client"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.length > 0 ? (
                        clients.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.first_name} {c.last_name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-clients" disabled>
                          {clients.length === 0 ? "Loading clients..." : "No clients available"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="staffId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Staff</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={staff.length === 0 ? "Loading staff..." : "Select a staff member"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {staff.length > 0 ? (
                        staff.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.user?.first_name} {s.user?.last_name} - {s.qualifications || 'Staff Member'}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-staff" disabled>
                          {staff.length === 0 ? "Loading staff..." : "No staff available"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="careServiceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Care Service</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a care service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="6">Physical Therapy Exercises</SelectItem>
                      <SelectItem value="8">Vital Signs Monitoring</SelectItem>
                      <SelectItem value="9">Morning Personal Care</SelectItem>
                      <SelectItem value="10">Companionship Activities</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="h-4 w-4 ml-auto opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-auto" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name}>Start Time</FormLabel>
                    <input
                      id={field.name}
                      className="flex bg-background border border-input h-10 rounded-md text-sm w-full disabled:cursor-not-allowed disabled:opacity-50 file:bg-transparent file:border-0 file:font-medium file:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring placeholder:text-muted-foreground px-3 py-2 ring-offset-background"
                      type="time"
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      aria-invalid={fieldState.invalid ? "true" : undefined}
                      aria-describedby={fieldState.error?.message ? `${field.name}-error` : undefined}
                    />
                    <FormMessage id={`${field.name}-error`} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name}>End Time</FormLabel>
                    <input
                      id={field.name}
                      className="flex bg-background border border-input h-10 rounded-md text-sm w-full disabled:cursor-not-allowed disabled:opacity-50 file:bg-transparent file:border-0 file:font-medium file:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring placeholder:text-muted-foreground px-3 py-2 ring-offset-background"
                      type="time"
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      aria-invalid={fieldState.invalid ? "true" : undefined}
                      aria-describedby={fieldState.error?.message ? `${field.name}-error` : undefined}
                    />
                    <FormMessage id={`${field.name}-error`} />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="shiftTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shift Type (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a shift type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="9">Morning Shift</SelectItem>
                      <SelectItem value="10">Evening Shift</SelectItem>
                      <SelectItem value="11">Night Shift</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor={field.name}>Location</FormLabel>
                  <input
                    id={field.name}
                    className="flex bg-background border border-input h-10 rounded-md text-sm w-full disabled:cursor-not-allowed disabled:opacity-50 file:bg-transparent file:border-0 file:font-medium file:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring placeholder:text-muted-foreground px-3 py-2 ring-offset-background"
                    placeholder="e.g., Client's Home"
                    value={field.value || ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    aria-invalid={fieldState.invalid ? "true" : undefined}
                    aria-describedby={fieldState.error?.message ? `${field.name}-error` : undefined}
                  />
                  <FormMessage id={`${field.name}-error`} />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row border justify-between p-4 rounded-lg items-center">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Recurring Shift</FormLabel>
                      <FormDescription>Mark this shift as recurring.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {isRecurring && (
              <FormField
                control={form.control}
                name="recurrenceRule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurring Pattern</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pattern" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions</FormLabel>
                  <Textarea placeholder="Specific instructions for this shift..." {...field} />
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
                  <Textarea placeholder="Additional notes or comments..." {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="border-t mt-4 pt-4">
              <Button type="submit" className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Shift
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
