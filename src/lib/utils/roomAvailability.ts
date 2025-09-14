import { getAllRooms } from '../rooms'
import { getAllReservations } from '../reservations'
import { getAllReservationRooms } from '../reservationRooms'
import type { Room } from '../types/rooms'

/**
 * Get available rooms for a specific date range
 * A room is considered unavailable if it has any reservation that overlaps with the requested date range
 */
export const getAvailableRoomsForDateRange = async (
  checkInDate: string,
  checkOutDate: string,
  excludeReservationId?: string // For edit mode - exclude current reservation
): Promise<Room[]> => {
  try {
    // Get all rooms that are active and available in general
    const allRooms = await getAllRooms()
    const availableRooms = allRooms.filter(room => 
      room.isActive && room.status === 'available'
    )

    // Get all active reservations that could conflict with the date range
    const allReservations = await getAllReservations()
    const activeReservations = allReservations.filter(reservation =>
      reservation.status !== 'cancelled' && 
      reservation.id !== excludeReservationId && // Exclude current reservation in edit mode
      reservation.deletedAt === null
    )

    // Get all reservation rooms for active reservations
    const allReservationRooms = await getAllReservationRooms()
    const activeReservationRooms = allReservationRooms.filter(reservationRoom =>
      reservationRoom.roomStatus !== 'cancelled' &&
      reservationRoom.roomStatus !== 'checked_out' &&
      reservationRoom.deletedAt === null
    )

    // Create a map of reservation ID to reservation data for quick lookup
    const reservationMap = new Map(activeReservations.map(r => [r.id, r]))

    // Find rooms that have conflicting reservations
    const conflictingRoomIds = new Set<string>()

    for (const reservationRoom of activeReservationRooms) {
      const reservation = reservationMap.get(reservationRoom.reservationId)
      if (!reservation) continue

      // Check if the reservation dates overlap with requested dates
      if (datesOverlap(
        checkInDate,
        checkOutDate,
        reservation.checkInDate,
        reservation.checkOutDate
      )) {
        conflictingRoomIds.add(reservationRoom.roomId)
      }
    }

    // Return rooms that are not conflicting
    return availableRooms.filter(room => !conflictingRoomIds.has(room.id))
  } catch (error) {
    console.error('Error getting available rooms for date range:', error)
    throw error
  }
}

/**
 * Check if two date ranges overlap
 * Returns true if the ranges overlap, false otherwise
 */
const datesOverlap = (
  startDate1: string,
  endDate1: string,
  startDate2: string,
  endDate2: string
): boolean => {
  const start1 = new Date(startDate1).getTime()
  const end1 = new Date(endDate1).getTime()
  const start2 = new Date(startDate2).getTime()
  const end2 = new Date(endDate2).getTime()

  // Two date ranges overlap if:
  // - start1 is before end2 AND end1 is after start2
  return start1 < end2 && end1 > start2
}

/**
 * Get available rooms for a specific date range, excluding already selected rooms
 * Used in the room allocation form to prevent selecting the same room multiple times
 */
export const getAvailableRoomsExcludingSelected = async (
  checkInDate: string,
  checkOutDate: string,
  excludeRoomIds: string[] = [],
  excludeReservationId?: string
): Promise<Room[]> => {
  try {
    const availableRooms = await getAvailableRoomsForDateRange(
      checkInDate,
      checkOutDate,
      excludeReservationId
    )

    // Further exclude already selected rooms
    return availableRooms.filter(room => !excludeRoomIds.includes(room.id))
  } catch (error) {
    console.error('Error getting available rooms excluding selected:', error)
    throw error
  }
}

/**
 * Check if a specific room is available for a date range
 */
export const isRoomAvailableForDateRange = async (
  roomId: string,
  checkInDate: string,
  checkOutDate: string,
  excludeReservationId?: string
): Promise<boolean> => {
  try {
    const availableRooms = await getAvailableRoomsForDateRange(
      checkInDate,
      checkOutDate,
      excludeReservationId
    )

    return availableRooms.some(room => room.id === roomId)
  } catch (error) {
    console.error('Error checking room availability:', error)
    throw error
  }
}