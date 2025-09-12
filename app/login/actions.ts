"use server"

import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

export async function login(formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay

  const email = formData.get("email")
  const password = formData.get("password")

  const validation = loginSchema.safeParse({ email, password })

  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validation.error.flatten().fieldErrors,
    }
  }

  // Simulate authentication
  if (email === "test@example.com" && password === "password") {
    return {
      success: true,
      message: "Login successful! Redirecting...",
    }
  } else {
    return {
      success: false,
      message: "Invalid email or password.",
    }
  }
}
