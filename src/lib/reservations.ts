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
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import {
  Reservation,
  CreateReservationData,
  UpdateReservationData,
  ReservationFilters,
  ReservationStats,
  ReservationStatus,
  PaymentStatus
} from './types/reservations'
import { generateReferenceNumber } from './utils/referenceNumber'
import { validateReservation } from './utils/reservationValidation'
import { getRoomById } from './rooms'

const RESERVATIONS_COLLECTION = 'reservations'

// Convert Firestore data to Reservation interface
const convertFirestoreToReservation = (doc: any): Reservation => {
  const data = doc.data()
  return {
    id: doc.id,
    roomId: data.roomId,
    checkInDate: data.checkInDate,
    checkOutDate: data.checkOutDate,
    guestCount: data.guestCount,
    specialRequests: data.specialRequests || null,
    referenceNumber: data.referenceNumber,
    approxCheckInTime: data.approxCheckInTime || null,
    approxCheckOutTime: data.approxCheckOutTime || null,
    guestType: data.guestType || null,
    guestName: data.guestName || null,
    guestEmail: data.guestEmail || null,
    guestPhone: data.guestPhone || null,
    percentageDiscount: data.percentageDiscount || 0,
    fixedDiscount: data.fixedDiscount || 0,
    totalQuote: data.totalQuote || 0,
    roomTariff: data.roomTariff || 0,
    advancePayment: data.advancePayment || 0,
    balancePayment: data.balancePayment || 0,
    totalPrice: data.totalPrice || 0,
    agentId: data.agentId || null,
    agentCommission: data.agentCommission || null,
    status: data.status || 'reservation',
    paymentStatus: data.paymentStatus || 'pending',
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    deletedAt: data.deletedAt ?
      (data.deletedAt instanceof Timestamp ? data.deletedAt.toDate().toISOString() : data.deletedAt) : null,
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    deletedBy: data.deletedBy || null
  }
}

// Get all reservations with filters
export const getAllReservations = async (filters?: ReservationFilters): Promise<Reservation[]> => {
  try {
    const reservationsRef = collection(db, RESERVATIONS_COLLECTION)

    // Try with optimized query first
    try {
      let q = query(reservationsRef)

      // Apply filters
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }
      if (filters?.paymentStatus) {
        q = query(q, where('paymentStatus', '==', filters.paymentStatus))
      }
      if (filters?.roomId) {
        q = query(q, where('roomId', '==', filters.roomId))
      }
      if (filters?.guestType) {
        q = query(q, where('guestType', '==', filters.guestType))
      }
      if (filters?.createdBy) {
        q = query(q, where('createdBy', '==', filters.createdBy))
      }
      if (filters?.referenceNumber) {
        q = query(q, where('referenceNumber', '==', filters.referenceNumber))
      }

      // Order by creation date (most recent first)
      if (!filters || Object.keys(filters).length <= 1) {
        q = query(q, orderBy('createdAt', 'desc'))
      }

      const querySnapshot = await getDocs(q)
      let reservations = querySnapshot.docs.map(convertFirestoreToReservation)

      // Client-side filtering for date ranges
      if (filters?.checkInDateFrom || filters?.checkInDateTo) {
        reservations = reservations.filter(reservation => {
          if (filters.checkInDateFrom && reservation.checkInDate < filters.checkInDateFrom) {
            return false
          }
          if (filters.checkInDateTo && reservation.checkInDate > filters.checkInDateTo) {
            return false
          }
          return true
        })
      }

      if (filters?.checkOutDateFrom || filters?.checkOutDateTo) {
        reservations = reservations.filter(reservation => {
          if (filters.checkOutDateFrom && reservation.checkOutDate < filters.checkOutDateFrom) {
            return false
          }
          if (filters.checkOutDateTo && reservation.checkOutDate > filters.checkOutDateTo) {
            return false
          }
          return true
        })
      }

      // Client-side sorting if we couldn't use orderBy
      if (filters && Object.keys(filters).length > 1) {
        reservations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }

      return reservations
    } catch (indexError) {
      // Fallback: Get all docs and filter/sort in client
      console.warn('Index not ready, using client-side filtering:', indexError.message)
      const querySnapshot = await getDocs(reservationsRef)
      let reservations = querySnapshot.docs.map(convertFirestoreToReservation)

      // Apply all filters client-side
      if (filters) {
        reservations = reservations.filter(reservation => {
          if (filters.status && reservation.status !== filters.status) return false
          if (filters.paymentStatus && reservation.paymentStatus !== filters.paymentStatus) return false
          if (filters.roomId && reservation.roomId !== filters.roomId) return false
          if (filters.guestType && reservation.guestType !== filters.guestType) return false
          if (filters.createdBy && reservation.createdBy !== filters.createdBy) return false
          if (filters.referenceNumber && reservation.referenceNumber !== filters.referenceNumber) return false
          if (filters.checkInDateFrom && reservation.checkInDate < filters.checkInDateFrom) return false
          if (filters.checkInDateTo && reservation.checkInDate > filters.checkInDateTo) return false
          if (filters.checkOutDateFrom && reservation.checkOutDate < filters.checkOutDateFrom) return false
          if (filters.checkOutDateTo && reservation.checkOutDate > filters.checkOutDateTo) return false
          return true
        })
      }

      // Sort by creation date
      reservations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      return reservations
    }
  } catch (error) {
    console.error('Error getting reservations:', error)
    throw error
  }
}

// Get reservation by ID
export const getReservationById = async (id: string): Promise<Reservation | null> => {
  try {
    const docRef = doc(db, RESERVATIONS_COLLECTION, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return convertFirestoreToReservation(docSnap)
    }

    return null
  } catch (error) {
    console.error('Error getting reservation:', error)
    throw error
  }
}

// Get reservation by reference number
export const getReservationByReferenceNumber = async (referenceNumber: string): Promise<Reservation | null> => {
  try {
    const reservationsRef = collection(db, RESERVATIONS_COLLECTION)
    const q = query(reservationsRef, where('referenceNumber', '==', referenceNumber), limit(1))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      return convertFirestoreToReservation(querySnapshot.docs[0])
    }

    return null
  } catch (error) {
    console.error('Error getting reservation by reference number:', error)
    throw error
  }
}

// Get reservations with room details
export const getReservationsWithRoomDetails = async (filters?: ReservationFilters): Promise<Reservation[]> => {
  try {
    const reservations = await getAllReservations(filters)

    // Fetch room details for each reservation
    const reservationsWithRooms = await Promise.all(
      reservations.map(async (reservation) => {
        try {
          const room = await getRoomById(reservation.roomId)
          return {
            ...reservation,
            room: room ? {
              id: room.id,
              roomNumber: room.roomNumber,
              roomTypeName: room.roomType?.name || 'Unknown',
              pricePerNight: room.roomType?.pricePerNight || 0,
              maxGuests: room.roomType?.maxGuests || 0
            } : undefined
          }
        } catch (error) {
          console.error(`Error fetching room details for reservation ${reservation.id}:`, error)
          return reservation
        }
      })
    )

    return reservationsWithRooms
  } catch (error) {
    console.error('Error getting reservations with room details:', error)
    throw error
  }
}

// Create new reservation
export const createReservation = async (
  data: CreateReservationData,
  userId: string
): Promise<{ id: string; referenceNumber: string }> => {
  try {
    // Validate reservation data
    const validation = validateReservation(data)
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }

    // Generate reference number
    const referenceNumber = await generateReferenceNumber()

    const reservationsRef = collection(db, RESERVATIONS_COLLECTION)
    const reservationData = {
      ...data,
      referenceNumber,
      status: data.status || 'reservation',
      paymentStatus: data.paymentStatus || 'pending',
      percentageDiscount: data.percentageDiscount || 0,
      fixedDiscount: data.fixedDiscount || 0,
      // advancePayment: data.advancePayment || 0,
      // balancePayment: data.balancePayment || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
      updatedBy: userId,
      deletedAt: null,
      deletedBy: null
    }

    const docRef = await addDoc(reservationsRef, reservationData)
    return { id: docRef.id, referenceNumber }
  } catch (error) {
    console.error('Error creating reservation:', error)
    throw error
  }
}

// Update reservation
export const updateReservation = async (
  id: string,
  data: UpdateReservationData
): Promise<void> => {
  try {
    const docRef = doc(db, RESERVATIONS_COLLECTION, id)
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    }

    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error('Error updating reservation:', error)
    throw error
  }
}

// Update reservation status
export const updateReservationStatus = async (
  id: string,
  status: ReservationStatus,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, RESERVATIONS_COLLECTION, id)
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })
  } catch (error) {
    console.error('Error updating reservation status:', error)
    throw error
  }
}

// Update payment status
export const updatePaymentStatus = async (
  id: string,
  paymentStatus: PaymentStatus,
  advancePayment?: number,
  balancePayment?: number,
  userId?: string
): Promise<void> => {
  try {
    const docRef = doc(db, RESERVATIONS_COLLECTION, id)
    const updateData: any = {
      paymentStatus,
      updatedAt: serverTimestamp()
    }

    if (advancePayment !== undefined) updateData.advancePayment = advancePayment
    if (balancePayment !== undefined) updateData.balancePayment = balancePayment
    if (userId) updateData.updatedBy = userId

    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error('Error updating payment status:', error)
    throw error
  }
}

// Soft delete reservation
export const deleteReservation = async (id: string, userId: string): Promise<void> => {
  try {
    const docRef = doc(db, RESERVATIONS_COLLECTION, id)
    await updateDoc(docRef, {
      status: 'cancelled',
      deletedAt: serverTimestamp(),
      deletedBy: userId,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })
  } catch (error) {
    console.error('Error deleting reservation:', error)
    throw error
  }
}

// Hard delete reservation (admin only)
export const hardDeleteReservation = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, RESERVATIONS_COLLECTION, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error hard deleting reservation:', error)
    throw error
  }
}

// Get reservations by status
export const getReservationsByStatus = async (status: ReservationStatus): Promise<Reservation[]> => {
  return getAllReservations({ status })
}

// Get reservations by payment status
export const getReservationsByPaymentStatus = async (paymentStatus: PaymentStatus): Promise<Reservation[]> => {
  return getAllReservations({ paymentStatus })
}

// Get reservations for a specific room
export const getReservationsForRoom = async (roomId: string): Promise<Reservation[]> => {
  return getAllReservations({ roomId })
}

// Get reservations for date range
export const getReservationsForDateRange = async (
  checkInFrom: string,
  checkInTo: string
): Promise<Reservation[]> => {
  return getAllReservations({
    checkInDateFrom: checkInFrom,
    checkInDateTo: checkInTo
  })
}

// Get reservation statistics
export const getReservationStats = async (): Promise<ReservationStats> => {
  try {
    const reservations = await getAllReservations()

    const stats = reservations.reduce((acc, reservation) => {
      acc.totalReservations++

      switch (reservation.status) {
        case 'reservation':
        case 'booking':
        case 'checked_in':
          acc.activeReservations++
          break
        case 'checked_out':
          acc.completedReservations++
          break
        case 'cancelled':
          acc.cancelledReservations++
          break
      }

      if (reservation.paymentStatus === 'pending') {
        acc.pendingPayments++
      }

      if (reservation.status === 'checked_out') {
        acc.totalRevenue += reservation.totalPrice
      }

      return acc
    }, {
      totalReservations: 0,
      activeReservations: 0,
      completedReservations: 0,
      cancelledReservations: 0,
      pendingPayments: 0,
      totalRevenue: 0,
      averageStayDuration: 0,
      occupancyRate: 0
    })

    // Calculate average stay duration
    if (reservations.length > 0) {
      const totalDuration = reservations.reduce((sum, reservation) => {
        const checkIn = new Date(reservation.checkInDate)
        const checkOut = new Date(reservation.checkOutDate)
        const duration = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        return sum + duration
      }, 0)
      stats.averageStayDuration = totalDuration / reservations.length
    }

    // Note: Occupancy rate calculation would need total room count and date range
    // This is a simplified calculation
    stats.occupancyRate = stats.activeReservations / Math.max(stats.totalReservations, 1) * 100

    return stats
  } catch (error) {
    console.error('Error getting reservation stats:', error)
    throw error
  }
}

// Check room availability for date range
export const isRoomAvailable = async (
  roomId: string,
  checkInDate: string,
  checkOutDate: string,
  excludeReservationId?: string
): Promise<boolean> => {
  try {
    const reservationsRef = collection(db, RESERVATIONS_COLLECTION)
    const q = query(
      reservationsRef,
      where('roomId', '==', roomId),
      where('status', 'in', ['reservation', 'booking', 'checked_in'])
    )

    const querySnapshot = await getDocs(q)
    const conflictingReservations = querySnapshot.docs
      .map(convertFirestoreToReservation)
      .filter(reservation => {
        // Exclude the current reservation if updating
        if (excludeReservationId && reservation.id === excludeReservationId) {
          return false
        }

        // Check for date overlap
        const existingCheckIn = new Date(reservation.checkInDate)
        const existingCheckOut = new Date(reservation.checkOutDate)
        const newCheckIn = new Date(checkInDate)
        const newCheckOut = new Date(checkOutDate)

        // Check if dates overlap
        return !(newCheckOut <= existingCheckIn || newCheckIn >= existingCheckOut)
      })

    return conflictingReservations.length === 0
  } catch (error) {
    console.error('Error checking room availability:', error)
    return false
  }
}