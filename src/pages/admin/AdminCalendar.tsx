import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, addDays, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { Calendar, Download, Filter, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useCalendarStore } from '@/stores/calendarStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Import existing calendar components
import CalendarHeader from '@/components/calendar/CalendarHeader'
import CalendarGrid from '@/components/calendar/CalendarGrid'
import CalendarViewModeSelector from '@/components/calendar/CalendarViewModeSelector'
import CalendarFilters from '@/components/calendar/CalendarFilters'
import CalendarLegend from '@/components/calendar/CalendarLegend'

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
    roomStatus?: string
  }>
  reference_number?: string
  guest_name?: string
  guest_phone?: string
  total_quote?: number
}

const AdminCalendar: React.FC = () => {
  // Use calendar store for state management
  const {
    rooms,
    reservations,
    selectedDate,
    viewMode,
    showFilters,
    isLoading,
    lastRefreshTime,
    filters,
    isSubscribed,
    setSelectedDate,
    setViewMode,
    setShowFilters,
    setSelectedRoomType,
    setSelectedStatus,
    getFilteredRooms,
    getFilteredReservations,
    getRoomTypes,
    getStatusTypes,
    loadInitialData,
    startRealtimeListeners,
    stopRealtimeListeners,
  } = useCalendarStore()

  const { currentUser } = useAuth()
  const { toast } = useToast()

  // Local state for refresh animation
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Initialize calendar data and real-time listeners
  useEffect(() => {
    if (!currentUser) return

    const initializeCalendar = async () => {
      try {
        // Load initial data
        await loadInitialData()

        // Start real-time listeners
        await startRealtimeListeners()

        console.log('📅 Calendar initialized with real-time updates')
      } catch (error) {
        console.error('Error initializing calendar:', error)
        toast({
          title: "Initialization Error",
          description: "Failed to initialize calendar. Please refresh the page.",
          variant: "destructive",
        })
      }
    }

    initializeCalendar()

    // Cleanup listeners on unmount or user change
    return () => {
      stopRealtimeListeners()
    }
  }, [currentUser, loadInitialData, startRealtimeListeners, stopRealtimeListeners, toast])

  // Refresh handler (triggers re-initialization)
  const handleRefresh = async () => {
    if (!currentUser) return

    setIsRefreshing(true)
    try {
      // Stop existing listeners
      stopRealtimeListeners()

      // Reload initial data
      await loadInitialData()

      // Restart listeners
      await startRealtimeListeners()

      toast({
        title: "Calendar Refreshed",
        description: "Latest data has been loaded successfully.",
      })
    } catch (error) {
      console.error('Error refreshing calendar:', error)
      toast({
        title: "Refresh Error",
        description: "Failed to refresh calendar data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

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

  // Ensure selectedDate is a Date object (fallback for hydration issues)
  const safeSelectedDate = selectedDate instanceof Date ? selectedDate : new Date(selectedDate)
  const dates = generateDateRange(safeSelectedDate, viewMode)

  // Navigation handlers
  const handlePrevious = () => {
    switch (viewMode) {
      case 'day':
        setSelectedDate(addDays(safeSelectedDate, -1))
        break
      case 'week':
        setSelectedDate(addDays(safeSelectedDate, -7))
        break
      case 'month':
        setSelectedDate(subMonths(safeSelectedDate, 1))
        break
    }
  }

  const handleNext = () => {
    switch (viewMode) {
      case 'day':
        setSelectedDate(addDays(safeSelectedDate, 1))
        break
      case 'week':
        setSelectedDate(addDays(safeSelectedDate, 7))
        break
      case 'month':
        setSelectedDate(addMonths(safeSelectedDate, 1))
        break
    }
  }

  const handleCellClick = (roomNumber: string, date: Date, capacityData: any) => {
    // Admin-specific actions can be implemented here
  }

  const handleExportData = () => {
    const data = {
      rooms,
      reservations,
      selectedDate: format(safeSelectedDate, 'yyyy-MM'),
      exportDate: new Date().toISOString(),
      role: 'admin'
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin-calendar-${format(safeSelectedDate, 'yyyy-MM')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Get filtered data from store
  const filteredRooms = getFilteredRooms()
  const filteredReservations = getFilteredReservations()
  const roomTypes = getRoomTypes()
  const statusTypes = getStatusTypes()

  if (isLoading) {
    return (
      <motion.div
        className="space-y-8 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading calendar...</p>
          </div>
        </div>
      </motion.div>
    )
  }

  const totalCapacity = filteredRooms.reduce((sum, room) => sum + room.capacity, 0)
  const totalTariff = filteredRooms.reduce((sum, room) => sum + room.tariff, 0)

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
          <Calendar className="h-8 w-8 text-gray-900" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Calendar</h1>
            <p className="text-gray-600 mt-2">Manage room availability and view all bookings</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CalendarViewModeSelector viewMode={viewMode} onViewModeChange={setViewMode} />

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              title={`${isSubscribed ? 'Real-time updates active' : 'Click to enable real-time updates'}${lastRefreshTime ? ` • Last updated: ${new Date(lastRefreshTime).toLocaleTimeString()}` : ''}`}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="bg-white/95 backdrop-blur-sm border-black/20"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleExportData}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Filters Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <CalendarFilters
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          selectedRoomType={filters.selectedRoomType}
          setSelectedRoomType={setSelectedRoomType}
          selectedStatus={filters.selectedStatus}
          setSelectedStatus={setSelectedStatus}
          roomTypes={roomTypes}
          statusTypes={statusTypes}
          filteredRoomsCount={filteredRooms.length}
          totalRoomsCount={rooms.length}
          filteredReservationsCount={filteredReservations.length}
          totalReservationsCount={reservations.length}
        />
      </motion.div>

      {/* Calendar Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <CalendarHeader
          selectedDate={safeSelectedDate}
          onPreviousMonth={handlePrevious}
          onNextMonth={handleNext}
          totalRooms={filteredRooms.length}
          totalCapacity={totalCapacity}
          totalTariff={totalTariff}
          activeReservations={filteredReservations.length}
          viewMode={viewMode}
        />
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Room Availability Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarGrid
              rooms={filteredRooms}
              reservations={filteredReservations}
              dates={dates}
              onCellClick={handleCellClick}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Calendar Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <CalendarLegend />
      </motion.div>
    </motion.div>
  )
}

export { AdminCalendar };
export default AdminCalendar;