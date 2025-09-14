import { motion } from 'framer-motion'
import { Percent } from 'lucide-react'

interface DiscountSectionProps {
  discountType: 'percentage' | 'amount' | 'none'
  discountValue: number
  onDiscountTypeChange: (type: 'percentage' | 'amount' | 'none') => void
  onDiscountValueChange: (value: number) => void
}

export default function DiscountSection({
  discountType,
  discountValue,
  onDiscountTypeChange,
  onDiscountValueChange
}: DiscountSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-900 rounded-lg">
          <Percent className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Discount</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
          <select
            value={discountType}
            onChange={(e) => onDiscountTypeChange(e.target.value as 'percentage' | 'amount' | 'none')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="none">No Discount</option>
            <option value="percentage">Percentage (%)</option>
            <option value="amount">Fixed Amount (₹)</option>
          </select>
        </div>

        {(discountType === 'percentage' || discountType === 'amount') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
            </label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => onDiscountValueChange(parseFloat(e.target.value) || 0)}
              min="0"
              max={discountType === 'percentage' ? 100 : undefined}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder={discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}