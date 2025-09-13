import { useState, useRef, useEffect } from 'react'
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerProps {
  selectedDate: string
  onDateChange: (date: string) => void
  placeholder?: string
  className?: string
  minDate?: string
  maxDate?: string
}

export function DatePicker({ 
  selectedDate, 
  onDateChange, 
  placeholder = "Select date",
  className = '',
  minDate,
  maxDate
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
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
    if (selectedDate) {
      setCurrentMonth(new Date(selectedDate))
    }
  }, [selectedDate])

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
    return selectedDate && date.toDateString() === new Date(selectedDate).toDateString()
  }

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (minDate && date < new Date(minDate)) return true
    if (maxDate && date > new Date(maxDate)) return true
    
    return false
  }

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    
    if (isDateDisabled(selectedDate)) return
    
    onDateChange(selectedDate.toISOString().split('T')[0])
    setIsOpen(false)
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
      const isToday = date.toDateString() === new Date().toDateString()

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          disabled={isDisabled}
          className={`
            h-8 w-8 rounded-full text-sm font-medium transition-all duration-200
            ${isDisabled 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'hover:bg-blue-50 hover:text-blue-600 cursor-pointer'
            }
            ${isToday && !isSelected
              ? 'bg-gray-100 text-gray-900' 
              : ''
            }
            ${isSelected 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
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

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDateChange('')
  }

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      >
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className={`text-sm ${selectedDate ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedDate ? formatDate(new Date(selectedDate)) : placeholder}
          </span>
        </div>
        {selectedDate && (
          <span
            onClick={clearDate}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex space-x-1">
              <button
                onClick={prevMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
            {generateCalendarDays()}
          </div>

          {/* Quick Actions */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <button
              onClick={() => {
                const today = new Date()
                onDateChange(today.toISOString().split('T')[0])
                setIsOpen(false)
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Today
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 