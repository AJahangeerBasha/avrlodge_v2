import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { PaymentCalculation } from '@/services/payment.service'

interface PaymentSummaryProps {
  calculation: PaymentCalculation
  discountType: 'percentage' | 'amount' | 'none'
}

export default function PaymentSummary({
  calculation,
  discountType
}: PaymentSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-900 rounded-lg">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Final Summary</h2>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Room Tariff</span>
          <span className="font-medium">₹{calculation.roomTariff}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Special Charges</span>
          <span className="font-medium">₹{calculation.specialChargesTotal}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">₹{calculation.subtotal}</span>
        </div>
        {discountType !== 'none' && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span className="font-medium">-₹{calculation.discount}</span>
          </div>
        )}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-lg font-semibold text-gray-900">Total Amount</span>
            <span className="text-2xl font-bold text-gray-900">₹{calculation.total}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}