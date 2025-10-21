"use client"

import type * as React from "react"
import { Calendar, Users, UserCheck, Clock, DollarSign, Settings, BarChart3, LogOut, Heart, Tag, BookOpen, ChevronLeft, ChevronRight, Building2 } from "lucide-react"
import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { logout } from "@/feature/auth/authSlice"
import { AppDispatch } from "@/lib/store"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const navigationItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: BarChart3,
        isActive: false,
        tooltip: "Main dashboard overview",
      },
      {
        title: "Scheduler",
        url: "/scheduler",
        icon: Calendar,
        isActive: false,
        tooltip: "Schedule management",
      },
      {
        title: "Shifts",
        url: "/shifts",
        icon: Clock,
        isActive: false,
        tooltip: "Shift management and assignments",
      },
    ],
  },
  {
    title: "People Management",
    items: [
      {
        title: "Staff",
        url: "/staff",
        icon: Users,
        isActive: false,
        tooltip: "Manage staff members",
      },
      {
        title: "Clients",
        url: "/clients",
        icon: UserCheck,
        isActive: false,
        tooltip: "Client management",
      },
    ],
  },
  {
    title: "Services & Operations",
    items: [
      {
        title: "Care Services",
        url: "/care-services",
        icon: Heart,
        isActive: false,
        tooltip: "Care service management",
      },
      {
        title: "Service Types",
        url: "/service-types",
        icon: Tag,
        isActive: false,
        tooltip: "Service type configuration",
      },
      {
        title: "Shift Types",
        url: "/shift-types",
        icon: Clock,
        isActive: false,
        tooltip: "Shift type management",
      },
      {
        title: "Price Books",
        url: "/price-books",
        icon: BookOpen,
        isActive: false,
        tooltip: "Pricing management",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        isActive: false,
        tooltip: "System settings",
      }
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails, redirect to login
      router.push('/login')
    }
  }

  return (
    <Sidebar 
      {...props} 
      collapsible="icon"
      className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 shadow-lg"
    >
      <SidebarHeader className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
        <div className="flex gap-3 items-center px-2 py-3">
          <div className="flex bg-gradient-to-br from-blue-600 to-blue-700 h-10 w-10 justify-center rounded-xl text-white items-center shadow-lg">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-lg font-bold text-slate-900 dark:text-white">ShiftCare</span>
            <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Management System</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        {navigationItems.map((group) => (
          <SidebarGroup key={group.title} className="mb-6">
            <SidebarGroupLabel className="text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 group-data-[collapsible=icon]:hidden">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={item.isActive}
                      tooltip={item.tooltip}
                      className="group relative rounded-lg transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-sm data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:border-l-4 data-[active=true]:border-blue-500 dark:data-[active=true]:bg-blue-900/20 dark:data-[active=true]:text-blue-300"
                    >
                      <a href={item.url} className="flex items-center gap-3 px-3 py-2.5">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarRail />
      
      <SidebarFooter className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-4">
        <div className="space-y-3">
          <SidebarMenuButton 
            onClick={handleLogout}
            tooltip="Sign out of your account"
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-lg transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium group-data-[collapsible=icon]:hidden">Sign Out</span>
          </SidebarMenuButton>
          
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
