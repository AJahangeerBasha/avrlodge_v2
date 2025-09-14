import { motion } from 'framer-motion'

interface CalendarViewModeSelectorProps {
  viewMode: 'day' | 'week' | 'month'
  onViewModeChange: (mode: 'day' | 'week' | 'month') => void
}

export default function CalendarViewModeSelector({ viewMode, onViewModeChange }: CalendarViewModeSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onViewModeChange('day')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          viewMode === 'day' 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Day
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onViewModeChange('week')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          viewMode === 'week' 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Week
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onViewModeChange('month')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          viewMode === 'month' 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Month
      </motion.button>
    </div>
  )
}
