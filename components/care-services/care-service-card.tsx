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
import { deleteCareService, setSelectedCareService } from "@/feature/careServices/careServiceSlice"
import { CareService } from "@/types"

interface CareServiceCardProps {
  careService: CareService
  onEdit: (careService: CareService) => void
}

export function CareServiceCard({ careService, onEdit }: CareServiceCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { status } = useSelector((state: RootState) => state.careServices)

  const handleDelete = async () => {
    try {
      const result = await dispatch(deleteCareService(careService.id))
      
      if (deleteCareService.fulfilled.match(result)) {
        toast({
          title: "Success",
          description: "Care service deleted successfully",
        })
      }
    } catch (error) {
      console.error("Error deleting care service:", error)
    }
    setShowDeleteDialog(false)
  }

  const handleView = () => {
    dispatch(setSelectedCareService(careService))
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{careService.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {careService.description || "No description provided"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={careService.is_active ? "default" : "secondary"}>
                {careService.is_active ? "Active" : "Inactive"}
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
                  <DropdownMenuItem onClick={() => onEdit(careService)}>
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
            {careService.service_type_id && (
              <div>
                <span className="font-medium">Service Type ID:</span> {careService.service_type_id}
                {careService.service_type && (
                  <span className="ml-1">({careService.service_type.name})</span>
                )}
              </div>
            )}
            {careService.price_book_id && (
              <div>
                <span className="font-medium">Price Book ID:</span> {careService.price_book_id}
                {careService.price_book && (
                  <span className="ml-1">
                    ({careService.price_book.name} - ${careService.price_book.rate_per_hour}/hr)
                  </span>
                )}
              </div>
            )}
            <div>
              <span className="font-medium">Created:</span>{" "}
              {new Date(careService.created_at).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the care service
              "{careService.name}" and remove it from all associated shifts.
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
