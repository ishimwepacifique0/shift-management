import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google" // Import Inter from next/font/google
import { cn } from "@/lib/utils" // Assuming you have a cn utility

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans", // Define CSS variable for Inter
})

export const metadata = {
  title: "ShiftCare Management",
  description: "A comprehensive shift management application.",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>{children}</body>
    </html>
  )
}
