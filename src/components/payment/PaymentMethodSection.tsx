import { motion } from 'framer-motion'
import { CreditCard, QrCode } from 'lucide-react'

interface PaymentMethodSectionProps {
  selectedPaymentMethod: string
  errors: Record<string, string>
  onPaymentMethodChange: (method: string) => void
}

export default function PaymentMethodSection({
  selectedPaymentMethod,
  errors,
  onPaymentMethodChange
}: PaymentMethodSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-900 rounded-lg">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onPaymentMethodChange('jubair_qr')}
          className={`p-6 border-2 rounded-lg transition-colors ${
            selectedPaymentMethod === 'jubair_qr'
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <QrCode className="w-6 h-6 text-gray-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Jubair QR Code</div>
              <div className="text-sm text-gray-600">Scan to pay via Jubair</div>
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onPaymentMethodChange('basha_qr')}
          className={`p-6 border-2 rounded-lg transition-colors ${
            selectedPaymentMethod === 'basha_qr'
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <QrCode className="w-6 h-6 text-gray-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Basha QR Code</div>
              <div className="text-sm text-gray-600">Scan to pay via Basha</div>
            </div>
          </div>
        </motion.button>
      </div>

      {errors.paymentMethod && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-600 text-sm mt-2"
        >
          {errors.paymentMethod}
        </motion.p>
      )}
    </motion.div>
  )
}