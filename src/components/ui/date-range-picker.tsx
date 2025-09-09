import { useState, useRef, useEffect } from 'react'
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface DateRangePickerProps {
  checkInDate: Date | null
  checkOutDate: Date | null
  onCheckInChange: (date: Date | null) => void
  onCheckOutChange: (date: Date | null) => void
  className?: string
  allowPastDates?: boolean
}

export function DateRangePicker({ 
  checkInDate, 
  checkOutDate, 
  onCheckInChange, 
  onCheckOutChange, 
  className = '',
  allowPastDates = false
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [activePicker, setActivePicker] = useState<'checkin' | 'checkout'>('checkin')
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Set current month to selected date when it changes
  useEffect(() => {
    if (activePicker === 'checkin' && checkInDate) {
      setCurrentMonth(checkInDate)
    } else if (activePicker === 'checkout' && checkOutDate) {
      setCurrentMonth(checkOutDate)
    }
  }, [checkInDate, checkOutDate, activePicker])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isDateSelected = (date: Date) => {
    return (checkInDate && date.toDateString() === checkInDate.toDateString()) ||
           (checkOutDate && date.toDateString() === checkOutDate.toDateString())
  }

  const isDateInRange = (date: Date) => {
    if (!checkInDate || !checkOutDate) return false
    return date >= checkInDate && date <= checkOutDate
  }

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // For checkout, disable dates before checkin
    if (activePicker === 'checkout' && checkInDate && date <= checkInDate) {
      return true
    }
    
    // Only disable past dates if allowPastDates is false
    if (!allowPastDates && date < today) {
      return true
    }
    
    return false
  }

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    
    if (isDateDisabled(selectedDate)) return
    
    if (activePicker === 'checkin') {
      onCheckInChange(selectedDate)
      // Clear checkout when checkin changes and switch to checkout picker
      onCheckOutChange(null)
      setActivePicker('checkout')
    } else {
      onCheckOutChange(selectedDate)
      setIsOpen(false)
    }
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const isDisabled = isDateDisabled(date)
      const isSelected = isDateSelected(date)
      const isInRange = isDateInRange(date)
      const isToday = date.toDateString() === new Date().toDateString()

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          disabled={isDisabled}
          className={`
            h-10 w-10 rounded-full text-sm font-medium transition-all duration-200 touch-manipulation
            flex items-center justify-center
            ${isDisabled 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'hover:bg-blue-50 hover:text-blue-600 cursor-pointer active:scale-95'
            }
            ${isToday && !isSelected
              ? 'bg-gray-100 text-gray-900 ring-1 ring-gray-300' 
              : ''
            }
            ${isSelected 
              ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md' 
              : ''
            }
            ${isInRange && !isSelected
              ? 'bg-blue-100 text-blue-700' 
              : ''
            }
          `}
        >
          {day}
        </button>
      )
    }

    return days
  }

  const clearDates = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCheckInChange(null)
    onCheckOutChange(null)
  }

  const getDisplayText = () => {
    if (checkInDate && checkOutDate) {
      return `${formatDate(checkInDate)} - ${formatDate(checkOutDate)}`
    } else if (checkInDate) {
      return `Start Date: ${formatDate(checkInDate)}`
    } else {
      return 'Select start date and end date'
    }
  }

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          // Reset to checkin picker if no dates are selected
          if (!checkInDate && !checkOutDate) {
            setActivePicker('checkin')
          } else if (checkInDate && !checkOutDate) {
            setActivePicker('checkout')
          } else {
            setActivePicker('checkin')
          }
        }}
        className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      >
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className={`text-sm ${checkInDate || checkOutDate ? 'text-gray-900' : 'text-gray-500'}`}>
            {getDisplayText()}
          </span>
        </div>
        {(checkInDate || checkOutDate) && (
          <button
            onClick={clearDates}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 w-full min-w-[280px] max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 z-[9999] p-3 mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              {activePicker === 'checkin' ? 'Select Start Date' : 'Select End Date'}
            </h3>
            <div className="flex space-x-1">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Month Display */}
          <div className="text-center mb-3">
            <p className="text-sm text-gray-600">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="h-10 flex items-center justify-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
            {generateCalendarDays()}
          </div>

          {/* Quick Actions */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-100 gap-2">
            <button
              onClick={() => {
                const today = new Date()
                onCheckInChange(today)
                const tomorrow = new Date(today)
                tomorrow.setDate(tomorrow.getDate() + 1)
                onCheckOutChange(tomorrow)
                setIsOpen(false)
              }}
              className="px-3 py-2 text-xs text-blue-600 hover:text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 rounded-md transition-colors touch-manipulation"
            >
              Select Today
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors touch-manipulation"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 