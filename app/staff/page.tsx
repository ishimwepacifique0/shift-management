"use client"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Users, UserCheck, UserX, Clock } from "lucide-react"
import type { Staff } from "@/types"
import { StatsCard } from "@/components/stats-card"
import { DataTable } from "@/components/ui/data-table"

const sampleStaff: Staff[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    initials: "SJ",
    roles: ["Support Worker", "Team Lead"],
    email: "sarah@shiftcare.com",
    phone: "+1234567890",
    weeklyHours: 35,
    monthlyHours: 140,
    status: "active",
  },
  {
    id: "2",
    name: "Mike Chen",
    initials: "MC",
    roles: ["Support Worker"],
    email: "mike@shiftcare.com",
    phone: "+1234567891",
    weeklyHours: 40,
    monthlyHours: 160,
    status: "active",
  },
  {
    id: "3",
    name: "Emma Wilson",
    initials: "EW",
    roles: ["Coordinator", "Support Worker"],
    email: "emma@shiftcare.com",
    phone: "+1234567892",
    weeklyHours: 32,
    monthlyHours: 128,
    status: "active",
  },
  {
    id: "4",
    name: "David Lee",
    initials: "DL",
    roles: ["Support Worker"],
    email: "david@shiftcare.com",
    phone: "+1234567893",
    weeklyHours: 0,
    monthlyHours: 0,
    status: "inactive",
  },
  {
    id: "5",
    name: "Olivia Brown",
    initials: "OB",
    roles: ["Support Worker"],
    email: "olivia@shiftcare.com",
    phone: "+1234567894",
    weeklyHours: 28,
    monthlyHours: 112,
    status: "active",
  },
  {
    id: "6",
    name: "James Miller",
    initials: "JM",
    roles: ["Support Worker"],
    email: "james@shiftcare.com",
    phone: "+1234567895",
    weeklyHours: 15,
    monthlyHours: 60,
    status: "active",
  },
  {
    id: "7",
    name: "Sophia Davis",
    initials: "SD",
    roles: ["Support Worker"],
    email: "sophia@shiftcare.com",
    phone: "+1234567896",
    weeklyHours: 0,
    monthlyHours: 0,
    status: "inactive",
  },
  {
    id: "8",
    name: "Liam Garcia",
    initials: "LG",
    roles: ["Support Worker"],
    email: "liam@shiftcare.com",
    phone: "+1234567897",
    weeklyHours: 38,
    monthlyHours: 152,
    status: "active",
  },
  {
    id: "9",
    name: "Ava Rodriguez",
    initials: "AR",
    roles: ["Support Worker"],
    email: "ava@shiftcare.com",
    phone: "+1234567898",
    weeklyHours: 20,
    monthlyHours: 80,
    status: "active",
  },
  {
    id: "10",
    name: "Noah Martinez",
    initials: "NM",
    roles: ["Support Worker"],
    email: "noah@shiftcare.com",
    phone: "+1234567899",
    weeklyHours: 25,
    monthlyHours: 100,
    status: "active",
  },
  {
    id: "11",
    name: "Isabella Hernandez",
    initials: "IH",
    roles: ["Support Worker"],
    email: "isabella@shiftcare.com",
    phone: "+1234567800",
    weeklyHours: 0,
    monthlyHours: 0,
    status: "inactive",
  },
]

export default function StaffPage() {
  const totalStaff = sampleStaff.length
  const activeStaff = sampleStaff.filter((s) => s.status === "active").length
  const inactiveStaff = totalStaff - activeStaff
  const averageWeeklyHours = (sampleStaff.reduce((sum, s) => sum + s.weeklyHours, 0) / totalStaff).toFixed(1)

  const staffColumns = [
    {
      key: "name",
      header: "Name",
      render: (row: Staff) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={row.photo || `/placeholder.svg?height=32&width=32&query=${row.name}`} />
            <AvatarFallback>{row.initials}</AvatarFallback>
          </Avatar>
          {row.name}
        </div>
      ),
    },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    {
      key: "roles",
      header: "Roles",
      render: (row: Staff) => (
        <div className="flex flex-wrap gap-1">
          {row.roles.map((role) => (
            <Badge key={role} variant="secondary">
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    { key: "weeklyHours", header: "Weekly Hours" },
    {
      key: "status",
      header: "Status",
      render: (row: Staff) => <Badge variant={row.status === "active" ? "default" : "secondary"}>{row.status}</Badge>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Staff) => (
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
              <h1 className="text-3xl font-bold">Staff Management</h1>
              <p className="text-muted-foreground">Manage your team members and their assignments</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </div>

          <div className="flex-1 p-6">
            <div className="grid gap-6 lg:grid-cols-4 mb-6 md:grid-cols-2">
              <StatsCard
                title="Total Staff"
                value={totalStaff}
                description="All registered staff members"
                icon={Users}
              />
              <StatsCard
                title="Active Staff"
                value={activeStaff}
                description="Currently active for shifts"
                icon={UserCheck}
              />
              <StatsCard title="Inactive Staff" value={inactiveStaff} description="Not currently active" icon={UserX} />
              <StatsCard
                title="Avg. Weekly Hours"
                value={`${averageWeeklyHours}h`}
                description="Average hours per active staff"
                icon={Clock}
              />
            </div>

            <DataTable columns={staffColumns} data={sampleStaff} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
