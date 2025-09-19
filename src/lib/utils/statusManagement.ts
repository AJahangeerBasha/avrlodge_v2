// Status Management Utility
// Implements business logic for automatic reservation and room status updates
// Based on the workflow defined in status.md

import { runTransaction, doc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTIONS } from '../constants/collections'
import { ReservationStatus, PaymentStatus } from '../types/reservations'
import { RoomStatus } from '../types/reservationRooms'

/**
 * Updates reservation payment status based on actual payment amounts
 * Business Rule: Calculate payment status from completed payments vs total amount
 */
export const updateReservationPaymentStatus = async (
  reservationId: string,
  currentUserId: string
): Promise<void> => {
  try {
    // Get reservation and payments data (outside transaction)
    const reservationRef = doc(db, COLLECTIONS.RESERVATIONS, reservationId)
    const reservationDoc = await getDocs(query(collection(db, COLLECTIONS.RESERVATIONS), where('__name__', '==', reservationId)))

    if (reservationDoc.empty) {
      throw new Error('Reservation not found')
    }

    const reservation = reservationDoc.docs[0].data()
    const totalAmount = reservation.totalQuote || reservation.totalPrice || 0

    console.log(`💰 Calculating payment status for reservation ${reservationId}:`)
    console.log(`💰 Total amount: ₹${totalAmount}`)
    console.log(`💰 Current payment status: '${reservation.paymentStatus}'`)

    // Get completed payments for this reservation
    const paymentsQuery = query(
      collection(db, COLLECTIONS.PAYMENTS),
      where('reservationId', '==', reservationId),
      where('paymentStatus', '==', 'completed')
    )

    const paymentsSnapshot = await getDocs(paymentsQuery)
    const totalPaid = paymentsSnapshot.docs
      .filter(doc => !doc.data().deletedAt) // Client-side filter for non-deleted payments
      .reduce((sum, doc) => {
        const payment = doc.data()
        return sum + (payment.amount || 0)
      }, 0)

    console.log(`💰 Total paid: ₹${totalPaid}`)

    // Determine payment status
    let newPaymentStatus: PaymentStatus
    if (totalPaid === 0) {
      newPaymentStatus = 'pending'
    } else if (totalPaid >= totalAmount) {
      newPaymentStatus = 'paid'
    } else {
      newPaymentStatus = 'partial'
    }

    console.log(`💰 Calculated new payment status: '${newPaymentStatus}'`)

    // Update reservation payment status
    await runTransaction(db, async (transaction) => {
      const currentReservationDoc = await transaction.get(reservationRef)

      if (!currentReservationDoc.exists()) {
        throw new Error('Reservation not found')
      }

      const currentData = currentReservationDoc.data()

      // Only update if payment status has changed
      if (currentData.paymentStatus !== newPaymentStatus) {
        transaction.update(reservationRef, {
          paymentStatus: newPaymentStatus,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUserId
        })

        console.log(`✅ Reservation ${reservationId} payment status updated to '${newPaymentStatus}' (paid: ₹${totalPaid}/${totalAmount})`)
      } else {
        console.log(`⏭️ Skipping payment status update: already at '${currentData.paymentStatus}'`)
      }
    })
  } catch (error) {
    console.error('❌ Error updating reservation payment status:', error)
    throw error
  }
}

/**
 * Updates reservation status to 'booking' when first payment is made
 * Business Rule: First payment success → Reservation Status = 'booking'
 */
export const updateReservationStatusOnFirstPayment = async (
  reservationId: string,
  currentUserId: string
): Promise<void> => {
  try {
    await runTransaction(db, async (transaction) => {
      // Get current reservation
      const reservationRef = doc(db, COLLECTIONS.RESERVATIONS, reservationId)
      const reservationDoc = await transaction.get(reservationRef)

      if (!reservationDoc.exists()) {
        throw new Error('Reservation not found')
      }

      const reservation = reservationDoc.data()

      // Only update if current status is 'reservation'
      if (reservation.status === 'reservation') {
        transaction.update(reservationRef, {
          status: 'booking' as ReservationStatus,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUserId
        })

        console.log(`✅ Reservation ${reservationId} status updated to 'booking' after first payment`)
      }
    })

    // Also update payment status
    await updateReservationPaymentStatus(reservationId, currentUserId)
  } catch (error) {
    console.error('❌ Error updating reservation status on first payment:', error)
    throw error
  }
}

/**
 * Updates reservation status based on all associated room statuses
 * Business Rules:
 * - All rooms checked_in → Reservation Status = 'checked_in'
 * - All rooms checked_out → Reservation Status = 'checked_out'
 * - Any room cancelled → Reservation Status = 'cancelled'
 */
export const updateReservationStatusBasedOnRooms = async (
  reservationId: string,
  currentUserId: string
): Promise<void> => {
  try {
    // Get all reservation rooms for this reservation (outside transaction)
    const roomsQuery = query(
      collection(db, COLLECTIONS.RESERVATION_ROOMS),
      where('reservationId', '==', reservationId),
      where('deletedAt', '==', null)
    )

    const roomsSnapshot = await getDocs(roomsQuery)
    const rooms = roomsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    if (rooms.length === 0) {
      console.warn(`⚠️ No rooms found for reservation ${reservationId}`)
      return
    }

    // Analyze room statuses
    const roomStatuses = rooms.map(room => room.roomStatus as RoomStatus)

    console.log(`🔍 Analyzing reservation ${reservationId} room statuses:`, roomStatuses)

    let newReservationStatus: ReservationStatus | null = null

    // Check for cancellation - if any room is cancelled
    if (roomStatuses.includes('cancelled')) {
      newReservationStatus = 'cancelled'
      console.log(`📋 Setting reservation status to 'cancelled' (found cancelled room)`)
    }
    // Check if all rooms are checked out
    else if (roomStatuses.every(status => status === 'checked_out')) {
      newReservationStatus = 'checked_out'
      console.log(`📋 Setting reservation status to 'checked_out' (all rooms checked out)`)
    }
    // Check if all rooms are checked in
    else if (roomStatuses.every(status => status === 'checked_in')) {
      newReservationStatus = 'checked_in'
      console.log(`📋 Setting reservation status to 'checked_in' (all rooms checked in)`)
    }
    else {
      console.log(`📋 No status change needed. Room statuses: ${roomStatuses.join(', ')}`)
    }

    // Only update if there's a new status to set
    if (newReservationStatus) {
      await runTransaction(db, async (transaction) => {
        // Get current reservation
        const reservationRef = doc(db, COLLECTIONS.RESERVATIONS, reservationId)
        const reservationDoc = await transaction.get(reservationRef)

        if (!reservationDoc.exists()) {
          throw new Error('Reservation not found')
        }

        const currentStatus = reservationDoc.data().status

        console.log(`🏷️ Current reservation status: '${currentStatus}' → Target: '${newReservationStatus}'`)

        // Don't change from cancelled or if already at target status
        if (currentStatus === 'cancelled' || currentStatus === newReservationStatus) {
          console.log(`⏭️ Skipping status update: ${currentStatus === 'cancelled' ? 'reservation is cancelled' : 'already at target status'}`)
          return
        }

        // Update reservation status
        transaction.update(reservationRef, {
          status: newReservationStatus,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUserId
        })

        console.log(`✅ Reservation ${reservationId} status updated from '${currentStatus}' to '${newReservationStatus}' based on room statuses`)
      })

      // Also update payment status to keep it in sync
      await updateReservationPaymentStatus(reservationId, currentUserId)
    }
  } catch (error) {
    console.error('❌ Error updating reservation status based on rooms:', error)
    throw error
  }
}

/**
 * Updates room status and triggers reservation status update
 * Business Rule: Update room status → Check all rooms → Update reservation status
 */
export const updateRoomStatusAndReservation = async (
  reservationRoomId: string,
  newRoomStatus: RoomStatus,
  currentUserId: string,
  additionalData?: {
    checkInDatetime?: string
    checkOutDatetime?: string
    checkedInBy?: string
    checkedOutBy?: string
    checkInNotes?: string
    checkOutNotes?: string
  }
): Promise<void> => {
  try {
    let reservationId: string

    await runTransaction(db, async (transaction) => {
      // Get the reservation room
      const roomRef = doc(db, COLLECTIONS.RESERVATION_ROOMS, reservationRoomId)
      const roomDoc = await transaction.get(roomRef)

      if (!roomDoc.exists()) {
        throw new Error('Reservation room not found')
      }

      const roomData = roomDoc.data()
      reservationId = roomData.reservationId

      // Update room status
      const updateData: any = {
        roomStatus: newRoomStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUserId,
        ...additionalData
      }

      transaction.update(roomRef, updateData)

      console.log(`✅ Room ${reservationRoomId} status updated to '${newRoomStatus}'`)
    })

    // After room update, check and update reservation status
    await updateReservationStatusBasedOnRooms(reservationId!, currentUserId)

  } catch (error) {
    console.error('❌ Error updating room status and reservation:', error)
    throw error
  }
}

/**
 * Cancels a reservation and all its associated rooms
 * Business Rule: Reservation cancellation → Status = 'cancelled' → All rooms = 'cancelled'
 */
export const cancelReservationAndRooms = async (
  reservationId: string,
  currentUserId: string,
  cancellationReason?: string
): Promise<void> => {
  try {
    // Get all reservation rooms first (outside transaction)
    const roomsQuery = query(
      collection(db, COLLECTIONS.RESERVATION_ROOMS),
      where('reservationId', '==', reservationId),
      where('deletedAt', '==', null)
    )

    const roomsSnapshot = await getDocs(roomsQuery)

    await runTransaction(db, async (transaction) => {
      // Update reservation status to cancelled
      const reservationRef = doc(db, COLLECTIONS.RESERVATIONS, reservationId)
      transaction.update(reservationRef, {
        status: 'cancelled' as ReservationStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUserId,
        ...(cancellationReason && { cancellationReason })
      })

      // Cancel all reservation rooms
      roomsSnapshot.docs.forEach(roomDoc => {
        const roomRef = doc(db, COLLECTIONS.RESERVATION_ROOMS, roomDoc.id)
        transaction.update(roomRef, {
          roomStatus: 'cancelled' as RoomStatus,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUserId
        })
      })

      console.log(`✅ Reservation ${reservationId} and ${roomsSnapshot.docs.length} rooms cancelled`)
    })
  } catch (error) {
    console.error('❌ Error cancelling reservation and rooms:', error)
    throw error
  }
}

/**
 * Gets the calculated status based on current business rules
 * This matches the logic in the UI but provides a server-side calculation
 */
export const getCalculatedReservationStatus = async (reservationId: string): Promise<ReservationStatus> => {
  try {
    // Get reservation
    const reservationRef = doc(db, COLLECTIONS.RESERVATIONS, reservationId)
    const reservationDoc = await getDocs(query(collection(db, COLLECTIONS.RESERVATIONS), where('__name__', '==', reservationId)))

    if (reservationDoc.empty) {
      throw new Error('Reservation not found')
    }

    const reservation = reservationDoc.docs[0].data()

    // If cancelled, always return cancelled
    if (reservation.status === 'cancelled') {
      return 'cancelled'
    }

    // Check room statuses
    const roomsQuery = query(
      collection(db, COLLECTIONS.RESERVATION_ROOMS),
      where('reservationId', '==', reservationId),
      where('deletedAt', '==', null)
    )

    const roomsSnapshot = await getDocs(roomsQuery)
    const rooms = roomsSnapshot.docs.map(doc => doc.data())

    if (rooms.length > 0) {
      const roomStatuses = rooms.map(room => room.roomStatus as RoomStatus)

      // All checked out
      if (roomStatuses.every(status => status === 'checked_out')) {
        return 'checked_out'
      }

      // All checked in
      if (roomStatuses.every(status => status === 'checked_in')) {
        return 'checked_in'
      }

      // Any cancelled
      if (roomStatuses.includes('cancelled')) {
        return 'cancelled'
      }
    }

    // Check payment status
    const paymentsQuery = query(
      collection(db, COLLECTIONS.PAYMENTS),
      where('reservationId', '==', reservationId),
      where('paymentStatus', '==', 'completed'),
      where('deletedAt', '==', null)
    )

    const paymentsSnapshot = await getDocs(paymentsQuery)

    if (paymentsSnapshot.docs.length > 0) {
      return 'booking'
    }

    // Default to reservation
    return 'reservation'

  } catch (error) {
    console.error('❌ Error calculating reservation status:', error)
    return 'reservation' // Safe default
  }
}