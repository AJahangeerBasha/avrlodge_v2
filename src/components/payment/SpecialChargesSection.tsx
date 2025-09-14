import { motion } from 'framer-motion'
import { DollarSign } from 'lucide-react'
import { SpecialCharge } from '@/services/payment.service'

interface SpecialChargesSectionProps {
  specialCharges: SpecialCharge[]
  totalAmount: number
  onAddCustomCharge: () => void
  onAddDefaultCharge: (chargeType: string) => void
  onUpdateCharge: (id: string, field: keyof SpecialCharge, value: string | number) => void
  onRemoveCharge: (id: string) => void
}

const DEFAULT_SPECIAL_CHARGES = [
  { id: 'kitchen', name: 'Kitchen', defaultAmount: 2000, description: 'Per day' },
  { id: 'campfire', name: 'Campfire', defaultAmount: 300, description: 'Per day' },
  { id: 'conference', name: 'Conference Hall', defaultAmount: 5000, description: 'Per day' },
  { id: 'extra_person', name: 'Extra Person', defaultAmount: 300, description: 'Per person per day' }
]

export default function SpecialChargesSection({
  specialCharges,
  totalAmount,
  onAddCustomCharge,
  onAddDefaultCharge,
  onUpdateCharge,
  onRemoveCharge
}: SpecialChargesSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Special Charges</h2>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddCustomCharge}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Add Custom Charge
        </motion.button>
      </div>

      {/* Quick Add Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {DEFAULT_SPECIAL_CHARGES.map(charge => (
          <motion.button
            key={charge.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddDefaultCharge(charge.id)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            {charge.name} (₹{charge.defaultAmount})
          </motion.button>
        ))}
      </div>

      {/* Special Charges List */}
      <div className="space-y-4">
        {specialCharges.map((charge, index) => (
          <motion.div
            key={charge.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white"
          >
            <div className="flex-1">
              <input
                type="text"
                value={charge.name}
                onChange={(e) => onUpdateCharge(charge.id, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Charge name"
              />
            </div>
            <div className="w-32">
              <input
                type="number"
                value={charge.amount}
                onChange={(e) => onUpdateCharge(charge.id, 'amount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Rate"
              />
            </div>
            <div className="w-20">
              <input
                type="number"
                min="1"
                value={charge.quantity || 1}
                onChange={(e) => onUpdateCharge(charge.id, 'quantity', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Qty"
              />
            </div>
            <div className="w-24 text-right font-semibold">
              ₹{((charge.amount || 0) * (charge.quantity || 1)).toLocaleString()}
            </div>
            <div className="w-32">
              <input
                type="text"
                value={charge.description || ''}
                onChange={(e) => onUpdateCharge(charge.id, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Description"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onRemoveCharge(charge.id)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              Remove
            </motion.button>
          </motion.div>
        ))}
      </div>

      {specialCharges.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">Total Special Charges</span>
            <span className="font-bold text-gray-900">₹{totalAmount}</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}