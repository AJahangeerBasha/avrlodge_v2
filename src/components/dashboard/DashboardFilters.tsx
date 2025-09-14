import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DatePickerWithRange } from '@/components/ui/date-picker-range'
import { DateRange } from 'react-day-picker'
import { format, startOfToday, endOfToday, startOfYesterday, endOfYesterday, startOfWeek, endOfWeek, addWeeks, startOfMonth, endOfMonth, addMonths } from 'date-fns'

export type FilterType = 'today' | 'current_week' | 'next_week' | 'current_month' | 'next_month' | 'yesterday' | 'last_week' | 'last_month' | 'custom'

interface DashboardFiltersProps {
  selectedFilter: FilterType
  onFilterChange: (filter: FilterType, dateRange?: DateRange) => void
  customDateRange?: DateRange
  role?: 'admin' | 'manager'
}

export function DashboardFilters({ selectedFilter, onFilterChange, customDateRange, role }: DashboardFiltersProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false)

  const baseFilterOptions = [
    { id: 'today' as FilterType, label: 'Today' },
    { id: 'yesterday' as FilterType, label: 'Yesterday' },
    { id: 'current_week' as FilterType, label: 'Current Week' },
    { id: 'last_week' as FilterType, label: 'Last Week' },
    { id: 'current_month' as FilterType, label: 'Current Month' },
    { id: 'last_month' as FilterType, label: 'Last Month' },
    { id: 'next_week' as FilterType, label: 'Next Week' },
    { id: 'next_month' as FilterType, label: 'Next Month' },
  ]

  // Only add CustomDateRange for admin role
  const filterOptions = role === 'admin' 
    ? [...baseFilterOptions, { id: 'custom' as FilterType, label: 'Custom Date Range' }]
    : baseFilterOptions

  const getDateRangeForFilter = (filter: FilterType): DateRange => {
    const today = new Date()
    
    switch (filter) {
      case 'today': {
        return { from: startOfToday(), to: endOfToday() }
      }
      case 'yesterday': {
        return { from: startOfYesterday(), to: endOfYesterday() }
      }
      case 'current_week': {
        return { from: startOfWeek(today, { weekStartsOn: 1 }), to: endOfWeek(today, { weekStartsOn: 1 }) }
      }
      case 'next_week': {
        const nextWeek = addWeeks(today, 1)
        return { from: startOfWeek(nextWeek, { weekStartsOn: 1 }), to: endOfWeek(nextWeek, { weekStartsOn: 1 }) }
      }
      case 'last_week': {
        const lastWeek = addWeeks(today, -1)
        return { from: startOfWeek(lastWeek, { weekStartsOn: 1 }), to: endOfWeek(lastWeek, { weekStartsOn: 1 }) }
      }
      case 'current_month': {
        return { from: startOfMonth(today), to: endOfMonth(today) }
      }
      case 'next_month': {
        const nextMonth = addMonths(today, 1)
        return { from: startOfMonth(nextMonth), to: endOfMonth(nextMonth) }
      }
      case 'last_month': {
        const lastMonth = addMonths(today, -1)
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
      }
      default:
        return { from: today, to: today }
    }
  }

  const formatDateRange = (filter: FilterType, customRange?: DateRange): string => {
    if (filter === 'custom' && customRange?.from && customRange?.to) {
      return `${format(customRange.from, 'MMM dd')} - ${format(customRange.to, 'MMM dd')}`
    }
    
    const range = getDateRangeForFilter(filter)
    if (range.from && range.to) {
      if (filter === 'today') return 'Today'
      if (filter === 'yesterday') return 'Yesterday'
      return `${format(range.from, 'MMM dd')} - ${format(range.to, 'MMM dd')}`
    }
    
    return filterOptions.find(opt => opt.id === filter)?.label || 'Select Period'
  }

  const handleFilterSelect = (filter: FilterType) => {
    if (filter === 'custom') {
      setShowCustomPicker(true)
    } else {
      const dateRange = getDateRangeForFilter(filter)
      onFilterChange(filter, dateRange)
      setShowCustomPicker(false)
    }
  }

  const handleCustomDateChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onFilterChange('custom', range)
      setShowCustomPicker(false)
    }
  }

  // No grouping needed - use flat list

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Filter Dropdown */}
        <div className="w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full sm:w-64 justify-between bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">
                    {formatDateRange(selectedFilter, customDateRange)}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {filterOptions.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => handleFilterSelect(option.id)}
                >
                  <span className={`${selectedFilter === option.id ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                    {option.label}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Custom Date Picker */}
        {showCustomPicker && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full sm:w-auto"
          >
            <DatePickerWithRange
              date={customDateRange}
              onDateChange={handleCustomDateChange}
              placeholder="Pick date range"
            />
          </motion.div>
        )}

        {/* Active Filter Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 ml-auto"
        >
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Active Filter</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}