import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, startOfDay, endOfDay, addDays, subDays, nextSaturday, nextSunday, isWeekend, isSaturday } from 'date-fns'
import { FileText, Search, Filter } from 'lucide-react'
import { supabaseQueries } from '@/lib/database'
import { useToast } from '@/hooks/use-toast'
import PaymentUpdateModal from '@/components/admin/PaymentUpdateModal'
import CheckInModal from '@/components/admin/CheckInModal'
import CheckOutModal from '@/components/admin/CheckOutModal'
import EditReservationModal from '@/components/admin/EditReservationModal'
import CancelReservationModal from '@/components/admin/CancelReservationModal'
import DocumentViewer from '@/components/ui/document-viewer'
import BookingSearch from '@/components/bookings/BookingSearch'
import BookingCard from '@/components/bookings/BookingCard'
import BookingEmptyState from '@/components/bookings/BookingEmptyState'
import ModernPageLayout from '@/components/common/ModernPageLayout'
import ModernCard from '@/components/common/ModernCard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
}

type DateFilterType = 'today' | 'yesterday' | 'tomorrow' | 'this_weekend' | 'current_week' | 'last_week' | 'next_week' | 'current_month' | 'previous_month' | 'next_month' | 'all' | string

type StatusFilterType = 'all_status' | 'reservation' | 'booking' | 'checked_in' | 'checked_out' | 'cancelled' | 'pending_payments'

interface BookingsPageLayoutProps {
  role: 'admin' | 'manager'
}

export default function BookingsPageLayout({ role }: BookingsPageLayoutProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [updatingPayment, setUpdatingPayment] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [checkInBooking, setCheckInBooking] = useState<Booking | null>(null)
  const [checkOutBooking, setCheckOutBooking] = useState<Booking | null>(null)
  const [editBooking, setEditBooking] = useState<Booking | null>(null)
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null)
  const [bookingWhatsAppData, setBookingWhatsAppData] = useState<{[key: string]: any}>({})
  const [documents, setDocuments] = useState<any[]>([])
  const [showDocuments, setShowDocuments] = useState(false)
  const [loadingDocuments, setLoadingDocuments] = useState(false)
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

  // Function to prepare WhatsApp data for a booking
  const prepareWhatsAppData = async (booking: Booking) => {
    try {
      const guestData = await supabaseQueries.getGuestsByReservation(booking.id)
      
      if (!guestData || guestData.length === 0) {
        return null
      }

      const primaryGuest = guestData.find(g => g.is_primary_guest) || guestData[0]
      const secondaryGuests = guestData.filter(g => !g.is_primary_guest)
      
      return {
        referenceNumber: booking.reference_number,
        totalAmount: booking.total_quote,
        primaryGuest: {
          id: primaryGuest.id,
          name: primaryGuest.name,
          phone: primaryGuest.phone,
          whatsapp: primaryGuest.whatsapp,
          telegram: primaryGuest.telegram
        },
        secondaryGuests: secondaryGuests.map(guest => ({
          id: guest.id,
          name: guest.name,
          phone: guest.phone,
          whatsapp: guest.whatsapp,
          telegram: guest.telegram
        })),
        checkInDate: booking.check_in_date,
        checkOutDate: booking.check_out_date,
        roomAllocations: booking.reservation_rooms?.map(room => ({
          id: room.id || '',
          room_id: '',
          room_number: room.room_number,
          room_type: room.room_type,
          capacity: 0,
          tariff: 0,
          guest_count: room.guest_count
        })) || [],
        guestCount: booking.guest_count
      }
    } catch (error) {
      console.error('Error preparing WhatsApp data for booking:', booking.id, error)
      return null
    }
  }

  // Function to load WhatsApp data for all bookings
  const loadWhatsAppDataForBookings = useCallback(async (bookings: Booking[]) => {
    const whatsAppDataMap: {[key: string]: any} = {}
    
    // Load WhatsApp data for each booking in parallel
    const promises = bookings.map(async (booking) => {
      const data = await prepareWhatsAppData(booking)
      if (data) {
        whatsAppDataMap[booking.id] = data
      }
    })
    
    await Promise.all(promises)
    setBookingWhatsAppData(whatsAppDataMap)
  }, [])

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
      case 'this_weekend': {
        // Get the upcoming weekend (Saturday and Sunday)
        const currentDay = now.getDay()
        let weekendStart: Date

        if (currentDay === 6) { // Saturday
          weekendStart = startOfDay(now)
        } else if (currentDay === 0) { // Sunday
          weekendStart = startOfDay(addDays(now, -1)) // Previous Saturday
        } else {
          // Find next Saturday
          weekendStart = startOfDay(nextSaturday(now))
        }

        const weekendEnd = endOfDay(addDays(weekendStart, 1)) // Sunday

        return {
          start: weekendStart,
          end: weekendEnd
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
      case 'this_weekend':
        return `This Weekend (${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')})`
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

  // Helper function to filter bookings by status
  const filterBookingsByStatus = useCallback((bookings: Booking[], statusFilter: StatusFilterType) => {
    if (statusFilter === 'all_status') {
      return bookings
    }
    
    if (statusFilter === 'pending_payments') {
      return bookings.filter(booking => 
        (booking.remaining_balance || 0) > 0 && booking.status !== 'cancelled'
      )
    }
    
    return bookings.filter(booking => booking.status === statusFilter)
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

  // Fetch bookings by date range and apply status filtering
  const fetchBookingsByFilters = useCallback(async (dateFilter: DateFilterType, statusFilter?: StatusFilterType) => {
    setLoading(true)
    try {
      // Use the appropriate API endpoint based on role with cache busting
      const apiEndpoint = `${role === 'admin' ? '/api/admin/bookings' : '/api/manager/bookings'}?t=${Date.now()}&nocache=true`
      const response = await fetch(apiEndpoint)
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch bookings')
      }
      
      let results = data.bookings || []
      
      // Apply date filtering (since API returns all bookings)
      if (dateFilter !== 'all') {
        const { start, end } = getDateRange(dateFilter)
        results = results.filter((booking: any) => {
          const checkInDate = new Date(booking.check_in_date)
          const checkOutDate = new Date(booking.check_out_date)
          
          // Include bookings that overlap with the date range
          return (checkInDate <= end && checkOutDate >= start)
        })
      }
      
      // Apply status filtering
      const currentStatusFilter = statusFilter || selectedStatusFilter
      const filteredByStatus = filterBookingsByStatus(results, currentStatusFilter)
      
      // Sort by today's check-ins first, then by most recent activity
      const sortedResults = filteredByStatus.sort((a: any, b: any) => {
        const today = format(new Date(), 'yyyy-MM-dd')
        
        // Check if check-in dates match today
        const aIsToday = a.check_in_date === today
        const bIsToday = b.check_in_date === today
        
        // If one is today's check-in and the other isn't, prioritize today's
        if (aIsToday && !bIsToday) return -1
        if (!aIsToday && bIsToday) return 1
        
        // If both are today's check-ins or both aren't, sort by most recent activity
        const aUpdateTime = a.updated_at ? new Date(a.updated_at).getTime() : 0
        const aCreateTime = a.created_at ? new Date(a.created_at).getTime() : 0
        const aTime = Math.max(aUpdateTime, aCreateTime)
        
        const bUpdateTime = b.updated_at ? new Date(b.updated_at).getTime() : 0
        const bCreateTime = b.created_at ? new Date(b.created_at).getTime() : 0
        const bTime = Math.max(bUpdateTime, bCreateTime)
        
        return bTime - aTime
      })
      
      setBookings(sortedResults)
      
      // Load WhatsApp data for the bookings
      if (sortedResults && sortedResults.length > 0) {
        await loadWhatsAppDataForBookings(sortedResults)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast({
        title: "Fetch Error",
        description: "Failed to fetch bookings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast, loadWhatsAppDataForBookings, selectedStatusFilter, filterBookingsByStatus, role])

  // Auto-fetch bookings on component mount with persisted filters
  useEffect(() => {
    fetchBookingsByFilters(selectedFilter, selectedStatusFilter)
  }, [fetchBookingsByFilters, selectedFilter, selectedStatusFilter])

  const handleSearch = async (term: string) => {
    setSearchTerm(term)
    if (!term.trim()) {
      // If search is cleared, go back to filter mode
      setIsSearchMode(false)
      fetchBookingsByFilters(selectedFilter, selectedStatusFilter)
      return
    }
    
    // Switch to search mode
    setIsSearchMode(true)
    setLoading(true)
    try {
      // Use the appropriate API endpoint based on role to get bookings with special charges (with cache busting)
      const apiEndpoint = `${role === 'admin' ? '/api/admin/bookings' : '/api/manager/bookings'}?t=${Date.now()}&nocache=true`
      const response = await fetch(apiEndpoint)
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch bookings')
      }
      
      const allBookings = data.bookings || []
      
      // Debug logging for search issue
      console.log('🔍 DEBUG: Total bookings from API:', allBookings.length)
      console.log('🔍 DEBUG: Search term:', term)
      console.log('🔍 DEBUG: Sample booking structure:', allBookings[0])
      console.log('🔍 DEBUG: All reference numbers:', allBookings.map((b: any) => b.reference_number))
      
      // Check if our target record exists
      const targetRecord = allBookings.find((b: any) => b.reference_number === '092025-023')
      console.log('🔍 DEBUG: Found 092025-023:', !!targetRecord)
      if (targetRecord) {
        console.log('🔍 DEBUG: Target record details:', targetRecord)
      }
      
      // Filter bookings based on search term (client-side search)
      const searchResults = allBookings.filter((booking: any) => {
        const searchLower = term.toLowerCase()
        return (
          booking.reference_number?.toLowerCase().includes(searchLower) ||
          booking.guest_name?.toLowerCase().includes(searchLower) ||
          booking.guest_phone?.toLowerCase().includes(searchLower) ||
          booking.guest_email?.toLowerCase().includes(searchLower) ||
          booking.room_numbers?.some((room: string) => room.toLowerCase().includes(searchLower)) ||
          booking.status?.toLowerCase().includes(searchLower)
        )
      })
      
      // Sort by today's check-ins first, then by most recent activity
      const sortedResults = searchResults.sort((a: any, b: any) => {
        const today = format(new Date(), 'yyyy-MM-dd')
        
        // Check if check-in dates match today
        const aIsToday = a.check_in_date === today
        const bIsToday = b.check_in_date === today
        
        // If one is today's check-in and the other isn't, prioritize today's
        if (aIsToday && !bIsToday) return -1
        if (!aIsToday && bIsToday) return 1
        
        // If both are today's check-ins or both aren't, sort by most recent activity
        const aUpdateTime = a.updated_at ? new Date(a.updated_at).getTime() : 0
        const aCreateTime = a.created_at ? new Date(a.created_at).getTime() : 0
        const aTime = Math.max(aUpdateTime, aCreateTime)
        
        const bUpdateTime = b.updated_at ? new Date(b.updated_at).getTime() : 0
        const bCreateTime = b.created_at ? new Date(b.created_at).getTime() : 0
        const bTime = Math.max(bUpdateTime, bCreateTime)
        
        return bTime - aTime
      })
      
      setBookings(sortedResults)
      
      // Load WhatsApp data for the bookings
      if (sortedResults && sortedResults.length > 0) {
        await loadWhatsAppDataForBookings(sortedResults)
      }
      
      if (sortedResults?.length === 0) {
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
      setLoading(false)
    }
  }

  // Handle date filter change
  const handleFilterChange = (filter: DateFilterType) => {
    setSelectedFilter(filter)
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookings-date-filter', filter)
    }
    if (!isSearchMode) {
      fetchBookingsByFilters(filter, selectedStatusFilter)
    }
  }

  // Handle status filter change
  const handleStatusFilterChange = (statusFilter: StatusFilterType) => {
    setSelectedStatusFilter(statusFilter)
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookings-status-filter', statusFilter)
    }
    if (!isSearchMode) {
      fetchBookingsByFilters(selectedFilter, statusFilter)
    }
  }

  const handlePaymentUpdate = async () => {
    setUpdatingPayment(true)
    try {
      // Add delay to ensure database consistency, then refresh appropriately
      setTimeout(async () => {
        if (isSearchMode && searchTerm) {
          await handleSearch(searchTerm)
        } else {
          await fetchBookingsByFilters(selectedFilter, selectedStatusFilter)
        }
        toast({
          title: "Payment Updated",
          description: "Booking payment information has been refreshed.",
        })
        setUpdatingPayment(false)
      }, 1000) // 1 second delay to ensure database is fully updated and consistent
      setSelectedBooking(null)
    } catch (error) {
      toast({
        title: "Update Error",
        description: "Failed to refresh payment information.",
        variant: "destructive",
      })
      setUpdatingPayment(false)
    }
  }

    const handleCheckInComplete = async () => {
    try {
      await handleSearch(searchTerm)
      toast({
        title: "Check-In Complete",
        description: "Booking status has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Update Error",
        description: "Failed to refresh booking information.",
        variant: "destructive",
      })
    }
  }

  const handleCheckOutComplete = async () => {
    try {
      await handleSearch(searchTerm)
      toast({
        title: "Check-Out Complete",
        description: "Booking status has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Update Error",
        description: "Failed to refresh booking information.",
        variant: "destructive",
      })
    }
  }

  const handleViewDocuments = async (booking: Booking) => {
    setLoadingDocuments(true)
    try {
      // Get both general reservation documents and room-specific check-in documents
      const [reservationDocs, roomCheckinDocs] = await Promise.all([
        supabaseQueries.getDocumentsByReservation(booking.id),
        supabaseQueries.getRoomCheckinDocumentsByReservation(booking.id)
      ])

      // Transform room check-in documents to match the general document format
      const transformedRoomDocs = (roomCheckinDocs || []).map((roomDoc: any) => ({
        id: roomDoc.id,
        reservation_id: booking.id,
        document_type: roomDoc.document_type,
        file_url: roomDoc.file_url,
        file_name: roomDoc.file_name,
        uploaded_at: roomDoc.uploaded_at || roomDoc.created_at,
        uploaded_by: roomDoc.uploaded_by,
        created_at: roomDoc.created_at,
        updated_at: roomDoc.updated_at,
        // Add room info for identification
        room_info: roomDoc.reservation_rooms ? {
          room_number: roomDoc.reservation_rooms.room_number,
          room_type: roomDoc.reservation_rooms.room_type
        } : null,
        document_source: 'room_checkin' // Flag to identify source
      }))

      // Combine all documents and sort by upload/creation date
      const allDocs = [
        ...(reservationDocs || []).map((doc: any) => ({ ...doc, document_source: 'reservation' })),
        ...transformedRoomDocs
      ].sort((a, b) => new Date(b.uploaded_at || b.created_at).getTime() - new Date(a.uploaded_at || a.created_at).getTime())

      setDocuments(allDocs)
      setShowDocuments(true)
    } catch (error) {
      console.error('Error loading documents:', error)
      toast({
        title: "Error",
        description: "Failed to load documents.",
        variant: "destructive",
      })
    } finally {
      setLoadingDocuments(false)
    }
  }

  const handleEditReservation = (booking: Booking) => {
    // Only admins can edit reservations
    if (role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can edit reservations.",
        variant: "destructive",
      })
      return
    }

    // Navigate to reservation route in edit mode
    const editUrl = `/${role}/reservation?edit=${booking.id}`
    window.location.href = editUrl
  }

  const handleEditComplete = async () => {
    try {
      // Refresh the bookings list
      if (isSearchMode) {
        await handleSearch(searchTerm)
      } else {
        await fetchBookingsByFilters(selectedFilter, selectedStatusFilter)
      }
      
      toast({
        title: "Success",
        description: "Reservation updated and list refreshed.",
      })
    } catch (error) {
      toast({
        title: "Refresh Error",
        description: "Reservation updated but failed to refresh the list.",
        variant: "destructive",
      })
    }
  }

  const handleCancelReservation = async (bookingId: string) => {
    try {
      await supabaseQueries.cancelReservation(bookingId)
      
      // Refresh the bookings list
      if (isSearchMode) {
        await handleSearch(searchTerm)
      } else {
        await fetchBookingsByFilters(selectedFilter, selectedStatusFilter)
      }
      
      toast({
        title: "Reservation Cancelled",
        description: "The reservation has been cancelled and rooms have been released.",
      })
    } catch (error) {
      console.error('Error cancelling reservation:', error)
      toast({
        title: "Cancellation Failed",
        description: error instanceof Error ? error.message : 'Failed to cancel reservation.',
        variant: "destructive",
      })
    }
  }

  const handleRoomCheckIn = async (roomId: string, roomNumber: string) => {
    try {
      // Room check-in is already handled by RoomCheckInModal
      // This callback only refreshes the bookings list
      
      // Refresh the bookings list
      if (isSearchMode) {
        await handleSearch(searchTerm)
      } else {
        await fetchBookingsByFilters(selectedFilter, selectedStatusFilter)
      }
      
      // Don't show toast here since the modal already shows it
    } catch (error) {
      console.error('Error checking in room:', error)
      toast({
        title: "Check-in Failed",
        description: error instanceof Error ? error.message : 'Failed to check in room.',
        variant: "destructive",
      })
    }
  }

  const handleRoomCheckOut = async (roomId: string, roomNumber: string) => {
    try {
      // Room check-out is already handled by RoomCheckOutModal
      // This callback only refreshes the bookings list
      
      // Refresh the bookings list
      if (isSearchMode) {
        await handleSearch(searchTerm)
      } else {
        await fetchBookingsByFilters(selectedFilter, selectedStatusFilter)
      }
      
      // Don't show toast here since the modal already shows it
    } catch (error) {
      console.error('Error checking out room:', error)
      toast({
        title: "Check-out Failed",
        description: error instanceof Error ? error.message : 'Failed to check out room.',
        variant: "destructive",
      })
    }
  }

  return (
    <ModernPageLayout
      title="Booking Management"
      subtitle="Search and manage all bookings"
      icon={FileText}
      headerContent={
        <BookingSearch onSearch={handleSearch} loading={loading} />
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
              { key: 'this_weekend' as DateFilterType, label: 'This Weekend' },
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
              <BookingCard
                key={booking.id}
                booking={booking}
                onPaymentUpdate={setSelectedBooking}
                onCheckIn={setCheckInBooking}
                onCheckOut={setCheckOutBooking}
                onViewDocuments={handleViewDocuments}
                onEdit={role === 'admin' ? handleEditReservation : undefined}
                onCancel={setCancelBooking}
                onRoomCheckIn={handleRoomCheckIn}
                onRoomCheckOut={handleRoomCheckOut}
                updatingPayment={updatingPayment}
                loadingDocuments={loadingDocuments}
                showRoomStatus={true}
                whatsAppData={bookingWhatsAppData[booking.id]}
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
                  onClick={() => handleSearch('')}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        </ModernCard>
      )}

      {/* Payment Update Modal */}
      {selectedBooking && (
        <PaymentUpdateModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdate={handlePaymentUpdate}
        />
      )}

      {/* Check-In Modal */}
      {checkInBooking && (
        <CheckInModal
          booking={checkInBooking}
          onClose={() => setCheckInBooking(null)}
          onCheckInComplete={handleCheckInComplete}
        />
      )}

      {/* Check-Out Modal */}
      {checkOutBooking && (
        <CheckOutModal
          booking={checkOutBooking}
          onClose={() => setCheckOutBooking(null)}
          onCheckOutComplete={handleCheckOutComplete}
        />
      )}

      {/* Edit Reservation Modal */}
      {editBooking && (
        <EditReservationModal
          booking={editBooking}
          isOpen={!!editBooking}
          onClose={() => setEditBooking(null)}
          onUpdate={handleEditComplete}
        />
      )}

      {/* Cancel Reservation Modal */}
      <CancelReservationModal
        booking={cancelBooking}
        isOpen={!!cancelBooking}
        onClose={() => setCancelBooking(null)}
        onConfirm={handleCancelReservation}
      />

      {/* Document Viewer Modal */}
      <DocumentViewer
        documents={documents}
        isOpen={showDocuments}
        onClose={() => setShowDocuments(false)}
      />

    </ModernPageLayout>
  )
}