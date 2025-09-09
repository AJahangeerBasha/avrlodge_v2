import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { RoomAllocation } from '@/services/room.service'

interface AllocationSummaryProps {
  allocatedRooms: RoomAllocation[]
  totalTariff: number
  totalGuestsAllocated: number
  guestCount: number
  onNext?: () => void
  onBack?: () => void
}

export default function AllocationSummary({
  allocatedRooms,
  totalTariff,
  totalGuestsAllocated,
  guestCount,
  onNext,
  onBack
}: AllocationSummaryProps) {
  const isAllocationComplete = totalGuestsAllocated === guestCount
  const hasRoomsAllocated = allocatedRooms.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 p-6 rounded-lg"
    >
      <h3 className="text-lg font-medium text-gray-900 mb-4">Allocation Summary</h3>
      
      <div className="space-y-4">
        {/* Guest Allocation Status */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Guests Allocated:</span>
          <div className="flex items-center space-x-2">
            <span className={`font-medium ${
              isAllocationComplete ? 'text-green-600' : 'text-orange-600'
            }`}>
              {totalGuestsAllocated} / {guestCount}
            </span>
            {isAllocationComplete ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-orange-600" />
            )}
          </div>
        </div>

        {/* Room Count */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Rooms:</span>
          <span className="font-medium text-gray-900">{allocatedRooms.length}</span>
        </div>

        {/* Total Cost */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <span className="text-lg font-medium text-gray-900">Total Cost:</span>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(totalTariff)}
          </span>
        </div>

        {/* Room Details */}
        {hasRoomsAllocated && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Room Details:</h4>
            {allocatedRooms.map((room, index) => (
              <div 
                key={room.id} 
                className="flex items-center justify-between text-sm bg-white p-2 rounded"
              >
                <span className="text-gray-700">
                  {room.room_number} ({room.guest_count} guests)
                </span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(room.tariff)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Status Messages */}
        {!hasRoomsAllocated && (
          <div className="flex items-center space-x-2 text-orange-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>No rooms allocated yet. Please select allocation options above.</span>
          </div>
        )}

        {hasRoomsAllocated && !isAllocationComplete && (
          <div className="flex items-center space-x-2 text-orange-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>
              {guestCount - totalGuestsAllocated} guest{guestCount - totalGuestsAllocated !== 1 ? 's' : ''} still need allocation.
            </span>
          </div>
        )}

        {isAllocationComplete && (
          <div className="flex items-center space-x-2 text-green-600 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>All guests have been allocated to rooms.</span>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {(onNext || onBack) && (
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
            >
              Back
            </Button>
          )}
          
          {onNext && (
            <Button
              type="button"
              onClick={onNext}
              disabled={!isAllocationComplete || !hasRoomsAllocated}
              className="ml-auto"
            >
              Continue to Payment
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}