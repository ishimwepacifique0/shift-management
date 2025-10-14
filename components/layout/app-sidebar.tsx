"use client"

import type * as React from "react"
import { Calendar, Users, UserCheck, Clock, DollarSign, Settings, BarChart3, LogOut } from "lucide-react"
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
} from "@/components/ui/sidebar"

const navigationItems = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Scheduler",
        url: "/",
        icon: Calendar,
        isActive: false,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Staff",
        url: "/staff",
        icon: Users,
        isActive: false,
      },
      {
        title: "Clients",
        url: "/clients",
        icon: UserCheck,
        isActive: false,
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
    <Sidebar {...props}>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex gap-2 items-center">
          <div className="flex bg-primary h-8 justify-center rounded-lg text-primary-foreground w-8 items-center">
            <Calendar className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">ShiftCare</span>
            <span className="text-muted-foreground text-xs">Management</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navigationItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <a href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-sidebar-border border-t p-4">
        <div className="space-y-2">
          <SidebarMenuButton 
            onClick={handleLogout}
            className="justify-start text-red-600 w-full hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </SidebarMenuButton>
          <div className="text-muted-foreground text-xs">© 2024 ShiftCare Management</div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
