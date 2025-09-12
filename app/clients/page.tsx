"use client"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Users, UserCheck, UserX, CalendarCheck } from "lucide-react"
import type { Client } from "@/types"
import { StatsCard } from "@/components/stats-card"
import { DataTable } from "@/components/ui/data-table"

const sampleClients: Client[] = [
  {
    id: "c1",
    name: "Macquarie House",
    needs: ["Mobility Support", "Personal Care"],
    preferences: ["Morning shifts preferred"],
    contactInfo: {
      email: "macquarie@example.com",
      phone: "+1234567896",
      address: "123 Main St",
    },
    status: "active",
  },
  {
    id: "c2",
    name: "Riverbend Community",
    needs: ["Medication Reminders", "Meal Prep"],
    preferences: ["Evening shifts preferred"],
    contactInfo: {
      email: "riverbend@example.com",
      phone: "+1234567897",
      address: "456 Oak Ave",
    },
    status: "active",
  },
  {
    id: "c3",
    name: "Green Valley Seniors",
    needs: ["Companionship"],
    preferences: ["Female staff preferred"],
    contactInfo: {
      email: "greenvalley@example.com",
      phone: "+1234567898",
      address: "789 Pine Ln",
    },
    status: "inactive",
  },
  {
    id: "c4",
    name: "Willow Creek Residence",
    needs: ["Physical Therapy"],
    preferences: ["Consistent staff"],
    contactInfo: {
      email: "willowcreek@example.com",
      phone: "+1234567899",
      address: "101 Elm Rd",
    },
    status: "active",
  },
  {
    id: "c5",
    name: "Maplewood Care",
    needs: ["Cognitive Support"],
    preferences: ["Quiet environment"],
    contactInfo: {
      email: "maplewood@example.com",
      phone: "+1234567800",
      address: "202 Birch Blvd",
    },
    status: "active",
  },
  {
    id: "c6",
    name: "Sunrise Haven",
    needs: ["Transportation"],
    preferences: ["Early morning pickups"],
    contactInfo: {
      email: "sunrise@example.com",
      phone: "+1234567801",
      address: "303 Cedar Ct",
    },
    status: "inactive",
  },
]

// Assuming you have some sample shifts to determine clients with shifts
const sampleShiftsForClients = [{ clientId: "c1" }, { clientId: "c2" }, { clientId: "c4" }, { clientId: "c5" }]

export default function ClientsPage() {
  const totalClients = sampleClients.length
  const activeClients = sampleClients.filter((c) => c.status === "active").length
  const inactiveClients = totalClients - activeClients
  const clientsWithShifts = new Set(sampleShiftsForClients.map((s) => s.clientId)).size

  const clientColumns = [
    {
      key: "name",
      header: "Name",
      render: (row: Client) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={row.photo || `/placeholder.svg?height=32&width=32&query=${row.name}`} />
            <AvatarFallback>
              {row.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          {row.name}
        </div>
      ),
    },
    {
      key: "contactInfo",
      header: "Contact Info",
      render: (row: Client) => (
        <div className="text-sm">
          <p>{row.contactInfo.email}</p>
          <p className="text-muted-foreground">{row.contactInfo.phone}</p>
        </div>
      ),
    },
    {
      key: "needs",
      header: "Needs",
      render: (row: Client) => (
        <div className="flex flex-wrap gap-1">
          {row.needs.slice(0, 2).map((need) => (
            <Badge key={need} variant="outline">
              {need}
            </Badge>
          ))}
          {row.needs.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{row.needs.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: Client) => <Badge variant={row.status === "active" ? "default" : "secondary"}>{row.status}</Badge>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Client) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <div className="flex border-b justify-between p-6 items-center">
            <div>
              <h1 className="text-3xl font-bold">Client Management</h1>
              <p className="text-muted-foreground">Manage your clients and their service needs</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>

          <div className="flex-1 p-6">
            <div className="grid gap-6 lg:grid-cols-4 mb-6 md:grid-cols-2">
              <StatsCard title="Total Clients" value={totalClients} description="All registered clients" icon={Users} />
              <StatsCard
                title="Active Clients"
                value={activeClients}
                description="Currently receiving services"
                icon={UserCheck}
              />
              <StatsCard
                title="Inactive Clients"
                value={inactiveClients}
                description="Not currently active"
                icon={UserX}
              />
              <StatsCard
                title="Clients with Shifts"
                value={clientsWithShifts}
                description="Clients with scheduled shifts"
                icon={CalendarCheck}
              />
            </div>

            <DataTable columns={clientColumns} data={sampleClients} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
