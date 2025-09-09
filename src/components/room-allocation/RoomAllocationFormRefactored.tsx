import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { useRoomAllocation } from '@/hooks/useRoomAllocation'
import RoomAllocationOptions from './RoomAllocationOptions'
import RoomCard from './RoomCard'
import AllocationSummary from './AllocationSummary'
import type { RoomAllocation } from '@/services/room.service'

interface RoomAllocationFormProps {
  guestCount: number
  guestType: string
  checkInDate: string
  checkOutDate: string
  currentAllocations?: RoomAllocation[]
  onRoomAllocationChange: (allocation: RoomAllocation[]) => void
  onNext: () => void
  onBack: () => void
}

export default function RoomAllocationFormRefactored({
  guestCount,
  guestType,
  checkInDate,
  checkOutDate,
  currentAllocations = [],
  onRoomAllocationChange,
  onNext,
  onBack
}: RoomAllocationFormProps) {
  const {
    rooms,
    allocatedRooms,
    allocationOptions,
    selectedOptionIndex,
    isLoading,
    totalTariff,
    totalGuestsAllocated,
    selectAllocationOption,
    addRoomAllocation,
    removeRoomAllocation,
    updateRoomAllocation
  } = useRoomAllocation({
    guestCount,
    guestType,
    checkInDate,
    checkOutDate,
    currentAllocations,
    onAllocationChange: onRoomAllocationChange
  })

  if (isLoading) {
    return <LoadingSpinner message="Finding available rooms..." />
  }

  if (rooms.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            No Available Rooms
          </h3>
          <p className="text-yellow-600 mb-4">
            Sorry, no rooms are available for the selected dates and guest count. 
            Please try different dates or contact us directly.
          </p>
          <Button onClick={onBack} variant="outline">
            Go Back
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Automatic Allocation Options */}
      {allocationOptions.length > 0 && (
        <RoomAllocationOptions
          allocationOptions={allocationOptions}
          selectedOptionIndex={selectedOptionIndex}
          onSelectOption={selectAllocationOption}
          totalGuestsAllocated={totalGuestsAllocated}
          guestCount={guestCount}
        />
      )}

      {/* Manual Room Allocation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Manual Room Allocation</h3>
          <Button
            onClick={addRoomAllocation}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Room</span>
          </Button>
        </div>

        {allocatedRooms.length > 0 ? (
          <div className="space-y-4">
            {allocatedRooms.map((allocation, index) => (
              <RoomCard
                key={allocation.id}
                allocation={allocation}
                rooms={rooms}
                onUpdate={updateRoomAllocation}
                onRemove={removeRoomAllocation}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500 mb-4">
              No rooms manually allocated yet
            </p>
            <Button onClick={addRoomAllocation} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Room
            </Button>
          </div>
        )}
      </div>

      {/* Allocation Summary */}
      <AllocationSummary
        allocatedRooms={allocatedRooms}
        totalTariff={totalTariff}
        totalGuestsAllocated={totalGuestsAllocated}
        guestCount={guestCount}
        onNext={onNext}
        onBack={onBack}
      />
    </div>
  )
}