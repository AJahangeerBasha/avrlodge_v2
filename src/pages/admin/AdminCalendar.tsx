import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { format, addDays, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { Calendar, Download, Filter } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

// Import existing calendar components
import CalendarHeader from '@/components/calendar/CalendarHeader'
import CalendarGrid from '@/components/calendar/CalendarGrid'
import CalendarViewModeSelector from '@/components/calendar/CalendarViewModeSelector'
import CalendarFilters from '@/components/calendar/CalendarFilters'
import CalendarLegend from '@/components/calendar/CalendarLegend'
import ModernPageLayout from '@/components/common/ModernPageLayout'
import ModernCard from '@/components/common/ModernCard'

// Import Firebase functions
import { getAllReservations } from '@/lib/reservations'
import { getAllReservationRooms } from '@/lib/reservationRooms'
import { getAllRooms } from '@/lib/rooms'
import { getAllRoomTypes } from '@/lib/roomTypes'
import { getPaymentsByReservationId } from '@/lib/payments'

// Interfaces to match existing calendar components
interface Room {
  id: string
  room_number: string
  room_type: string
  capacity: number
  tariff: number
}

interface Reservation {
  id: string
  check_in_date: string
  check_out_date: string
  guest_count: number
  status: string
  room_numbers?: string[]
  reservation_rooms?: Array<{
    room_number: string
    room_type: string
    guest_count: number
  }>
  reference_number?: string
  guest_name?: string
  guest_phone?: string
  total_quote?: number
}

export const AdminCalendar: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month')

  const { currentUser } = useAuth()
  const { toast } = useToast()

  // Virtual status calculation function (same as booking card)
  const calculateVirtualStatusForReservation = async (reservation: any): Promise<string> => {
    try {
      // If already cancelled, keep cancelled
      if (reservation.status === 'cancelled') {
        return 'cancelled'
      }

      // Check room states if we have reservation_rooms
      if (reservation.reservationRooms && reservation.reservationRooms.length > 0) {
        const roomStates = reservation.reservationRooms.map((room: any) => room.roomStatus || 'pending')

        // If all rooms are checked out
        if (roomStates.every((status: string) => status === 'checked_out')) {
          return 'checked_out'
        }

        // If all rooms are checked in
        if (roomStates.every((status: string) => status === 'checked_in')) {
          return 'checked_in'
        }

        // If some rooms are checked in (partial check-in)
        if (roomStates.some((status: string) => status === 'checked_in')) {
          return 'checked_in' // Still show as checked_in for partial
        }
      }

      // Check payment status for booking vs reservation
      try {
        const payments = await getPaymentsByReservationId(reservation.id)
        const totalPaid = payments
          .filter((payment: any) => payment.paymentStatus === 'completed')
          .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0)

        if (totalPaid > 0) {
          return 'booking' // Payment made = booking status
        }
      } catch (error) {
        console.log('Could not load payments for reservation', reservation.id)
      }

      // Default to reservation for new bookings with no payment
      return 'reservation'
    } catch (error) {
      console.error('Error calculating virtual status:', error)
      return reservation.status || 'reservation'
    }
  }

  const loadCalendarData = useCallback(async () => {
    if (!currentUser) return

    setIsLoading(true)
    try {
      console.log('Loading admin calendar data...')

      // Determine date range based on viewMode
      let startDate: string
      let endDate: string

      switch (viewMode) {
        case 'day':
          startDate = format(selectedDate, 'yyyy-MM-dd')
          endDate = format(selectedDate, 'yyyy-MM-dd')
          break
        case 'week':
          const dayOfWeek = selectedDate.getDay()
          const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
          const weekStart = addDays(selectedDate, -daysFromMonday)
          const weekEnd = addDays(weekStart, 6)
          startDate = format(weekStart, 'yyyy-MM-dd')
          endDate = format(weekEnd, 'yyyy-MM-dd')
          break
        case 'month':
        default:
          startDate = format(startOfMonth(selectedDate), 'yyyy-MM-dd')
          endDate = format(endOfMonth(selectedDate), 'yyyy-MM-dd')
          break
      }

      // Load all room types first to get pricing info
      const roomTypes = await getAllRoomTypes()
      const roomTypeMap = new Map(roomTypes.map(rt => [rt.id, rt]))

      // Load all rooms
      const allRooms = await getAllRooms()

      // Transform rooms to match interface and add pricing from room types
      const transformedRooms: Room[] = allRooms.map(room => {
        const roomType = roomTypeMap.get(room.roomTypeId)
        return {
          id: room.id,
          room_number: room.roomNumber,
          room_type: roomType?.name || 'Unknown',
          capacity: roomType?.maxGuests || 1,
          tariff: roomType?.pricePerNight || 0
        }
      })

      console.log('Transformed rooms:', transformedRooms.length)
      setRooms(transformedRooms)

      // Load all reservations
      const allReservations = await getAllReservations()

      // Filter reservations by date range
      const dateFilteredReservations = allReservations.filter(reservation => {
        const reservationStart = reservation.checkInDate
        const reservationEnd = reservation.checkOutDate

        // Check if reservation overlaps with selected date range
        return (reservationStart <= endDate && reservationEnd >= startDate)
      })

      // Load reservation rooms for each reservation and transform data
      const transformedReservations: Reservation[] = await Promise.all(
        dateFilteredReservations.map(async (reservation) => {
          try {
            // Load reservation rooms
            const reservationRooms = await getAllReservationRooms({ reservationId: reservation.id })

            // Calculate virtual status
            const virtualStatus = await calculateVirtualStatusForReservation({
              ...reservation,
              reservationRooms
            })

            return {
              id: reservation.id,
              check_in_date: reservation.checkInDate,
              check_out_date: reservation.checkOutDate,
              guest_count: reservation.guestCount,
              status: virtualStatus, // Use virtual status instead of raw status
              reference_number: reservation.referenceNumber,
              guest_name: reservation.guestName,
              guest_phone: reservation.guestPhone,
              total_quote: reservation.totalPrice,
              reservation_rooms: reservationRooms.map(room => ({
                room_number: room.roomNumber,
                room_type: room.roomType || 'Unknown',
                guest_count: room.guestCount || 0
              })),
              room_numbers: reservationRooms.map(room => room.roomNumber)
            }
          } catch (error) {
            console.error(`Error loading details for reservation ${reservation.id}:`, error)
            return {
              id: reservation.id,
              check_in_date: reservation.checkInDate,
              check_out_date: reservation.checkOutDate,
              guest_count: reservation.guestCount,
              status: reservation.status,
              reference_number: reservation.referenceNumber,
              guest_name: reservation.guestName,
              guest_phone: reservation.guestPhone,
              total_quote: reservation.totalPrice
            }
          }
        })
      )

      console.log('Transformed reservations:', transformedReservations.length)
      setReservations(transformedReservations.filter(r => r.status !== 'cancelled'))

    } catch (error) {
      console.error('Error loading calendar data:', error)
      toast({
        title: "Loading Error",
        description: "Failed to load calendar data. Please try again.",
        variant: "destructive",
      })
      setReservations([])
      setRooms([])
    } finally {
      setIsLoading(false)
    }
  }, [currentUser, selectedDate, viewMode, toast])

  // Load data on component mount and when dependencies change
  useEffect(() => {
    loadCalendarData()
  }, [loadCalendarData])

  // Generate date range based on view mode
  const generateDateRange = (date: Date, mode: 'day' | 'week' | 'month') => {
    let start: Date
    let end: Date

    switch (mode) {
      case 'day':
        start = date
        end = date
        break
      case 'week':
        const dayOfWeek = date.getDay()
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        start = addDays(date, -daysFromMonday)
        end = addDays(start, 6)
        break
      case 'month':
      default:
        start = startOfMonth(date)
        end = endOfMonth(date)
        break
    }

    const dates = []
    let current = start
    while (current <= end) {
      dates.push(current)
      current = addDays(current, 1)
    }

    return dates
  }

  const dates = generateDateRange(selectedDate, viewMode)

  // Navigation handlers
  const handlePrevious = () => {
    switch (viewMode) {
      case 'day':
        setSelectedDate(addDays(selectedDate, -1))
        break
      case 'week':
        setSelectedDate(addDays(selectedDate, -7))
        break
      case 'month':
        setSelectedDate(subMonths(selectedDate, 1))
        break
    }
  }

  const handleNext = () => {
    switch (viewMode) {
      case 'day':
        setSelectedDate(addDays(selectedDate, 1))
        break
      case 'week':
        setSelectedDate(addDays(selectedDate, 7))
        break
      case 'month':
        setSelectedDate(addMonths(selectedDate, 1))
        break
    }
  }

  const handleCellClick = (roomNumber: string, date: Date, capacityData: any) => {
    console.log('Admin calendar cell clicked:', { roomNumber, date, capacityData })
    // Admin-specific actions can be implemented here
  }

  const handleExportData = () => {
    const data = {
      rooms,
      reservations,
      selectedDate: format(selectedDate, 'yyyy-MM'),
      exportDate: new Date().toISOString(),
      role: 'admin'
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin-calendar-${format(selectedDate, 'yyyy-MM')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Filter rooms and reservations
  const filteredRooms = selectedRoomType === 'all'
    ? rooms
    : rooms.filter(room => room.room_type === selectedRoomType)

  const roomTypes = Array.from(new Set(rooms.map(room => room.room_type))).map(type => ({ value: type, label: type }))

  const filteredReservations = selectedStatus === 'all'
    ? reservations
    : reservations.filter(reservation => reservation.status === selectedStatus)

  const statusTypes = Array.from(new Set(reservations.map(reservation => reservation.status))).map(status => ({ value: status, label: status }))

  if (isLoading) {
    return (
      <ModernPageLayout
        title="Admin Calendar"
        subtitle="Loading calendar data..."
        icon={Calendar}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <span className="ml-3 text-gray-600">Loading admin calendar...</span>
        </div>
      </ModernPageLayout>
    )
  }

  const totalCapacity = filteredRooms.reduce((sum, room) => sum + room.capacity, 0)
  const totalTariff = filteredRooms.reduce((sum, room) => sum + room.tariff, 0)

  return (
    <ModernPageLayout
      title="Admin Calendar"
      subtitle="Manage room availability and view all bookings"
      icon={Calendar}
      actions={
        <div className="flex items-center gap-3">
          <CalendarViewModeSelector viewMode={viewMode} onViewModeChange={setViewMode} />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        </div>
      }
    >
      {/* Filters Panel */}
      <CalendarFilters
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        selectedRoomType={selectedRoomType}
        setSelectedRoomType={setSelectedRoomType}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        roomTypes={roomTypes}
        statusTypes={statusTypes}
        filteredRoomsCount={filteredRooms.length}
        totalRoomsCount={rooms.length}
        filteredReservationsCount={filteredReservations.length}
        totalReservationsCount={reservations.length}
      />

      {/* Calendar Statistics */}
      <CalendarHeader
        selectedDate={selectedDate}
        onPreviousMonth={handlePrevious}
        onNextMonth={handleNext}
        totalRooms={filteredRooms.length}
        totalCapacity={totalCapacity}
        totalTariff={totalTariff}
        activeReservations={filteredReservations.length}
        viewMode={viewMode}
      />

      {/* Calendar Grid */}
      <ModernCard title="Room Availability Calendar">
        <CalendarGrid
          rooms={filteredRooms}
          reservations={filteredReservations}
          dates={dates}
          onCellClick={handleCellClick}
        />
      </ModernCard>

      {/* Calendar Legend */}
      <CalendarLegend />

    </ModernPageLayout>
  )
}