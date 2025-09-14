import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Home, ArrowRight, Search, Users, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { getRoomsWithType, getRoomByNumber } from '@/lib/rooms'
import { deleteReservationRoom, createReservationRoom } from '@/lib/reservationRooms'
import { updateRoomCheckinDocuments } from '@/lib/roomCheckinDocuments'

interface Room {
  id: string
  room_number: string
  room_type: string
  guest_count: number
  room_status?: 'pending' | 'checked_in' | 'checked_out'
  check_in_datetime?: string | null
  check_out_datetime?: string | null
}

interface Booking {
  id: string
  reference_number: string
  guest_name: string
  reservation_rooms?: Room[]
}

interface RoomOption {
  id: string
  roomNumber: string
  roomType?: {
    id: string
    name: string
    pricePerNight: number
    maxGuests: number
  }
  status: 'available' | 'occupied' | 'maintenance' | 'reserved'
  isActive: boolean
}

interface RoomChangeModalProps {
  isOpen: boolean
  onClose: () => void
  booking: Booking | null
  room: Room | null
  onSuccess?: () => void
}

export default function RoomChangeModal({
  isOpen,
  onClose,
  booking,
  room,
  onSuccess
}: RoomChangeModalProps) {
  const [availableRooms, setAvailableRooms] = useState<RoomOption[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [confirmation, setConfirmation] = useState('')

  const { toast } = useToast()
  const { currentUser } = useAuth()

  // Load available rooms
  const loadAvailableRooms = async () => {
    try {
      setLoadingRooms(true)
      const rooms = await getRoomsWithType({
        isActive: true,
        status: 'available' // Only show available rooms
      })
      setAvailableRooms(rooms)
    } catch (error) {
      console.error('Error loading available rooms:', error)
      toast({
        title: "Error",
        description: "Failed to load available rooms.",
        variant: "destructive",
      })
    } finally {
      setLoadingRooms(false)
    }
  }

  // Load rooms when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAvailableRooms()
      setSelectedRoomId('')
      setSearchTerm('')
      setRoomTypeFilter('all')
      setConfirmation('')
    }
  }, [isOpen])

  // Filter available rooms
  const filteredRooms = availableRooms.filter(roomOption => {
    // Exclude current room from options (compare by room number)
    if (room && roomOption.roomNumber === room.room_number) return false

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      if (!roomOption.roomNumber.toLowerCase().includes(searchLower) &&
          !roomOption.roomType?.name.toLowerCase().includes(searchLower)) {
        return false
      }
    }

    // Room type filter
    if (roomTypeFilter !== 'all') {
      if (roomOption.roomType?.id !== roomTypeFilter) {
        return false
      }
    }

    return true
  })

  // Get unique room types for filter
  const roomTypes = Array.from(
    new Set(availableRooms.map(room => room.roomType?.id).filter(Boolean))
  ).map(typeId => {
    const room = availableRooms.find(r => r.roomType?.id === typeId)
    return {
      id: typeId!,
      name: room?.roomType?.name || 'Unknown'
    }
  })

  // Get selected room details
  const selectedRoom = availableRooms.find(r => r.id === selectedRoomId)

  // Handle room change
  const handleRoomChange = async () => {
    if (!currentUser || !booking || !room || !selectedRoom) {
      toast({
        title: "Error",
        description: "Missing required information.",
        variant: "destructive",
      })
      return
    }

    // Require confirmation
    if (confirmation !== 'CHANGE') {
      toast({
        title: "Confirmation Required",
        description: 'Please type "CHANGE" to confirm.',
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Step 1: Get the actual room IDs for document updates
      const oldRoom = await getRoomByNumber(room.room_number)
      if (!oldRoom) {
        throw new Error(`Old room ${room.room_number} not found`)
      }

      // Step 2: Update any check-in documents to reference the new room
      try {
        await updateRoomCheckinDocuments(booking.id, oldRoom.id, selectedRoom.id, currentUser.uid)
      } catch (docError) {
        console.warn('Error updating documents:', docError)
        // Continue with room change even if document update fails
      }

      // Step 3: Delete the old reservation room assignment first
      if (room.id) {
        await deleteReservationRoom(room.id, currentUser.uid)
      }

      // Step 4: Create new reservation room assignment
      const newRoomData = {
        reservationId: booking.id,
        roomId: selectedRoom.id,
        roomNumber: selectedRoom.roomNumber,
        roomType: selectedRoom.roomType?.name || 'Unknown',
        guestCount: room.guest_count || 1,
        tariffPerNight: selectedRoom.roomType?.pricePerNight || 0,
        roomStatus: room.room_status || 'pending',
        checkInDatetime: room.check_in_datetime || undefined,
        checkOutDatetime: room.check_out_datetime || undefined,
        checkedInBy: room.room_status === 'checked_in' ? currentUser.uid : null,
        checkInNotes: null
      }

      const newReservationRoomId = await createReservationRoom(newRoomData, currentUser.uid)

      // Step 5: Create room change history entry
      try {
        await createRoomChangeHistory({
          reservationId: booking.id,
          fromRoomId: oldRoom.id,
          fromRoomNumber: room.room_number,
          fromRoomType: room.room_type,
          toRoomId: selectedRoom.id,
          toRoomNumber: selectedRoom.roomNumber,
          toRoomType: selectedRoom.roomType?.name,
          changeReason: 'Manual room change',
          guestCount: room.guest_count,
          preservedStatus: room.room_status,
          preservedCheckInDate: room.check_in_datetime,
          preservedCheckOutDate: room.check_out_datetime,
          notes: `Room changed from ${room.room_number} to ${selectedRoom.roomNumber} by admin`
        }, currentUser.uid, currentUser.displayName || currentUser.email || 'Admin User')
      } catch (historyError) {
        console.warn('Failed to create room change history:', historyError)
        // Don't fail the room change if history creation fails
      }

      toast({
        title: "Room Changed Successfully",
        description: `Room changed from ${room.room_number} to ${selectedRoom.roomNumber}`,
      })

      // Call success callback and close modal
      if (onSuccess) {
        onSuccess()
      }
      onClose()

    } catch (error) {
      console.error('Error changing room:', error)
      toast({
        title: "Room Change Failed",
        description: error instanceof Error ? error.message : "Failed to change room. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !booking || !room) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Change Room Assignment
                </h3>
                <p className="text-sm text-gray-500">
                  {booking.reference_number} • {booking.guest_name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Room Info */}
          <div className="p-6 bg-yellow-50 border-b border-yellow-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Home className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Current Assignment</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="font-medium">Room {room.room_number}</span>
                  <span>•</span>
                  <span>{room.room_type}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {room.guest_count} guest{room.guest_count !== 1 ? 's' : ''}
                  </span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    room.room_status === 'checked_in'
                      ? 'bg-green-100 text-green-700'
                      : room.room_status === 'checked_out'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {room.room_status?.replace('_', ' ') || 'pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Room Selection */}
          <div className="flex-1 overflow-auto p-6">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Search Rooms
                </Label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by room number or type..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Room Type
                </Label>
                <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                  <SelectTrigger className="bg-white border border-gray-300">
                    <SelectValue placeholder="All room types" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-[100] max-h-60 overflow-y-auto">
                    <SelectItem value="all" className="hover:bg-gray-100">All Room Types</SelectItem>
                    {roomTypes.map(type => (
                      <SelectItem key={type.id} value={type.id} className="hover:bg-gray-100">
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Available Rooms List */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Available Rooms ({filteredRooms.length})
              </h4>

              {loadingRooms ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading available rooms...</span>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No available rooms found</p>
                  <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredRooms.map((roomOption) => (
                    <div
                      key={roomOption.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedRoomId === roomOption.id
                          ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-200'
                          : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedRoomId(roomOption.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            selectedRoomId === roomOption.id
                              ? 'bg-blue-100'
                              : 'bg-gray-100'
                          }`}>
                            <Home className={`w-4 h-4 ${
                              selectedRoomId === roomOption.id
                                ? 'text-blue-600'
                                : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              Room {roomOption.roomNumber}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{roomOption.roomType?.name}</span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Max {roomOption.roomType?.maxGuests} guests
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ₹{roomOption.roomType?.pricePerNight}/night
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedRoomId === roomOption.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedRoomId === roomOption.id && (
                            <div className="w-full h-full rounded-full bg-blue-500"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Change Preview */}
            {selectedRoom && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-3">Room Change Preview</h4>
                <div className="flex items-center gap-4">
                  {/* From */}
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center">
                      <Home className="w-3 h-3 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium">Room {room.room_number}</div>
                      <div className="text-gray-500">{room.room_type}</div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="w-4 h-4 text-blue-600" />

                  {/* To */}
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                      <Home className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Room {selectedRoom.roomNumber}</div>
                      <div className="text-gray-500">{selectedRoom.roomType?.name}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Input */}
            {selectedRoom && (
              <div className="mt-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Type "CHANGE" to confirm room change
                </Label>
                <Input
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="Type CHANGE to confirm"
                  className="mb-4"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center gap-4 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoomChange}
              disabled={!selectedRoom || confirmation !== 'CHANGE' || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Changing Room...
                </div>
              ) : (
                `Change to Room ${selectedRoom?.roomNumber || ''}`
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}