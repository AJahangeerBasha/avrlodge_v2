import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabaseQueries } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import { format, addDays, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { Shield, Settings, Download, Filter, Calendar } from 'lucide-react'
import CalendarHeader from '@/components/calendar/CalendarHeader'
import CalendarGrid from '@/components/calendar/CalendarGrid'
import CalendarViewModeSelector from '@/components/calendar/CalendarViewModeSelector'
import CalendarFilters from '@/components/calendar/CalendarFilters'
import RoomDetailsTable from '@/components/calendar/RoomDetailsTable'
import LoadingSpinner from '@/components/calendar/LoadingSpinner'
import ModernPageLayout from '@/components/common/ModernPageLayout'
import ModernCard from '@/components/common/ModernCard'

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
}

interface CalendarPageLayoutProps {
  role: 'admin' | 'manager'
}

export default function CalendarPageLayout({ role }: CalendarPageLayoutProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month')

  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        setIsLoading(true)
        console.log(`Loading ${role} calendar data...`)
        
        // Determine startDate and endDate based on viewMode
        let startDate: string
        let endDate: string
        
        switch (viewMode) {
          case 'day':
            startDate = format(selectedDate, 'yyyy-MM-dd')
            endDate = format(selectedDate, 'yyyy-MM-dd')
            break
          case 'week': {
            const dayOfWeek = selectedDate.getDay()
            const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
            const weekStart = addDays(selectedDate, -daysFromMonday)
            const weekEnd = addDays(weekStart, 6)
            startDate = format(weekStart, 'yyyy-MM-dd')
            endDate = format(weekEnd, 'yyyy-MM-dd')
            break
          }
          case 'month':
          default:
            startDate = format(startOfMonth(selectedDate), 'yyyy-MM-dd')
            endDate = format(endOfMonth(selectedDate), 'yyyy-MM-dd')
            break
        }

        // Get rooms with capacity in correct order
        const roomsData = await supabaseQueries.getRoomsWithCapacityOrdered(startDate, endDate)
        console.log('Rooms data loaded:', roomsData)
        setRooms(roomsData || [])
        
        // Get reservations for the selected date range
        console.log('Loading reservations for date range:', startDate, 'to', endDate)
        
        // Debug: Let's also get ALL reservations to see what's in the database
        const { data: allReservations, error: allError } = await supabase
          .from('reservations')
          .select('*')
          .is('deleted_at', null)
        console.log('ALL reservations in database:', allReservations)
        
        const reservationsData = await supabaseQueries.getReservationsForDateRange(startDate, endDate, true)
        console.log('Reservations data loaded:', reservationsData)
        setReservations(reservationsData.filter(r => r.status !== "cancelled") || [])
      } catch (error) {
        console.error(`Error loading ${role} calendar data:`, error)
        setReservations([])
        if (rooms.length === 0) {
          setRooms([])
        }
      } finally {
        setIsLoading(false)
        console.log(`${role} calendar data loading completed. Rooms count:`, rooms.length)
      }
    }

    loadCalendarData()
  }, [selectedDate, viewMode, rooms.length, role])

  // Generate date range based on view mode
  const generateDateRange = (date: Date, mode: 'day' | 'week' | 'month') => {
    let start: Date
    let end: Date
    
    switch (mode) {
      case 'day':
        start = date
        end = date
        break
      case 'week': {
        // Start from Monday of the week
        const dayOfWeek = date.getDay()
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        start = addDays(date, -daysFromMonday)
        end = addDays(start, 6)
        break
      }
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
    console.log(`${role} cell clicked:`, { roomNumber, date, capacityData })
    // Role-specific actions can be implemented here
  }

  const handleExportData = () => {
    // Export calendar data
    const data = {
      rooms,
      reservations,
      selectedDate: format(selectedDate, 'yyyy-MM'),
      exportDate: new Date().toISOString(),
      role
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${role}-calendar-${format(selectedDate, 'yyyy-MM')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredRooms = selectedRoomType === 'all' 
    ? rooms 
    : rooms.filter(room => room.room_type === selectedRoomType)

  const roomTypes = Array.from(new Set(rooms.map(room => room.room_type))).map(type => ({ value: type, label: type }))

  // Filter reservations by status
  const filteredReservations = selectedStatus === 'all' 
    ? reservations 
    : reservations.filter(reservation => reservation.status === selectedStatus)

  // Get unique status values from reservations
  const statusTypes = Array.from(new Set(reservations.map(reservation => reservation.status))).map(status => ({ value: status, label: status }))

  if (isLoading) {
    return <LoadingSpinner message={`Loading ${role} calendar...`} />
  }

  const totalCapacity = filteredRooms.reduce((sum, room) => sum + room.capacity, 0)
  const totalTariff = filteredRooms.reduce((sum, room) => sum + room.tariff, 0)

  return (
    <ModernPageLayout
      title="Room Calendar"
      subtitle="View and manage room availability and bookings"
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
        activeReservations={reservations.length}
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

      {/* Room Details */}
      <ModernCard title="Room Details" subtitle={`${filteredRooms.length} rooms shown`}>
        <RoomDetailsTable rooms={filteredRooms} />
      </ModernCard>

    </ModernPageLayout>
  )
}