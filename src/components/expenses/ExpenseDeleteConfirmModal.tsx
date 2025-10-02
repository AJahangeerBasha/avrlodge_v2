import React from 'react'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

import {
  useExpenseIsDeleteConfirmModalOpen,
  useExpenseDeletingCategoryId,
  useExpenseDeletingSubCategoryId,
  useExpenseCloseDeleteConfirmModal,
  useExpenseSetError
} from '@/stores/expenseStore'
import {
  useDeleteExpenseCategory,
  useDeleteExpenseSubCategory,
  useExpenseCategory,
  useExpenseSubCategory
} from '@/hooks/useExpenses'

export const ExpenseDeleteConfirmModal = () => {
  const isOpen = useExpenseIsDeleteConfirmModalOpen()
  const deletingCategoryId = useExpenseDeletingCategoryId()
  const deletingSubCategoryId = useExpenseDeletingSubCategoryId()
  const closeDeleteConfirmModal = useExpenseCloseDeleteConfirmModal()
  const setError = useExpenseSetError()

  const deleteCategory = useDeleteExpenseCategory()
  const deleteSubCategory = useDeleteExpenseSubCategory()

  const { data: category } = useExpenseCategory(deletingCategoryId || '')
  const { data: subCategory } = useExpenseSubCategory(deletingSubCategoryId || '')

  const isCategory = !!deletingCategoryId
  const isSubCategory = !!deletingSubCategoryId
  const targetName = category?.name || subCategory?.name || ''
  const targetType = isCategory ? 'category' : 'subcategory'

  const handleClose = () => {
    closeDeleteConfirmModal()
  }

  const handleDelete = async () => {
    try {
      if (isCategory && deletingCategoryId) {
        await deleteCategory.mutateAsync(deletingCategoryId)
      } else if (isSubCategory && deletingSubCategoryId) {
        await deleteSubCategory.mutateAsync(deletingSubCategoryId)
      }
      handleClose()
    } catch (error: any) {
      setError(error.message || 'Failed to delete')
    }
  }

  const isDeleting = deleteCategory.isPending || deleteSubCategory.isPending

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-600 flex items-center gap-2">
            <Trash2 className="h-6 w-6" />
            Delete {targetType === 'category' ? 'Category' : 'SubCategory'}
          </DialogTitle>
          <DialogDescription>
            This action will soft delete the {targetType}. You can restore it later if needed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning Alert */}
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <span className="font-medium">Warning:</span> You are about to delete{' '}
              <span className="font-semibold">"{targetName}"</span>.
              {isCategory && (
                <span className="block mt-1">
                  All associated subcategories and items will also be marked as inactive.
                </span>
              )}
            </AlertDescription>
          </Alert>

          {/* Confirmation Message */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">What happens next?</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>The {targetType} will be soft deleted (not permanently removed)</li>
              <li>It will no longer appear in active lists</li>
              <li>Historical data and references will be preserved</li>
              <li>You can restore it from inactive items if needed</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete {targetType === 'category' ? 'Category' : 'SubCategory'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}