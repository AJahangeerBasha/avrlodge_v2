import React, { useState } from 'react'
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { useExpenseIsImportModalOpen, useExpenseCloseImportModal, useExpenseSetError } from '@/stores/expenseStore'
import { useImportExpenseData } from '@/hooks/useExpenses'
import expenseData from '@/data/expenses.json'

export const ExpenseImportModal = () => {
  const isOpen = useExpenseIsImportModalOpen()
  const closeImportModal = useExpenseCloseImportModal()
  const setError = useExpenseSetError()
  const importData = useImportExpenseData()

  const [importStatus, setImportStatus] = useState<{
    type: 'idle' | 'success' | 'error'
    message: string
  }>({ type: 'idle', message: '' })

  const handleClose = () => {
    setImportStatus({ type: 'idle', message: '' })
    closeImportModal()
  }

  const handleImport = async () => {
    try {
      setImportStatus({ type: 'idle', message: '' })

      const result = await importData.mutateAsync(expenseData as any)

      if (result.errors.length > 0) {
        setImportStatus({
          type: 'error',
          message: `Imported ${result.success} categories with ${result.errors.length} errors: ${result.errors.join(', ')}`
        })
      } else {
        setImportStatus({
          type: 'success',
          message: `Successfully imported ${result.success} expense categories with their subcategories and items.`
        })
      }
    } catch (error: any) {
      setImportStatus({
        type: 'error',
        message: error.message || 'Failed to import expense data'
      })
      setError(error.message || 'Import failed')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Import Expense Data</DialogTitle>
          <DialogDescription>
            Import predefined expense categories, subcategories, and items from the default template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-gray-900">Data Preview</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                This will import <span className="font-semibold">{expenseData.categories.length} categories</span> including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                {expenseData.categories.slice(0, 5).map((cat, index) => (
                  <li key={index}>
                    <span className="font-medium">{cat.category}</span> - {cat.subCategories.length} subcategories
                  </li>
                ))}
                {expenseData.categories.length > 5 && (
                  <li className="text-gray-500">
                    ...and {expenseData.categories.length - 5} more categories
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Status Messages */}
          {importStatus.type === 'success' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {importStatus.message}
              </AlertDescription>
            </Alert>
          )}

          {importStatus.type === 'error' && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {importStatus.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Warning */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <span className="font-medium">Note:</span> This will add new expense categories to your system.
              Existing categories with the same names will not be affected.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={importData.isPending}
              className="flex-1"
            >
              {importStatus.type === 'success' ? 'Close' : 'Cancel'}
            </Button>
            {importStatus.type !== 'success' && (
              <Button
                onClick={handleImport}
                disabled={importData.isPending}
                className="flex-1 bg-black hover:bg-gray-800 text-white"
              >
                {importData.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Data
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}