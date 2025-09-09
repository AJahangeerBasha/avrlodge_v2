import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Building, Calculator, Settings, Users, Edit3 } from 'lucide-react'
import { supabaseQueries } from '@/lib/database'

interface Room {
  id: string
  room_number: string
  room_type: string
  capacity: number
  tariff: number
  is_available: boolean
}

interface RoomAllocation {
  id: string;
  room_id: string;
  room_number: string;
  room_type: string;
  capacity: number;
  tariff: number;
  guest_count: number;
}

interface RoomAllocationFormProps {
  guestCount: number
  guestType: string
  checkInDate: string
  checkOutDate: string
  currentAllocations?: RoomAllocation[]
  isEditMode?: boolean
  onRoomAllocationChange: (allocation: RoomAllocation[]) => void
  onNext: () => void
  onBack: () => void
}

export default function RoomAllocationForm({
  guestCount,
  guestType,
  checkInDate,
  checkOutDate,
  currentAllocations = [],
  isEditMode = false,
  onRoomAllocationChange,
  onNext,
  onBack
}: RoomAllocationFormProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [allocatedRooms, setAllocatedRooms] = useState<RoomAllocation[]>(currentAllocations)
  const [allocationOptions, setAllocationOptions] = useState<RoomAllocation[][]>([])
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isManualMode, setIsManualMode] = useState(isEditMode || currentAllocations.length > 0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Room types for dropdown
  const roomTypes = Array.from(new Set(rooms.map(room => room.room_type))).map(type => ({ value: type, label: type }))

  const generateComfortFirstAllocation = useCallback(() => {
    const allocation: RoomAllocation[] = []
    let remainingGuests = guestCount

    // Define room type priorities (higher index = higher priority)
    const roomTypePriority = {
      'Couple': 1,
      'Quad': 2,
      'Family': 3,
      'Dormitory': 4
    }

    // Smart allocation prioritizing rooms that minimize extra person charges
    const smartSortRooms = (guests: number) => {
      return rooms
        .filter(room => room.is_available !== false)
        .sort((a, b) => {
          // First priority: prefer rooms that can accommodate guests without extra charges
          const aCanAccommodate = a.capacity >= guests ? 1 : 0
          const bCanAccommodate = b.capacity >= guests ? 1 : 0

          if (aCanAccommodate !== bCanAccommodate) {
            return bCanAccommodate - aCanAccommodate // Rooms that can accommodate get priority
          }

          // Second priority: minimize wasted capacity (prefer closest match)
          if (aCanAccommodate && bCanAccommodate) {
            const aWaste = a.capacity - guests
            const bWaste = b.capacity - guests
            if (aWaste !== bWaste) {
              return aWaste - bWaste // Less waste is better
            }
          }

          // Third priority: room type preference
          const aPriority = roomTypePriority[a.room_type as keyof typeof roomTypePriority] || 5
          const bPriority = roomTypePriority[b.room_type as keyof typeof roomTypePriority] || 5

          if (aPriority !== bPriority) {
            return aPriority - bPriority
          }

          // Fourth priority: price per guest (lower is better)
          const aPricePerGuest = a.tariff / a.capacity
          const bPricePerGuest = b.tariff / b.capacity

          return aPricePerGuest - bPricePerGuest
        })
    }

    // Auto-allocation logic based on guest type and count
    if (guestType === 'couple' && guestCount <= 2) {
      // For couples, prioritize couple rooms that can accommodate without extra charges
      const coupleRoom = smartSortRooms(guestCount).find(room =>
        room.room_type === 'Couple' && room.capacity >= guestCount
      )
      if (coupleRoom) {
        allocation.push({
          id: crypto.randomUUID(),
          room_id: coupleRoom.id,
          room_number: coupleRoom.room_number,
          room_type: coupleRoom.room_type,
          capacity: coupleRoom.capacity,
          tariff: coupleRoom.tariff,
          guest_count: guestCount
        })
        remainingGuests = 0
      }
    } else if (guestType === 'family' && guestCount <= 6) {
      // For families, try to get a single room that can accommodate all guests
      const familyRoom = smartSortRooms(guestCount).find(room =>
        room.room_type === 'Family' && room.capacity >= guestCount
      )
      if (familyRoom) {
        allocation.push({
          id: crypto.randomUUID(),
          room_id: familyRoom.id,
          room_number: familyRoom.room_number,
          room_type: familyRoom.room_type,
          capacity: familyRoom.capacity,
          tariff: familyRoom.tariff,
          guest_count: guestCount
        })
        remainingGuests = 0
      }
    }

    // If no single room allocation or for larger groups, use smart allocation
    if (remainingGuests > 0) {
      const sortedRooms = smartSortRooms(remainingGuests)

      // Allocate rooms optimally
      for (const room of sortedRooms) {
        if (remainingGuests <= 0) break

        // Calculate optimal guests for this room
        let guestsForThisRoom = Math.min(room.capacity, remainingGuests)

        // For rooms that can accommodate remaining guests, allocate all
        if (room.capacity >= remainingGuests) {
          guestsForThisRoom = remainingGuests
        }

        allocation.push({
          id: crypto.randomUUID(),
          room_id: room.id,
          room_number: room.room_number,
          room_type: room.room_type,
          capacity: room.capacity,
          tariff: room.tariff,
          guest_count: guestsForThisRoom
        })
        remainingGuests -= guestsForThisRoom
      }
    }

    return allocation
  }, [guestCount, guestType, rooms])

  const generatePriceOptimizedAllocation = useCallback(() => {
    const allocation: RoomAllocation[] = []
    let remainingGuests = guestCount

    // Sort rooms by price optimization with smart capacity matching
    const sortedRooms = rooms
      .filter(room => room.is_available !== false)
      .sort((a, b) => {
        // First priority: prefer rooms that can accommodate guests without extra charges
        const aCanAccommodate = a.capacity >= remainingGuests ? 1 : 0
        const bCanAccommodate = b.capacity >= remainingGuests ? 1 : 0

        if (aCanAccommodate !== bCanAccommodate) {
          return bCanAccommodate - aCanAccommodate
        }

        // Second priority: price per guest (lowest first)
        const aPricePerGuest = a.tariff / a.capacity
        const bPricePerGuest = b.tariff / b.capacity

        if (aPricePerGuest !== bPricePerGuest) {
          return aPricePerGuest - bPricePerGuest
        }

        // Third priority: minimize wasted capacity
        if (aCanAccommodate && bCanAccommodate) {
          const aWaste = a.capacity - remainingGuests
          const bWaste = b.capacity - remainingGuests
          return aWaste - bWaste
        }

        return 0
      })

    for (const room of sortedRooms) {
      if (remainingGuests <= 0) break

      // Prefer to allocate all remaining guests to rooms that can accommodate them
      const guestsForThisRoom = room.capacity >= remainingGuests ?
        remainingGuests : Math.min(room.capacity, remainingGuests)

      allocation.push({
        id: crypto.randomUUID(),
        room_id: room.id,
        room_number: room.room_number,
        room_type: room.room_type,
        capacity: room.capacity,
        tariff: room.tariff,
        guest_count: guestsForThisRoom
      })
      remainingGuests -= guestsForThisRoom
    }

    return allocation
  }, [guestCount, rooms])

  const generateMinimalRoomsAllocation = useCallback(() => {
    const allocation: RoomAllocation[] = []
    let remainingGuests = guestCount

    // Sort rooms to minimize number of rooms while avoiding extra charges
    const sortedRooms = rooms
      .filter(room => room.is_available !== false)
      .sort((a, b) => {
        // First priority: prefer rooms that can accommodate all remaining guests
        const aCanAccommodateAll = a.capacity >= remainingGuests ? 1 : 0
        const bCanAccommodateAll = b.capacity >= remainingGuests ? 1 : 0

        if (aCanAccommodateAll !== bCanAccommodateAll) {
          return bCanAccommodateAll - aCanAccommodateAll
        }

        // Second priority: highest capacity to minimize room count
        if (aCanAccommodateAll && bCanAccommodateAll) {
          // Among rooms that can accommodate all, prefer smaller waste
          const aWaste = a.capacity - remainingGuests
          const bWaste = b.capacity - remainingGuests
          return aWaste - bWaste
        }

        // For rooms that cannot accommodate all, prefer highest capacity
        return b.capacity - a.capacity
      })

    for (const room of sortedRooms) {
      if (remainingGuests <= 0) break

      // If room can accommodate all remaining guests, allocate all
      const guestsForThisRoom = room.capacity >= remainingGuests ?
        remainingGuests : Math.min(room.capacity, remainingGuests)

      allocation.push({
        id: crypto.randomUUID(),
        room_id: room.id,
        room_number: room.room_number,
        room_type: room.room_type,
        capacity: room.capacity,
        tariff: room.tariff,
        guest_count: guestsForThisRoom
      })
      remainingGuests -= guestsForThisRoom
    }

    return allocation
  }, [guestCount, rooms])

  const generateAllocationOptions = useCallback(() => {
    const options: RoomAllocation[][] = []

    // Option 1: Comfort-first allocation (current logic)
    const comfortAllocation = generateComfortFirstAllocation()
    if (comfortAllocation.length > 0) {
      options.push(comfortAllocation)
    }

    // Option 2: Price-optimized allocation
    const priceAllocation = generatePriceOptimizedAllocation()
    if (priceAllocation.length > 0 && JSON.stringify(priceAllocation) !== JSON.stringify(comfortAllocation)) {
      options.push(priceAllocation)
    }

    // Option 3: Minimal rooms allocation
    const minimalAllocation = generateMinimalRoomsAllocation()
    if (minimalAllocation.length > 0 &&
      JSON.stringify(minimalAllocation) !== JSON.stringify(comfortAllocation) &&
      JSON.stringify(minimalAllocation) !== JSON.stringify(priceAllocation)) {
      options.push(minimalAllocation)
    }

    const availableRoomOptions: RoomAllocation[][] = options
      .flat()
      .filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.room_type === item.room_type)
      )
      .filter((item) => item.room_id) // keep only those with room_id
      .map((item) => [item]); // wrap each in its own array
    setAllocationOptions(availableRoomOptions)

    if (availableRoomOptions.length > 0 && allocatedRooms.length === 0) {
      setAllocatedRooms(availableRoomOptions[0])
      onRoomAllocationChange(availableRoomOptions[0])
      setSelectedOptionIndex(0)
    }
  }, [generateComfortFirstAllocation, generatePriceOptimizedAllocation, generateMinimalRoomsAllocation, onRoomAllocationChange, allocatedRooms.length])

  const loadAvailableRooms = useCallback(async () => {
    setIsLoading(true)
    try {
      const roomsData = await supabaseQueries.getRoomsWithCapacityOrdered(checkInDate, checkOutDate)
      
      // In edit mode, include all rooms (not just available ones) so existing allocated rooms can be selected
      if (isEditMode) {
        setRooms(roomsData)
      } else {
        // Filter available rooms for the date range (normal mode)
        const availableRooms = roomsData.filter((room: any) => room.is_available !== false)
        setRooms(availableRooms)
      }
    } catch (error) {
      console.error('Error loading rooms:', error)
    } finally {
      setIsLoading(false)
    }
  }, [checkInDate, checkOutDate, isEditMode])

  useEffect(() => {
    loadAvailableRooms()
  }, [checkInDate, checkOutDate, loadAvailableRooms])

  useEffect(() => {
    if (rooms.length > 0 && guestCount > 0 && !isManualMode) {
      generateAllocationOptions()
    }
  }, [rooms, guestCount, guestType, generateAllocationOptions, isManualMode])
  // Update allocated rooms when currentAllocations changes
  useEffect(() => {
    if (currentAllocations.length > 0) {
      setAllocatedRooms(currentAllocations)
      setIsManualMode(true)
      onRoomAllocationChange(currentAllocations)
    }
  }, [currentAllocations, onRoomAllocationChange])

  const selectAllocationOption = (index: number) => {
    setSelectedOptionIndex(index)
    setAllocatedRooms(allocationOptions[index])
    onRoomAllocationChange(allocationOptions[index])
  }

  const addRoomAllocation = () => {
    if (rooms.length === 0) return

    // Find first available room that's not already allocated
    const availableUnallocatedRooms = rooms.filter(room => {
      const isAvailable = room.is_available !== false
      const isNotAllocated = !allocatedRooms.some(alloc => alloc.room_id === room.id)
      return isAvailable && isNotAllocated
    })

    // Create new allocation with empty values if no room available for auto-selection
    const selectedRoom = availableUnallocatedRooms[0]
    
    const newAllocation: RoomAllocation = {
      id: crypto.randomUUID(), // Generate a unique ID
      room_id: selectedRoom?.id || '',
      room_number: selectedRoom?.room_number || '',
      room_type: selectedRoom?.room_type || '',
      capacity: selectedRoom?.capacity || 0,
      tariff: selectedRoom?.tariff || 0,
      guest_count: 1
    }

    const updatedAllocations = [...allocatedRooms, newAllocation]
    setAllocatedRooms(updatedAllocations)
    onRoomAllocationChange(updatedAllocations)
  }
  const removeRoomAllocation = (id: string) => {
    const updatedAllocations = allocatedRooms.filter(alloc => alloc.id !== id)
    setAllocatedRooms(updatedAllocations)
    onRoomAllocationChange(updatedAllocations)
  }

  const updateRoomAllocation = (id: string, updates: Partial<RoomAllocation>) => {
    setAllocatedRooms(prev => {
      const newAllocations = prev.map(alloc => {
        if (alloc.id === id) {
          return { ...alloc, ...updates }
        }
        return alloc
      })
      onRoomAllocationChange(newAllocations)
      return newAllocations
    })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (allocatedRooms.length === 0) {
      newErrors.allocation = 'Please allocate at least one room'
    } else {
      const totalAllocatedGuests = allocatedRooms.reduce((sum, room) => sum + room.guest_count, 0)
      if (totalAllocatedGuests !== guestCount) {
        newErrors.guestCount = `Total allocated guests (${totalAllocatedGuests}) must equal requested guests (${guestCount})`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext()
    }
  }

  const calculateTotalCost = () => {
    return allocatedRooms.reduce((total, room) => {
      const nights = Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))
      return total + (room.tariff * nights)
    }, 0)
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available rooms...</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-900 rounded-lg">
            <Building className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Room Allocation</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Guests:</span>
            <span className="font-medium">{guestCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Total Cost:</span>
            <span className="font-medium">₹{calculateTotalCost().toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Mode:</span>
            <span className="font-medium">{isManualMode ? 'Manual' : 'Auto'}</span>
          </div>
        </div>
      </motion.div>

      {/* Mode Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Allocation Mode</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Auto Mode Option */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsManualMode(false)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${!isManualMode
              ? 'border-gray-900 bg-gray-50 ring-2 ring-gray-900 ring-opacity-20'
              : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${!isManualMode ? 'border-gray-900' : 'border-gray-300'
                }`}>
                {!isManualMode && (
                  <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                )}
              </div>
              <Calculator className="w-5 h-5 text-gray-700" />
              <h4 className="font-medium text-gray-900">Auto Allocation</h4>
            </div>
            <p className="text-sm text-gray-600 ml-7">
              Choose from automatically generated room allocation options optimized for cost, comfort, or minimum rooms
            </p>
          </motion.div>

          {/* Manual Mode Option */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsManualMode(true)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${isManualMode
              ? 'border-gray-900 bg-gray-50 ring-2 ring-gray-900 ring-opacity-20'
              : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isManualMode ? 'border-gray-900' : 'border-gray-300'
                }`}>
                {isManualMode && (
                  <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                )}
              </div>
              <Edit3 className="w-5 h-5 text-gray-700" />
              <h4 className="font-medium text-gray-900">Manual Selection</h4>
            </div>
            <p className="text-sm text-gray-600 ml-7">
              Manually select and configure individual rooms with full control over room types and guest distribution
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Auto Allocation Options */}
      {!isManualMode && allocationOptions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Allocation Options</h3>
          <div className="space-y-3">
            {allocationOptions.map((option, index) => {
              const totalCost = option.reduce((sum, room) => {
                const nights = Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))
                return sum + (room.tariff * nights)
              }, 0)

              return (
                <motion.div
                  key={`option-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedOptionIndex === index
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                  onClick={() => selectAllocationOption(index)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Option {index + 1}: {option.length} room{option.length !== 1 ? 's' : ''}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {option.map((room, roomIndex) => (
                          <span key={`${room.room_id}-${roomIndex}`}>
                            {`${room.room_type} (${room.guest_count} guests)`}
                            {roomIndex < option.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{totalCost.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Total cost</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Manual Room Allocation */}
      {isManualMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Manual Room Allocation</h3>
            <button
              onClick={addRoomAllocation}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Add Room
            </button>
          </div>

          {allocatedRooms.map((allocation, index) => (
            <motion.div
              key={`${allocation.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg p-4 mb-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Room {index + 1}</h4>
                <button
                  onClick={() => removeRoomAllocation(allocation.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type
                  </label>
                  <select
                    value={allocation.room_type}
                    onChange={(e) => {
                      updateRoomAllocation(allocation.id, {
                        room_type: e.target.value,
                        room_id: '',
                        room_number: '',
                        capacity: 0,
                        tariff: 0,
                      })
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                  >
                    <option value="">Select a room type</option>
                    {roomTypes.map((type, typeIndex) => (
                      <option key={`type-${type.value}-${typeIndex}`} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Number
                  </label>
                  <select
                    value={allocation.room_id}
                    onChange={(e) => {
                      const selectedRoom = rooms.find(room => room.id === e.target.value);
                      if (selectedRoom) {
                        updateRoomAllocation(allocation.id, {
                          room_id: selectedRoom.id,
                          room_number: selectedRoom.room_number,
                          room_type: selectedRoom.room_type,
                          capacity: selectedRoom.capacity,
                          tariff: selectedRoom.tariff,
                        });
                      } 
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                  >
                    <option value="">Select a room</option>
                    {rooms
                      .filter(room => {
                        // Show room if:
                        // 1. It's available OR it's the currently selected room for this allocation (for edit mode)
                        // 2. It's not already selected in another allocation (except current one)
                        const isAlreadySelected = allocatedRooms.some(alloc => 
                          alloc.room_id === room.id && alloc.id !== allocation.id
                        )
                        const isCurrentlySelected = allocation.room_id === room.id
                        return (room.is_available !== false || isCurrentlySelected) && !isAlreadySelected
                      })
                      .map((room, roomIndex) => (
                        <option key={`room-${room.id}-${roomIndex}`} value={room.id}>
                          {/* {room.room_number} - {room.room_type} ({room.capacity} guests) - ₹{room.tariff}/night */}
                          {room.room_number} - ₹{room.tariff}/night

                          </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guest Count
                  </label>
                  <input
                    type="number"
                    value={allocation.guest_count}
                    onChange={(e) => updateRoomAllocation(allocation.id, { guest_count: parseInt(e.target.value) || 0 })}
                    min="1"
                    max={guestCount}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Can exceed room capacity. Extra guests will incur additional charges.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className={allocation.guest_count > allocation.capacity ? 'text-orange-600 font-medium' : 'text-gray-600'}>
                  Capacity: {allocation.capacity} guests
                  {allocation.guest_count > allocation.capacity && 
                    <span className="ml-1 text-orange-600">
                      (+{allocation.guest_count - allocation.capacity} extra)
                    </span>
                  }
                </span>
                <span className="text-gray-600">Tariff: ₹{allocation.tariff}/night</span>
              </div>
            </motion.div>
          ))}

          {allocatedRooms.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500"
            >
              <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No rooms allocated yet</p>
              <button
                onClick={addRoomAllocation}
                className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Add First Room
              </button>
            </motion.div>
          )}

          {errors.allocation && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 text-sm mt-2"
            >
              {errors.allocation}
            </motion.p>
          )}

          {errors.guestCount && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 text-sm mt-2"
            >
              {errors.guestCount}
            </motion.p>
          )}
        </motion.div>
      )}

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-between"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Back: Location & Dates
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          Next: Payment & Confirm
        </motion.button>
      </motion.div>
    </motion.div>
  )
}