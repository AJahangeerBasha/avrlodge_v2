import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Settings,
  Users,
  DollarSign,
  Calculator
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { useBookings } from '@/contexts/BookingsContext'
import { updateReservation } from '@/lib/reservations'

interface Booking {
  id: string
  reference_number: string
  guest_name: string
  guest_count: number
  total_quote: number
  total_paid?: number
  remaining_balance?: number
  // Fields from reservation that we need to update
  fixedDiscount?: number
  percentageDiscount?: number
  totalPrice?: number
  status: 'reservation' | 'booking' | 'checked_in' | 'checked_out' | 'cancelled'
}

interface AdditionalOptionsModalProps {
  booking: Booking
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function AdditionalOptionsModal({
  booking,
  isOpen,
  onClose,
  onUpdate
}: AdditionalOptionsModalProps) {
  const [guestCount, setGuestCount] = useState(booking.guest_count || 1)
  const [discountType, setDiscountType] = useState<'none' | 'percentage' | 'amount'>('none')
  const [discountValue, setDiscountValue] = useState(0)
  const [originalTotal, setOriginalTotal] = useState(booking.total_quote || 0)
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()
  const { currentUser } = useAuth()
  const { actions } = useBookings()

  // Load existing values when modal opens
  useEffect(() => {
    if (isOpen) {
      setGuestCount(booking.guest_count || 1)
      setOriginalTotal(booking.total_quote || 0)

      // Determine current discount type and value
      if (booking.fixedDiscount && booking.fixedDiscount > 0) {
        setDiscountType('amount')
        setDiscountValue(booking.fixedDiscount)
      } else if (booking.percentageDiscount && booking.percentageDiscount > 0) {
        setDiscountType('percentage')
        setDiscountValue(booking.percentageDiscount)
      } else {
        setDiscountType('none')
        setDiscountValue(0)
      }
    }
  }, [isOpen, booking])

  // Calculate totals similar to Payment Confirmation form
  const calculateTotals = useCallback(() => {
    const subtotal = originalTotal

    let discount = 0
    if (discountType === 'percentage') {
      discount = (subtotal * discountValue) / 100
    } else if (discountType === 'amount') {
      discount = discountValue
    }

    const finalTotal = Math.max(0, subtotal - discount)

    return { subtotal, discount, finalTotal }
  }, [originalTotal, discountType, discountValue])

  const { subtotal, discount, finalTotal } = calculateTotals()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleSubmit = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to update reservation details.",
        variant: "destructive",
      })
      return
    }

    try {
      setProcessing(true)

      // Prepare update data following the reservation types
      const updateData = {
        guestCount: guestCount,
        totalPrice: finalTotal,
        totalQuote: finalTotal, // Update both totalPrice and totalQuote
        updatedBy: currentUser.uid,
        updatedAt: new Date().toISOString()
      }

      // Add discount fields based on type
      if (discountType === 'percentage') {
        updateData.percentageDiscount = discountValue
        updateData.fixedDiscount = 0
      } else if (discountType === 'amount') {
        updateData.fixedDiscount = discountValue
        updateData.percentageDiscount = 0
      } else {
        updateData.fixedDiscount = 0
        updateData.percentageDiscount = 0
      }

      await updateReservation(booking.id, updateData)

      toast({
        title: "Reservation Updated",
        description: `Successfully updated guest count and pricing for ${booking.reference_number}`,
      })

      // Trigger BookingsContext refresh (this calls the parent's loadBookings function)
      actions.refreshBookings()

      // Trigger local component refresh
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error updating reservation:', error)
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update reservation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Additional Options
                  </h2>
                  <p className="text-sm text-gray-500">
                    {booking.guest_name} • {booking.reference_number}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Guest Count Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Guest Count</h3>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Number of Guests
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                    className="bg-gray-50 border-gray-200"
                    placeholder="Enter number of guests"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {booking.guest_count} guests
                  </p>
                </div>
              </div>

              {/* Original Total Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Original Total</h3>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Base Amount (before discount)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={originalTotal}
                    onChange={(e) => setOriginalTotal(parseFloat(e.target.value) || 0)}
                    className="bg-gray-50 border-gray-200"
                    placeholder="Enter original total"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {formatCurrency(booking.total_quote || 0)}
                  </p>
                </div>
              </div>

              {/* Discount Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Discount</h3>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Discount Type
                  </Label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'none' | 'percentage' | 'amount')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors"
                  >
                    <option value="none">No Discount</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="amount">Fixed Amount (₹)</option>
                  </select>
                </div>

                {discountType !== 'none' && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Discount Amount
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max={discountType === 'percentage' ? 100 : originalTotal}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                        className="pr-12 bg-gray-50 border-gray-200"
                        placeholder="0"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 text-sm">
                        {discountType === 'percentage' ? '%' : '₹'}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {booking.fixedDiscount ? `₹${booking.fixedDiscount}` :
                               booking.percentageDiscount ? `${booking.percentageDiscount}%` : 'No discount'}
                    </p>
                  </div>
                )}
              </div>

              {/* Calculation Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900">Calculation Summary</h4>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Total:</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount:</span>
                      <span className="font-medium">-{formatCurrency(discount)}</span>
                    </div>
                  )}

                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span className="text-gray-900">Final Total:</span>
                      <span className="text-green-600">{formatCurrency(finalTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={processing || finalTotal < 0}
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </div>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Update Reservation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}