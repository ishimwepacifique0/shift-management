"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { login } from "@/feature/auth/authSlice"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { RootState, AppDispatch } from "@/lib/store"
import { toast } from "react-toastify"

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

export function LoginForm() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { status, isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const [showPassword, setShowPassword] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await dispatch(login(values)).unwrap()
      // Navigation and company check will be handled in the useEffect
    } catch (err: any) {
      // Extract error message from Redux Toolkit rejectWithValue
      // When using rejectWithValue, the error is the value itself
      let errorMessage = "Login failed. Please check your credentials."
      
      if (err) {
        // Handle string errors (from rejectWithValue)
        if (typeof err === "string") {
          errorMessage = err
        }
        // Handle Error object
        else if (err instanceof Error) {
          errorMessage = err.message
        }
        // Handle object with message property
        else if (err.message) {
          errorMessage = err.message
        }
        // Handle axios error response structure
        else if (err.response?.data?.error) {
          errorMessage = err.response.data.error
        }
        else if (err.response?.data?.message) {
          errorMessage = err.response.data.message
        }
        // Handle nested error structure
        else if (err.error) {
          errorMessage = typeof err.error === "string" ? err.error : err.error.message || "Login failed"
        }
      }
      
      toast.error(errorMessage)
    }
  }

  React.useEffect(() => {
    if (isAuthenticated && user) {
      // Check if user has company before navigating
      if (user.company_id && user.company_id !== null) {
        router.push("/")
        toast.success("Login successful. Welcome back!")
      } else {
        // User is authenticated but doesn't have a company
        toast.error("You no longer have access. No company associated with your account.")
      }
    }
  }, [isAuthenticated, user, router])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="••••••••" 
                    {...field} 
                    type={showPassword ? "text" : "password"}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={status === "loading"}>
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </form>
    </Form>
  )
}
