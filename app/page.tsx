"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard
    router.push('/dashboard')
  }, [router])

  return (
    <ProtectedRoute>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Redirecting to dashboard...</p>
        </div>
      </div>
    </ProtectedRoute>
  )
}
