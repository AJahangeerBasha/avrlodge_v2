import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  X,
  Calendar,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface GuestBookingFiltersProps {
  filters: {
    status: string
    dateRange: string
    search: string
  }
  onFiltersChange: (filters: any) => void
}

export function GuestBookingFilters({ filters, onFiltersChange }: GuestBookingFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const statusOptions = [
    { value: 'all', label: 'All Bookings', icon: Filter },
    { value: 'pending', label: 'Pending', icon: Clock },
    { value: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle },
    { value: 'completed', label: 'Completed', icon: CheckCircle }
  ]

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'past', label: 'Past' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' }
  ]

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      dateRange: 'all',
      search: ''
    })
  }

  const hasActiveFilters = filters.status !== 'all' || filters.dateRange !== 'all' || filters.search

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by room number, room type..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent min-h-[44px] text-base sm:text-sm touch-manipulation"
          />
        </div>
        
        <div className="flex gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors min-h-[44px] flex-1 sm:flex-none touch-manipulation"
          >
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters</span>
          </motion.button>

          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearFilters}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors min-h-[44px] flex-1 sm:flex-none touch-manipulation"
            >
              <X className="w-4 h-4" />
              <span className="font-medium">Clear</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 dark:border-gray-700 pt-4"
          >
            <div className="space-y-6">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Booking Status
                </label>
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2">
                  {statusOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleFilterChange('status', option.value)}
                      className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] touch-manipulation ${
                        filters.status === option.value
                          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <option.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{option.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Date Range
                </label>
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2">
                  {dateRangeOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleFilterChange('dateRange', option.value)}
                      className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] touch-manipulation ${
                        filters.dateRange === option.value
                          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{option.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium flex-shrink-0">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {filters.status !== 'all' && (
                <span className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-full text-xs font-medium border border-gray-300 dark:border-gray-600">
                  Status: {statusOptions.find(s => s.value === filters.status)?.label}
                </span>
              )}
              {filters.dateRange !== 'all' && (
                <span className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-full text-xs font-medium border border-gray-300 dark:border-gray-600">
                  Date: {dateRangeOptions.find(d => d.value === filters.dateRange)?.label}
                </span>
              )}
              {filters.search && (
                <span className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-full text-xs font-medium border border-gray-300 dark:border-gray-600 max-w-[200px] truncate">
                  Search: "{filters.search}"
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
} 