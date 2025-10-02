import React, { useState, useEffect } from 'react'
import { X, Save, Loader2, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

import {
  useCreateExpenseEntry,
  useUpdateExpenseEntry,
  useExpenseEntry
} from '@/hooks/useExpenses'
import { CreateExpenseEntryData, UpdateExpenseEntryData } from '@/lib/types/expenses'
import expenseData from '@/data/expenses.json'
import { useAuth } from '@/contexts/AuthContext'

interface ExpenseEntryModalProps {
  isOpen: boolean
  onClose: () => void
  editingEntryId?: string | null
}

export const ExpenseEntryModal: React.FC<ExpenseEntryModalProps> = ({
  isOpen,
  onClose,
  editingEntryId
}) => {
  const isEditMode = !!editingEntryId

  // Form state
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [categoryId, setCategoryId] = useState('')
  const [subCategoryId, setSubCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Bank Transfer' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Cheque'>('Cash')
  const [vendor, setVendor] = useState('')
  const [status, setStatus] = useState<'Paid' | 'Pending' | 'Cancelled'>('Paid')
  const [receiptNumber, setReceiptNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Hooks
  const { currentUser } = useAuth()
  const createEntry = useCreateExpenseEntry()
  const updateEntry = useUpdateExpenseEntry()
  const { data: existingEntry } = useExpenseEntry(editingEntryId || '')

  // Get categories and subcategories from expenses.json
  const categories = expenseData.categories.map(cat => ({
    id: cat.category,
    name: cat.category
  }))

  const subCategories = categoryId
    ? expenseData.categories
        .find(cat => cat.category === categoryId)
        ?.subCategories.map(sub => ({
          id: sub.name,
          name: sub.name
        })) || []
    : []

  // Load existing entry data in edit mode
  useEffect(() => {
    if (isEditMode && existingEntry) {
      setDate(new Date(existingEntry.date))
      setCategoryId(existingEntry.categoryId)
      setSubCategoryId(existingEntry.subCategoryId)
      setDescription(existingEntry.description)
      setAmount(existingEntry.amount.toString())
      setPaymentMode(existingEntry.paymentMode)
      setVendor(existingEntry.vendor || '')
      setStatus(existingEntry.status)
      setReceiptNumber(existingEntry.receiptNumber || '')
      setNotes(existingEntry.notes || '')
    }
  }, [isEditMode, existingEntry])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDate(new Date())
      setCategoryId('')
      setSubCategoryId('')
      setDescription('')
      setAmount('')
      setPaymentMode('Cash')
      setVendor('')
      setStatus('Paid')
      setReceiptNumber('')
      setNotes('')
      setValidationErrors({})
    }
  }, [isOpen])

  // Reset subcategory when category changes
  useEffect(() => {
    if (!isEditMode) {
      setSubCategoryId('')
    }
  }, [categoryId, isEditMode])

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!date) errors.date = 'Date is required'
    if (!categoryId) errors.categoryId = 'Category is required'
    if (!subCategoryId) errors.subCategoryId = 'SubCategory is required'
    if (!description.trim()) errors.description = 'Description is required'
    if (!amount || parseFloat(amount) <= 0) errors.amount = 'Valid amount is required'

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    if (!currentUser?.uid) {
      setValidationErrors({ submit: 'Please log in to create expenses' })
      return
    }

    try {
      const data: CreateExpenseEntryData = {
        date: date ? format(date, 'yyyy-MM-dd') : '',
        categoryId,
        subCategoryId,
        description,
        amount: parseFloat(amount),
        paymentMode,
        vendor: vendor || undefined,
        status,
        receiptNumber: receiptNumber || undefined,
        notes: notes || undefined
      }

      if (isEditMode && editingEntryId) {
        await updateEntry.mutateAsync({
          id: editingEntryId,
          data: data as UpdateExpenseEntryData,
          userId: currentUser.uid
        })
      } else {
        await createEntry.mutateAsync({
          data,
          userId: currentUser.uid
        })
      }

      onClose()
    } catch (error: any) {
      console.error('Error saving expense entry:', error)
      setValidationErrors({ submit: error.message || 'Failed to save expense entry' })
    }
  }

  const isSaving = createEntry.isPending || updateEntry.isPending

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEditMode ? 'Edit Expense' : 'Add New Expense'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update expense entry details' : 'Create a new expense entry'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <Label htmlFor="date">Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-gray-500",
                    validationErrors.date && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={false}
                />
              </PopoverContent>
            </Popover>
            {validationErrors.date && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.date}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className={validationErrors.categoryId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.categoryId && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.categoryId}</p>
            )}
          </div>

          {/* SubCategory */}
          <div>
            <Label htmlFor="subCategory">SubCategory *</Label>
            <Select value={subCategoryId} onValueChange={setSubCategoryId} disabled={!categoryId}>
              <SelectTrigger className={validationErrors.subCategoryId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                {subCategories.map((subCat) => (
                  <SelectItem key={subCat.id} value={subCat.id}>
                    {subCat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.subCategoryId && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.subCategoryId}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter expense description"
              className={validationErrors.description ? 'border-red-500' : ''}
            />
            {validationErrors.description && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.description}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={validationErrors.amount ? 'border-red-500' : ''}
            />
            {validationErrors.amount && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.amount}</p>
            )}
          </div>

          {/* Payment Mode */}
          <div>
            <Label htmlFor="paymentMode">Payment Mode *</Label>
            <Select value={paymentMode} onValueChange={(value: any) => setPaymentMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="Debit Card">Debit Card</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vendor */}
          <div>
            <Label htmlFor="vendor">Vendor</Label>
            <Input
              id="vendor"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="Enter vendor name"
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status *</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Receipt Number */}
          <div>
            <Label htmlFor="receiptNumber">Receipt Number</Label>
            <Input
              id="receiptNumber"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              placeholder="Enter receipt number"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes"
              rows={3}
            />
          </div>

          {/* Submit Error */}
          {validationErrors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {validationErrors.submit}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
                  {isEditMode ? 'Update' : 'Create'} Expense
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
