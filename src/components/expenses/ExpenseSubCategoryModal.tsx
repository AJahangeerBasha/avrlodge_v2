import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import {
  useExpenseIsCreateSubCategoryModalOpen,
  useExpenseIsEditSubCategoryModalOpen,
  useExpenseEditingSubCategoryId,
  useExpenseSelectedCategoryId,
  useExpenseCloseCreateSubCategoryModal,
  useExpenseCloseEditSubCategoryModal,
  useExpenseSetError
} from '@/stores/expenseStore'
import {
  useCreateExpenseSubCategory,
  useUpdateExpenseSubCategory,
  useExpenseSubCategory,
  useExpenseCategories
} from '@/hooks/useExpenses'

export const ExpenseSubCategoryModal = () => {
  const isCreateOpen = useExpenseIsCreateSubCategoryModalOpen()
  const isEditOpen = useExpenseIsEditSubCategoryModalOpen()
  const editingSubCategoryId = useExpenseEditingSubCategoryId()
  const selectedCategoryIdFromStore = useExpenseSelectedCategoryId()
  const isOpen = isCreateOpen || isEditOpen
  const isEditMode = isEditOpen && !!editingSubCategoryId

  const closeCreateSubCategoryModal = useExpenseCloseCreateSubCategoryModal()
  const closeEditSubCategoryModal = useExpenseCloseEditSubCategoryModal()
  const setError = useExpenseSetError()

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Hooks
  const createSubCategory = useCreateExpenseSubCategory()
  const updateSubCategory = useUpdateExpenseSubCategory()
  const { data: existingSubCategory } = useExpenseSubCategory(editingSubCategoryId || '')
  const { data: categories = [] } = useExpenseCategories({ isActive: true })

  // Load existing subcategory data in edit mode
  useEffect(() => {
    if (isEditMode && existingSubCategory) {
      setName(existingSubCategory.name)
      setDescription(existingSubCategory.description || '')
      setCategoryId(existingSubCategory.categoryId)
      setIsActive(existingSubCategory.isActive)
    } else {
      // Reset form when creating new
      setName('')
      setDescription('')
      setCategoryId(selectedCategoryIdFromStore || '')
      setIsActive(true)
    }
    setValidationErrors({})
  }, [isEditMode, existingSubCategory, selectedCategoryIdFromStore])

  const handleClose = () => {
    setName('')
    setDescription('')
    setCategoryId('')
    setIsActive(true)
    setValidationErrors({})
    if (isCreateOpen) {
      closeCreateSubCategoryModal()
    } else {
      closeEditSubCategoryModal()
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!name.trim()) {
      errors.name = 'SubCategory name is required'
    } else if (name.trim().length < 2) {
      errors.name = 'SubCategory name must be at least 2 characters'
    } else if (name.trim().length > 50) {
      errors.name = 'SubCategory name must be less than 50 characters'
    }

    if (!categoryId) {
      errors.categoryId = 'Please select a category'
    }

    if (description && description.length > 200) {
      errors.description = 'Description must be less than 200 characters'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      if (isEditMode && editingSubCategoryId) {
        // Update existing subcategory
        await updateSubCategory.mutateAsync({
          id: editingSubCategoryId,
          data: {
            name: name.trim(),
            description: description.trim() || undefined,
            categoryId,
            isActive
          }
        })
      } else {
        // Create new subcategory
        await createSubCategory.mutateAsync({
          name: name.trim(),
          description: description.trim() || undefined,
          categoryId
        })
      }

      handleClose()
    } catch (error: any) {
      setError(error.message || 'Failed to save subcategory')
    }
  }

  const isSaving = createSubCategory.isPending || updateSubCategory.isPending

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEditMode ? 'Edit SubCategory' : 'Create New SubCategory'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the expense subcategory details below.'
              : 'Add a new subcategory to organize expense items.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="categoryId" className="text-sm font-medium">
              Parent Category <span className="text-red-500">*</span>
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={isSaving}>
              <SelectTrigger className={validationErrors.categoryId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.categoryId && (
              <p className="text-sm text-red-500">{validationErrors.categoryId}</p>
            )}
          </div>

          {/* SubCategory Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              SubCategory Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Electricity Bill, Staff Salary"
              className={validationErrors.name ? 'border-red-500' : ''}
              disabled={isSaving}
              autoFocus
            />
            {validationErrors.name && (
              <p className="text-sm text-red-500">{validationErrors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this subcategory..."
              rows={3}
              className={validationErrors.description ? 'border-red-500' : ''}
              disabled={isSaving}
            />
            {validationErrors.description && (
              <p className="text-sm text-red-500">{validationErrors.description}</p>
            )}
            <p className="text-xs text-gray-500">
              {description.length}/200 characters
            </p>
          </div>

          {/* Active Status */}
          {isEditMode && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="text-sm font-medium">
                  Active Status
                </Label>
                <p className="text-sm text-gray-600">
                  {isActive ? 'SubCategory is currently active' : 'SubCategory is currently inactive'}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={isSaving}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-black hover:bg-gray-800 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? 'Update' : 'Create'} SubCategory
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}