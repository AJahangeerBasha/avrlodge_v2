import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

// Disable default browser tooltips for calendar cells
const disableDefaultTooltips = `
  .calendar-cell {
    pointer-events: auto !important;
  }
  .calendar-cell * {
    pointer-events: none;
  }
`

interface Room {
  id: string
  room_number: string
  room_type: string
  capacity: number
  tariff: number
}

interface Reservation {
  id: string
  check_in_date: string
  check_out_date: string
  guest_count: number
  status: string
  room_numbers?: string[]
  reservation_rooms?: Array<{
    room_number: string
    room_type: string
    guest_count: number
  }>
}

interface CalendarGridProps {
  rooms: Room[]
  reservations: Reservation[]
  dates: Date[]
  onCellClick?: (roomNumber: string, date: Date, capacityData: any) => void
}

export default function CalendarGrid({
  rooms,
  reservations,
  dates,
  onCellClick
}: CalendarGridProps) {
  const [tooltipData, setTooltipData] = useState<{
    content: string
    x: number
    y: number
    visible: boolean
    roomNumber: string
    date: string
    isMobile: boolean
  } | null>(null)

  const [isTouchDevice, setIsTouchDevice] = useState(false)

  // Detect touch device on mount and handle global keyboard events
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
    checkTouchDevice()
    window.addEventListener('resize', checkTouchDevice)

    // Global escape key handler
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && tooltipData) {
        setTooltipData(null)
      }
    }

    // Global click handler for mobile backdrop
    const handleGlobalClick = (e: Event) => {
      if (tooltipData?.isMobile && e.target instanceof Element) {
        const tooltipElement = document.getElementById('room-tooltip')
        if (tooltipElement && !tooltipElement.contains(e.target)) {
          setTooltipData(null)
        }
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    document.addEventListener('click', handleGlobalClick)

    return () => {
      window.removeEventListener('resize', checkTouchDevice)
      document.removeEventListener('keydown', handleGlobalKeyDown)
      document.removeEventListener('click', handleGlobalClick)
    }
  }, [tooltipData])
  // Helper function to safely parse and compare dates
  const isDateInRange = (currentDate: string, checkIn: string, checkOut: string): boolean => {
    try {
      // Normalize all dates to YYYY-MM-DD format for proper string comparison
      const normalizeDate = (dateStr: string): string => {
        if (!dateStr) return ''

        // If it's already in YYYY-MM-DD format, return as-is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          return dateStr
        }

        // Try to parse and reformat the date
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) {
          console.warn('Invalid date:', dateStr)
          return ''
        }

        return format(date, 'yyyy-MM-dd')
      }

      const current = normalizeDate(currentDate)
      const checkInNorm = normalizeDate(checkIn)
      const checkOutNorm = normalizeDate(checkOut)

      if (!current || !checkInNorm || !checkOutNorm) {
        return false
      }

      // Date range check: current >= checkIn && current < checkOut
      // This ensures we mark all nights from check-in up to (but not including) check-out
      return current >= checkInNorm && current < checkOutNorm
    } catch (error) {
      console.error('Date comparison error:', error, { currentDate, checkIn, checkOut })
      return false
    }
  }

  // Get room capacity and reservation details for a specific room and date
  const getRoomCapacityForDate = (roomNumber: string, date: Date) => {
    const room = rooms.find(r => r.room_number === roomNumber)
    if (!room) return null

    // Check if room is occupied on this date and get reservation details
    const dateStr = format(date, 'yyyy-MM-dd')
    const occupiedReservation = reservations.find(reservation => {
      // Check new structure (reservation_rooms)
      if (reservation.reservation_rooms && reservation.reservation_rooms.length > 0) {
        const roomMatch = reservation.reservation_rooms.some(room => room.room_number === roomNumber)
        const dateMatch = isDateInRange(dateStr, reservation.check_in_date, reservation.check_out_date)
        return roomMatch && dateMatch
      }

      // Check old structure (room_numbers array)
      if (reservation.room_numbers && reservation.room_numbers.length > 0) {
        const roomMatch = reservation.room_numbers.includes(roomNumber)
        const dateMatch = isDateInRange(dateStr, reservation.check_in_date, reservation.check_out_date)
        return roomMatch && dateMatch
      }

      return false
    })

    const isOccupied = !!occupiedReservation

    return {
      capacity: room.capacity,
      isOccupied,
      roomType: room.room_type,
      tariff: room.tariff,
      reservation: occupiedReservation
    }
  }

  // Enhanced UX design with specific color codes and visual indicators
  const getStatusBasedColors = (capacityData: any) => {
    if (!capacityData || !capacityData.isOccupied) {
      // Available → Green
      return {
        badgeBg: 'bg-green-400',
        badgeBorder: 'border-green-400',
        badgeText: 'text-green-900',
        cellBg: 'bg-green-50/30',
        cellHover: 'hover:bg-green-100/50',
        cellFocus: 'focus:bg-green-100/40',
        statusIcon: '🟢',
        statusLabel: 'Available',
        ringColor: 'focus:ring-green-400'
      }
    }

    // Get reservation status for occupied rooms
    const status = capacityData.reservation?.status?.toLowerCase() || 'occupied'
    console.log('status::', status)
    switch (status) {
      case 'checked_in':
        // CheckedIn → Blue
        return {
          badgeBg: 'bg-blue-400',
          badgeBorder: 'border-blue-400',
          badgeText: 'text-blue-900',
          cellBg: 'bg-blue-50/30',
          cellHover: 'hover:bg-blue-100/50',
          cellFocus: 'focus:bg-blue-100/40',
          statusIcon: '🔵',
          statusLabel: 'Checked In',
          ringColor: 'focus:ring-blue-400'
        }
      case 'confirmed':
      case 'booking':
        // Booking → Yellow
        return {
          badgeBg: 'bg-yellow-400',
          badgeBorder: 'border-yellow-400',
          badgeText: 'text-yellow-900',
          cellBg: 'bg-yellow-50/30',
          cellHover: 'hover:bg-yellow-100/50',
          cellFocus: 'focus:bg-yellow-100/40',
          statusIcon: '🟡',
          statusLabel: 'Booking',
          ringColor: 'focus:ring-yellow-400'
        }
      case 'pending':
      case 'reservation':
        // Reservation → Orange
        return {
          badgeBg: 'bg-orange-400',
          badgeBorder: 'border-orange-400',
          badgeText: 'text-orange-900',
          cellBg: 'bg-orange-50/30',
          cellHover: 'hover:bg-orange-100/50',
          cellFocus: 'focus:bg-orange-100/40',
          statusIcon: '🟠',
          statusLabel: 'Reservation',
          ringColor: 'focus:ring-orange-400'
        }
      case 'checked_out':
        // CheckedOut → Gray (indicates past stay, no longer occupying)
        // return {
        //   badgeBg: 'bg-gray-400',
        //   badgeBorder: 'border-gray-400',
        //   badgeText: 'text-gray-900',
        //   cellBg: 'bg-gray-50/30',
        //   cellHover: 'hover:bg-gray-100/50',
        //   cellFocus: 'focus:bg-gray-100/40',
        //   statusIcon: '⚪',
        //   statusLabel: 'Checked Out',
        //   ringColor: 'focus:ring-gray-400'
        // }
        return {
        badgeBg: 'bg-green-400',
        badgeBorder: 'border-green-400',
        badgeText: 'text-green-900',
        cellBg: 'bg-green-50/30',
        cellHover: 'hover:bg-green-100/50',
        cellFocus: 'focus:bg-green-100/40',
        statusIcon: '🟢',
        statusLabel: 'Available',
        ringColor: 'focus:ring-green-400'
      }
      case 'cancelled':
        return {
          badgeBg: 'bg-red-400',
          badgeBorder: 'border-red-400',
          badgeText: 'text-red-900',
          cellBg: 'bg-red-50/30',
          cellHover: 'hover:bg-red-100/40',
          cellFocus: 'focus:bg-red-100/30',
          statusIcon: '🔴',
          statusLabel: 'Cancelled',
          ringColor: 'focus:ring-red-400'
        }
      default:
        // Default occupied (fallback)
        return {
          badgeBg: 'bg-gray-400',
          badgeBorder: 'border-gray-400',
          badgeText: 'text-gray-900',
          cellBg: 'bg-gray-50/30',
          cellHover: 'hover:bg-gray-100/50',
          cellFocus: 'focus:bg-gray-100/40',
          statusIcon: '⚫',
          statusLabel: 'Occupied',
          ringColor: 'focus:ring-gray-400'
        }
    }
  }

  // Generate enhanced tooltip content for a room/date combination
  const getTooltipContent = (capacityData: any) => {
    if (!capacityData) return ''

    if (!capacityData.isOccupied) {
      return '' // No tooltip for available rooms
    }

    if (capacityData.reservation) {
      const reservation = capacityData.reservation

      // Enhanced date formatting
      const formatTooltipDate = (dateStr: string) => {
        try {
          const date = new Date(dateStr)
          return format(date, 'MMM dd, yyyy')
        } catch {
          return 'Invalid date'
        }
      }

      const checkIn = formatTooltipDate(reservation.check_in_date)
      const checkOut = formatTooltipDate(reservation.check_out_date)

      // Calculate stay duration
      const getDuration = () => {
        try {
          const start = new Date(reservation.check_in_date)
          const end = new Date(reservation.check_out_date)
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
          return days > 1 ? `${days} nights` : '1 night'
        } catch {
          return 'N/A'
        }
      }

      // Status badge styling
      const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
          case 'checked_in': return '🔵 Checked In'
          case 'checked_out': return '⚪ Checked Out'
          case 'confirmed':
          case 'booking': return '🟡 Booking'
          case 'pending':
          case 'reservation': return '🟠 Reservation'
          case 'cancelled': return '🔴 Cancelled'
          default: return `📊 ${status || 'Unknown'}`
        }
      }

      // Format amount with proper currency
      const formatAmount = (amount: number | string) => {
        if (!amount || amount === 'N/A') return 'Not specified'
        const num = typeof amount === 'string' ? parseFloat(amount) : amount
        return isNaN(num) ? 'Invalid amount' : `₹${num.toLocaleString('en-IN')}`
      }

      return `🏨 RESERVATION DETAILS

👤 ${reservation.guest_name || 'Guest Name Not Available'}
📱 ${reservation.guest_phone || 'Phone Not Available'}

📅 ${checkIn} → ${checkOut}
⏰ Duration: ${getDuration()}
👥 Guests: ${reservation.guest_count || 0}

🏠 Room: ${capacityData.roomType}
💰 Amount: ${formatAmount(reservation.total_quote || reservation.total_price)}
🏷️ Ref: ${reservation.reference_number || 'N/A'}

${getStatusColor(reservation.status)}`
    }

    return `🏨 ${capacityData.roomType} - Occupied`
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  const cellVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      <style>{disableDefaultTooltips}</style>
      <div className="relative">
        {/* Frozen column container */}
        <div className="flex">
          {/* Frozen Room Number Column */}
          <div className="sticky left-0 z-20 bg-white border-r-2 border-gray-300 shadow-lg">
            <table className="border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300 h-16">
                  <th className="p-3 text-left font-semibold text-gray-900 min-w-[80px] bg-gray-100">
                    <div className="font-semibold text-sm text-gray-700 h-10 flex items-center">Room #</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room, roomIndex) => (
                  <motion.tr
                    key={room.id}
                    variants={rowVariants}
                    className={`border-b border-gray-200 h-16 ${roomIndex % 2 === 0 ? 'bg-blue-50' : 'bg-indigo-50'
                      }`}
                  >
                    <td className="p-2 font-medium text-gray-900 bg-inherit min-w-[80px]">
                      <div className="flex items-center gap-2 h-12">
                        <span className="font-mono text-sm font-bold text-blue-900">{room.room_number}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Scrollable content */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full border-collapse">
              <thead>
                <motion.tr
                  variants={rowVariants}
                  className="bg-gray-100 border-b-2 border-gray-300 h-16"
                >
                  {dates.map((date, index) => (
                    <motion.th
                      key={date.toISOString()}
                      variants={cellVariants}
                      className="border-r border-gray-200 p-3 text-center font-semibold text-gray-900 min-w-[50px] bg-gray-100"
                    >
                      <div className="text-xs h-10 flex flex-col items-center justify-center">
                        <div className="font-medium text-gray-700">{format(date, 'EEE')}</div>
                        <div className="text-gray-600 font-bold">{format(date, 'dd')}</div>
                      </div>
                    </motion.th>
                  ))}
                </motion.tr>
              </thead>
              <tbody>
                {rooms.map((room, roomIndex) => (
                  <motion.tr
                    key={room.id}
                    variants={rowVariants}
                    className={`border-b border-gray-200 h-16`}
                  >
                    {dates.map((date, dateIndex) => {
                      const capacityData = getRoomCapacityForDate(room.room_number, date)
                      const colors = getStatusBasedColors(capacityData)

                      if (!capacityData) {
                        return (
                          <motion.td
                            key={`${room.id}-${date.toISOString()}`}
                            variants={cellVariants}
                            title="Room not available"
                            className="border-r border-gray-200 p-1.5 text-center text-xs bg-gray-50/20 h-16 relative"
                          >
                            {/* Unavailable indicator */}
                            <div className="absolute top-1 left-1 opacity-50">
                              <span className="text-[8px]">⚪</span>
                            </div>

                            <div className="h-full flex flex-col items-center justify-center gap-1">
                              <div className="w-10 h-10 bg-gray-200 border-2 border-gray-300 rounded-xl flex items-center justify-center shadow-sm">
                                <span className="text-gray-500 font-mono text-sm">-</span>
                              </div>
                              <div className="text-[9px] font-medium tracking-wide uppercase opacity-60 text-gray-500">
                                N/A
                              </div>
                            </div>
                          </motion.td>
                        )
                      }

                      return (
                        <motion.td
                          key={`${room.id}-${date.toISOString()}`}
                          variants={cellVariants}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onCellClick?.(room.room_number, date, capacityData)}
                          onMouseEnter={(e) => {
                            if (!isTouchDevice) {
                              const tooltipContent = getTooltipContent(capacityData)
                              if (tooltipContent) {
                                const rect = e.currentTarget.getBoundingClientRect()
                                const viewportWidth = window.innerWidth
                                const viewportHeight = window.innerHeight
                                const isMobile = viewportWidth < 768

                                // Smart positioning to keep tooltip in viewport
                                let x = rect.left + rect.width / 2
                                let y = rect.top - 15

                                // Mobile-specific positioning
                                if (isMobile) {
                                  x = viewportWidth / 2 // Center on mobile
                                  y = rect.top - 10
                                } else {
                                  // Desktop positioning logic
                                  const tooltipWidth = 320
                                  if (x - tooltipWidth / 2 < 10) {
                                    x = 10 + tooltipWidth / 2
                                  } else if (x + tooltipWidth / 2 > viewportWidth - 10) {
                                    x = viewportWidth - 10 - tooltipWidth / 2
                                  }
                                }

                                // Adjust vertical position if too close to top
                                if (y < (isMobile ? 120 : 200)) {
                                  y = rect.bottom + 15
                                }

                                setTooltipData({
                                  content: tooltipContent,
                                  x,
                                  y,
                                  visible: true,
                                  roomNumber: room.room_number,
                                  date: format(date, 'MMM dd, yyyy'),
                                  isMobile
                                })
                              }
                            }
                          }}
                          onMouseLeave={() => {
                            if (!isTouchDevice) {
                              setTooltipData(null)
                            }
                          }}
                          onTouchStart={(e) => {
                            e.preventDefault()
                            const tooltipContent = getTooltipContent(capacityData)
                            if (tooltipContent) {
                              const rect = e.currentTarget.getBoundingClientRect()
                              const viewportWidth = window.innerWidth

                              setTooltipData({
                                content: tooltipContent,
                                x: viewportWidth / 2,
                                y: rect.top - 10,
                                visible: true,
                                roomNumber: room.room_number,
                                date: format(date, 'MMM dd, yyyy'),
                                isMobile: true
                              })

                              // Auto-hide after 4 seconds on mobile
                              setTimeout(() => {
                                setTooltipData(null)
                              }, 4000)
                            }
                          }}
                          onTouchEnd={() => {
                            // Prevent immediate hiding on touch end
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              const tooltipContent = getTooltipContent(capacityData)
                              if (tooltipContent) {
                                const rect = e.currentTarget.getBoundingClientRect()
                                const viewportWidth = window.innerWidth
                                const isMobile = viewportWidth < 768

                                setTooltipData({
                                  content: tooltipContent,
                                  x: isMobile ? viewportWidth / 2 : rect.left + rect.width / 2,
                                  y: rect.top - 15,
                                  visible: true,
                                  roomNumber: room.room_number,
                                  date: format(date, 'MMM dd, yyyy'),
                                  isMobile
                                })

                                // Auto-hide after 5 seconds for keyboard users
                                setTimeout(() => {
                                  setTooltipData(null)
                                }, 5000)
                              }
                            }
                            if (e.key === 'Escape') {
                              setTooltipData(null)
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`Room ${room.room_number} on ${format(date, 'MMMM dd, yyyy')}. ${capacityData.isOccupied ? `Status: ${capacityData.reservation?.status || 'Occupied'}` : 'Available'}. Press Enter for details.`}
                          aria-describedby={tooltipData && tooltipData.roomNumber === room.room_number && tooltipData.date === format(date, 'MMM dd, yyyy') ? 'room-tooltip' : undefined}
                          title=""
                          className={`
                        calendar-cell border-r border-gray-200 p-1.5 text-center text-xs cursor-pointer transition-all duration-300 h-16
                        focus:outline-none focus:ring-2 focus:ring-opacity-60 focus:z-10 relative
                        ${colors.cellHover} ${colors.cellFocus} ${colors.ringColor}
                      `}
                        >
                          {/* Status indicator dot */}
                          {/* <div className="absolute top-1 left-1 opacity-70">
                        <span className="text-[8px]">{colors.statusIcon}</span>
                      </div> */}

                          <div className="h-full flex flex-col items-center justify-center gap-1">
                            <motion.div
                              className={`
                            w-10 h-10 rounded-xl flex items-center justify-center font-mono text-sm font-bold border-2 
                            transition-all duration-300 shadow-sm backdrop-blur-sm
                            ${colors.badgeBg} ${colors.badgeBorder} ${colors.badgeText}
                          `}
                              whileHover={{
                                scale: 1.05,
                                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                                borderWidth: "3px"
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <span className="drop-shadow-sm">{capacityData.capacity}</span>
                            </motion.div>

                            {/* Status label */}
                            <div className={`
                          text-[9px] font-medium tracking-wide uppercase opacity-75 
                          ${colors.badgeText} truncate max-w-[45px]
                        `}>
                              {/* {colors.statusLabel} */}
                            </div>
                          </div>
                        </motion.td>
                      )
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile-Responsive Accessible Tooltip */}
      {tooltipData && (
        <>
          {/* Mobile Backdrop */}
          {tooltipData.isMobile && (
            <div
              className="fixed inset-0 bg-black bg-opacity-20 z-40"
              onClick={() => setTooltipData(null)}
              onTouchEnd={() => setTooltipData(null)}
            />
          )}

          <motion.div
            id="room-tooltip"
            role="tooltip"
            aria-live="polite"
            initial={{ opacity: 0, y: tooltipData.isMobile ? 20 : 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: tooltipData.isMobile ? 20 : 10, scale: 0.95 }}
            transition={{ duration: tooltipData.isMobile ? 0.25 : 0.15, ease: "easeOut" }}
            className={`fixed z-50 ${tooltipData.isMobile ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{
              left: tooltipData.isMobile ? '50%' : tooltipData.x,
              top: tooltipData.isMobile ? '50%' : tooltipData.y,
              transform: tooltipData.isMobile
                ? 'translateX(-50%) translateY(-50%)'
                : 'translateX(-50%) translateY(-100%)'
            }}
          >
            <div className={`
              bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm
              ${tooltipData.isMobile
                ? 'max-w-[90vw] w-80 mx-4'
                : 'max-w-sm'
              }
            `}>
              {/* Mobile Close Button */}
              {tooltipData.isMobile && (
                <button
                  onClick={() => setTooltipData(null)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
                  aria-label="Close tooltip"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Tooltip Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
                <div className="text-white font-semibold flex items-center gap-2">
                  <span className="text-sm">🏨</span>
                  <div>
                    <div className="text-sm font-bold">RESERVATION DETAILS</div>
                    <div className="text-xs opacity-90">
                      Room {tooltipData.roomNumber} • {tooltipData.date}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tooltip Content */}
              <div className={`${tooltipData.isMobile ? 'px-4 py-4' : 'px-4 py-3'}`}>
                <div className={`space-y-2 ${tooltipData.isMobile ? 'text-sm' : 'text-sm'}`}>
                  <div className={`
                    whitespace-pre-line text-gray-800 leading-relaxed 
                    ${tooltipData.isMobile ? 'font-sans text-sm' : 'font-mono text-xs'}
                  `}>
                    {tooltipData.content.replace('🏨 RESERVATION DETAILS\n\n', '')}
                  </div>
                </div>

                {/* Mobile Action Hint */}
                {tooltipData.isMobile && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">
                      Tap outside to close • Touch anywhere to interact
                    </p>
                  </div>
                )}
              </div>

              {/* Desktop Tooltip Arrow */}
              {!tooltipData.isMobile && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                  <div className="w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-white"></div>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-gray-200"></div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  )
} 