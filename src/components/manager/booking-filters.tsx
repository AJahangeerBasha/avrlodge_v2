import { motion } from 'framer-motion'
import { Search, Filter, Calendar, Users, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Filters {
  status: string
  dateRange: string
  search: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface BookingFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  totalBookings: number
  filteredCount: number
}

export function BookingFilters({ 
  filters, 
  onFiltersChange, 
  totalBookings, 
  filteredCount 
}: BookingFiltersProps) {
  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      dateRange: 'all',
      search: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    })
  }

  const hasActiveFilters = filters.status !== 'all' || 
                          filters.dateRange !== 'all' || 
                          filters.search !== '' || 
                          filters.sortBy !== 'created_at'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Filters & Search</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredCount} of {totalBookings} bookings
            </p>
          </div>
        </div>
        
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={clearFilters}
            className="px-4 py-2 text-sm bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 rounded-lg transition-colors min-h-[44px] touch-manipulation font-medium self-start sm:self-auto"
          >
            Clear all
          </motion.button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by guest name, email, or phone..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white min-h-[44px] text-base sm:text-sm touch-manipulation"
        />
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 min-h-[44px] touch-manipulation">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date Range
          </label>
          <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
            <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 min-h-[44px] touch-manipulation">
              <SelectValue placeholder="All Dates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 min-h-[44px] touch-manipulation">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Date Created</SelectItem>
              <SelectItem value="checkin_date">Check-in Date</SelectItem>
              <SelectItem value="total_amount">Total Amount</SelectItem>
              <SelectItem value="guest_name">Guest Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Order
          </label>
          <div className="flex gap-2">
            <Button
              variant={filters.sortOrder === 'desc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilter('sortOrder', 'desc')}
              className="flex-1 min-h-[44px] touch-manipulation"
            >
              Desc
            </Button>
            <Button
              variant={filters.sortOrder === 'asc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilter('sortOrder', 'asc')}
              className="flex-1 min-h-[44px] touch-manipulation"
            >
              Asc
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex-shrink-0">
              Active filters:
            </span>
            <div className="flex flex-wrap gap-2">
              {filters.status !== 'all' && (
                <Badge variant="secondary" className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-3 py-1.5">
                  Status: {filters.status}
                </Badge>
              )}
              {filters.dateRange !== 'all' && (
                <Badge variant="secondary" className="bg-blue-600 text-white px-3 py-1.5">
                  <Calendar className="w-3 h-3 mr-1" />
                  {filters.dateRange}
                </Badge>
              )}
              {filters.search && (
                <Badge variant="secondary" className="bg-green-600 text-white px-3 py-1.5 max-w-[200px] truncate">
                  Search: "{filters.search}"
                </Badge>
              )}
              <Badge variant="secondary" className="bg-purple-600 text-white px-3 py-1.5">
                {filters.sortBy} ({filters.sortOrder})
              </Badge>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
} 