import { useState, useCallback, useEffect } from 'react'
import { RoomService, type RoomAllocation, type RoomAvailabilityParams, type RoomWithAllocation } from '@/services/room.service'

interface UseRoomAllocationProps {
  guestCount: number
  guestType: string
  checkInDate: string
  checkOutDate: string
  currentAllocations?: RoomAllocation[]
  onAllocationChange: (allocations: RoomAllocation[]) => void
}

export function useRoomAllocation({
  guestCount,
  guestType,
  checkInDate,
  checkOutDate,
  currentAllocations = [],
  onAllocationChange
}: UseRoomAllocationProps) {
  const [rooms, setRooms] = useState<RoomWithAllocation[]>([])
  const [allocatedRooms, setAllocatedRooms] = useState<RoomAllocation[]>(currentAllocations)
  const [allocationOptions, setAllocationOptions] = useState<RoomAllocation[][]>([])
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const generateAllocationOptions = useCallback((availableRooms: RoomWithAllocation[]) => {
    if (!availableRooms.length || !guestCount) return

    const options: RoomAllocation[][] = []
    
    // Option 1: Comfort-first allocation
    const comfortFirst = RoomService.generateComfortFirstAllocation(
      availableRooms, 
      guestCount, 
      guestType
    )
    if (comfortFirst.length > 0) options.push(comfortFirst)

    // Option 2: Price-optimized allocation
    const priceOptimized = RoomService.generatePriceOptimizedAllocation(
      availableRooms, 
      guestCount
    )
    if (priceOptimized.length > 0) options.push(priceOptimized)

    // Option 3: Minimal rooms allocation
    const minimalRooms = RoomService.generateMinimalRoomsAllocation(
      availableRooms, 
      guestCount
    )
    if (minimalRooms.length > 0) options.push(minimalRooms)

    setAllocationOptions(options)
    
    if (options.length > 0) {
      setAllocatedRooms(options[0])
      onAllocationChange(options[0])
      setSelectedOptionIndex(0)
    }
  }, [guestCount, guestType, onAllocationChange])

  const loadAvailableRooms = useCallback(async () => {
    if (!checkInDate || !checkOutDate || !guestCount) return

    setIsLoading(true)
    try {
      const availableRooms = await RoomService.getAvailableRooms({
        checkInDate,
        checkOutDate,
        guestCount,
        guestType
      })
      setRooms(availableRooms || [])
      generateAllocationOptions(availableRooms || [])
    } catch (error) {
      console.error('Error loading available rooms:', error)
      setRooms([])
    } finally {
      setIsLoading(false)
    }
  }, [checkInDate, checkOutDate, guestCount, guestType, generateAllocationOptions])


  const selectAllocationOption = useCallback((index: number) => {
    if (index >= 0 && index < allocationOptions.length) {
      setSelectedOptionIndex(index)
      setAllocatedRooms(allocationOptions[index])
      onAllocationChange(allocationOptions[index])
    }
  }, [allocationOptions, onAllocationChange])

  const addRoomAllocation = useCallback(() => {
    if (rooms.length === 0) return
    
    const availableRooms = rooms.filter(room => 
      !allocatedRooms.some(alloc => alloc.room_id === room.id)
    )
    
    const firstAvailableRoom = availableRooms[0]
    if (!firstAvailableRoom) return
    
    const newAllocation: RoomAllocation = {
      id: crypto.randomUUID(),
      room_id: firstAvailableRoom.id,
      room_number: firstAvailableRoom.room_number,
      room_type: firstAvailableRoom.room_type,
      capacity: firstAvailableRoom.capacity,
      tariff: firstAvailableRoom.tariff,
      guest_count: 1
    }

    const updatedAllocations = [...allocatedRooms, newAllocation]
    setAllocatedRooms(updatedAllocations)
    onAllocationChange(updatedAllocations)
  }, [rooms, allocatedRooms, onAllocationChange])

  const removeRoomAllocation = useCallback((id: string) => {
    const updatedAllocations = allocatedRooms.filter(alloc => alloc.id !== id)
    setAllocatedRooms(updatedAllocations)
    onAllocationChange(updatedAllocations)
  }, [allocatedRooms, onAllocationChange])

  const updateRoomAllocation = useCallback((id: string, updates: Partial<RoomAllocation>) => {
    setAllocatedRooms(prev => {
      const newAllocations = prev.map(alloc => {
        if (alloc.id === id) {
          return { ...alloc, ...updates }
        }
        return alloc
      })
      onAllocationChange(newAllocations)
      return newAllocations
    })
  }, [onAllocationChange])

  const totalTariff = allocatedRooms.reduce((sum, room) => sum + room.tariff, 0)
  const totalGuestsAllocated = allocatedRooms.reduce((sum, room) => sum + room.guest_count, 0)

  useEffect(() => {
    loadAvailableRooms()
  }, [loadAvailableRooms])

  useEffect(() => {
    setAllocatedRooms(currentAllocations)
  }, [currentAllocations])

  return {
    rooms,
    allocatedRooms,
    allocationOptions,
    selectedOptionIndex,
    isLoading,
    totalTariff,
    totalGuestsAllocated,
    loadAvailableRooms,
    selectAllocationOption,
    addRoomAllocation,
    removeRoomAllocation,
    updateRoomAllocation
  }
}