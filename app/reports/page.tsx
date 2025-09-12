"use client"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Users, Clock, DollarSign, Calendar } from "lucide-react"

export default function ReportsPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <div className="flex border-b justify-between p-6 items-center">
            <div>
              <h1 className="text-3xl font-bold">Reports & Analytics</h1>
              <p className="text-muted-foreground">Track performance and generate insights</p>
            </div>
            <div className="flex space-x-2">
              <Select defaultValue="this-month">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="this-quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="grid gap-6 lg:grid-cols-4 mb-6 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                  <Users className="h-4 text-muted-foreground w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-muted-foreground text-xs">+2 from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                  <Clock className="h-4 text-muted-foreground w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,240</div>
                  <p className="text-muted-foreground text-xs">+15% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Completed Shifts</CardTitle>
                  <Calendar className="h-4 text-muted-foreground w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-muted-foreground text-xs">+8% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-4 text-muted-foreground w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231</div>
                  <p className="text-muted-foreground text-xs">+12% from last month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Staff Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sarah Johnson</span>
                      <span className="text-sm font-medium">98% completion rate</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mike Chen</span>
                      <span className="text-sm font-medium">95% completion rate</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Emma Wilson</span>
                      <span className="text-sm font-medium">97% completion rate</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shift Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed</span>
                      <span className="text-sm font-medium">156 (78%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Scheduled</span>
                      <span className="text-sm font-medium">32 (16%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Vacant</span>
                      <span className="text-sm font-medium">8 (4%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cancelled</span>
                      <span className="text-sm font-medium">4 (2%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
