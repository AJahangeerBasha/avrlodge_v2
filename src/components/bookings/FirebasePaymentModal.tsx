import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  DollarSign,
  Banknote,
  CheckCircle,
  AlertCircle,
  QrCode
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Payment } from '@/lib/types/payments'
import { createPayment, getPaymentsByReservationId } from '@/lib/payments'

interface Booking {
  id: string
  reference_number: string
  guest_name: string
  guest_email: string
  guest_phone: string
  total_quote: number
  total_paid: number
  remaining_balance: number
  status: 'reservation' | 'booking' | 'checked_in' | 'checked_out' | 'cancelled'
}

interface FirebasePaymentModalProps {
  booking: Booking
  isOpen: boolean
  onClose: () => void
  onPaymentComplete: () => void
}

export function FirebasePaymentModal({
  booking,
  isOpen,
  onClose,
  onPaymentComplete
}: FirebasePaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'jubair_qr' | 'basha_qr' | 'cash'>('cash')
  const [amount, setAmount] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [processing, setProcessing] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loadingPayments, setLoadingPayments] = useState(true)
  const { toast } = useToast()
  const { currentUser } = useAuth()

  // Load payment history function - defined first to avoid hoisting issues
  const loadPaymentHistory = useCallback(async () => {
    try {
      setLoadingPayments(true)
      const paymentHistory = await getPaymentsByReservationId(booking.id)
      setPayments(paymentHistory)
    } catch (error) {
      console.error('Error loading payment history:', error)
    } finally {
      setLoadingPayments(false)
    }
  }, [booking.id])

  // Calculate payment totals from actual payment history
  const calculatePaymentTotals = useCallback(() => {
    const totalPaid = payments
      .filter(payment => payment.paymentStatus === 'completed')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0)

    const remainingBalance = Math.max(0, (booking.total_quote || 0) - totalPaid)
    return { totalPaid, remainingBalance }
  }, [payments, booking.total_quote])

  // Load payment history when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPaymentHistory()
    }
  }, [isOpen, loadPaymentHistory])

  // Update amount when payments change
  useEffect(() => {
    if (!loadingPayments) {
      const { remainingBalance } = calculatePaymentTotals()
      setAmount(remainingBalance.toString())
    }
  }, [payments, loadingPayments, calculatePaymentTotals])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handlePayment = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to process payments.",
        variant: "destructive",
      })
      return
    }

    try {
      setProcessing(true)
      
      const paymentAmount = parseFloat(amount)
      const { remainingBalance } = calculatePaymentTotals()
      if (paymentAmount <= 0 || paymentAmount > remainingBalance) {
        throw new Error('Invalid payment amount')
      }

      // Store the actual payment method name as selected by user
      let actualPaymentMethod = ''
      switch (paymentMethod) {
        case 'jubair_qr':
          actualPaymentMethod = 'Jubair QR'
          break
        case 'basha_qr':
          actualPaymentMethod = 'Basha QR'
          break
        case 'cash':
          actualPaymentMethod = 'Cash'
          break
        default:
          actualPaymentMethod = 'Cash'
      }

      const paymentData = {
        reservationId: booking.id,
        amount: paymentAmount,
        paymentMethod: actualPaymentMethod,
        transactionId: transactionId.trim() || undefined,
        paymentDate: new Date().toISOString()
      }

      await createPayment(paymentData, currentUser.uid)
      
      toast({
        title: "Payment Successful",
        description: `Payment of ${formatCurrency(paymentAmount)} recorded successfully`,
      })
      
      onPaymentComplete()
      onClose()
    } catch (error) {
      console.error('Error processing payment:', error)
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to process payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const isFullPayment = parseFloat(amount || '0') >= calculatePaymentTotals().remainingBalance


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
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Payment Management
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
            <div className="flex-1 overflow-y-auto p-6">
              {/* Payment Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Summary
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(booking.total_quote)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid Amount:</span>
                    <span className="font-semibold text-green-600">
                      {loadingPayments ? '...' : formatCurrency(calculatePaymentTotals().totalPaid)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-semibold text-red-600">
                        {loadingPayments ? '...' : formatCurrency(calculatePaymentTotals().remainingBalance)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>


              {/* Payment Method */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Payment Method
                </Label>
                <div className="space-y-3">
                  {/* Jubair QR */}
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="jubair_qr"
                      checked={paymentMethod === 'jubair_qr'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'jubair_qr' | 'basha_qr' | 'cash')}
                      className="w-4 h-4 text-green-600 focus:ring-green-500 focus:ring-2"
                    />
                    <QrCode className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Jubair QR</p>
                      <p className="text-xs text-gray-500">UPI Payment via Jubair QR Code</p>
                    </div>
                  </label>

                  {/* Basha QR */}
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="basha_qr"
                      checked={paymentMethod === 'basha_qr'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'jubair_qr' | 'basha_qr' | 'cash')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <QrCode className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Basha QR</p>
                      <p className="text-xs text-gray-500">UPI Payment via Basha QR Code</p>
                    </div>
                  </label>

                  {/* Cash */}
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'jubair_qr' | 'basha_qr' | 'cash')}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500 focus:ring-2"
                    />
                    <Banknote className="w-5 h-5 text-orange-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Cash</p>
                      <p className="text-xs text-gray-500">Physical cash payment</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Amount */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Payment Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₹
                  </span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8 pr-4 py-3 bg-gray-50 border-gray-200"
                    placeholder="Enter amount"
                    min="0"
                    max={calculatePaymentTotals().remainingBalance}
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: {loadingPayments ? '...' : formatCurrency(calculatePaymentTotals().remainingBalance)}
                </p>
              </div>

              {/* Transaction ID (for QR payments) */}
              {(paymentMethod === 'jubair_qr' || paymentMethod === 'basha_qr') && (
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Transaction ID <span className="text-gray-400">(Optional)</span>
                  </Label>
                  <Input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="bg-gray-50 border-gray-200"
                    placeholder="Enter transaction reference"
                  />
                </div>
              )}


              {/* Payment Status */}
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    {isFullPayment ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {isFullPayment ? 'Full Payment' : 'Partial Payment'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {isFullPayment 
                          ? 'This will complete the payment for this booking'
                          : 'This will be recorded as a partial payment'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions - Fixed at bottom */}
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
                  onClick={handlePayment}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={processing || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > calculatePaymentTotals().remainingBalance}
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Record Payment
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