import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, startOfDay, endOfDay, addDays, subDays } from 'date-fns'
import { FileText, Search, Filter, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import FirebaseBookingCard from '@/components/bookings/FirebaseBookingCard'
import ModernPageLayout from '@/components/common/ModernPageLayout'
import ModernCard from '@/components/common/ModernCard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Firebase imports
import { getAllReservations } from '../../lib/reservations'
import { getAllReservationRooms } from '../../lib/reservationRooms'
import { getGuestsByReservationId } from '../../lib/guests'
import { getAllReservationSpecialCharges } from '../../lib/reservationSpecialCharges'
import { getPaymentsByReservationId } from '../../lib/payments'
import { useAuth } from '../../contexts/AuthContext'
import { useBookings } from '../../contexts/BookingsContext'

interface FirebaseReservation {
  id: string
  referenceNumber: string
  guestName: string
  guestEmail: string
  guestPhone: string
  checkInDate: string
  checkOutDate: string
  guestCount: number
  totalPrice: number
  status: 'reservation' | 'booking' | 'checked_in' | 'checked_out' | 'cancelled'
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded'
  createdAt: string
  updatedAt?: string
}

interface Booking {
  id: string
  reference_number: string
  guest_name: string
  guest_phone: string
  guest_email: string
  check_in_date: string
  check_out_date: string
  total_quote: number
  total_paid: number
  remaining_balance: number
  status: 'reservation' | 'booking' | 'checked_in' | 'checked_out' | 'cancelled'
  guest_count: number
  room_numbers?: string
  reservation_rooms?: Array<{
    id?: string
    room_number: string
    room_type: string
    guest_count: number
    room_status?: 'pending' | 'checked_in' | 'checked_out'
    check_in_datetime?: string | null
    check_out_datetime?: string | null
  }>
  reservation_special_charges?: Array<{
    id: string
    custom_rate: number
    custom_description?: string
    quantity: number
    total_amount: number
    special_charges_master?: {
      charge_name: string
      default_rate: number
      rate_type: string
    }
  }>
  created_at: string
  updated_at?: string
  // Virtual fields for status filtering
  virtualStatus?: string
  virtualPaymentTotals?: {
    totalPaid: number
    remainingBalance: number
  }
}

type DateFilterType = 'today' | 'yesterday' | 'tomorrow' | 'this_weekend' | 'current_week' | 'last_week' | 'next_week' | 'current_month' | 'previous_month' | 'next_month' | 'all' | string

type StatusFilterType = 'all_status' | 'reservation' | 'booking' | 'checked_in' | 'checked_out' | 'cancelled' | 'pending_payments'

interface FirebaseBookingsPageLayoutProps {
  role: 'admin' | 'manager'
}

export default function FirebaseBookingsPageLayout({ role }: FirebaseBookingsPageLayoutProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searching, setSearching] = useState(false)
  const { currentUser } = useAuth()
  const { actions } = useBookings()
  
  // Persistent filter states with localStorage
  const [selectedFilter, setSelectedFilter] = useState<DateFilterType>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('bookings-date-filter') as DateFilterType) || 'today'
    }
    return 'today'
  })
  
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<StatusFilterType>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('bookings-status-filter') as StatusFilterType) || 'all_status'
    }
    return 'all_status'
  })

  // Generate upcoming months for dropdown (6 months ahead)
  const generateUpcomingMonths = () => {
    const months = []
    const now = new Date()
    
    for (let i = 2; i <= 7; i++) { // Start from month 2 (current month + 2) up to 7 (6 months ahead)
      const monthDate = addMonths(now, i)
      const key = `month_${monthDate.getFullYear()}_${monthDate.getMonth() + 1}`
      const label = format(monthDate, 'MMMM yyyy')
      months.push({ key, label, date: monthDate })
    }
    
    return months
  }
  
  const upcomingMonths = generateUpcomingMonths()
  const [isSearchMode, setIsSearchMode] = useState(false)
  const { toast } = useToast()

  // Helper function to transform Firebase data to Booking format
  const transformFirebaseToBooking = (firebaseReservation: FirebaseReservation, rooms: any[], guests: any[], specialCharges: any[]): Booking => {
    // Calculate payment info (placeholder - you may need to implement proper payment tracking)
    const totalPaid = 0 // TODO: Calculate from payments collection
    const remainingBalance = firebaseReservation.totalPrice - totalPaid

    // Find primary guest for name and phone
    const primaryGuest = guests.find(guest => guest.isPrimaryGuest)
    
    return {
      id: firebaseReservation.id,
      reference_number: firebaseReservation.referenceNumber,
      guest_name: primaryGuest?.name || firebaseReservation.guestName || 'Unknown Guest',
      guest_phone: primaryGuest?.phone || firebaseReservation.guestPhone || '',
      guest_email: firebaseReservation.guestEmail || '', // Email comes from reservation, not guest
      check_in_date: firebaseReservation.checkInDate,
      check_out_date: firebaseReservation.checkOutDate,
      total_quote: firebaseReservation.totalPrice,
      total_paid: totalPaid,
      remaining_balance: remainingBalance,
      status: firebaseReservation.status,
      guest_count: firebaseReservation.guestCount,
      room_numbers: rooms.map(r => r.roomNumber).join(', '),
      reservation_rooms: rooms.map(room => ({
        id: room.id,
        room_number: room.roomNumber,
        room_type: room.roomType,
        guest_count: room.guestCount || 0,
        room_status: room.roomStatus as 'pending' | 'checked_in' | 'checked_out',
        check_in_datetime: room.checkInTime || null,
        check_out_datetime: room.checkOutTime || null
      })),
      reservation_special_charges: specialCharges.map(charge => ({
        id: charge.id,
        custom_rate: charge.customRate || 0,
        custom_description: charge.customDescription,
        quantity: charge.quantity,
        total_amount: charge.totalAmount,
        special_charges_master: {
          charge_name: charge.customDescription || 'Special Charge',
          default_rate: charge.customRate || 0,
          rate_type: 'fixed'
        }
      })),
      created_at: firebaseReservation.createdAt,
      updated_at: firebaseReservation.updatedAt
    }
  }

  // Helper function to get date range based on filter
  const getDateRange = (filter: DateFilterType) => {
    const now = new Date()
    
    switch (filter) {
      case 'today':
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        }
      case 'yesterday': {
        const yesterday = subDays(now, 1)
        return {
          start: startOfDay(yesterday),
          end: endOfDay(yesterday)
        }
      }
      case 'tomorrow': {
        const tomorrow = addDays(now, 1)
        return {
          start: startOfDay(tomorrow),
          end: endOfDay(tomorrow)
        }
      }
      case 'current_week':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }), // Monday
          end: endOfWeek(now, { weekStartsOn: 1 })      // Sunday
        }
      case 'last_week': {
        const lastWeek = subWeeks(now, 1)
        return {
          start: startOfWeek(lastWeek, { weekStartsOn: 1 }),
          end: endOfWeek(lastWeek, { weekStartsOn: 1 })
        }
      }
      case 'next_week': {
        const nextWeek = addWeeks(now, 1)
        return {
          start: startOfWeek(nextWeek, { weekStartsOn: 1 }),
          end: endOfWeek(nextWeek, { weekStartsOn: 1 })
        }
      }
      case 'current_month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        }
      case 'previous_month': {
        const previousMonth = subMonths(now, 1)
        return {
          start: startOfMonth(previousMonth),
          end: endOfMonth(previousMonth)
        }
      }
      case 'next_month': {
        const nextMonth = addMonths(now, 1)
        return {
          start: startOfMonth(nextMonth),
          end: endOfMonth(nextMonth)
        }
      }
      case 'all':
        // Return a very wide date range to get all bookings
        return {
          start: new Date(2020, 0, 1), // January 1, 2020
          end: new Date(2030, 11, 31)  // December 31, 2030
        }
      default:
        // Handle dynamic month filters (format: month_YYYY_MM)
        if (filter.startsWith('month_')) {
          const parts = filter.split('_')
          if (parts.length === 3) {
            const year = parseInt(parts[1])
            const month = parseInt(parts[2]) - 1 // JavaScript months are 0-indexed
            const targetDate = new Date(year, month, 1)
            return {
              start: startOfMonth(targetDate),
              end: endOfMonth(targetDate)
            }
          }
        }
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 })
        }
    }
  }

  // Helper function to get display text for date range
  const getDateRangeText = (filter: DateFilterType) => {
    const { start, end } = getDateRange(filter)
    
    switch (filter) {
      case 'today':
        return `Today (${format(start, 'MMM dd, yyyy')})`
      case 'yesterday':
        return `Yesterday (${format(start, 'MMM dd, yyyy')})`
      case 'tomorrow':
        return `Tomorrow (${format(start, 'MMM dd, yyyy')})`
      case 'current_week':
        return `Current Week (${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')})`
      case 'last_week':
        return `Last Week (${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')})`
      case 'next_week':
        return `Next Week (${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')})`
      case 'current_month':
        return `Current Month (${format(start, 'MMMM yyyy')})`
      case 'previous_month':
        return `Previous Month (${format(start, 'MMMM yyyy')})`
      case 'next_month':
        return `Next Month (${format(start, 'MMMM yyyy')})`
      case 'all':
        return 'All Bookings'
      default:
        // Handle dynamic month filters
        if (filter.startsWith('month_')) {
          return format(start, 'MMMM yyyy')
        }
        return 'Current Week'
    }
  }

  // Virtual status calculation logic (same as FirebaseBookingCard)
  const calculatePaymentTotalsForBooking = (booking: Booking, payments: any[]) => {
    if (payments.length === 0) {
      return {
        totalPaid: booking.total_paid || 0,
        remainingBalance: booking.remaining_balance || 0
      }
    }

    const totalPaid = payments
      .filter(payment => payment.paymentStatus === 'completed')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0)

    const remainingBalance = Math.max(0, (booking.total_quote || 0) - totalPaid)

    return { totalPaid, remainingBalance }
  }

  const getCalculatedStatusForBooking = (booking: Booking, payments: any[]): string => {
    // If already cancelled, keep cancelled
    if (booking.status === 'cancelled') {
      return 'cancelled'
    }

    // Check room states if we have reservation_rooms
    if (booking.reservation_rooms && booking.reservation_rooms.length > 0) {
      const roomStates = booking.reservation_rooms.map(room => room.room_status || 'pending')

      // If all rooms are checked out
      if (roomStates.every(status => status === 'checked_out')) {
        return 'checked_out'
      }

      // If all rooms are checked in
      if (roomStates.every(status => status === 'checked_in')) {
        return 'checked_in'
      }

      // If some rooms are checked in (partial check-in)
      if (roomStates.some(status => status === 'checked_in')) {
        return 'checked_in' // Still show as checked_in for partial
      }
    }

    // Check payment status for booking vs reservation - use calculated total paid
    const { totalPaid } = calculatePaymentTotalsForBooking(booking, payments)
    if (totalPaid > 0) {
      return 'booking' // Payment made = booking status
    }

    // Default to reservation for new bookings with no payment
    return 'reservation'
  }

  // Helper function to filter bookings by virtual status
  const filterBookingsByStatus = useCallback(async (bookings: Booking[], statusFilter: StatusFilterType) => {
    if (statusFilter === 'all_status') {
      return bookings
    }

    // For each booking, we need to calculate the virtual status
    const bookingsWithVirtualStatus = await Promise.all(
      bookings.map(async (booking) => {
        try {
          // Load payment data for virtual status calculation
          const payments = await getPaymentsByReservationId(booking.id)
          const virtualStatus = getCalculatedStatusForBooking(booking, payments)
          const paymentTotals = calculatePaymentTotalsForBooking(booking, payments)

          return {
            ...booking,
            virtualStatus,
            virtualPaymentTotals: paymentTotals
          }
        } catch (error) {
          console.error(`Error loading payments for booking ${booking.id}:`, error)
          // Fallback to original booking data
          return {
            ...booking,
            virtualStatus: booking.status,
            virtualPaymentTotals: {
              totalPaid: booking.total_paid || 0,
              remainingBalance: booking.remaining_balance || 0
            }
          }
        }
      })
    )

    // Filter based on virtual status
    if (statusFilter === 'pending_payments') {
      return bookingsWithVirtualStatus.filter(booking =>
        (booking.virtualPaymentTotals?.remainingBalance || 0) > 0 && booking.virtualStatus !== 'cancelled'
      )
    }

    return bookingsWithVirtualStatus.filter(booking => booking.virtualStatus === statusFilter)
  }, [])

  // Helper function to get status filter display text
  const getStatusFilterText = (statusFilter: StatusFilterType) => {
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
        return 'All Status'
    }
  }

  // Load bookings data from Firebase
  const loadBookings = useCallback(async () => {
    if (!currentUser) return

    setLoading(true)
    try {
      console.log('Loading reservations from Firebase...')
      
      // Get all reservations
      const reservations = await getAllReservations()
      console.log('Loaded reservations:', reservations.length)
      
      // Get related data for each reservation
      const bookingsWithDetails = await Promise.all(
        reservations.map(async (reservation: FirebaseReservation) => {
          try {
            // Get rooms for this reservation
            const rooms = await getAllReservationRooms({ reservationId: reservation.id })
            
            // Get guests for this reservation
            const guests = await getGuestsByReservationId(reservation.id)
            
            // Get special charges for this reservation
            const specialCharges = await getAllReservationSpecialCharges({ reservationId: reservation.id })
            
            // Debug logging
            const primaryGuest = guests?.find(g => g.isPrimaryGuest)
            console.log(`Reservation ${reservation.referenceNumber}:`, {
              reservationId: reservation.id,
              guestsCount: guests?.length || 0,
              primaryGuest: primaryGuest ? {
                id: primaryGuest.id,
                name: primaryGuest.name,
                phone: primaryGuest.phone,
                isPrimaryGuest: primaryGuest.isPrimaryGuest
              } : null,
              roomsCount: rooms?.length || 0,
              allGuests: guests?.map(g => ({ name: g.name, isPrimary: g.isPrimaryGuest }))
            })
            
            return transformFirebaseToBooking(reservation, rooms || [], guests || [], specialCharges || [])
          } catch (error) {
            console.error(`Error loading details for reservation ${reservation.id}:`, error)
            return transformFirebaseToBooking(reservation, [], [], [])
          }
        })
      )
      
      // Apply date filtering
      if (selectedFilter !== 'all') {
        const { start, end } = getDateRange(selectedFilter)
        const dateFilteredResults = bookingsWithDetails.filter((booking: Booking) => {
          const checkInDate = new Date(booking.check_in_date)
          const checkOutDate = new Date(booking.check_out_date)
          
          // Include bookings that overlap with the date range
          return (checkInDate <= end && checkOutDate >= start)
        })
        
        // Apply status filtering (async)
        const statusFilteredResults = await filterBookingsByStatus(dateFilteredResults, selectedStatusFilter)

        setBookings(statusFilteredResults)
      } else {
        // Apply status filtering to all bookings (async)
        const statusFilteredResults = await filterBookingsByStatus(bookingsWithDetails, selectedStatusFilter)
        setBookings(statusFilteredResults)
      }
      
    } catch (error) {
      console.error('Error loading bookings:', error)
      toast({
        title: "Fetch Error",
        description: "Failed to fetch bookings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [currentUser, selectedFilter, selectedStatusFilter, filterBookingsByStatus, toast])

  // Set refresh callback for BookingsContext
  useEffect(() => {
    actions.setRefreshCallback(loadBookings)
  }, [actions, loadBookings])

  // Auto-fetch bookings on component mount and filter changes
  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  // Handle search button click
  const handleSearchClick = async () => {
    const term = searchQuery.trim()
    if (!term) {
      // If search is empty, clear search mode
      handleClearSearch()
      return
    }

    setSearchTerm(term)
    setIsSearchMode(true)
    setSearching(true)
    try {
      // Load all bookings and filter client-side
      const reservations = await getAllReservations()
      
      const allBookingsWithDetails = await Promise.all(
        reservations.map(async (reservation: FirebaseReservation) => {
          try {
            const rooms = await getAllReservationRooms({ reservationId: reservation.id })
            const guests = await getGuestsByReservationId(reservation.id)
            const specialCharges = await getAllReservationSpecialCharges({ reservationId: reservation.id })
            
            // Debug logging for search
            const primaryGuestSearch = guests?.find(g => g.isPrimaryGuest)
            console.log(`Search - Reservation ${reservation.referenceNumber}:`, {
              reservationId: reservation.id,
              guestsCount: guests?.length || 0,
              primaryGuest: primaryGuestSearch ? {
                name: primaryGuestSearch.name,
                phone: primaryGuestSearch.phone,
                isPrimary: primaryGuestSearch.isPrimaryGuest
              } : null
            })
            
            return transformFirebaseToBooking(reservation, rooms || [], guests || [], specialCharges || [])
          } catch (error) {
            console.error(`Error loading details for reservation ${reservation.id}:`, error)
            return transformFirebaseToBooking(reservation, [], [], [])
          }
        })
      )
      
      // Calculate virtual status for each booking and then filter based on search term
      const bookingsWithVirtualStatus = await Promise.all(
        allBookingsWithDetails.map(async (booking) => {
          try {
            // Load payment data for virtual status calculation
            const payments = await getPaymentsByReservationId(booking.id)
            const virtualStatus = getCalculatedStatusForBooking(booking, payments)
            const paymentTotals = calculatePaymentTotalsForBooking(booking, payments)

            return {
              ...booking,
              virtualStatus,
              virtualPaymentTotals: paymentTotals
            }
          } catch (error) {
            console.error(`Error loading payments for search booking ${booking.id}:`, error)
            // Fallback to original booking data
            return {
              ...booking,
              virtualStatus: booking.status,
              virtualPaymentTotals: {
                totalPaid: booking.total_paid || 0,
                remainingBalance: booking.remaining_balance || 0
              }
            }
          }
        })
      )

      // Filter bookings based on search term (including virtual status)
      const searchResults = bookingsWithVirtualStatus.filter((booking: Booking) => {
        const searchLower = term.toLowerCase()
        return (
          booking.reference_number?.toLowerCase().includes(searchLower) ||
          booking.guest_name?.toLowerCase().includes(searchLower) ||
          booking.guest_phone?.toLowerCase().includes(searchLower) ||
          booking.guest_email?.toLowerCase().includes(searchLower) ||
          booking.room_numbers?.toLowerCase().includes(searchLower) ||
          booking.status?.toLowerCase().includes(searchLower) ||
          booking.virtualStatus?.toLowerCase().includes(searchLower)
        )
      })

      setBookings(searchResults)
      
      if (searchResults?.length === 0) {
        toast({
          title: "No Results",
          description: "No bookings found with the provided search criteria.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search bookings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSearching(false)
    }
  }

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchTerm('')
    setIsSearchMode(false)
    loadBookings()
  }

  // Handle Enter key in search input
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchClick()
    }
  }

  // Handle date filter change
  const handleFilterChange = (filter: DateFilterType) => {
    setSelectedFilter(filter)
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookings-date-filter', filter)
    }
    if (!isSearchMode) {
      // Will trigger loadBookings via useEffect
    }
  }

  // Handle status filter change
  const handleStatusFilterChange = (statusFilter: StatusFilterType) => {
    setSelectedStatusFilter(statusFilter)
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookings-status-filter', statusFilter)
    }
    if (!isSearchMode) {
      // Will trigger loadBookings via useEffect
    }
  }

  // Handle manual refresh
  const handleRefresh = async () => {
    if (refreshing || loading) return

    setRefreshing(true)
    try {
      if (isSearchMode && searchTerm.trim()) {
        // Refresh search results
        setSearchQuery(searchTerm)
        await handleSearchClick()
      } else {
        // Refresh regular filtered results
        await loadBookings()
      }
      toast({
        title: "Refreshed",
        description: "Bookings data has been refreshed successfully.",
      })
    } catch (error) {
      console.error('Error refreshing bookings:', error)
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh bookings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <ModernPageLayout
      title="Booking Management"
      subtitle="Search and manage all bookings"
      icon={FileText}
      headerContent={
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder="Search by guest name, booking ID, room number, or status..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-black focus:ring-black bg-white w-full"
              disabled={loading || searching}
            />
          </div>

          {/* Search Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearchClick}
            disabled={searching || loading}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              searching || loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Search className={`h-4 w-4 ${searching ? 'animate-pulse' : ''}`} />
            <span>Search</span>
          </motion.button>

          {/* Clear Search Button */}
          {isSearchMode && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearSearch}
              className="px-3 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
              title="Clear search"
            >
              ✕
            </motion.button>
          )}

          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={refreshing || loading || searching}
            className={`p-2 rounded-lg transition-colors ${
              refreshing || loading || searching
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            }`}
            title="Refresh bookings"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      }
    >

      {/* Filters Card */}
      <ModernCard title="Filters" icon={Filter}>
        {/* Date Filter Buttons */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Date Range</h3>
          <div className="flex flex-wrap items-center gap-3">
            {[
              { key: 'today' as DateFilterType, label: 'Today' },
              { key: 'yesterday' as DateFilterType, label: 'Yesterday' },
              { key: 'tomorrow' as DateFilterType, label: 'Tomorrow' },
              { key: 'current_week' as DateFilterType, label: 'Current Week' },
              { key: 'last_week' as DateFilterType, label: 'Last Week' },
              { key: 'next_week' as DateFilterType, label: 'Next Week' },
              { key: 'current_month' as DateFilterType, label: 'Current Month' },
              { key: 'previous_month' as DateFilterType, label: 'Previous Month' },
              { key: 'next_month' as DateFilterType, label: 'Next Month' },
              { key: 'all' as DateFilterType, label: 'All' },
            ].map((filter) => (
              <motion.button
                key={filter.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFilterChange(filter.key)}
                disabled={isSearchMode}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === filter.key && !isSearchMode
                    ? 'bg-gray-900 text-white'
                    : isSearchMode
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </motion.button>
            ))}
            
            {/* Upcoming Months Dropdown */}
            <div className="relative">
              <Select
                disabled={isSearchMode}
                value={upcomingMonths.some(month => month.key === selectedFilter) ? selectedFilter : ''}
                onValueChange={(value) => handleFilterChange(value as DateFilterType)}
              >
                <SelectTrigger className={`w-48 text-sm font-medium transition-colors ${
                  upcomingMonths.some(month => month.key === selectedFilter) && !isSearchMode
                    ? 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800'
                    : isSearchMode
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
                }`}>
                  <SelectValue placeholder="Upcoming Months" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 shadow-lg">
                  {upcomingMonths.map((month) => (
                    <SelectItem 
                      key={month.key} 
                      value={month.key} 
                      className="text-sm bg-white hover:bg-gray-100 focus:bg-gray-100 cursor-pointer"
                    >
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {!isSearchMode && (
            <p className="text-sm text-gray-600 mt-2">
              Showing: {getDateRangeText(selectedFilter)}
            </p>
          )}
          {isSearchMode && (
            <p className="text-sm text-gray-500 mt-2">
              Date filters disabled during search. Clear search to re-enable.
            </p>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Status</h3>
          <div className="flex flex-wrap items-center gap-3">
            {[
              { key: 'all_status' as StatusFilterType, label: 'All Status' },
              { key: 'reservation' as StatusFilterType, label: 'Reservation' },
              { key: 'booking' as StatusFilterType, label: 'Booking' },
              { key: 'checked_in' as StatusFilterType, label: 'Checked-In' },
              { key: 'checked_out' as StatusFilterType, label: 'Checked-Out' },
              { key: 'pending_payments' as StatusFilterType, label: 'Pending Payments' },
              { key: 'cancelled' as StatusFilterType, label: 'Cancelled' },
            ].map((filter) => (
              <motion.button
                key={filter.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStatusFilterChange(filter.key)}
                disabled={isSearchMode}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatusFilter === filter.key && !isSearchMode
                    ? 'bg-gray-900 text-white'
                    : isSearchMode
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
          {!isSearchMode && (
            <p className="text-sm text-gray-600 mt-2">
              Status: {getStatusFilterText(selectedStatusFilter)}
            </p>
          )}
          {isSearchMode && (
            <p className="text-sm text-gray-500 mt-2">
              Status filters disabled during search. Clear search to re-enable.
            </p>
          )}
        </div>
      </ModernCard>

      {/* Results */}
      {bookings.length > 0 && (
        <ModernCard 
          title={isSearchMode 
            ? `Search Results (${bookings.length})` 
            : `${getDateRangeText(selectedFilter)} • ${getStatusFilterText(selectedStatusFilter)} (${bookings.length})`
          }
          subtitle={`${bookings.length} booking${bookings.length !== 1 ? 's' : ''} sorted by today's check-ins first`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <FirebaseBookingCard
                key={booking.id}
                booking={booking}
                showActions={true}
                showRoomStatus={true}
                onPaymentUpdate={loadBookings}
              />
            ))}
          </div>
        </ModernCard>
      )}

      {/* Empty State */}
      {!loading && bookings.length === 0 && (
        <ModernCard>
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isSearchMode ? 'No Search Results' : 'No Bookings Found'}
              </h3>
              <p className="text-gray-600 mb-4">
                {isSearchMode 
                  ? 'No bookings found with the provided search criteria.'
                  : `No bookings found for ${getDateRangeText(selectedFilter).toLowerCase()} with status "${getStatusFilterText(selectedStatusFilter).toLowerCase()}".`
                }
              </p>
              {isSearchMode && (
                <button
                  onClick={handleClearSearch}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        </ModernCard>
      )}

    </ModernPageLayout>
  )
}