import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  DollarSign, 
  CreditCard, 
  Banknote,
  CheckCircle,
  AlertCircle,
  Receipt
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

interface Booking {
  id: string
  guest_name: string
  guest_email: string
  total_amount: number
  payment_status: string
  payment_received?: number
}

interface PaymentModalProps {
  booking: Booking
  isOpen: boolean
  onClose: () => void
  onPaymentComplete: () => void
}

export function PaymentModal({ 
  booking, 
  isOpen, 
  onClose, 
  onPaymentComplete 
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amount, setAmount] = useState(booking.total_amount.toString())
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handlePayment = async () => {
    try {
      setProcessing(true)
      
      const response = await fetch(`/api/manager/bookings/${booking.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          payment_status: parseFloat(amount) >= booking.total_amount ? 'full' : 'partial'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Payment Successful",
          description: `Payment of ${formatCurrency(parseFloat(amount))} recorded successfully`,
        })
        onPaymentComplete()
      } else {
        throw new Error(data.error || 'Failed to process payment')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const remainingAmount = booking.total_amount - (booking.payment_received || 0)
  const isFullPayment = parseFloat(amount) >= remainingAmount

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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Payment Management
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {booking.guest_name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Payment Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Payment Summary
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(booking.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Paid Amount:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(booking.payment_received || 0)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(remainingAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Payment Method
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4" />
                        Cash
                      </div>
                    </SelectItem>
                    <SelectItem value="card">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Credit/Debit Card
                      </div>
                    </SelectItem>
                    <SelectItem value="upi">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4" />
                        UPI
                      </div>
                    </SelectItem>
                    <SelectItem value="bank_transfer">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        Bank Transfer
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Amount */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
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
                    className="pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    placeholder="Enter amount"
                    min="0"
                    max={remainingAmount}
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Maximum: {formatCurrency(remainingAmount)}
                </p>
              </div>

              {/* Payment Status */}
              <div className="mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    {isFullPayment ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {isFullPayment ? 'Full Payment' : 'Partial Payment'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {isFullPayment 
                          ? 'This will complete the payment for this booking'
                          : 'This will be recorded as a partial payment'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Payment Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Payment Details
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Booking ID:</span>
                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                      {booking.id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Guest Email:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {booking.guest_email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Current Status:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {booking.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Payment Instructions
                </h3>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Cash Payment:</strong> Collect cash and mark as received
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Card Payment:</strong> Process through card machine
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>UPI Payment:</strong> Use UPI ID: resort@upi
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Bank Transfer:</strong> Account: 1234567890, IFSC: RESO0001234
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions - Fixed at bottom */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex-shrink-0">
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
                  disabled={processing || !amount || parseFloat(amount) <= 0}
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