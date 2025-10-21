"use client"

import * as React from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { RootState, AppDispatch } from "@/lib/store"
import ProtectedRoute from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building2, Users, Calendar, Heart, Settings, Save, RefreshCw, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { companyApi, CompanyUpdateData, CompanyStats } from "@/lib/api/companyApi"

interface Company {
  id: number
  name: string
  email?: string
  phone_number?: string
  location?: string
  representative_name?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function SettingsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  
  const [company, setCompany] = useState<Company | null>(null)
  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  
  const [formData, setFormData] = useState<CompanyUpdateData>({
    name: '',
    email: '',
    phone_number: '',
    location: '',
    representative_name: '',
    is_active: true
  })

  useEffect(() => {
    if (isAuthenticated && user?.company_id) {
      fetchCompanyData()
    }
  }, [isAuthenticated, user])

  const fetchCompanyData = async () => {
    if (!user?.company_id) {
      toast({
        title: "No Company Access",
        description: "You don't have access to any company information. Please contact your administrator.",
        variant: "destructive",
      })
      return
    }
    
    try {
      setLoading(true)
      
      // First, try to get company information
      const companyResponse = await companyApi.getCompany(user.company_id)
      
      if (companyResponse.success) {
        setCompany(companyResponse.data)
        setFormData({
          name: companyResponse.data.name,
          email: companyResponse.data.email || '',
          phone_number: companyResponse.data.phone_number || '',
          location: companyResponse.data.location || '',
          representative_name: companyResponse.data.representative_name || '',
          is_active: companyResponse.data.is_active
        })
        
        toast({
          title: "Company Information Loaded",
          description: `Successfully loaded information for ${companyResponse.data.name}`,
        })
      } else {
        toast({
          title: "Error Loading Company",
          description: companyResponse.message || "Failed to load company information",
          variant: "destructive",
        })
        return
      }
      
      // Then try to get statistics (this might fail if endpoint doesn't exist)
      try {
        const statsResponse = await companyApi.getCompanyStats(user.company_id)
        if (statsResponse.success) {
          setStats(statsResponse.data)
        } else {
          console.warn('Statistics API returned error:', statsResponse.message)
          // Set default empty stats if statistics endpoint returns error
          setStats({
            totalUsers: 0,
            totalClients: 0,
            totalStaff: 0,
            totalShifts: 0,
            activeShifts: 0,
            totalServices: 0
          })
        }
      } catch (statsError: any) {
        console.warn('Statistics not available:', statsError)
        // Set default empty stats if statistics endpoint is not available
        setStats({
          totalUsers: 0,
          totalClients: 0,
          totalStaff: 0,
          totalShifts: 0,
          activeShifts: 0,
          totalServices: 0
        })
        
        // Show a subtle notification that statistics are not available
        toast({
          title: "Statistics Unavailable",
          description: "Company statistics are not available at the moment. Basic information has been loaded.",
          variant: "default",
        })
      }
      
    } catch (error: any) {
      console.error('Error fetching company data:', error)
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user?.company_id) {
      toast({
        title: "No Company Access",
        description: "You don't have permission to update company information",
        variant: "destructive",
      })
      return
    }
    
    // Validate required fields
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Company name is required",
        variant: "destructive",
      })
      return
    }
    
    try {
      setSaving(true)
      const response = await companyApi.updateCompanySettings(user.company_id, formData)
      
      if (response.success) {
        setCompany(response.data)
        setEditing(false)
        toast({
          title: "Company Updated Successfully",
          description: `Company information for ${response.data.name} has been updated`,
        })
      } else {
        toast({
          title: "Update Failed",
          description: response.message || "Failed to update company settings",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error('Error updating company:', error)
      toast({
        title: "Update Error",
        description: "Unable to save changes. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (company) {
      setFormData({
        name: company.name,
        email: company.email || '',
        phone_number: company.phone_number || '',
        location: company.location || '',
        representative_name: company.representative_name || '',
        is_active: company.is_active
      })
    }
    setEditing(false)
  }

  const handleInputChange = (field: keyof CompanyUpdateData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-slate-600">Loading company settings...</p>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    )
  }

  if (!company) {
    return (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
                <p className="text-slate-600">No company information found</p>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-screen">
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm border-b">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Company Settings</h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {company ? `Manage information for ${company.name}` : 'Manage your company information and preferences'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!editing && (
                  <Button 
                    variant="outline" 
                    onClick={fetchCompanyData} 
                    disabled={loading}
                    className="mr-2"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                )}
                {editing ? (
                  <>
                    <Button variant="outline" onClick={handleCancel} disabled={saving}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                      {saving ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Settings
                  </Button>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Help Information */}
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">How to Manage Company Information</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        You can view and update your company's information here. Click "Edit Settings" to make changes, 
                        then "Save Changes" to update. Use the "Refresh" button to reload the latest information.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Company Information */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        Company Information
                      </CardTitle>
                      <CardDescription>
                        Basic company details and contact information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Company Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            disabled={!editing}
                            placeholder="Enter company name"
                            className={!formData.name?.trim() && editing ? 'border-red-500' : ''}
                          />
                          {!formData.name?.trim() && editing && (
                            <p className="text-xs text-red-500">Company name is required</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            disabled={!editing}
                            placeholder="company@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={formData.phone_number}
                            onChange={(e) => handleInputChange('phone_number', e.target.value)}
                            disabled={!editing}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            disabled={!editing}
                            placeholder="City, State, Country"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="representative">Representative Name</Label>
                        <Input
                          id="representative"
                          value={formData.representative_name}
                          onChange={(e) => handleInputChange('representative_name', e.target.value)}
                          disabled={!editing}
                          placeholder="Company representative name"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="active"
                          checked={formData.is_active}
                          onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                          disabled={!editing}
                        />
                        <Label htmlFor="active">Company is active</Label>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Company Statistics */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-600" />
                        Company Statistics
                      </CardTitle>
                      <CardDescription>
                        Current company metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {stats ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Total Users</span>
                            <Badge variant="secondary">{stats.totalUsers}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Total Clients</span>
                            <Badge variant="secondary">{stats.totalClients}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Total Staff</span>
                            <Badge variant="secondary">{stats.totalStaff}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Total Shifts</span>
                            <Badge variant="secondary">{stats.totalShifts}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Active Shifts</span>
                            <Badge variant="secondary">{stats.activeShifts}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Total Services</span>
                            <Badge variant="secondary">{stats.totalServices}</Badge>
                          </div>
                          {stats.totalUsers === 0 && stats.totalClients === 0 && stats.totalStaff === 0 && (
                            <div className="text-center py-2">
                              <p className="text-xs text-slate-500">Statistics will appear as you add data</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-400" />
                          <p className="text-sm text-slate-500">Loading statistics...</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Common tasks for managing your company
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setEditing(true)}
                      disabled={editing}
                      className="h-auto p-4 flex flex-col items-start"
                    >
                      <Settings className="h-5 w-5 mb-2" />
                      <span className="font-medium">Edit Company Info</span>
                      <span className="text-xs text-slate-500">Update company details</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={fetchCompanyData}
                      disabled={loading}
                      className="h-auto p-4 flex flex-col items-start"
                    >
                      <RefreshCw className={`h-5 w-5 mb-2 ${loading ? 'animate-spin' : ''}`} />
                      <span className="font-medium">Refresh Data</span>
                      <span className="text-xs text-slate-500">Reload latest information</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Company Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Company Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Company Status</p>
                      <p className="text-sm text-slate-600">
                        {company.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <Badge variant={company.is_active ? "default" : "destructive"}>
                      {company.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Created</p>
                      <p className="font-medium">
                        {new Date(company.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600">Last Updated</p>
                      <p className="font-medium">
                        {new Date(company.updated_at).toLocaleDateString()}
                      </p>
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
