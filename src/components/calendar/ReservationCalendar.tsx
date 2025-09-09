import { useRef, useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { useSwipeable } from 'react-swipeable'
import type { Reservation } from '@/lib/types'

interface ReservationCalendarProps {
  role: 'admin' | 'manager'
  reservations: Reservation[]
  onEventClick: (eventInfo: any) => void
  onDateSelect: (selectInfo: any) => void
}

export default function ReservationCalendar({
  role,
  reservations,
  onEventClick,
  onDateSelect
}: ReservationCalendarProps) {
  const calendarRef = useRef<any>(null)
  const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')

  // Detect screen size for responsive view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('mobile')
      } else if (window.innerWidth < 1024) {
        setViewMode('tablet')
      } else {
        setViewMode('desktop')
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Swipe handlers for mobile
  const handlers = useSwipeable({
    onSwipedLeft: () => calendarRef.current?.getApi().next(),
    onSwipedRight: () => calendarRef.current?.getApi().prev(),

    delta: 10,
    swipeDuration: 500,
  })

  // Convert reservations to calendar events
  const events = reservations.map(reservation => ({
    id: reservation.id,
    title: `${reservation.reference_number} - ${reservation.guest_count} guests`,
    start: reservation.check_in_date,
    end: reservation.check_out_date,
    backgroundColor: getStatusColor(reservation.status),
    borderColor: getStatusColor(reservation.status),
    textColor: '#ffffff',
    extendedProps: {
      ...reservation,
      display: 'block'
    }
  }))

  // Calendar configuration based on view mode
  const calendarConfig = {
    mobile: {
      initialView: 'listWeek',
      headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: 'listWeek,dayGridMonth'
      },
      height: 'auto',
      dayMaxEvents: 3,
      eventDisplay: 'block'
    },
    tablet: {
      initialView: 'timeGridWeek',
      headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: 'timeGridWeek,dayGridMonth,listWeek'
      },
      height: 'auto',
      dayMaxEvents: 5,
      eventDisplay: 'block'
    },
    desktop: {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,listWeek'
      },
      height: 'auto',
      dayMaxEvents: 8,
      eventDisplay: 'block'
    }
  }

  return (
    <div {...handlers} className="h-full">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        {...calendarConfig[viewMode]}
        events={events}
        eventClick={onEventClick}
        select={onDateSelect}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        firstDay={1}
        locale="en"
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week',
          list: 'List'
        }}
        eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
        dayCellClassNames="hover:bg-gray-50 transition-colors"
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        slotDuration="01:00:00"
        slotLabelInterval="02:00:00"
        expandRows={true}
        stickyHeaderDates={true}
        nowIndicator={true}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: 'short'
        }}
        dayHeaderFormat={{
          weekday: 'short',
          day: 'numeric'
        }}
        titleFormat={{
          month: 'long',
          year: 'numeric'
        }}
      />
    </div>
  )
}

// Helper function to get status colors
function getStatusColor(status: string): string {
  switch (status) {
    case 'reservation':
      return '#fbbf24' // yellow
    case 'booking':
      return '#3b82f6' // blue
    case 'checked_in':
      return '#10b981' // green
    case 'checked_out':
      return '#6b7280' // gray
    case 'cancelled':
      return '#ef4444' // red
    default:
      return '#6b7280' // gray
  }
} 