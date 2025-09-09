import { 
  createReservation, 
  updateReservation, 
  deleteReservation, 
  getReservationById 
} from '../reservations'
import { 
  createReservationRoomsBatch, 
  getReservationRoomsByReservationId, 
  deleteReservationRoomsByReservationId,
  getReservationRoomSummary
} from '../reservationRooms'
import { isRoomAvailable } from '../reservations'
import { CreateReservationData } from '../types/reservations'
import { CreateReservationRoomData } from '../types/reservationRooms'

// Complete reservation with rooms data
export interface CompleteReservationData {
  reservation: CreateReservationData
  rooms: CreateReservationRoomData[]
}

// Create complete reservation with rooms
export const createCompleteReservation = async (
  data: CompleteReservationData,
  userId: string
): Promise<{ reservationId: string; referenceNumber: string; roomIds: string[] }> => {
  try {
    // Validate that at least one room is provided
    if (!data.rooms || data.rooms.length === 0) {
      throw new Error('At least one room must be specified for the reservation')
    }
    
    // Check room availability for all rooms
    const availabilityChecks = await Promise.all(
      data.rooms.map(async (room) => {
        const isAvailable = await isRoomAvailable(
          room.roomId,
          data.reservation.checkInDate,
          data.reservation.checkOutDate
        )
        return { roomId: room.roomId, roomNumber: room.roomNumber, isAvailable }
      })
    )
    
    // Check if any rooms are unavailable
    const unavailableRooms = availabilityChecks.filter(check => !check.isAvailable)
    if (unavailableRooms.length > 0) {
      const roomNumbers = unavailableRooms.map(room => room.roomNumber).join(', ')
      throw new Error(`The following rooms are not available for the selected dates: ${roomNumbers}`)
    }
    
    // Create the reservation first
    const { id: reservationId, referenceNumber } = await createReservation(data.reservation, userId)
    
    try {
      // Add reservation ID to all room data
      const roomsWithReservationId = data.rooms.map(room => ({
        ...room,
        reservationId
      }))
      
      // Create all reservation rooms in batch
      const roomIds = await createReservationRoomsBatch(roomsWithReservationId, userId)
      
      return {
        reservationId,
        referenceNumber,
        roomIds
      }
    } catch (roomError) {
      // If room creation fails, clean up the reservation
      console.error('Error creating reservation rooms, cleaning up reservation:', roomError)
      try {
        await deleteReservation(reservationId, userId)
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError)
      }
      throw roomError
    }
  } catch (error) {
    console.error('Error creating complete reservation:', error)
    throw error
  }
}

// Update reservation and optionally manage rooms
export const updateCompleteReservation = async (
  reservationId: string,
  reservationData: Partial<CreateReservationData>,
  roomsData?: CreateReservationRoomData[],
  userId: string
): Promise<void> => {
  try {
    // Update the reservation
    if (Object.keys(reservationData).length > 0) {
      await updateReservation(reservationId, {
        ...reservationData,
        updatedBy: userId,
        updatedAt: new Date().toISOString()
      })
    }
    
    // If rooms data is provided, replace all existing rooms
    if (roomsData && roomsData.length > 0) {
      // First, delete existing reservation rooms
      await deleteReservationRoomsByReservationId(reservationId, userId)
      
      // If new dates are provided, check availability
      const reservation = await getReservationById(reservationId)
      if (reservation) {
        const checkInDate = reservationData.checkInDate || reservation.checkInDate
        const checkOutDate = reservationData.checkOutDate || reservation.checkOutDate
        
        // Check room availability for all new rooms
        const availabilityChecks = await Promise.all(
          roomsData.map(async (room) => {
            const isAvailable = await isRoomAvailable(
              room.roomId,
              checkInDate,
              checkOutDate,
              reservationId // Exclude current reservation from availability check
            )
            return { roomId: room.roomId, roomNumber: room.roomNumber, isAvailable }
          })
        )
        
        // Check if any rooms are unavailable
        const unavailableRooms = availabilityChecks.filter(check => !check.isAvailable)
        if (unavailableRooms.length > 0) {
          const roomNumbers = unavailableRooms.map(room => room.roomNumber).join(', ')
          throw new Error(`The following rooms are not available for the selected dates: ${roomNumbers}`)
        }
      }
      
      // Add reservation ID to all room data
      const roomsWithReservationId = roomsData.map(room => ({
        ...room,
        reservationId
      }))
      
      // Create new reservation rooms
      await createReservationRoomsBatch(roomsWithReservationId, userId)
    }
  } catch (error) {
    console.error('Error updating complete reservation:', error)
    throw error
  }
}

// Delete complete reservation (with all associated rooms)
export const deleteCompleteReservation = async (
  reservationId: string,
  userId: string
): Promise<void> => {
  try {
    // Delete all associated reservation rooms first
    await deleteReservationRoomsByReservationId(reservationId, userId)
    
    // Then delete the reservation
    await deleteReservation(reservationId, userId)
  } catch (error) {
    console.error('Error deleting complete reservation:', error)
    throw error
  }
}

// Get complete reservation with rooms
export const getCompleteReservation = async (reservationId: string) => {
  try {
    const [reservation, roomSummary] = await Promise.all([
      getReservationById(reservationId),
      getReservationRoomSummary(reservationId)
    ])
    
    if (!reservation) {
      return null
    }
    
    return {
      reservation,
      rooms: roomSummary?.rooms || [],
      summary: roomSummary
    }
  } catch (error) {
    console.error('Error getting complete reservation:', error)
    throw error
  }
}

// Validate room dates against reservation dates
export const validateRoomDatesAgainstReservation = (
  reservationCheckIn: string,
  reservationCheckOut: string,
  roomCheckIn?: string,
  roomCheckOut?: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  const resCheckIn = new Date(reservationCheckIn)
  const resCheckOut = new Date(reservationCheckOut)
  
  if (roomCheckIn) {
    const roomCheckInDate = new Date(roomCheckIn)
    if (roomCheckInDate < resCheckIn) {
      errors.push('Room check-in cannot be before reservation check-in date')
    }
    if (roomCheckInDate > resCheckOut) {
      errors.push('Room check-in cannot be after reservation check-out date')
    }
  }
  
  if (roomCheckOut) {
    const roomCheckOutDate = new Date(roomCheckOut)
    if (roomCheckOutDate < resCheckIn) {
      errors.push('Room check-out cannot be before reservation check-in date')
    }
    if (roomCheckOutDate > resCheckOut) {
      errors.push('Room check-out cannot be after reservation check-out date')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Calculate total reservation cost from rooms
export const calculateTotalReservationCost = (
  rooms: CreateReservationRoomData[],
  stayDuration: number
): { totalRoomTariff: number; totalGuests: number } => {
  const totalRoomTariff = rooms.reduce((sum, room) => {
    return sum + (room.tariffPerNight * stayDuration)
  }, 0)
  
  const totalGuests = rooms.reduce((sum, room) => {
    return sum + (room.guestCount || 1)
  }, 0)
  
  return {
    totalRoomTariff,
    totalGuests
  }
}

// Get reservation occupancy summary
export const getReservationOccupancySummary = async (
  checkInDate: string,
  checkOutDate: string
) => {
  try {
    const reservationRooms = await import('../reservationRooms')
    
    // Get all reservation rooms that overlap with the specified date range
    const overlappingRooms = await reservationRooms.getAllReservationRooms({
      checkInDateFrom: checkInDate,
      checkOutDateTo: checkOutDate
    })
    
    // Group by room status
    const statusCounts = overlappingRooms.reduce((acc, room) => {
      acc[room.roomStatus] = (acc[room.roomStatus] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Group by room type
    const roomTypeCounts = overlappingRooms.reduce((acc, room) => {
      acc[room.roomType] = (acc[room.roomType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalRooms: overlappingRooms.length,
      statusBreakdown: statusCounts,
      roomTypeBreakdown: roomTypeCounts,
      rooms: overlappingRooms
    }
  } catch (error) {
    console.error('Error getting reservation occupancy summary:', error)
    throw error
  }
}

// Bulk check-in for multiple rooms in a reservation
export const bulkCheckInReservationRooms = async (
  reservationId: string,
  checkInDatetime: string,
  checkedInBy: string,
  checkInNotes?: string
): Promise<void> => {
  try {
    const rooms = await getReservationRoomsByReservationId(reservationId)
    const pendingRooms = rooms.filter(room => room.roomStatus === 'pending')
    
    if (pendingRooms.length === 0) {
      throw new Error('No pending rooms found for check-in')
    }
    
    const { checkInReservationRoom } = await import('../reservationRooms')
    
    // Check in all pending rooms
    await Promise.all(
      pendingRooms.map(room =>
        checkInReservationRoom(room.id, {
          checkInDatetime,
          checkedInBy,
          checkInNotes,
          roomStatus: 'checked_in'
        })
      )
    )
  } catch (error) {
    console.error('Error during bulk check-in:', error)
    throw error
  }
}

// Bulk check-out for multiple rooms in a reservation
export const bulkCheckOutReservationRooms = async (
  reservationId: string,
  checkOutDatetime: string,
  checkedOutBy: string,
  checkOutNotes?: string
): Promise<void> => {
  try {
    const rooms = await getReservationRoomsByReservationId(reservationId)
    const checkedInRooms = rooms.filter(room => room.roomStatus === 'checked_in')
    
    if (checkedInRooms.length === 0) {
      throw new Error('No checked-in rooms found for check-out')
    }
    
    const { checkOutReservationRoom } = await import('../reservationRooms')
    
    // Check out all checked-in rooms
    await Promise.all(
      checkedInRooms.map(room =>
        checkOutReservationRoom(room.id, {
          checkOutDatetime,
          checkedOutBy,
          checkOutNotes,
          roomStatus: 'checked_out'
        })
      )
    )
  } catch (error) {
    console.error('Error during bulk check-out:', error)
    throw error
  }
}