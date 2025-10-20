"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Calendar, DollarSign, Tag } from "lucide-react"
import { CareService } from "@/types"

interface CareServiceDetailsModalProps {
  careService: CareService | null
  isOpen: boolean
  onClose: () => void
  onEdit: (careService: CareService) => void
}

export function CareServiceDetailsModal({ 
  careService, 
  isOpen, 
  onClose, 
  onEdit 
}: CareServiceDetailsModalProps) {
  if (!careService) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{careService.name}</DialogTitle>
              <DialogDescription className="mt-2">
                Care service details and information
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={careService.is_active ? "default" : "secondary"}>
                {careService.is_active ? "Active" : "Inactive"}
              </Badge>
              <Button onClick={() => onEdit(careService)} size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {careService.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{careService.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {careService.service_type && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Service Type</h3>
                </div>
                <div className="pl-6">
                  <p className="font-medium">{careService.service_type.name}</p>
                  {careService.service_type.description && (
                    <p className="text-sm text-muted-foreground">
                      {careService.service_type.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {careService.price_book && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Price Book</h3>
                </div>
                <div className="pl-6">
                  <p className="font-medium">{careService.price_book.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ${careService.price_book.rate_per_hour} per hour
                  </p>
                  {careService.price_book.day_of_week && (
                    <p className="text-sm text-muted-foreground">
                      {careService.price_book.day_of_week}
                    </p>
                  )}
                  {careService.price_book.notes && (
                    <p className="text-sm text-muted-foreground">
                      {careService.price_book.notes}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Timeline</h3>
            </div>
            <div className="pl-6 space-y-1">
              <p className="text-sm">
                <span className="font-medium">Created:</span>{" "}
                {new Date(careService.created_at).toLocaleString()}
              </p>
              <p className="text-sm">
                <span className="font-medium">Last Updated:</span>{" "}
                {new Date(careService.updated_at).toLocaleString()}
              </p>
            </div>
          </div>

          {!careService.service_type && !careService.price_book && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No additional information available</p>
              <p className="text-sm">Consider adding service type and price book for better organization</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
