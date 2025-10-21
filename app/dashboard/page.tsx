"use client"

import * as React from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react"
import { fetchShifts, fetchShiftTypes } from "@/feature/shifts/shiftSlice"
import { fetchStaff, fetchStaffByCompany } from "@/feature/staff/staffSlice"
import { fetchClients, fetchClientsByCompany } from "@/feature/clients/clientSlice"
import { RootState, AppDispatch } from "@/lib/store"
import ProtectedRoute from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, UserCheck, Clock, TrendingUp, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { format, startOfWeek, endOfWeek, isToday, isTomorrow, isYesterday } from "date-fns"

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { shifts, shiftTypes } = useSelector((state: RootState) => state.shifts)
  const { staff } = useSelector((state: RootState) => state.staff)
  const { clients } = useSelector((state: RootState) => state.clients)
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch basic data for dashboard
      if (user.company_id) {
        dispatch(fetchStaffByCompany({ companyId: user.company_id }))
        dispatch(fetchClientsByCompany({ companyId: user.company_id }))
      } else {
        dispatch(fetchStaff())
        dispatch(fetchClients())
      }
      dispatch(fetchShiftTypes())
      
      // Fetch recent shifts
      const today = new Date()
      const weekStart = startOfWeek(today, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
      
      dispatch(fetchShifts({
        page: 1,
        limit: 50,
        company_id: user.company_id,
        date_from: weekStart.toISOString().split('T')[0],
        date_to: weekEnd.toISOString().split('T')[0]
      }))
    }
  }, [dispatch, isAuthenticated, user])

  // Calculate dashboard stats
  const today = new Date()
  const todayShifts = shifts?.filter(shift => {
    const shiftDate = new Date(shift.start_time)
    return isToday(shiftDate)
  }) || []

  const tomorrowShifts = shifts?.filter(shift => {
    const shiftDate = new Date(shift.start_time)
    return isTomorrow(shiftDate)
  }) || []

  const completedShifts = shifts?.filter(shift => shift.status === 'completed') || []
  const pendingShifts = shifts?.filter(shift => ['draft', 'published', 'assigned'].includes(shift.status)) || []
  const cancelledShifts = shifts?.filter(shift => shift.status === 'cancelled') || []

  const stats = [
    {
      title: "Total Staff",
      value: staff?.length || 0,
      icon: Users,
      description: "Active staff members",
      color: "text-blue-600"
    },
    {
      title: "Total Clients",
      value: clients?.length || 0,
      icon: UserCheck,
      description: "Registered clients",
      color: "text-green-600"
    },
    {
      title: "Today's Shifts",
      value: todayShifts.length,
      icon: Calendar,
      description: "Shifts scheduled today",
      color: "text-purple-600"
    },
    {
      title: "Completed Shifts",
      value: completedShifts.length,
      icon: TrendingUp,
      description: "Successfully completed",
      color: "text-emerald-600"
    }
  ]

  const quickActions = [
    {
      title: "View Scheduler",
      description: "Manage shifts and schedules",
      icon: Calendar,
      href: "/",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Manage Staff",
      description: "Add or edit staff members",
      icon: Users,
      href: "/staff",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Manage Clients",
      description: "Add or edit clients",
      icon: UserCheck,
      href: "/clients",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Shift Types",
      description: "Configure shift types",
      icon: Clock,
      href: "/shift-types",
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ]

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-screen">
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm border-b">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                <p className="text-slate-600 dark:text-slate-400">Welcome back! Here's what's happening today.</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => router.push('/')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Go to Scheduler
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {stat.value}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <Card 
                      key={index} 
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                      onClick={() => router.push(action.href)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${action.color} text-white`}>
                            <action.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {action.title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Shifts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <span>Today's Shifts</span>
                    </CardTitle>
                    <CardDescription>
                      {todayShifts.length} shifts scheduled for today
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {todayShifts.length === 0 ? (
                      <div className="text-center py-4 text-slate-500">
                        No shifts scheduled for today
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {todayShifts.slice(0, 5).map((shift) => (
                          <div key={shift.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div>
                              <div className="font-medium text-sm">
                                {format(new Date(shift.start_time), 'HH:mm')} - {format(new Date(shift.end_time), 'HH:mm')}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                {shift.care_service?.name || 'Shift'}
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              shift.status === 'completed' ? 'bg-green-100 text-green-800' :
                              shift.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              shift.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {shift.status}
                            </div>
                          </div>
                        ))}
                        {todayShifts.length > 5 && (
                          <div className="text-center text-sm text-slate-500">
                            +{todayShifts.length - 5} more shifts
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tomorrow's Shifts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <span>Tomorrow's Shifts</span>
                    </CardTitle>
                    <CardDescription>
                      {tomorrowShifts.length} shifts scheduled for tomorrow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tomorrowShifts.length === 0 ? (
                      <div className="text-center py-4 text-slate-500">
                        No shifts scheduled for tomorrow
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tomorrowShifts.slice(0, 5).map((shift) => (
                          <div key={shift.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div>
                              <div className="font-medium text-sm">
                                {format(new Date(shift.start_time), 'HH:mm')} - {format(new Date(shift.end_time), 'HH:mm')}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                {shift.care_service?.name || 'Shift'}
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              shift.status === 'completed' ? 'bg-green-100 text-green-800' :
                              shift.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              shift.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {shift.status}
                            </div>
                          </div>
                        ))}
                        {tomorrowShifts.length > 5 && (
                          <div className="text-center text-sm text-slate-500">
                            +{tomorrowShifts.length - 5} more shifts
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-green-600" />
                    <span>System Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{completedShifts.length}</div>
                      <div className="text-sm text-green-600">Completed Shifts</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{pendingShifts.length}</div>
                      <div className="text-sm text-yellow-600">Pending Shifts</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{cancelledShifts.length}</div>
                      <div className="text-sm text-red-600">Cancelled Shifts</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
