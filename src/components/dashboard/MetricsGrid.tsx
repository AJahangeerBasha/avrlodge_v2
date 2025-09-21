import { motion } from 'framer-motion'
import {
  Hotel,
  Bed,
  Calendar,
  CalendarCheck,
  CalendarX,
  Users,
  UserCheck,
  Ban
} from 'lucide-react'
import { MetricCard } from './MetricCard'
import { DashboardMetrics } from '@/stores/dashboardStore'

interface MetricsGridProps {
  metrics: DashboardMetrics
  isLoading?: boolean
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics,
  isLoading = false
}) => {
  const metricsConfig = [
    // Room Status Section
    {
      title: 'Total Rooms',
      value: metrics.totalRooms,
      icon: Hotel,
      iconColor: 'text-blue-600',
      section: 'rooms'
    },
    {
      title: 'Reserved Rooms',
      value: metrics.reservedRoomsNoPayment,
      subtitle: 'No payments',
      icon: Calendar,
      iconColor: 'text-orange-600',
      section: 'rooms'
    },
    {
      title: 'Booked Rooms',
      value: metrics.bookedRoomsWithPayment,
      subtitle: 'With payments',
      icon: CalendarCheck,
      iconColor: 'text-green-600',
      section: 'rooms'
    },
    {
      title: 'Available Rooms',
      value: metrics.availableRooms,
      subtitle: 'Ready for booking',
      icon: Bed,
      iconColor: 'text-gray-600',
      section: 'rooms'
    },

    // Check-in Status Section
    {
      title: 'Checked In',
      value: metrics.checkedInRooms,
      subtitle: 'Currently occupied',
      icon: UserCheck,
      iconColor: 'text-green-600',
      section: 'checkin'
    },
    {
      title: 'Check-in Due',
      value: metrics.checkInDue,
      subtitle: 'Today',
      icon: CalendarCheck,
      iconColor: 'text-blue-600',
      section: 'checkin'
    },
    {
      title: 'Check-out Due',
      value: metrics.checkOutDue,
      subtitle: 'Today',
      icon: CalendarX,
      iconColor: 'text-red-600',
      section: 'checkin'
    },

    // Guest Metrics Section
    {
      title: 'Current Guests',
      value: metrics.currentGuests,
      subtitle: 'Checked in',
      icon: Users,
      iconColor: 'text-green-600',
      section: 'guests'
    },
    {
      title: 'Expected Guests',
      value: metrics.expectedGuests,
      subtitle: 'Reserved + Booked',
      icon: Users,
      iconColor: 'text-blue-600',
      section: 'guests'
    },

    // Cancellation Section
    {
      title: 'Cancellations',
      value: metrics.totalCancellations,
      subtitle: 'Total cancelled',
      icon: Ban,
      iconColor: 'text-red-600',
      section: 'other'
    }
  ]

  const sections = {
    rooms: 'Room Status',
    checkin: 'Check-in Status',
    guests: 'Guest Metrics',
    other: 'Other Metrics'
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        {Object.entries(sections).map(([sectionKey, sectionTitle]) => (
          <div key={sectionKey} className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">{sectionTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-6 animate-pulse"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                    <div className="w-24 h-4 bg-gray-300 rounded"></div>
                  </div>
                  <div className="w-16 h-8 bg-gray-300 rounded mb-1"></div>
                  <div className="w-20 h-3 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {Object.entries(sections).map(([sectionKey, sectionTitle], sectionIndex) => {
        const sectionMetrics = metricsConfig.filter(metric => metric.section === sectionKey)

        if (sectionMetrics.length === 0) return null

        return (
          <motion.div
            key={sectionKey}
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1, duration: 0.5 }}
          >
            <h2 className="text-lg font-semibold text-gray-900">{sectionTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sectionMetrics.map((metric, index) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (sectionIndex * 0.1) + (index * 0.05), duration: 0.3 }}
                >
                  <MetricCard
                    title={metric.title}
                    value={metric.value}
                    subtitle={metric.subtitle}
                    icon={metric.icon}
                    iconColor={metric.iconColor}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}