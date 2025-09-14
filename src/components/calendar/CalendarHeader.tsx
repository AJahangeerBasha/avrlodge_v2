import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

interface CalendarHeaderProps {
  selectedDate: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
  totalRooms: number
  totalCapacity: number
  totalTariff: number
  activeReservations: number
  viewMode?: 'day' | 'week' | 'month'
}

export default function CalendarHeader({
  selectedDate,
  onPreviousMonth,
  onNextMonth,
  totalRooms: _totalRooms,
  totalCapacity: _totalCapacity,
  totalTariff: _totalTariff,
  activeReservations: _activeReservations,
  viewMode = 'month'
}: CalendarHeaderProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Responsive Main Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 md:p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md"
            >
              <CalendarIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900">Room Calendar</h1>
              <p className="text-gray-600 text-xs md:text-sm mt-1 hidden sm:block">
                Shows room capacity for each day
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs md:text-sm text-gray-500">
              {viewMode === 'day' ? 'Current Day' : 
               viewMode === 'week' ? 'Current Week' : 'Current Month'}
            </p>
            <p className="text-base md:text-lg font-semibold text-gray-900">
              {viewMode === 'day' ? format(selectedDate, 'EEEE, MMMM d, yyyy') :
               viewMode === 'week' ? format(selectedDate, 'MMM d, yyyy') :
               format(selectedDate, 'MMMM yyyy')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Responsive Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6"
      >
        {/* Mobile Navigation */}
        <div className="flex flex-col gap-4 sm:hidden">
          {/* Month Display */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">
              {format(selectedDate, 'MMMM yyyy')}
            </h2>
            <p className="text-gray-500 text-sm">
              Navigate through months
            </p>
          </div>
          
          {/* Navigation Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button 
              onClick={onPreviousMonth}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all duration-300 font-medium shadow-md"
              aria-label="Go to previous month"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Previous</span>
            </motion.button>
            
            <motion.button 
              onClick={onNextMonth}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-md"
              aria-label="Go to next month"
            >
              <span className="text-sm">Next</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden sm:flex justify-between items-center">
          <motion.button 
            onClick={onPreviousMonth}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2 md:py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all duration-300 font-medium shadow-md"
            aria-label="Go to previous month"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Previous</span>
          </motion.button>
          
          <div className="text-center px-4">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900">
              {format(selectedDate, 'MMMM yyyy')}
            </h2>
            <p className="text-gray-500 text-xs md:text-sm hidden md:block">
              Navigate through months
            </p>
          </div>
          
          <motion.button 
            onClick={onNextMonth}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-md"
            aria-label="Go to next month"
          >
            <span className="text-sm md:text-base">Next</span>
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Summary Stats - Responsive Grid */}
      
    </div>
  )
} 