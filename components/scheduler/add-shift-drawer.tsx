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
import { cn } from "@/lib/utils"

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  date: z.date({ required_error: "A date is required." }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:MM)." }),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:MM)." }),
  type: z.enum(["Support Coordination", "Night Shift", "Standard", "Emergency"]),
  status: z.enum(["Vacant", "Scheduled", "Completed", "Cancelled"]),
  assignedStaff: z.array(z.string()).min(1, { message: "At least one staff member must be assigned." }),
  clientId: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.enum(["weekly", "monthly"]).optional(),
  notes: z.string().optional(),
  location: z.string().optional(),
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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: initialDate || new Date(),
      startTime: "09:00",
      endTime: "17:00",
      type: "Standard",
      status: "Vacant",
      assignedStaff: initialStaffId ? [initialStaffId] : [],
      clientId: initialClientId || "",
      isRecurring: false,
      notes: "",
      location: "",
    },
  })

  const isRecurring = form.watch("isRecurring")

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newShift: Omit<Shift, "id"> = {
      title: values.title,
      date: format(values.date, "yyyy-MM-dd"),
      startTime: values.startTime,
      endTime: values.endTime,
      type: values.type,
      status: values.status,
      assignedStaff: values.assignedStaff,
      clientId: values.clientId || undefined,
      isRecurring: values.isRecurring,
      recurringPattern: values.isRecurring ? values.recurringPattern : undefined,
      notes: values.notes,
      location: values.location,
    }
    onSave(newShift)
    form.reset()
    onClose()
  }

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        title: "",
        date: initialDate || new Date(),
        startTime: "09:00",
        endTime: "17:00",
        type: "Standard",
        status: "Vacant",
        assignedStaff: initialStaffId ? [initialStaffId] : [],
        clientId: initialClientId || "",
        isRecurring: false,
        notes: "",
        location: "",
      })
    }
  }, [isOpen, initialDate, initialStaffId, initialClientId, form])

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col font-sans">
        {" "}
        {/* Apply font-sans here */}
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-2xl font-bold">Add New Shift</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Fill in the details to create a new shift.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-6 flex-1 overflow-y-auto">
            <FormField
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor={field.name}>Shift Title</FormLabel>
                  <input
                    id={field.name}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="e.g., Support Coordination"
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
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
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
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shift Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a shift type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Support Coordination">Support Coordination</SelectItem>
                      <SelectItem value="Night Shift">Night Shift</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
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
                      <SelectItem value="Vacant">Vacant</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignedStaff"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Staff</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value ? [value] : [])} value={field.value[0] || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Client</SelectItem>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
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
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
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
                name="recurringPattern"
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <Textarea placeholder="Any specific instructions or notes..." {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="mt-4 pt-4 border-t">
              <Button type="submit" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Shift
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
