import * as React from 'react'
import { Calendar, CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface DatePickerWithRangeProps {
  date?: DateRange
  onDateChange?: (date: DateRange | undefined) => void
  placeholder?: string
  className?: string
}

// Context for popover state management
interface PopoverContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  toggle: () => void
}

const PopoverContext = React.createContext<PopoverContextType | null>(null)

const usePopoverContext = () => {
  const context = React.useContext(PopoverContext)
  if (!context) {
    throw new Error('Popover components must be used within a Popover')
  }
  return context
}

// Popover components with proper state management
const PopoverComponent = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  const toggle = React.useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])
  
  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      <div className="relative">{children}</div>
    </PopoverContext.Provider>
  )
}

const PopoverTriggerComponent = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, asChild, onClick, ...props }, ref) => {
  const { toggle } = usePopoverContext()
  
  const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    toggle()
    onClick?.(e)
  }, [toggle, onClick])
  
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      ref,
      onClick: handleClick,
      ...props,
    })
  }
  return (
    <button ref={ref} onClick={handleClick} {...props}>
      {children}
    </button>
  )
})
PopoverTriggerComponent.displayName = 'PopoverTrigger'

const PopoverContentComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isOpen, setIsOpen } = usePopoverContext()
  const contentRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const content = contentRef.current
      const target = event.target as Node
      
      if (isOpen && content && !content.contains(target)) {
        // Check if click is on trigger
        const trigger = content.parentElement?.querySelector('button')
        if (trigger && !trigger.contains(target)) {
          setIsOpen(false)
        }
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, setIsOpen])
  
  React.useImperativeHandle(ref, () => contentRef.current!, [])
  
  if (!isOpen) return null
  
  return (
    <div
      ref={contentRef}
      className={cn(
        'absolute z-50 mt-2 left-0 rounded-md border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg',
        'animate-in fade-in-0 zoom-in-95 duration-200',
        className
      )}
      style={{ minWidth: 'max-content' }}
      {...props}
    />
  )
})
PopoverContentComponent.displayName = 'PopoverContent'

// Enhanced Calendar component with proper styling
const SimpleCalendar = ({ 
  mode, 
  selected, 
  onSelect,
  numberOfMonths = 2
}: {
  mode: 'range'
  selected?: DateRange
  onSelect?: (date: DateRange | undefined) => void
  numberOfMonths?: number
}) => {
  const { setIsOpen } = usePopoverContext()
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(selected)
  
  React.useEffect(() => {
    setSelectedRange(selected)
  }, [selected])
  
  const handleDateClick = (date: Date) => {
    if (!selectedRange?.from || (selectedRange.from && selectedRange.to)) {
      // Start new selection
      const newRange = { from: date, to: undefined }
      setSelectedRange(newRange)
      onSelect?.(newRange)
    } else {
      // Complete the range
      let newRange: DateRange
      if (date >= selectedRange.from) {
        newRange = { from: selectedRange.from, to: date }
      } else {
        newRange = { from: date, to: selectedRange.from }
      }
      setSelectedRange(newRange)
      onSelect?.(newRange)
      
      // Close popover when range is complete
      setTimeout(() => setIsOpen(false), 150)
    }
  }
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }
  
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }
  
  const renderMonth = (monthOffset: number) => {
    const month = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1)
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
    
    const days = []
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-9 h-9"></div>)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day)
      const isStart = selectedRange?.from && date.getTime() === selectedRange.from.getTime()
      const isEnd = selectedRange?.to && date.getTime() === selectedRange.to.getTime()
      const isSelected = isStart || isEnd
      const isInRange = selectedRange?.from && selectedRange?.to && 
                       date > selectedRange.from && date < selectedRange.to
      const todayDate = isToday(date)
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          className={cn(
            'w-9 h-9 text-sm font-medium rounded-md transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'flex items-center justify-center relative',
            // Selected dates
            isSelected && 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
            // In range dates
            isInRange && !isSelected && 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100',
            // Today's date
            todayDate && !isSelected && 'bg-gray-100 dark:bg-gray-700 font-semibold',
            // Default state
            !isSelected && !isInRange && !todayDate && 'text-gray-700 dark:text-gray-300'
          )}
        >
          {day}
        </button>
      )
    }
    
    return (
      <div key={monthOffset} className="p-4">
        {/* Month header */}
        <div className="flex items-center justify-between mb-4">
          {monthOffset === 0 && (
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white px-2">
            {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          {monthOffset === numberOfMonths - 1 && (
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          {monthOffset > 0 && monthOffset < numberOfMonths - 1 && <div className="w-8"></div>}
        </div>
        
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="w-9 h-8 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>
        
        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
      <div className="flex divide-x divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: numberOfMonths }, (_, i) => renderMonth(i))}
      </div>
      
      {/* Footer with actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {selectedRange?.from && selectedRange?.to ? (
            `${format(selectedRange.from, 'MMM dd')} - ${format(selectedRange.to, 'MMM dd, yyyy')}`
          ) : selectedRange?.from ? (
            `Start: ${format(selectedRange.from, 'MMM dd, yyyy')}`
          ) : (
            'Select a date range'
          )}
        </div>
        <button
          onClick={() => {
            setSelectedRange(undefined)
            onSelect?.(undefined)
          }}
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

export function DatePickerWithRange({
  date,
  onDateChange,
  placeholder = "Pick a date range",
  className
}: DatePickerWithRangeProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <PopoverComponent>
        <PopoverTriggerComponent asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full sm:w-64 justify-start text-left font-normal bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700",
              !date && "text-gray-500 dark:text-gray-400"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MMM dd")} - {format(date.to, "MMM dd, yyyy")}
                </>
              ) : (
                format(date.from, "MMM dd, yyyy")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTriggerComponent>
        <PopoverContentComponent className="w-auto p-0 border-0 shadow-none bg-transparent">
          <SimpleCalendar
            mode="range"
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
          />
        </PopoverContentComponent>
      </PopoverComponent>
    </div>
  )
}