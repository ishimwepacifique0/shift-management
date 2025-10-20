"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/lib/store"
import { deleteServiceType, setSelectedServiceType } from "@/feature/serviceTypes/serviceTypeSlice"
import { ServiceType } from "@/types"

interface ServiceTypeCardProps {
  serviceType: ServiceType
  onEdit: (serviceType: ServiceType) => void
}

export function ServiceTypeCard({ serviceType, onEdit }: ServiceTypeCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { status } = useSelector((state: RootState) => state.serviceTypes)

  const handleDelete = async () => {
    try {
      const result = await dispatch(deleteServiceType(serviceType.id))
      
      if (deleteServiceType.fulfilled.match(result)) {
        toast({
          title: "Success",
          description: "Service type deleted successfully",
        })
      }
    } catch (error) {
      console.error("Error deleting service type:", error)
    }
    setShowDeleteDialog(false)
  }

  const handleView = () => {
    dispatch(setSelectedServiceType(serviceType))
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{serviceType.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {serviceType.description || "No description provided"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={serviceType.is_active ? "default" : "secondary"}>
                {serviceType.is_active ? "Active" : "Inactive"}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleView}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(serviceType)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Created:</span>{" "}
              {new Date(serviceType.created_at).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{" "}
              {new Date(serviceType.updated_at).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service type
              "{serviceType.name}" and remove it from all associated care services.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={status === "loading"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {status === "loading" ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
