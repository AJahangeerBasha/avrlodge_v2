import { useState, useRef, useEffect } from 'react'
import { Clock, ChevronUp, ChevronDown } from 'lucide-react'

interface TimePickerProps {
  selectedTime: string
  onTimeChange: (time: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function TimePicker({
  selectedTime,
  onTimeChange,
  placeholder = "Select time",
  className = '',
  disabled = false
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hours, setHours] = useState(() => {
    if (selectedTime) {
      const [h] = selectedTime.split(':')
      return parseInt(h, 10)
    }
    return new Date().getHours()
  })
  const [minutes, setMinutes] = useState(() => {
    if (selectedTime) {
      const [, m] = selectedTime.split(':')
      return parseInt(m, 10)
    }
    return 0
  })
  const [period, setPeriod] = useState(() => {
    if (selectedTime) {
      const [h] = selectedTime.split(':')
      return parseInt(h, 10) >= 12 ? 'PM' : 'AM'
    }
    return new Date().getHours() >= 12 ? 'PM' : 'AM'
  })

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

  // Update internal state when selectedTime prop changes
  useEffect(() => {
    if (selectedTime) {
      const [h, m] = selectedTime.split(':')
      const hourNum = parseInt(h, 10)
      const minuteNum = parseInt(m, 10)

      setHours(hourNum)
      setMinutes(minuteNum)
      setPeriod(hourNum >= 12 ? 'PM' : 'AM')
    }
  }, [selectedTime])

  const formatTime = (h: number, m: number) => {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  const formatDisplayTime = (h: number, m: number, p: string) => {
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `${displayHour}:${m.toString().padStart(2, '0')} ${p}`
  }

  const updateTime = () => {
    const formattedTime = formatTime(hours, minutes)
    onTimeChange(formattedTime)
  }

  const adjustHours = (increment: boolean) => {
    const newHours = increment
      ? (hours + 1) % 24
      : (hours - 1 + 24) % 24
    setHours(newHours)

    // Auto-update period
    const newPeriod = newHours >= 12 ? 'PM' : 'AM'
    setPeriod(newPeriod)

    // Update time immediately
    const formattedTime = formatTime(newHours, minutes)
    onTimeChange(formattedTime)
  }

  const adjustMinutes = (increment: boolean) => {
    const newMinutes = increment
      ? (minutes + 15) % 60
      : (minutes - 15 + 60) % 60
    setMinutes(newMinutes)

    // Update time immediately
    const formattedTime = formatTime(hours, newMinutes)
    onTimeChange(formattedTime)
  }

  const handlePeriodToggle = () => {
    const newPeriod = period === 'AM' ? 'PM' : 'AM'
    const newHours = period === 'AM' ? hours + 12 : hours - 12

    setPeriod(newPeriod)
    setHours(newHours)

    // Update time immediately
    const formattedTime = formatTime(newHours, minutes)
    onTimeChange(formattedTime)
  }

  const presetTimes = [
    { label: 'Now', value: () => {
      const now = new Date()
      return formatTime(now.getHours(), now.getMinutes())
    }},
    { label: '9:00 AM', value: () => formatTime(9, 0) },
    { label: '12:00 PM', value: () => formatTime(12, 0) },
    { label: '2:00 PM', value: () => formatTime(14, 0) },
    { label: '6:00 PM', value: () => formatTime(18, 0) }
  ]

  const handlePresetTime = (preset: { label: string; value: () => string }) => {
    const time = preset.value()
    onTimeChange(time)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center justify-between w-full px-3 py-2 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
          disabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="flex items-center space-x-2">
          <Clock className={`w-4 h-4 ${disabled ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`text-sm ${selectedTime ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedTime ? formatDisplayTime(hours, minutes, period) : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${disabled ? 'text-gray-400' : 'text-gray-400'}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4">
          {/* Time Controls */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => adjustHours(true)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronUp className="w-4 h-4 text-gray-600" />
              </button>
              <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-lg border text-lg font-semibold text-gray-900">
                {hours.toString().padStart(2, '0')}
              </div>
              <button
                onClick={() => adjustHours(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="text-2xl font-bold text-gray-400">:</div>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => adjustMinutes(true)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronUp className="w-4 h-4 text-gray-600" />
              </button>
              <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-lg border text-lg font-semibold text-gray-900">
                {minutes.toString().padStart(2, '0')}
              </div>
              <button
                onClick={() => adjustMinutes(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* AM/PM */}
            <div className="flex flex-col items-center">
              <button
                onClick={handlePeriodToggle}
                className="px-3 py-2 bg-blue-50 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                {period}
              </button>
            </div>
          </div>

          {/* Preset Times */}
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-medium text-gray-500 mb-2">Quick Select</p>
            <div className="grid grid-cols-5 gap-1">
              {presetTimes.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetTime(preset)}
                  className="px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 rounded transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              {formatDisplayTime(hours, minutes, period)}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}