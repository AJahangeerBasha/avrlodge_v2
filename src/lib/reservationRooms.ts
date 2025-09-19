import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'
import { 
  ReservationRoom, 
  CreateReservationRoomData, 
  UpdateReservationRoomData, 
  ReservationRoomFilters, 
  ReservationRoomStats,
  ReservationRoomSummary,
  RoomStatus,
  CheckInData,
  CheckOutData
} from './types/reservationRooms'
import { 
  validateReservationRoom, 
  validateCheckIn, 
  validateCheckOut,
  validateStatusTransition
} from './utils/reservationRoomValidation'
import { getReservationById } from './reservations'
import { getRoomById } from './rooms'
import { updateRoomStatusAndReservation } from './utils/statusManagement'

const RESERVATION_ROOMS_COLLECTION = 'reservationRooms'

// Convert Firestore data to ReservationRoom interface
const convertFirestoreToReservationRoom = (doc: any): ReservationRoom => {
  const data = doc.data()
  return {
    id: doc.id,
    reservationId: data.reservationId,
    roomId: data.roomId,
    roomNumber: data.roomNumber,
    roomType: data.roomType,
    guestCount: data.guestCount || 1,
    tariffPerNight: data.tariffPerNight || 0,
    roomStatus: data.roomStatus || 'pending',
    checkInDatetime: data.checkInDatetime || null,
    checkOutDatetime: data.checkOutDatetime || null,
    checkedInBy: data.checkedInBy || null,
    checkedOutBy: data.checkedOutBy || null,
    checkInNotes: data.checkInNotes || null,
    checkOutNotes: data.checkOutNotes || null,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    deletedAt: data.deletedAt ? 
      (data.deletedAt instanceof Timestamp ? data.deletedAt.toDate().toISOString() : data.deletedAt) : null,
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    deletedBy: data.deletedBy || null
  }
}

// Get all reservation rooms with filters
export const getAllReservationRooms = async (filters?: ReservationRoomFilters): Promise<ReservationRoom[]> => {
  try {
    const reservationRoomsRef = collection(db, RESERVATION_ROOMS_COLLECTION)
    
    // Try with optimized query first
    try {
      let q = query(reservationRoomsRef)
      
      // Apply filters
      if (filters?.reservationId) {
        q = query(q, where('reservationId', '==', filters.reservationId))
      }
      if (filters?.roomId) {
        q = query(q, where('roomId', '==', filters.roomId))
      }
      if (filters?.roomStatus) {
        q = query(q, where('roomStatus', '==', filters.roomStatus))
      }
      if (filters?.roomType) {
        q = query(q, where('roomType', '==', filters.roomType))
      }
      if (filters?.checkedInBy) {
        q = query(q, where('checkedInBy', '==', filters.checkedInBy))
      }
      if (filters?.checkedOutBy) {
        q = query(q, where('checkedOutBy', '==', filters.checkedOutBy))
      }
      if (filters?.createdBy) {
        q = query(q, where('createdBy', '==', filters.createdBy))
      }
      
      // Order by creation date (most recent first)
      if (!filters || Object.keys(filters).length <= 1) {
        q = query(q, orderBy('createdAt', 'desc'))
      }
      
      const querySnapshot = await getDocs(q)
      let reservationRooms = querySnapshot.docs.map(convertFirestoreToReservationRoom)
      
      // Client-side filtering for datetime ranges
      if (filters?.checkInDateFrom || filters?.checkInDateTo) {
        reservationRooms = reservationRooms.filter(room => {
          if (!room.checkInDatetime) return false
          if (filters.checkInDateFrom && room.checkInDatetime < filters.checkInDateFrom) {
            return false
          }
          if (filters.checkInDateTo && room.checkInDatetime > filters.checkInDateTo) {
            return false
          }
          return true
        })
      }
      
      if (filters?.checkOutDateFrom || filters?.checkOutDateTo) {
        reservationRooms = reservationRooms.filter(room => {
          if (!room.checkOutDatetime) return false
          if (filters.checkOutDateFrom && room.checkOutDatetime < filters.checkOutDateFrom) {
            return false
          }
          if (filters.checkOutDateTo && room.checkOutDatetime > filters.checkOutDateTo) {
            return false
          }
          return true
        })
      }
      
      // Client-side sorting if we couldn't use orderBy
      if (filters && Object.keys(filters).length > 1) {
        reservationRooms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }
      
      return reservationRooms
    } catch (indexError) {
      // Fallback: Get all docs and filter/sort in client
      console.warn('Index not ready, using client-side filtering:', indexError.message)
      const querySnapshot = await getDocs(reservationRoomsRef)
      let reservationRooms = querySnapshot.docs.map(convertFirestoreToReservationRoom)
      
      // Apply all filters client-side
      if (filters) {
        reservationRooms = reservationRooms.filter(room => {
          if (filters.reservationId && room.reservationId !== filters.reservationId) return false
          if (filters.roomId && room.roomId !== filters.roomId) return false
          if (filters.roomStatus && room.roomStatus !== filters.roomStatus) return false
          if (filters.roomType && room.roomType !== filters.roomType) return false
          if (filters.checkedInBy && room.checkedInBy !== filters.checkedInBy) return false
          if (filters.checkedOutBy && room.checkedOutBy !== filters.checkedOutBy) return false
          if (filters.createdBy && room.createdBy !== filters.createdBy) return false
          
          if (filters.checkInDateFrom || filters.checkInDateTo) {
            if (!room.checkInDatetime) return false
            if (filters.checkInDateFrom && room.checkInDatetime < filters.checkInDateFrom) return false
            if (filters.checkInDateTo && room.checkInDatetime > filters.checkInDateTo) return false
          }
          
          if (filters.checkOutDateFrom || filters.checkOutDateTo) {
            if (!room.checkOutDatetime) return false
            if (filters.checkOutDateFrom && room.checkOutDatetime < filters.checkOutDateFrom) return false
            if (filters.checkOutDateTo && room.checkOutDatetime > filters.checkOutDateTo) return false
          }
          
          return true
        })
      }
      
      // Sort by creation date
      reservationRooms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      return reservationRooms
    }
  } catch (error) {
    console.error('Error getting reservation rooms:', error)
    throw error
  }
}

// Get reservation room by ID
export const getReservationRoomById = async (id: string): Promise<ReservationRoom | null> => {
  try {
    const docRef = doc(db, RESERVATION_ROOMS_COLLECTION, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return convertFirestoreToReservationRoom(docSnap)
    }
    
    return null
  } catch (error) {
    console.error('Error getting reservation room:', error)
    throw error
  }
}

// Get reservation rooms for a specific reservation
export const getReservationRoomsByReservationId = async (reservationId: string): Promise<ReservationRoom[]> => {
  return getAllReservationRooms({ reservationId })
}

// Get reservation rooms with full details
export const getReservationRoomsWithDetails = async (filters?: ReservationRoomFilters): Promise<ReservationRoom[]> => {
  try {
    const reservationRooms = await getAllReservationRooms(filters)
    
    // Fetch reservation and room details for each reservation room
    const roomsWithDetails = await Promise.all(
      reservationRooms.map(async (reservationRoom) => {
        try {
          const [reservation, room] = await Promise.all([
            getReservationById(reservationRoom.reservationId),
            getRoomById(reservationRoom.roomId)
          ])
          
          return {
            ...reservationRoom,
            reservation: reservation ? {
              id: reservation.id,
              referenceNumber: reservation.referenceNumber,
              checkInDate: reservation.checkInDate,
              checkOutDate: reservation.checkOutDate,
              totalPrice: reservation.totalPrice
            } : undefined,
            room: room ? {
              id: room.id,
              roomNumber: room.roomNumber,
              roomTypeName: room.roomType?.name || 'Unknown',
              maxGuests: room.roomType?.maxGuests || 0,
              status: room.status
            } : undefined
          }
        } catch (error) {
          console.error(`Error fetching details for reservation room ${reservationRoom.id}:`, error)
          return reservationRoom
        }
      })
    )
    
    return roomsWithDetails
  } catch (error) {
    console.error('Error getting reservation rooms with details:', error)
    throw error
  }
}

// Create new reservation room
export const createReservationRoom = async (
  data: CreateReservationRoomData, 
  userId: string
): Promise<string> => {
  try {
    // Validate reservation room data
    const validation = validateReservationRoom(data)
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }
    
    const reservationRoomsRef = collection(db, RESERVATION_ROOMS_COLLECTION)
    const reservationRoomData = {
      ...data,
      guestCount: data.guestCount || 1,
      roomStatus: data.roomStatus || 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
      updatedBy: userId,
      deletedAt: null,
      deletedBy: null
    }
    
    const docRef = await addDoc(reservationRoomsRef, reservationRoomData)
    return docRef.id
  } catch (error) {
    console.error('Error creating reservation room:', error)
    throw error
  }
}

// Create multiple reservation rooms in batch
export const createReservationRoomsBatch = async (
  reservationRoomsData: CreateReservationRoomData[],
  userId: string
): Promise<string[]> => {
  try {
    // Validate all reservation room data
    for (const data of reservationRoomsData) {
      const validation = validateReservationRoom(data)
      if (!validation.isValid) {
        throw new Error(`Validation failed for room ${data.roomNumber}: ${validation.errors.map(e => e.message).join(', ')}`)
      }
    }
    
    const batch = writeBatch(db)
    const docIds: string[] = []
    
    for (const data of reservationRoomsData) {
      const docRef = doc(collection(db, RESERVATION_ROOMS_COLLECTION))
      const reservationRoomData = {
        ...data,
        guestCount: data.guestCount || 1,
        roomStatus: data.roomStatus || 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
        updatedBy: userId,
        deletedAt: null,
        deletedBy: null
      }
      
      batch.set(docRef, reservationRoomData)
      docIds.push(docRef.id)
    }
    
    await batch.commit()
    return docIds
  } catch (error) {
    console.error('Error creating reservation rooms batch:', error)
    throw error
  }
}

// Update reservation room
export const updateReservationRoom = async (
  id: string, 
  data: UpdateReservationRoomData
): Promise<void> => {
  try {
    const docRef = doc(db, RESERVATION_ROOMS_COLLECTION, id)
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    }
    
    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error('Error updating reservation room:', error)
    throw error
  }
}

// Update room status
export const updateReservationRoomStatus = async (
  id: string, 
  status: RoomStatus,
  userId: string
): Promise<void> => {
  try {
    // Get current reservation room to validate status transition
    const currentRoom = await getReservationRoomById(id)
    if (!currentRoom) {
      throw new Error('Reservation room not found')
    }
    
    // Validate status transition
    const transitionError = validateStatusTransition(currentRoom.roomStatus, status)
    if (transitionError) {
      throw new Error(transitionError.message)
    }
    
    const docRef = doc(db, RESERVATION_ROOMS_COLLECTION, id)
    await updateDoc(docRef, {
      roomStatus: status,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })
  } catch (error) {
    console.error('Error updating reservation room status:', error)
    throw error
  }
}

// Check in room
export const checkInReservationRoom = async (
  id: string,
  checkInData: CheckInData
): Promise<void> => {
  try {
    // Validate check-in data
    const validation = validateCheckIn(checkInData)
    if (!validation.isValid) {
      throw new Error(`Check-in validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }
    
    // Get current reservation room to validate status transition
    const currentRoom = await getReservationRoomById(id)
    if (!currentRoom) {
      throw new Error('Reservation room not found')
    }
    
    const newStatus = checkInData.roomStatus || 'checked_in'
    const transitionError = validateStatusTransition(currentRoom.roomStatus, newStatus)
    if (transitionError) {
      throw new Error(transitionError.message)
    }
    
    // Use the new status management function that also updates reservation status
    await updateRoomStatusAndReservation(
      id,
      newStatus,
      checkInData.checkedInBy,
      {
        checkInDatetime: checkInData.checkInDatetime,
        checkedInBy: checkInData.checkedInBy,
        checkInNotes: checkInData.checkInNotes
      }
    )
  } catch (error) {
    console.error('Error checking in reservation room:', error)
    throw error
  }
}

// Check out room
export const checkOutReservationRoom = async (
  id: string,
  checkOutData: CheckOutData
): Promise<void> => {
  try {
    // Get current reservation room to validate
    const currentRoom = await getReservationRoomById(id)
    if (!currentRoom) {
      throw new Error('Reservation room not found')
    }
    
    // Validate check-out data
    const validation = validateCheckOut(checkOutData, currentRoom.checkInDatetime || undefined)
    if (!validation.isValid) {
      throw new Error(`Check-out validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }
    
    const newStatus = checkOutData.roomStatus || 'checked_out'
    const transitionError = validateStatusTransition(currentRoom.roomStatus, newStatus)
    if (transitionError) {
      throw new Error(transitionError.message)
    }
    
    // Use the new status management function that also updates reservation status
    await updateRoomStatusAndReservation(
      id,
      newStatus,
      checkOutData.checkedOutBy,
      {
        checkOutDatetime: checkOutData.checkOutDatetime,
        checkedOutBy: checkOutData.checkedOutBy,
        checkOutNotes: checkOutData.checkOutNotes
      }
    )
  } catch (error) {
    console.error('Error checking out reservation room:', error)
    throw error
  }
}

// Soft delete reservation room
export const deleteReservationRoom = async (id: string, userId: string): Promise<void> => {
  try {
    const docRef = doc(db, RESERVATION_ROOMS_COLLECTION, id)
    await updateDoc(docRef, {
      roomStatus: 'cancelled',
      deletedAt: serverTimestamp(),
      deletedBy: userId,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })
  } catch (error) {
    console.error('Error deleting reservation room:', error)
    throw error
  }
}

// Hard delete reservation room (admin only)
export const hardDeleteReservationRoom = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, RESERVATION_ROOMS_COLLECTION, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error hard deleting reservation room:', error)
    throw error
  }
}

// Delete all reservation rooms for a reservation
export const deleteReservationRoomsByReservationId = async (
  reservationId: string, 
  userId: string
): Promise<void> => {
  try {
    const reservationRooms = await getReservationRoomsByReservationId(reservationId)
    const batch = writeBatch(db)
    
    for (const room of reservationRooms) {
      const docRef = doc(db, RESERVATION_ROOMS_COLLECTION, room.id)
      batch.update(docRef, {
        roomStatus: 'cancelled',
        deletedAt: serverTimestamp(),
        deletedBy: userId,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      })
    }
    
    await batch.commit()
  } catch (error) {
    console.error('Error deleting reservation rooms by reservation ID:', error)
    throw error
  }
}

// Get reservation rooms by status
export const getReservationRoomsByStatus = async (status: RoomStatus): Promise<ReservationRoom[]> => {
  return getAllReservationRooms({ roomStatus: status })
}

// Get reservation rooms by room ID
export const getReservationRoomsByRoomId = async (roomId: string): Promise<ReservationRoom[]> => {
  return getAllReservationRooms({ roomId })
}

// Get reservation room statistics
export const getReservationRoomStats = async (): Promise<ReservationRoomStats> => {
  try {
    const reservationRooms = await getAllReservationRooms()
    
    const stats = reservationRooms.reduce((acc, room) => {
      acc.totalRooms++
      
      switch (room.roomStatus) {
        case 'pending':
          acc.pendingRooms++
          break
        case 'checked_in':
          acc.checkedInRooms++
          break
        case 'checked_out':
          acc.checkedOutRooms++
          break
        case 'cancelled':
          acc.cancelledRooms++
          break
        case 'no_show':
          acc.noShowRooms++
          break
      }
      
      if (room.roomStatus === 'checked_out') {
        acc.totalRevenue += room.tariffPerNight
      }
      
      return acc
    }, {
      totalRooms: 0,
      pendingRooms: 0,
      checkedInRooms: 0,
      checkedOutRooms: 0,
      cancelledRooms: 0,
      noShowRooms: 0,
      totalRevenue: 0,
      averageStayDuration: 0,
      occupancyRate: 0
    })
    
    // Calculate average stay duration (for checked out rooms)
    const checkedOutRooms = reservationRooms.filter(room => 
      room.roomStatus === 'checked_out' && 
      room.checkInDatetime && 
      room.checkOutDatetime
    )
    
    if (checkedOutRooms.length > 0) {
      const totalDuration = checkedOutRooms.reduce((sum, room) => {
        const checkIn = new Date(room.checkInDatetime!).getTime()
        const checkOut = new Date(room.checkOutDatetime!).getTime()
        const durationHours = (checkOut - checkIn) / (1000 * 60 * 60)
        return sum + durationHours
      }, 0)
      stats.averageStayDuration = totalDuration / checkedOutRooms.length
    }
    
    // Calculate occupancy rate
    stats.occupancyRate = stats.totalRooms > 0 
      ? (stats.checkedInRooms + stats.checkedOutRooms) / stats.totalRooms * 100 
      : 0
    
    return stats
  } catch (error) {
    console.error('Error getting reservation room stats:', error)
    throw error
  }
}

// Get reservation room summary by reservation ID
export const getReservationRoomSummary = async (reservationId: string): Promise<ReservationRoomSummary | null> => {
  try {
    const rooms = await getReservationRoomsByReservationId(reservationId)
    
    if (rooms.length === 0) {
      return null
    }
    
    const summary: ReservationRoomSummary = {
      reservationId,
      totalRooms: rooms.length,
      totalGuests: rooms.reduce((sum, room) => sum + room.guestCount, 0),
      totalTariff: rooms.reduce((sum, room) => sum + room.tariffPerNight, 0),
      roomStatuses: {
        pending: 0,
        checked_in: 0,
        checked_out: 0,
        cancelled: 0,
        no_show: 0
      },
      rooms
    }
    
    // Count room statuses
    rooms.forEach(room => {
      summary.roomStatuses[room.roomStatus]++
    })
    
    return summary
  } catch (error) {
    console.error('Error getting reservation room summary:', error)
    throw error
  }
}