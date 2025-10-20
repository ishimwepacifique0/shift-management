"use client"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, BookOpen, DollarSign, Clock, Calendar } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { DataTable } from "@/components/ui/data-table"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { fetchPriceBooks, fetchActivePriceBooks, deletePriceBook } from "@/feature/priceBooks/priceBookSlice"
import { RootState, AppDispatch } from "@/lib/store"
import { PriceBook } from "@/types"
import { useServiceTypes } from "@/hooks/use-service-types"
import ProtectedRoute from "@/components/protected-route"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { AddPriceBookDrawer } from "@/components/price-books/add-price-book-drawer"
import { EditPriceBookDrawer } from "@/components/price-books/edit-price-book-drawer"

export default function PriceBooksPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { priceBooks, activePriceBooks, status, error } = useSelector((state: RootState) => state.priceBooks)
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const { serviceTypes } = useServiceTypes()
  const { toast } = useToast()
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [priceBookToDelete, setPriceBookToDelete] = useState<PriceBook | null>(null)
  const [addPriceBookDrawerOpen, setAddPriceBookDrawerOpen] = useState(false)
  const [editPriceBookDrawerOpen, setEditPriceBookDrawerOpen] = useState(false)
  const [priceBookToEdit, setPriceBookToEdit] = useState<PriceBook | null>(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchPriceBooks()).catch((error) => {
        console.error("Error fetching price books:", error)
        toast({
          title: "Error",
          description: "Failed to load price books. Please try again.",
          variant: "destructive",
        })
      })
      dispatch(fetchActivePriceBooks())
    }
  }, [dispatch, isAuthenticated, user, toast])


  const handleDeletePriceBook = async (priceBook: PriceBook) => {
    try {
      await dispatch(deletePriceBook(priceBook.id)).unwrap()
      toast({
        title: "Price Book Deleted",
        description: `${priceBook.name} has been permanently removed from the system.`,
      })
      setDeleteDialogOpen(false)
      setPriceBookToDelete(null)
    } catch (error: any) {
      let errorMessage = "Failed to delete price book"
      
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive",
      })
      setDeleteDialogOpen(false)
      setPriceBookToDelete(null)
    }
  }

  const openDeleteDialog = (priceBook: PriceBook) => {
    setPriceBookToDelete(priceBook)
    setDeleteDialogOpen(true)
  }

  const openEditDialog = (priceBook: PriceBook) => {
    setPriceBookToEdit(priceBook)
    setEditPriceBookDrawerOpen(true)
  }

  const totalPriceBooks = priceBooks?.length || 0
  const activePriceBooksCount = activePriceBooks?.length || 0
  const inactivePriceBooksCount = totalPriceBooks - activePriceBooksCount


  // Helper function to get service type name
  const getServiceTypeName = (serviceTypeId?: number) => {
    if (!serviceTypeId) return "No service type"
    const serviceType = serviceTypes?.find(st => st.id === serviceTypeId)
    return serviceType?.name || "Unknown service type"
  }

  const priceBookColumns = [
    {
      key: "name",
      header: "Price Book Name",
      render: (row: PriceBook) => (
        <div className="flex items-center">
          <BookOpen className="h-4 w-4 mr-2 text-green-500" />
          {row.name}
        </div>
      ),
    },
    {
      key: "rate_per_hour",
      header: "Rate/Hour",
      render: (row: PriceBook) => (
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 mr-1 text-green-600" />
          ${row.rate_per_hour.toFixed(2)}
        </div>
      ),
    },
    {
      key: "service_type",
      header: "Service Type",
      render: (row: PriceBook) => getServiceTypeName(row.service_type_id),
    },
    {
      key: "day_of_week",
      header: "Day of Week",
      render: (row: PriceBook) => row.day_of_week || "Any day",
    },
    {
      key: "status",
      header: "Status",
      render: (row: PriceBook) => (
        <Badge variant={row.is_active ? "default" : "secondary"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (row: PriceBook) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: PriceBook) => (
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => openEditDialog(row)}
            title="Edit price book"
            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => openDeleteDialog(row)}
            title="Delete price book"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-screen overflow-hidden">
            <div className="flex border-b justify-between p-6 items-center flex-shrink-0">
              <div>
                <h1 className="text-3xl font-bold">Price Books Management</h1>
                <p className="text-muted-foreground">Manage your company's pricing rates and schedules</p>
              </div>
              <Button onClick={() => setAddPriceBookDrawerOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Price Book
              </Button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid gap-6 lg:grid-cols-4 mb-6 md:grid-cols-2">
                <StatsCard
                  title="Total Price Books"
                  value={totalPriceBooks}
                  description="All pricing rates"
                  icon={BookOpen}
                />
                <StatsCard
                  title="Active Rates"
                  value={activePriceBooksCount}
                  description="Currently in use"
                  icon={DollarSign}
                />
                <StatsCard 
                  title="Inactive Rates" 
                  value={inactivePriceBooksCount} 
                  description="Not currently active" 
                  icon={Clock} 
                />
                <StatsCard
                  title="Service Types"
                  value={serviceTypes?.length || 0}
                  description="Different categories"
                  icon={Calendar}
                />
              </div>

              {status === "loading" ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">Loading price books...</div>
                </div>
              ) : status === "failed" && error ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-red-600">Error: {error}</div>
                </div>
              ) : (priceBooks && priceBooks.length > 0) ? (
                <DataTable columns={priceBookColumns} data={priceBooks} />
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No Price Books Found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get started by creating your first price book
                  </p>
                  <Button onClick={() => setAddPriceBookDrawerOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Price Book
                  </Button>
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Price Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {priceBookToDelete?.name}? 
              This action cannot be undone and will permanently remove the price book from the system.
              <br /><br />
              <strong>Warning:</strong> This will completely remove the price book.
              <br /><br />
              <strong>Note:</strong> Price books with associated care services cannot be deleted. 
              If this price book has associated care services, you'll need to reassign or remove those services first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => priceBookToDelete && handleDeletePriceBook(priceBookToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Price Book Drawer */}
      <AddPriceBookDrawer 
        isOpen={addPriceBookDrawerOpen} 
        onClose={() => setAddPriceBookDrawerOpen(false)} 
      />

      {/* Edit Price Book Drawer */}
      <EditPriceBookDrawer 
        priceBook={priceBookToEdit}
        isOpen={editPriceBookDrawerOpen} 
        onClose={() => {
          setEditPriceBookDrawerOpen(false)
          setPriceBookToEdit(null)
        }} 
      />
    </ProtectedRoute>
  )
}
