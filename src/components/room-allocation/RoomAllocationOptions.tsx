import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'
import type { RoomAllocation } from '@/services/room.service'

interface RoomAllocationOptionsProps {
  allocationOptions: RoomAllocation[][]
  selectedOptionIndex: number
  onSelectOption: (index: number) => void
  totalGuestsAllocated: number
  guestCount: number
}

const optionLabels = [
  'Comfort-First Allocation',
  'Price-Optimized Allocation', 
  'Minimal Rooms Allocation'
]

const optionDescriptions = [
  'Prioritizes guest comfort with preferred room types',
  'Optimizes for lowest total cost',
  'Uses minimum number of rooms'
]

export default function RoomAllocationOptions({
  allocationOptions,
  selectedOptionIndex,
  onSelectOption,
  totalGuestsAllocated,
  guestCount
}: RoomAllocationOptionsProps) {
  if (!allocationOptions.length) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Room Allocation Options</h3>
        <div className="text-sm text-gray-600">
          {totalGuestsAllocated} of {guestCount} guests allocated
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {allocationOptions.map((option, index) => {
          const totalCost = option.reduce((sum, room) => sum + room.tariff, 0)
          const isSelected = selectedOptionIndex === index

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onSelectOption(index)}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    {optionLabels[index] || `Option ${index + 1}`}
                  </h4>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  {optionDescriptions[index] || 'Custom allocation option'}
                </p>
                
                <div className="space-y-1">
                  <div className="text-sm text-gray-700">
                    Rooms: {option.length}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    Total: {formatCurrency(totalCost)}
                  </div>
                </div>

                <div className="space-y-1">
                  {option.map((room, roomIndex) => (
                    <div key={roomIndex} className="text-xs text-gray-600">
                      {room.room_number} - {room.guest_count} guests
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}