import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

import {
  useExpenseIsCreateCategoryModalOpen,
  useExpenseIsEditCategoryModalOpen,
  useExpenseEditingCategoryId,
  useExpenseCloseCreateCategoryModal,
  useExpenseCloseEditCategoryModal,
  useExpenseSetError
} from '@/stores/expenseStore'
import {
  useCreateExpenseCategory,
  useUpdateExpenseCategory,
  useExpenseCategory
} from '@/hooks/useExpenses'

export const ExpenseCategoryModal = () => {
  const isCreateOpen = useExpenseIsCreateCategoryModalOpen()
  const isEditOpen = useExpenseIsEditCategoryModalOpen()
  const editingCategoryId = useExpenseEditingCategoryId()
  const isOpen = isCreateOpen || isEditOpen
  const isEditMode = isEditOpen && !!editingCategoryId

  const closeCreateCategoryModal = useExpenseCloseCreateCategoryModal()
  const closeEditCategoryModal = useExpenseCloseEditCategoryModal()
  const setError = useExpenseSetError()

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Hooks
  const createCategory = useCreateExpenseCategory()
  const updateCategory = useUpdateExpenseCategory()
  const { data: existingCategory } = useExpenseCategory(editingCategoryId || '')

  // Load existing category data in edit mode
  useEffect(() => {
    if (isEditMode && existingCategory) {
      setName(existingCategory.name)
      setDescription(existingCategory.description || '')
      setIsActive(existingCategory.isActive)
    } else {
      // Reset form when creating new
      setName('')
      setDescription('')
      setIsActive(true)
    }
    setValidationErrors({})
  }, [isEditMode, existingCategory])

  const handleClose = () => {
    setName('')
    setDescription('')
    setIsActive(true)
    setValidationErrors({})
    if (isCreateOpen) {
      closeCreateCategoryModal()
    } else {
      closeEditCategoryModal()
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!name.trim()) {
      errors.name = 'Category name is required'
    } else if (name.trim().length < 2) {
      errors.name = 'Category name must be at least 2 characters'
    } else if (name.trim().length > 50) {
      errors.name = 'Category name must be less than 50 characters'
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
      if (isEditMode && editingCategoryId) {
        // Update existing category
        await updateCategory.mutateAsync({
          id: editingCategoryId,
          data: {
            name: name.trim(),
            description: description.trim() || undefined,
            isActive
          }
        })
      } else {
        // Create new category
        await createCategory.mutateAsync({
          name: name.trim(),
          description: description.trim() || undefined
        })
      }

      handleClose()
    } catch (error: any) {
      setError(error.message || 'Failed to save category')
    }
  }

  const isSaving = createCategory.isPending || updateCategory.isPending

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEditMode ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the expense category details below.'
              : 'Add a new expense category to organize your expenses.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Utilities, Maintenance, Salaries"
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
              placeholder="Brief description of this expense category..."
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
                  {isActive ? 'Category is currently active' : 'Category is currently inactive'}
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
                  {isEditMode ? 'Update' : 'Create'} Category
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}