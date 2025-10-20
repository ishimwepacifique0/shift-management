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
import { Edit, Calendar, Tag } from "lucide-react"
import { ServiceType } from "@/types"

interface ServiceTypeDetailsModalProps {
  serviceType: ServiceType | null
  isOpen: boolean
  onClose: () => void
  onEdit: (serviceType: ServiceType) => void
}

export function ServiceTypeDetailsModal({ 
  serviceType, 
  isOpen, 
  onClose, 
  onEdit 
}: ServiceTypeDetailsModalProps) {
  if (!serviceType) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{serviceType.name}</DialogTitle>
              <DialogDescription className="mt-2">
                Service type details and information
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={serviceType.is_active ? "default" : "secondary"}>
                {serviceType.is_active ? "Active" : "Inactive"}
              </Badge>
              <Button onClick={() => onEdit(serviceType)} size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {serviceType.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{serviceType.description}</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Service Type Information</h3>
            </div>
            <div className="pl-6 space-y-1">
              <p className="text-sm">
                <span className="font-medium">Name:</span> {serviceType.name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Status:</span>{" "}
                <Badge variant={serviceType.is_active ? "default" : "secondary"} className="ml-1">
                  {serviceType.is_active ? "Active" : "Inactive"}
                </Badge>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Timeline</h3>
            </div>
            <div className="pl-6 space-y-1">
              <p className="text-sm">
                <span className="font-medium">Created:</span>{" "}
                {new Date(serviceType.created_at).toLocaleString()}
              </p>
              <p className="text-sm">
                <span className="font-medium">Last Updated:</span>{" "}
                {new Date(serviceType.updated_at).toLocaleString()}
              </p>
            </div>
          </div>

          {!serviceType.description && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No additional information available</p>
              <p className="text-sm">Consider adding a description for better organization</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
