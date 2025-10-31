"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { documentCategoryApi, DocumentCategory } from "@/lib/api/documentCategoryApi"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface DocumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (files: File[], category: string) => Promise<void>
  title?: string
  description?: string
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  onUpload,
  title = "Upload Documents",
  description = "Select a category and upload documents",
}: DocumentUploadModalProps) {
  const [categories, setCategories] = useState<DocumentCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [categoryName, setCategoryName] = useState<string>("")
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      loadCategories()
    }
  }, [isOpen])

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true)
      const response = await documentCategoryApi.getCategories()
      if (response.success) {
        setCategories(response.data)
        // Set default category if available
        if (response.data.length > 0 && !selectedCategory) {
          setSelectedCategory(response.data[0].name)
        }
      }
    } catch (error: any) {
      console.error('Failed to load categories:', error)
      toast({
        title: "Error",
        description: "Failed to load document categories",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files)
      setFiles(fileArray)
    }
  }

  const handleCategorySelect = (value: string) => {
    setSelectedCategory(value)
  }

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await documentCategoryApi.createCategory({
        name: categoryName.trim(),
      })
      if (response.success) {
        setCategories([...categories, response.data])
        setSelectedCategory(response.data.name)
        setCategoryName("")
        toast({
          title: "Success",
          description: "Category created successfully",
        })
      }
    } catch (error: any) {
      console.error('Failed to create category:', error)
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create category"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedCategory) {
      toast({
        title: "Error",
        description: "Please select a document category",
        variant: "destructive",
      })
      return
    }

    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one file",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await onUpload(files, selectedCategory)
      setFiles([])
      setSelectedCategory("")
      onClose()
    } catch (error) {
      // Error handling is done in parent component
      console.error('Upload error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFiles([])
    setSelectedCategory("")
    setCategoryName("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Document Category</Label>
            <Select value={selectedCategory} onValueChange={handleCategorySelect} disabled={isLoadingCategories}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
                {categories.length === 0 && (
                  <SelectItem value="no-categories" disabled>
                    No categories available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Create New Category */}
          <div className="space-y-2">
            <Label htmlFor="category-name">Create New Category (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="category-name"
                placeholder="Enter category name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCreateCategory}
                disabled={isLoading || !categoryName.trim()}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </Button>
            </div>
          </div>

          {/* File Selection */}
          <div className="space-y-2">
            <Label htmlFor="documents">Select Documents</Label>
            <Input
              id="documents"
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={isLoading}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
            />
            {files.length > 0 && (
              <div className="text-sm text-muted-foreground mt-2">
                {files.length} file(s) selected
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isLoading || !selectedCategory || files.length === 0}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

