import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import type { RoomAllocation, RoomWithAllocation } from '@/services/room.service'

interface RoomCardProps {
  allocation: RoomAllocation
  rooms: RoomWithAllocation[]
  onUpdate: (id: string, updates: Partial<RoomAllocation>) => void
  onRemove: (id: string) => void
  index: number
}

export default function RoomCard({
  allocation,
  rooms,
  onUpdate,
  onRemove,
  index
}: RoomCardProps) {
  const handleRoomChange = (roomId: string) => {
    const selectedRoom = rooms.find(r => r.id === roomId)
    if (selectedRoom) {
      onUpdate(allocation.id, {
        room_id: selectedRoom.id,
        room_number: selectedRoom.room_number,
        room_type: selectedRoom.room_type,
        capacity: selectedRoom.capacity,
        tariff: selectedRoom.tariff
      })
    }
  }

  const handleGuestCountChange = (guestCount: number) => {
    onUpdate(allocation.id, { guest_count: guestCount })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 bg-white border border-gray-200 rounded-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">Room {index + 1}</h4>
        <button
          onClick={() => onRemove(allocation.id)}
          className="text-red-600 hover:text-red-800 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Room
          </label>
          <select
            value={allocation.room_id}
            onChange={(e) => handleRoomChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose a room...</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.room_number} - {room.room_type} (Max: {room.capacity})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Guests
          </label>
          <select
            value={allocation.guest_count}
            onChange={(e) => handleGuestCountChange(parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!allocation.room_id}
          >
            {allocation.capacity && Array.from(
              { length: allocation.capacity }, 
              (_, i) => i + 1
            ).map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        {allocation.room_id && (
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-600">Room Tariff:</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(allocation.tariff)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}