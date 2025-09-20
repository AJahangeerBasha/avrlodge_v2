// Business Logic Service for Bookings
import { useBookingsStore, type Booking, type DateFilterType, type StatusFilterType } from '@/stores/bookingsStore'

// Firebase imports
import { getAllReservations } from '@/lib/reservations'
import { getAllReservationRooms } from '@/lib/reservationRooms'
import { getGuestsByReservationId } from '@/lib/guests'
import { getAllReservationSpecialCharges } from '@/lib/reservationSpecialCharges'
import { getPaymentsByReservationId } from '@/lib/payments'
import { getAgent } from '@/lib/agents'

// Date utilities
import {
  startOfWeek, endOfWeek, addWeeks, subWeeks,
  startOfMonth, endOfMonth, addMonths, subMonths,
  startOfDay, endOfDay, addDays, subDays
} from 'date-fns'

export class BookingsService {
  private static instance: BookingsService

  static getInstance(): BookingsService {
    if (!BookingsService.instance) {
      BookingsService.instance = new BookingsService()
    }
    return BookingsService.instance
  }

  // Helper function to get date range based on filter
  private getDateRange(filter: DateFilterType) {
    const now = new Date()

    switch (filter) {
      case 'today':
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        }
      case 'yesterday':
        return {
          start: startOfDay(subDays(now, 1)),
          end: endOfDay(subDays(now, 1))
        }
      case 'tomorrow':
        return {
          start: startOfDay(addDays(now, 1)),
          end: endOfDay(addDays(now, 1))
        }
      case 'this_weekend':
        const saturday = startOfDay(addDays(startOfWeek(now), 6))
        const sunday = endOfDay(addDays(startOfWeek(now), 7))
        return { start: saturday, end: sunday }
      case 'current_week':
        return {
          start: startOfWeek(now),
          end: endOfWeek(now)
        }
      case 'last_week':
        return {
          start: startOfWeek(subWeeks(now, 1)),
          end: endOfWeek(subWeeks(now, 1))
        }
      case 'next_week':
        return {
          start: startOfWeek(addWeeks(now, 1)),
          end: endOfWeek(addWeeks(now, 1))
        }
      case 'current_month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        }
      case 'previous_month':
        return {
          start: startOfMonth(subMonths(now, 1)),
          end: endOfMonth(subMonths(now, 1))
        }
      case 'next_month':
        return {
          start: startOfMonth(addMonths(now, 1)),
          end: endOfMonth(addMonths(now, 1))
        }
      case 'all':
        return {
          start: new Date(2020, 0, 1),
          end: new Date(2030, 11, 31)
        }
      default:
        // Handle custom month formats like '012025'
        if (filter.length === 6) {
          const month = parseInt(filter.substring(0, 2)) - 1
          const year = parseInt(filter.substring(2))
          return {
            start: startOfMonth(new Date(year, month)),
            end: endOfMonth(new Date(year, month))
          }
        }
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        }
    }
  }

  // Build a single booking object from reservation data and related data
  private async buildBookingFromReservation(reservation: any): Promise<Booking> {
    try {
      // Fetch all related data for this reservation
      const [reservationRooms, guests, specialCharges, payments] = await Promise.all([
        getAllReservationRooms({ reservationId: reservation.id }),
        getGuestsByReservationId(reservation.id),
        getAllReservationSpecialCharges({ reservationId: reservation.id }),
        getPaymentsByReservationId(reservation.id)
      ])

      // Calculate payment totals from Firebase data
      const completedPayments = payments.filter(payment => payment.paymentStatus === 'completed')
      const totalPaid = completedPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
      const remainingBalance = Math.max(0, (reservation.totalPrice || 0) - totalPaid)

      // Get primary guest information
      const primaryGuest = guests.find(guest => guest.isPrimaryGuest)

      // Get agent information if exists
      let agentName = null
      if (reservation.agentId) {
        try {
          const agent = await getAgent(reservation.agentId)
          agentName = agent?.name || 'Unknown Agent'
        } catch {
          agentName = 'Unknown Agent'
        }
      }

      return {
        id: reservation.id,
        reference_number: reservation.referenceNumber,
        guest_name: primaryGuest?.name || reservation.guestName || 'Unknown Guest',
        guest_phone: primaryGuest?.phone || reservation.guestPhone || '',
        guest_email: reservation.guestEmail || '',
        check_in_date: reservation.checkInDate,
        check_out_date: reservation.checkOutDate,
        total_quote: reservation.totalPrice || 0,
        total_paid: totalPaid,
        remaining_balance: remainingBalance,
        status: reservation.status,
        payment_status: reservation.paymentStatus,
        guest_count: reservation.guestCount,
        agent_id: reservation.agentId,
        agent_commission: reservation.agentCommission,
        agent_name: agentName,
        room_numbers: reservationRooms.map(room => room.roomNumber).join(', '),
        reservation_rooms: reservationRooms.map(room => ({
          id: room.id,
          room_number: room.roomNumber,
          room_type: room.roomType,
          guest_count: room.guestCount || 0,
          room_status: room.roomStatus as 'pending' | 'checked_in' | 'checked_out',
          check_in_datetime: room.checkInDatetime || null,
          check_out_datetime: room.checkOutDatetime || null
        })),
        reservation_special_charges: specialCharges.map(charge => ({
          id: charge.id,
          custom_rate: charge.customRate || 0,
          quantity: charge.quantity || 0,
          total_amount: charge.totalAmount || 0,
          special_charges_master: charge.specialChargesMaster ? {
            charge_name: charge.specialChargesMaster.chargeName,
            default_rate: charge.specialChargesMaster.defaultRate,
            rate_type: charge.specialChargesMaster.rateType
          } : undefined
        })),
        created_at: reservation.createdAt
      }
    } catch (error) {
      console.error('Error building booking from reservation:', error)
      throw error
    }
  }

  // Filter bookings by status
  private filterBookingsByStatus(bookings: Booking[], statusFilter: StatusFilterType): Booking[] {
    if (statusFilter === 'all_status') {
      return bookings
    }

    if (statusFilter === 'pending_payments') {
      return bookings.filter(booking => {
        const hasPendingPayments = booking.payment_status === 'pending' || booking.payment_status === 'partial'
        const isNotCancelled = booking.status !== 'cancelled'
        return hasPendingPayments && isNotCancelled
      })
    }

    return bookings.filter(booking => booking.status === statusFilter)
  }

  // Filter bookings by date range
  private filterBookingsByDate(bookings: Booking[], dateFilter: DateFilterType): Booking[] {
    if (dateFilter === 'all') {
      return bookings
    }

    const { start, end } = this.getDateRange(dateFilter)

    return bookings.filter((booking) => {
      const checkInDate = new Date(booking.check_in_date)
      const checkOutDate = new Date(booking.check_out_date)

      // Include bookings that overlap with the date range
      return (checkInDate <= end && checkOutDate >= start)
    })
  }

  // Main method to load and filter bookings
  async loadBookings(statusFilter: StatusFilterType = 'all_status', dateFilter: DateFilterType = 'today'): Promise<Booking[]> {
    console.log('🔄 BookingsService.loadBookings:', { statusFilter, dateFilter })

    try {
      // Get all reservations from Firebase
      const reservations = await getAllReservations()
      console.log('📊 Loaded reservations from Firebase:', reservations.length)

      // Build booking objects with all related data
      const bookingsWithDetails = await Promise.all(
        reservations.map(reservation => this.buildBookingFromReservation(reservation))
      )

      // Apply date filtering
      const dateFilteredBookings = this.filterBookingsByDate(bookingsWithDetails, dateFilter)
      console.log('📅 After date filter:', dateFilteredBookings.length)

      // Apply status filtering
      const finalFilteredBookings = this.filterBookingsByStatus(dateFilteredBookings, statusFilter)
      console.log('📊 After status filter:', finalFilteredBookings.length)

      return finalFilteredBookings

    } catch (error) {
      console.error('❌ Error in BookingsService.loadBookings:', error)
      throw error
    }
  }

  // Search bookings
  async searchBookings(query: string, allBookings: Booking[]): Promise<Booking[]> {
    const searchTerm = query.toLowerCase().trim()

    if (!searchTerm) {
      return []
    }

    return allBookings.filter((booking) => {
      return (
        booking.reference_number?.toLowerCase().includes(searchTerm) ||
        booking.guest_name?.toLowerCase().includes(searchTerm) ||
        booking.guest_phone?.toLowerCase().includes(searchTerm) ||
        booking.guest_email?.toLowerCase().includes(searchTerm) ||
        booking.room_numbers?.toLowerCase().includes(searchTerm) ||
        booking.status?.toLowerCase().includes(searchTerm)
      )
    })
  }

  // Get status display text
  getStatusFilterText(statusFilter: StatusFilterType): string {
    switch (statusFilter) {
      case 'all_status':
        return 'All Status'
      case 'reservation':
        return 'Reservations'
      case 'booking':
        return 'Bookings'
      case 'checked_in':
        return 'Checked-In'
      case 'checked_out':
        return 'Checked-Out'
      case 'cancelled':
        return 'Cancelled'
      case 'pending_payments':
        return 'Pending Payments'
      default:
        return 'Unknown'
    }
  }

  // Get date range display text
  getDateRangeText(dateFilter: DateFilterType): string {
    const now = new Date()

    switch (dateFilter) {
      case 'today':
        return `Today (${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})`
      case 'yesterday':
        return 'Yesterday'
      case 'tomorrow':
        return 'Tomorrow'
      case 'this_weekend':
        return 'This Weekend'
      case 'current_week':
        const weekStart = startOfWeek(now)
        const weekEnd = endOfWeek(now)
        return `Current Week (${weekStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})`
      case 'last_week':
        return 'Last Week'
      case 'next_week':
        return 'Next Week'
      case 'current_month':
        return `Current Month (${now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })})`
      case 'previous_month':
        return 'Previous Month'
      case 'next_month':
        return 'Next Month'
      case 'all':
        return 'All Time'
      default:
        // Handle custom month formats
        if (dateFilter.length === 6) {
          const month = parseInt(dateFilter.substring(0, 2))
          const year = parseInt(dateFilter.substring(2))
          const date = new Date(year, month - 1)
          return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        }
        return 'Custom Range'
    }
  }
}

// Export singleton instance
export const bookingsService = BookingsService.getInstance()