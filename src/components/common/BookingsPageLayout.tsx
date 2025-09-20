import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, startOfDay, endOfDay, addDays, subDays } from 'date-fns'
import { FileText, Search, Filter, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import BookingCard from '@/components/bookings/BookingCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Firebase imports
import { getAllReservations } from '../../lib/reservations'
import { getAllReservationRooms } from '../../lib/reservationRooms'
import { getGuestsByReservationId } from '../../lib/guests'
import { getAllReservationSpecialCharges } from '../../lib/reservationSpecialCharges'
import { getPaymentsByReservationId } from '../../lib/payments'
import { getAgent } from '../../lib/agents'
import { useAuth } from '../../contexts/AuthContext'
import { useBookingsActions, useBookingsData, useBookingsFilters } from '../../stores/bookingsStore'

interface ReservationData {
  id: string
  referenceNumber: string
  guestName: string
  guestEmail: string
  guestPhone: string
  checkInDate: string
  checkOutDate: string
  guestCount: number
  totalPrice: number
  agentId?: string | null
  agentCommission?: number | null
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
  paymentStatus: 'pending' | 'partial' | 'paid'
  guest_count: number
  room_numbers?: string
  agent_id?: string | null
  agent_commission?: number | null
  agent_name?: string | null
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
}

type DateFilterType = 'today' | 'yesterday' | 'tomorrow' | 'this_weekend' | 'current_week' | 'last_week' | 'next_week' | 'current_month' | 'previous_month' | 'next_month' | 'all' | string

type StatusFilterType = 'all_status' | 'reservation' | 'booking' | 'checked_in' | 'checked_out' | 'cancelled' | 'pending_payments'

interface BookingsPageLayoutProps {
  role: 'admin' | 'manager'
}

export default function BookingsPageLayout({ role }: BookingsPageLayoutProps) {
  console.log(`🏨 BookingsPageLayout rendering with role: ${role}`)
  const startTime = performance.now()

  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searching, setSearching] = useState(false)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { currentUser } = useAuth()
  const { loadBookings, refreshBookings } = useBookingsActions()
  const { bookings: storeBookings, loading: storeLoading } = useBookingsData()
  const { dateFilter, statusFilter, setDateFilter, setStatusFilter } = useBookingsFilters()

  // Persistent filter states with localStorage - more robust implementation
  const [selectedFilter, setSelectedFilter] = useState<DateFilterType>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('avr-bookings-date-filter')
      return (saved as DateFilterType) || 'today'
    }
    return 'today'
  })

  const [selectedStatusFilter, setSelectedStatusFilter] = useState<StatusFilterType>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('avr-bookings-status-filter')
      return (saved as StatusFilterType) || 'all_status'
    }
    return 'all_status'
  })

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('avr-bookings-date-filter', selectedFilter)
    }
  }, [selectedFilter])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('avr-bookings-status-filter', selectedStatusFilter)
    }
  }, [selectedStatusFilter])

  console.log(`🏨 BookingsPageLayout state:`, {
    bookingsCount: bookings.length,
    loading,
    refreshing,
    searching,
    selectedStatusFilter,
    selectedFilter,
    isRefreshing,
    currentUser: currentUser?.uid || 'none'
  })

  // Generate upcoming months for dropdown (6 months ahead) - memoized
  const upcomingMonths = useMemo(() => {
    const months = []
    const now = new Date()

    for (let i = 2; i <= 7; i++) { // Start from month 2 (current month + 2) up to 7 (6 months ahead)
      const monthDate = addMonths(now, i)
      const key = `month_${monthDate.getFullYear()}_${monthDate.getMonth() + 1}`
      const label = format(monthDate, 'MMMM yyyy')
      months.push({ key, label, date: monthDate })
    }

    return months
  }, [])
  const [isSearchMode, setIsSearchMode] = useState(false)
  const { toast } = useToast()

  // Helper function to transform Firebase data to Booking format - memoized
  const transformReservationToBooking = useCallback((reservationData: ReservationData, rooms: any[], guests: any[], specialCharges: any[], agentName?: string | null): Booking => {
    // Calculate payment info (placeholder - you may need to implement proper payment tracking)
    const totalPaid = 0 // TODO: Calculate from payments collection
    const remainingBalance = reservationData.totalPrice - totalPaid

    // Find primary guest for name and phone
    const primaryGuest = guests.find(guest => guest.isPrimaryGuest)

    const booking = {
      id: reservationData.id,
      reference_number: reservationData.referenceNumber,
      guest_name: primaryGuest?.name || reservationData.guestName || 'Unknown Guest',
      guest_phone: primaryGuest?.phone || reservationData.guestPhone || '',
      guest_email: reservationData.guestEmail || '', // Email comes from reservation, not guest
      check_in_date: reservationData.checkInDate,
      check_out_date: reservationData.checkOutDate,
      total_quote: reservationData.totalPrice,
      total_paid: totalPaid,
      remaining_balance: remainingBalance,
      status: reservationData.status,
      paymentStatus: reservationData.paymentStatus,
      guest_count: reservationData.guestCount,
      agent_id: reservationData.agentId,
      agent_commission: reservationData.agentCommission,
      agent_name: agentName,
      room_numbers: rooms.map(r => r.roomNumber).join(', '),
      reservation_rooms: rooms.map(room => ({
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
        custom_description: charge.customDescription,
        quantity: charge.quantity,
        total_amount: charge.totalAmount,
        special_charges_master: {
          charge_name: charge.customDescription || 'Special Charge',
          default_rate: charge.customRate || 0,
          rate_type: 'fixed'
        }
      })),
      created_at: reservationData.createdAt,
      updated_at: reservationData.updatedAt
    }


    return booking
  }, [])

  // Helper function to get date range based on filter - memoized
  const getDateRange = useCallback((filter: DateFilterType) => {
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
  }, [])

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

  // Simple status filtering without virtual calculations
  const filterBookingsByStatus = useCallback((bookings: Booking[], statusFilter: StatusFilterType) => {
    console.log('🔍 Filtering bookings by status:', statusFilter)
    console.log('📊 Input bookings count:', bookings.length)
    const bookingDetails = bookings.map(b => ({
      id: b.id,
      status: b.status,
      paymentStatus: b.paymentStatus,
      ref: b.reference_number
    }))
    console.log('📊 Available bookings with statuses:', bookingDetails)

    // Log each booking individually for easier reading
    bookingDetails.forEach((booking, index) => {
      console.log(`📊 Booking ${index + 1}:`, booking)
    })
    console.log('📊 Current status filter:', statusFilter)

    if (statusFilter === 'all_status') {
      return bookings
    }

    if (statusFilter === 'pending_payments') {
      // Show reservations that have pending or partial payment status
      const filtered = bookings.filter(booking => {
        const hasPendingPayments = booking.paymentStatus === 'pending' || booking.paymentStatus === 'partial'
        const isNotCancelled = booking.status !== 'cancelled'
        const matches = hasPendingPayments && isNotCancelled
        console.log(`🔍 Pending payments check for ${booking.reference_number || booking.ref || 'NO_REF'}: paymentStatus='${booking.paymentStatus}' (hasPending=${hasPendingPayments}) + status='${booking.status}' (notCancelled=${isNotCancelled}) → ${matches ? 'MATCH' : 'NO MATCH'}`)
        return matches
      })
      console.log('💰 Pending payments filtered:', filtered.length, 'bookings')
      console.log(`💰 Filtered booking IDs:`, filtered.map(b => b.ref))
      return filtered
    }

    const filtered = bookings.filter(booking => {
      const matches = booking.status === statusFilter
      console.log(`🔍 Checking booking ${booking.reference_number || booking.ref || 'NO_REF'}: status='${booking.status}' vs filter='${statusFilter}' → ${matches ? 'MATCH' : 'NO MATCH'}`)
      return matches
    })
    console.log(`📋 Status '${statusFilter}' filtered:`, filtered.length, 'bookings')
    console.log(`📋 Filtered booking IDs:`, filtered.map(b => b.ref))
    return filtered
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
  const loadBookings = async (overrideStatusFilter?: StatusFilterType, overrideDateFilter?: DateFilterType) => {
    const callTime = performance.now()
    console.log(`📥 loadBookings called at ${callTime.toFixed(2)}ms`)

    if (!currentUser) {
      console.log('📥 loadBookings aborted - no currentUser')
      return
    }

    console.log(`📥 loadBookings starting with user: ${currentUser.uid}`)

    // Refresh callback is now set up in useEffect to avoid dependency issues

    setLoading(true)
    try {
      console.log('Loading reservations from Firebase...')
      
      // Get all reservations
      const reservations = await getAllReservations()
      console.log('Loaded reservations:', reservations.length)
      console.log('Reservation statuses:', reservations.map(r => ({ id: r.id, ref: r.referenceNumber, status: r.status, paymentStatus: r.paymentStatus })))

      // Debug: Log each reservation in detail
      reservations.forEach((res, index) => {
        console.log(`🔍 Reservation ${index + 1} Details:`, {
          id: res.id,
          referenceNumber: res.referenceNumber,
          status: res.status,
          paymentStatus: res.paymentStatus,
          guestName: res.guestName,
          totalPrice: res.totalPrice
        })
      })
      
      // Get related data for each reservation
      const bookingsWithDetails = await Promise.all(
        reservations.map(async (reservation: any) => {
          try {
            // Get rooms for this reservation
            const rooms = await getAllReservationRooms({ reservationId: reservation.id })
            
            // Get guests for this reservation
            const guests = await getGuestsByReservationId(reservation.id)
            
            // Get special charges for this reservation
            const specialCharges = await getAllReservationSpecialCharges({ reservationId: reservation.id })

            // Get agent information if agent ID exists
            let agentName = null
            if (reservation.agentId) {
              try {
                const agent = await getAgent(reservation.agentId)
                agentName = agent?.name || null
              } catch (error) {
                console.error(`Error loading agent ${reservation.agentId}:`, error)
              }
            }

            // Debug logging
            const primaryGuest = guests?.find(g => g.isPrimaryGuest)

            // Special debug for the specific reservation
            if (reservation.id === '5tnn6iuqJfRWvY9YiWnz') {
              console.log('🔍 DEBUGGING SPECIFIC RESERVATION:', {
                reservationId: reservation.id,
                referenceNumber: reservation.referenceNumber,
                agentId: reservation.agentId,
                agentCommission: reservation.agentCommission,
                agentName: agentName,
                rawReservation: reservation
              })
            }

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
              agentId: reservation.agentId,
              agentName: agentName,
              allGuests: guests?.map(g => ({ name: g.name, isPrimary: g.isPrimaryGuest }))
            })

            return transformReservationToBooking(reservation, rooms || [], guests || [], specialCharges || [], agentName)
          } catch (error) {
            console.error(`Error loading details for reservation ${reservation.id}:`, error)
            return transformReservationToBooking(reservation, [], [], [], null)
          }
        })
      )
      
      console.log('📊 Processing filtering step...')

      // Use override filters if provided, otherwise use current state
      const currentDateFilter = overrideDateFilter || selectedFilter
      const currentStatusFilter = overrideStatusFilter || selectedStatusFilter

      console.log('📊 Using filters:', { dateFilter: currentDateFilter, statusFilter: currentStatusFilter })
      console.log('📊 Component state selectedStatusFilter:', selectedStatusFilter)
      console.log('📊 Override status filter:', overrideStatusFilter)

      // Apply date filtering
      if (currentDateFilter !== 'all') {
        console.log('📅 Applying date filter:', currentDateFilter)
        const { start, end } = getDateRange(currentDateFilter)
        const dateFilteredResults = bookingsWithDetails.filter((booking: Booking) => {
          const checkInDate = new Date(booking.check_in_date)
          const checkOutDate = new Date(booking.check_out_date)

          // Include bookings that overlap with the date range
          return (checkInDate <= end && checkOutDate >= start)
        })

        console.log('📅 Date filtered results:', dateFilteredResults.length)

        // Apply status filtering
        const statusFilteredResults = filterBookingsByStatus(dateFilteredResults, currentStatusFilter)
        console.log('📊 Final filtered results:', statusFilteredResults.length)

        setBookings(statusFilteredResults)
        console.log('✅ Bookings state updated with filtered results')
      } else {
        console.log('📋 Applying status filter only (no date filter)')
        // Apply status filtering to all bookings
        const statusFilteredResults = filterBookingsByStatus(bookingsWithDetails, currentStatusFilter)
        console.log('📊 Final status filtered results:', statusFilteredResults.length)

        setBookings(statusFilteredResults)
        console.log('✅ Bookings state updated with status filtered results')
      }

      console.log('🎉 loadBookings completed successfully')
      
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
  }

  // Note: Removed all automatic loading useEffects to prevent infinite loops
  // Bookings are now loaded manually via "Load Bookings" button
  // Refresh callback is set when needed during operations

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
        reservations.map(async (reservation: any) => {
          try {
            const rooms = await getAllReservationRooms({ reservationId: reservation.id })
            const guests = await getGuestsByReservationId(reservation.id)
            const specialCharges = await getAllReservationSpecialCharges({ reservationId: reservation.id })

            // Get agent information if agent ID exists
            let agentName = null
            if (reservation.agentId) {
              try {
                const agent = await getAgent(reservation.agentId)
                agentName = agent?.name || null
              } catch (error) {
                console.error(`Error loading agent ${reservation.agentId}:`, error)
              }
            }

            // Debug logging for search
            const primaryGuestSearch = guests?.find(g => g.isPrimaryGuest)
            console.log(`Search - Reservation ${reservation.referenceNumber}:`, {
              reservationId: reservation.id,
              guestsCount: guests?.length || 0,
              primaryGuest: primaryGuestSearch ? {
                name: primaryGuestSearch.name,
                phone: primaryGuestSearch.phone,
                isPrimary: primaryGuestSearch.isPrimaryGuest
              } : null,
              agentId: reservation.agentId,
              agentName: agentName
            })

            return transformReservationToBooking(reservation, rooms || [], guests || [], specialCharges || [], agentName)
          } catch (error) {
            console.error(`Error loading details for reservation ${reservation.id}:`, error)
            return transformReservationToBooking(reservation, [], [], [], null)
          }
        })
      )
      
      // Filter bookings based on search term
      const searchResults = allBookingsWithDetails.filter((booking: Booking) => {
        const searchLower = term.toLowerCase()
        return (
          booking.reference_number?.toLowerCase().includes(searchLower) ||
          booking.guest_name?.toLowerCase().includes(searchLower) ||
          booking.guest_phone?.toLowerCase().includes(searchLower) ||
          booking.guest_email?.toLowerCase().includes(searchLower) ||
          booking.room_numbers?.toLowerCase().includes(searchLower) ||
          booking.status?.toLowerCase().includes(searchLower)
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
    // Only reload if we have bookings, otherwise just clear search mode
    if (bookings.length > 0) {
      loadBookings()
    }
  }

  // Handle Enter key in search input
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchClick()
    }
  }

  // Handle date filter change
  const handleFilterChange = useCallback((filter: DateFilterType) => {
    console.log('🗂️ Date filter changing to:', filter)

    try {
      setSelectedFilter(filter)
      // localStorage is updated automatically via useEffect

      if (!isSearchMode) {
        console.log('🗂️ Reloading with new date filter:', filter)
        loadBookings(selectedStatusFilter, filter)
      }
    } catch (error) {
      console.error('🗂️ Error in handleFilterChange:', error)
    }
  }, [isSearchMode, selectedStatusFilter, loadBookings])

  // Handle status filter change
  const handleStatusFilterChange = useCallback((statusFilter: StatusFilterType) => {
    console.log('📊 Status filter changing to:', statusFilter)

    try {
      setSelectedStatusFilter(statusFilter)
      // localStorage is updated automatically via useEffect

      if (!isSearchMode) {
        console.log('📊 Reloading with new status filter:', statusFilter)
        loadBookings(statusFilter, selectedFilter)
      } else {
        console.log('📊 Skipping reload - in search mode')
      }
    } catch (error) {
      console.error('📊 Error in handleStatusFilterChange:', error)
    }
  }, [isSearchMode, selectedFilter, loadBookings])

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

  // Force booking card refresh using timestamp for payment/checkin/checkout operations
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Callback to trigger individual booking card refresh
  const triggerBookingRefresh = useCallback(() => {
    console.log('💳 Triggering booking card refresh')
    setRefreshTrigger(prev => prev + 1)
  }, [])

  // Set up refresh trigger in the refresh callback
  useEffect(() => {
    const currentRefreshCallback = () => {
      console.log('🔄 Main refresh triggered, updating cards')
      // Trigger card refresh first
      triggerBookingRefresh()

      // Then reload data
      const currentDateFilter = (typeof window !== 'undefined' ?
        localStorage.getItem('avr-bookings-date-filter') as DateFilterType : null) || 'today'
      const currentStatusFilter = (typeof window !== 'undefined' ?
        localStorage.getItem('avr-bookings-status-filter') as StatusFilterType : null) || 'all_status'

      loadBookings(currentStatusFilter, currentDateFilter)
    }

    actions.setRefreshCallback(currentRefreshCallback)
  }, [actions, loadBookings, triggerBookingRefresh])

  // Memoized bookings list with refresh trigger
  const memoizedBookingsList = useMemo(
    () => bookings.map((booking) => (
      <BookingCard
        key={`${booking.id}-${refreshTrigger}`} // Use refresh trigger to force updates
        booking={booking}
        showActions={true}
        showRoomStatus={true}
        onPaymentUpdate={() => {}} // Keep empty to prevent duplicate refreshes
      />
    )),
    [bookings, refreshTrigger]
  )

  return (
    <motion.div
      className="space-y-8 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-gray-900" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-gray-600 mt-2">Search and manage all bookings</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full lg:w-auto">
          {/* Load Bookings Button - Primary Action - Only show when nothing has been loaded yet */}
          {!hasLoadedOnce && bookings.length === 0 && !loading && !searching && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => {
                  setHasLoadedOnce(true)
                  loadBookings()
                }}
                disabled={loading || searching}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <FileText className={`mr-2 h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
                Load Bookings
              </Button>
            </motion.div>
          )}

          {/* Search Section - Show after first load attempt */}
          {(hasLoadedOnce || bookings.length > 0 || isSearchMode) && (
            <>
              <div className="relative flex-1 lg:flex-initial lg:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="Search by guest name, booking ID, room number, or status..."
                  className="pl-10 bg-white/95 backdrop-blur-sm border-black/20"
                  disabled={loading || searching}
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Search Button */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleSearchClick}
                    disabled={searching || loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Search className={`mr-2 h-4 w-4 ${searching ? 'animate-pulse' : ''}`} />
                    Search
                  </Button>
                </motion.div>

                {/* Clear Search Button */}
                {isSearchMode && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleClearSearch}
                      variant="outline"
                      className="bg-white/95 backdrop-blur-sm border-black/20"
                      title="Clear search"
                    >
                      ✕
                    </Button>
                  </motion.div>
                )}

                {/* Refresh Button */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleRefresh}
                    disabled={refreshing || loading || searching}
                    variant="outline"
                    className="bg-white/95 backdrop-blur-sm border-black/20"
                    title="Refresh bookings"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Filters Card - Show after first load attempt */}
      {(hasLoadedOnce || bookings.length > 0 || isSearchMode) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Results */}
      {bookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {isSearchMode
                  ? `Search Results (${bookings.length})`
                  : `${getDateRangeText(selectedFilter)} • ${getStatusFilterText(selectedStatusFilter)} (${bookings.length})`
                }
              </CardTitle>
              <p className="text-sm text-gray-600">
                {`${bookings.length} booking${bookings.length !== 1 ? 's' : ''} sorted by today's check-ins first`}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {memoizedBookingsList}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty State or Welcome State */}
      {!loading && bookings.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {isSearchMode
                      ? 'No Search Results'
                      : hasLoadedOnce
                        ? 'No Bookings Found'
                        : 'Ready to Load Bookings'
                    }
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {isSearchMode
                      ? 'No bookings found with the provided search criteria.'
                      : hasLoadedOnce
                        ? 'No bookings match the current filters. Try adjusting your date range or status filters.'
                        : 'Click the "Load Bookings" button above to view all bookings. Use filters and search after loading.'
                    }
                  </p>
                  {isSearchMode && (
                    <Button
                      onClick={handleClearSearch}
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )

  // Performance logging at the end of render
  const endTime = performance.now()
  console.log(`🏨 BookingsPageLayout render completed in ${(endTime - startTime).toFixed(2)}ms`)
}