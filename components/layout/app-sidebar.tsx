"use client"

import type * as React from "react"
import { Calendar, Users, UserCheck, Clock, DollarSign, Settings, BarChart3, LogOut } from "lucide-react"

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
      {
        title: "Shifts",
        url: "/shifts",
        icon: Clock,
        isActive: false,
      },
    ],
  },
  {
    title: "Business",
    items: [
      {
        title: "Reports",
        url: "/reports",
        icon: BarChart3,
        isActive: false,
      },
      {
        title: "Invoices",
        url: "/invoices",
        icon: DollarSign,
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
      },
      {
        title: "Logout",
        url: "/logout",
        icon: LogOut,
        isActive: false,
      }
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <div className="text-muted-foreground text-xs">© 2024 ShiftCare Management</div>
      </SidebarFooter>
    </Sidebar>
  )
}
