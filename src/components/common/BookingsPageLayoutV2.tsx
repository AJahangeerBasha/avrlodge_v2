import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileText, Search, Filter, RefreshCw, X } from 'lucide-react'

// Store and Service
import {
  useBookingsData,
  useBookingsFilters,
  useBookingsActions,
  type DateFilterType,
  type StatusFilterType
} from '@/stores/bookingsStore'
import { bookingsService } from '@/services/bookingsService'

// UI Components
import BookingCard from '@/components/bookings/BookingCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Context
import { useAuth } from '@/contexts/AuthContext'

interface BookingsPageLayoutV2Props {
  role: 'admin' | 'manager'
}

export default function BookingsPageLayoutV2({ role }: BookingsPageLayoutV2Props) {
  const { currentUser } = useAuth()

  // Store hooks
  const { bookings, loading, error, hasLoadedOnce } = useBookingsData()
  const {
    dateFilter,
    statusFilter,
    isSearchMode,
    searchQuery,
    setDateFilter,
    setStatusFilter
  } = useBookingsFilters()
  const {
    loadBookings,
    refreshBookings,
    searchBookings,
    clearSearch,
    setSearchMode,
    setSearchQuery
  } = useBookingsActions()

  console.log('🏨 BookingsPageLayoutV2 state:', {
    bookingsCount: bookings.length,
    loading,
    dateFilter,
    statusFilter,
    isSearchMode,
    hasLoadedOnce,
    currentUser: currentUser?.uid || 'none'
  })

  // Load bookings on mount if user is authenticated
  useEffect(() => {
    if (currentUser && !hasLoadedOnce) {
      console.log('🚀 Initial load triggered')
      loadBookings()
    }
  }, [currentUser, hasLoadedOnce]) // Removed loadBookings from deps to prevent infinite loop

  // Handle filter changes - reload bookings when filters change
  useEffect(() => {
    if (hasLoadedOnce && !isSearchMode) {
      console.log('🔄 Filter changed, reloading bookings', { dateFilter, statusFilter })
      loadBookings()
    }
  }, [dateFilter, statusFilter, hasLoadedOnce, isSearchMode]) // Reload when filters change

  // Generate upcoming months for dropdown
  const upcomingMonths = useMemo(() => {
    const months = []
    const now = new Date()

    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + i)
      const month = monthDate.getMonth() + 1
      const year = monthDate.getFullYear()
      const key = `${month.toString().padStart(2, '0')}${year}`
      const label = monthDate.toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric'
      })

      months.push({ key, label })
    }

    return months
  }, [])

  // Event handlers
  const handleLoadBookings = () => {
    if (!currentUser) return
    console.log('📊 Manual load bookings triggered')
    loadBookings()
  }

  const handleSearchClick = () => {
    if (!searchQuery.trim()) return
    console.log('🔍 Search triggered:', searchQuery)
    searchBookings(searchQuery)
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchClick()
    }
  }

  const handleClearSearch = () => {
    console.log('🧹 Clearing search')
    clearSearch()
  }

  const handleRefresh = async () => {
    if (loading) return
    console.log('🔄 Manual refresh triggered')
    await refreshBookings()
  }

  // Memoized bookings list
  const memoizedBookingsList = useMemo(
    () => bookings.map((booking) => (
      <BookingCard
        key={booking.id}
        booking={booking}
        showActions={true}
        showRoomStatus={true}
        onPaymentUpdate={() => {}} // Handled by store
      />
    )),
    [bookings]
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
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-2">Search and manage all bookings</p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full lg:w-auto">
          {/* Load Bookings Button - Only show when nothing has been loaded yet */}
          {!hasLoadedOnce && bookings.length === 0 && !loading && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleLoadBookings}
                className="bg-black hover:bg-gray-800 text-white px-6 py-3"
                disabled={!currentUser}
              >
                <FileText className="w-4 h-4 mr-2" />
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setSearchMode(true)
                  }}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="Search by guest name, booking ID, room number, or status..."
                  className="pl-10 bg-white/95 backdrop-blur-sm border-black/20"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={isSearchMode ? handleClearSearch : handleSearchClick}
                    variant="outline"
                    className="bg-white/95 backdrop-blur-sm border-black/20"
                    disabled={loading}
                  >
                    {isSearchMode ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Clear
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    className="bg-white/95 backdrop-blur-sm border-black/20"
                    title="Refresh bookings"
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Filters Card */}
      {(hasLoadedOnce || bookings.length > 0 || isSearchMode) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="bg-white/95 backdrop-blur-sm border-black/10">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <CardTitle className="text-lg font-semibold text-gray-900">Filters</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-3">
                    Filter by Date Range
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {[
                      { key: 'today' as DateFilterType, label: 'Today' },
                      { key: 'yesterday' as DateFilterType, label: 'Yesterday' },
                      { key: 'tomorrow' as DateFilterType, label: 'Tomorrow' },
                      { key: 'current_week' as DateFilterType, label: 'This Week' },
                      { key: 'current_month' as DateFilterType, label: 'This Month' },
                      { key: 'all' as DateFilterType, label: 'All Time' },
                    ].map((filter) => (
                      <motion.button
                        key={filter.key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setDateFilter(filter.key)}
                        disabled={isSearchMode}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          dateFilter === filter.key && !isSearchMode
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

                  {/* Month Dropdown */}
                  <Select
                    value={upcomingMonths.some(month => month.key === dateFilter) ? dateFilter : ''}
                    onValueChange={(value) => setDateFilter(value as DateFilterType)}
                    disabled={isSearchMode}
                  >
                    <SelectTrigger className={`w-full ${
                      upcomingMonths.some(month => month.key === dateFilter) && !isSearchMode
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-gray-100 border-gray-200'
                    }`}>
                      <SelectValue placeholder="Select month..." />
                    </SelectTrigger>
                    <SelectContent>
                      {upcomingMonths.map((month) => (
                        <SelectItem key={month.key} value={month.key}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-3">
                    Filter by Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
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
                        onClick={() => setStatusFilter(filter.key)}
                        disabled={isSearchMode}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          statusFilter === filter.key && !isSearchMode
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
                </div>
              </div>

              {/* Active Filter Display */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                {!isSearchMode && (
                  <p className="text-sm text-gray-600">
                    Status: {bookingsService.getStatusFilterText(statusFilter)} •
                    Date: {bookingsService.getDateRangeText(dateFilter)}
                  </p>
                )}
                {isSearchMode && (
                  <p className="text-sm text-gray-600">
                    Search Results for: "{searchQuery}"
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
          <Card className="bg-white/95 backdrop-blur-sm border-black/10">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {isSearchMode
                  ? `Search Results (${bookings.length})`
                  : `${bookingsService.getDateRangeText(dateFilter)} • ${bookingsService.getStatusFilterText(statusFilter)} (${bookings.length})`
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

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-800 mb-4">{error}</p>
                <Button
                  onClick={handleRefresh}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && bookings.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="bg-white/95 backdrop-blur-sm border-black/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isSearchMode ? 'No Results Found' : hasLoadedOnce ? 'No Bookings Found' : 'Ready to Load Bookings'}
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
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}