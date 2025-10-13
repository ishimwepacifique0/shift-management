"use client"

import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { logout } from "@/feature/auth/authSlice"
import { AppDispatch } from "@/lib/store"

export default function LogoutPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      try {
        await dispatch(logout()).unwrap()
        router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
        // Even if logout fails, redirect to login
        router.push('/login')
      }
    }

    performLogout()
  }, [dispatch, router])

  return (
    <div className="flex bg-gradient-to-br h-screen justify-center dark:from-slate-950 dark:to-slate-800 dark:via-slate-900 from-slate-50 items-center to-slate-100 via-white">
      <div className="text-center">
        <div className="border-b-2 border-blue-600 h-12 rounded-full w-12 animate-spin mb-4 mx-auto"></div>
        <p className="text-slate-600 dark:text-slate-400">Logging out...</p>
      </div>
    </div>
  )
}