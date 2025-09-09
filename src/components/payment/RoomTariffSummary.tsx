import { motion } from 'framer-motion'
import { Calculator } from 'lucide-react'
import { RoomAllocation } from '@/services/payment.service'

interface RoomTariffSummaryProps {
  roomAllocations: RoomAllocation[]
  totalTariff: number
  numberOfDays: number
}

export default function RoomTariffSummary({
  roomAllocations,
  totalTariff,
  numberOfDays
}: RoomTariffSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-900 rounded-lg">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Room Tariff Summary</h2>
      </div>

      <div className="space-y-4">
        {roomAllocations.map((room, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <div className="font-medium text-gray-900">{room.room_number} - {room.room_type}</div>
              <div className="text-sm text-gray-600">{room.guest_count} guests</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900">₹{room.tariff}/night</div>
              <div className="text-sm text-gray-600">Capacity: {room.capacity}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total Room Tariff</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-gray-900">₹{totalTariff}</span>
            <div className="text-sm text-gray-500">
              {numberOfDays} night{numberOfDays !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}