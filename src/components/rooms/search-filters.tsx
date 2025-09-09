import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { AnimatePresence } from 'framer-motion'

interface SearchFiltersProps {
  checkInDate: Date | null
  checkOutDate: Date | null
  guestCount: number
  selectedRoomType: string | null
  onCheckInChange: (date: Date | null) => void
  onCheckOutChange: (date: Date | null) => void
  onGuestCountChange: (count: number) => void
  onRoomTypeChange: (type: string | null) => void
  onSearch: () => void
  roomTypes: string[]
}

export function SearchFilters({
  checkInDate,
  checkOutDate,
  guestCount,
  selectedRoomType,
  onCheckInChange,
  onCheckOutChange,
  onGuestCountChange,
  onRoomTypeChange,
  onSearch,
  roomTypes
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleGuestCountChange = (increment: boolean) => {
    const newCount = increment ? guestCount + 1 : guestCount - 1
    if (newCount >= 1 && newCount <= 15) {
      onGuestCountChange(newCount)
    }
  }

  const clearFilters = () => {
    onCheckInChange(null)
    onCheckOutChange(null)
    onGuestCountChange(1)
    onRoomTypeChange(null)
  }

  const hasActiveFilters = checkInDate || checkOutDate || guestCount > 1 || selectedRoomType

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
          Search Available Rooms
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <Filter className="w-4 h-4" />
          {isExpanded ? 'Hide Filters' : 'More Filters'}
        </Button>
      </div>

      {/* Main Search Form */}
      <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-4 md:gap-4 mb-4 md:mb-6">
        {/* Date Picker */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Check-in & Check-out
          </label>
          <DateRangePicker
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            onCheckInChange={onCheckInChange}
            onCheckOutChange={onCheckOutChange}
            className="w-full"
          />
        </div>

        {/* Guest Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Guests
          </label>
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleGuestCountChange(false)}
              disabled={guestCount <= 1}
              className="w-10 h-10 p-0 rounded-full touch-manipulation hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Decrease guest count"
            >
              -
            </Button>
            <div className="flex items-center flex-1 justify-center mx-2">
              <Users className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium text-sm">
                {guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleGuestCountChange(true)}
              disabled={guestCount >= 15}
              className="w-10 h-10 p-0 rounded-full touch-manipulation hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Increase guest count"
            >
              +
            </Button>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <Button
            onClick={onSearch}
            disabled={!checkInDate || !checkOutDate}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search Rooms
          </Button>
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 dark:border-gray-700 pt-6"
          >
            {/* Room Type Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Room Type
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedRoomType === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onRoomTypeChange(null)}
                  className={`touch-manipulation ${
                    selectedRoomType === null 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-md' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  All Types
                </Button>
                {roomTypes.map((type) => (
                  <Button
                    key={type}
                    variant={selectedRoomType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onRoomTypeChange(type)}
                    className={`touch-manipulation ${
                      selectedRoomType === type 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-md' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {checkInDate && checkOutDate && (
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm">
              {checkInDate.toLocaleDateString()} - {checkOutDate.toLocaleDateString()}
            </span>
          )}
          {guestCount > 1 && (
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm">
              {guestCount} Guests
            </span>
          )}
          {selectedRoomType && (
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm">
              {selectedRoomType}
            </span>
          )}
        </div>
      )}
    </div>
  )
} 