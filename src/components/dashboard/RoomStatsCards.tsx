import { motion } from 'framer-motion'
import { 
  Home, 
  Calendar, 
  CheckCircle, 
  Clock, 
  LogIn, 
  LogOut, 
  Users, 
  Target,
  Building
} from 'lucide-react'
import { MetricsCard, RoomMetricsCard } from './MetricsCard'

interface RoomStats {
  totalRooms: number
  bookedRooms: {
    reservation: number
    confirmation: number
  }
  availableRooms: number
  checkInDue: number
  checkOutDue: number
  totalGuestsInHouse: number
  occupancy: {
    present: {
      potential: number // (Booked Rooms / Total Rooms) × 100
      confirmed: number // (Checked-In Rooms / Total Rooms) × 100
    }
    future: {
      potential: number // (Reserved Rooms / Total Rooms) × 100
      confirmed: number // (Booked Rooms / Total Rooms) × 100
    }
    past: {
      confirmed: number // (Rooms Sold / Total Rooms) × 100
    }
    custom: {
      confirmed: number // (Rooms Sold / Total Rooms) × 100
    }
  }
}

interface RoomStatsCardsProps {
  data: RoomStats
  filterType: 'present' | 'future' | 'past' | 'custom'
  isLoading?: boolean
}

export function RoomStatsCards({ data, filterType, isLoading = false }: RoomStatsCardsProps) {
  // Calculate the appropriate occupancy percentage based on filter type
  const getOccupancyPercentage = () => {
    switch (filterType) {
      case 'present':
        return {
          potential: data.occupancy.present.potential,
          confirmed: data.occupancy.present.confirmed,
          label: 'Current'
        }
      case 'future':
        return {
          potential: data.occupancy.future.potential,
          confirmed: data.occupancy.future.confirmed,
          label: 'Forecasted'
        }
      case 'past':
        return {
          potential: data.occupancy.past.confirmed,
          confirmed: data.occupancy.past.confirmed,
          label: 'Historical'
        }
      case 'custom':
        return {
          potential: data.occupancy.custom.confirmed,
          confirmed: data.occupancy.custom.confirmed,
          label: 'Custom Period'
        }
      default:
        return {
          potential: 0,
          confirmed: 0,
          label: 'Unknown'
        }
    }
  }

  const occupancy = getOccupancyPercentage()

  const roomCards = [
    {
      title: 'Total Rooms',
      value: data.totalRooms,
      icon: Building,
      iconColor: 'text-blue-600 dark:text-blue-400',
      valueColor: 'text-gray-900 dark:text-white',
      trend: filterType === 'present' ? {
        value: occupancy.confirmed,
        isPositive: occupancy.confirmed > 70,
        label: `${occupancy.confirmed.toFixed(1)}% occupied`
      } : undefined
    },
    {
      title: 'Booked (Reservation)',
      value: data.bookedRooms.reservation,
      subtitle: `${data.bookedRooms.confirmation} confirmed`,
      icon: Calendar,
      iconColor: 'text-orange-600 dark:text-orange-400',
      valueColor: 'text-gray-900 dark:text-white',
      trend: {
        value: Math.round((data.bookedRooms.reservation / data.totalRooms) * 100),
        isPositive: data.bookedRooms.reservation > data.bookedRooms.confirmation,
        label: 'of total rooms'
      }
    },
    {
      title: 'Available Rooms',
      value: data.availableRooms,
      icon: Home,
      iconColor: 'text-green-600 dark:text-green-400',
      valueColor: 'text-gray-900 dark:text-white',
      trend: {
        value: Math.round((data.availableRooms / data.totalRooms) * 100),
        isPositive: data.availableRooms > data.totalRooms / 2,
        label: 'availability'
      }
    },
    {
      title: 'Check-In Due',
      value: data.checkInDue,
      icon: LogIn,
      iconColor: 'text-purple-600 dark:text-purple-400',
      valueColor: 'text-gray-900 dark:text-white',
    },
    {
      title: 'Check-Out Due',
      value: data.checkOutDue,
      icon: LogOut,
      iconColor: 'text-red-600 dark:text-red-400',
      valueColor: 'text-gray-900 dark:text-white',
    },
    {
      title: 'Guests In House',
      value: data.totalGuestsInHouse,
      icon: Users,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      valueColor: 'text-gray-900 dark:text-white',
    }
  ]

  const occupancyCards = [
    {
      title: `Potential Occupancy (${occupancy.label})`,
      value: `${occupancy.potential.toFixed(1)}%`,
      subtitle: filterType === 'present' 
        ? 'Booked Rooms / Total Rooms'
        : filterType === 'future'
        ? 'Reserved Rooms / Total Rooms'
        : 'Rooms Sold / Total Rooms',
      icon: Target,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      valueColor: occupancy.potential > 80 
        ? 'text-green-600 dark:text-green-400' 
        : occupancy.potential > 60 
        ? 'text-yellow-600 dark:text-yellow-400'
        : 'text-red-600 dark:text-red-400',
      trend: {
        value: occupancy.potential,
        isPositive: occupancy.potential > 70,
        label: 'occupancy rate'
      }
    },
    {
      title: `Confirmed Occupancy (${occupancy.label})`,
      value: `${occupancy.confirmed.toFixed(1)}%`,
      subtitle: filterType === 'present'
        ? 'Checked-In Rooms / Total Rooms'
        : filterType === 'future'
        ? 'Booked Rooms / Total Rooms'
        : 'Rooms Sold / Total Rooms',
      icon: CheckCircle,
      iconColor: 'text-green-600 dark:text-green-400',
      valueColor: occupancy.confirmed > 80 
        ? 'text-green-600 dark:text-green-400' 
        : occupancy.confirmed > 60 
        ? 'text-yellow-600 dark:text-yellow-400'
        : 'text-red-600 dark:text-red-400',
      trend: {
        value: occupancy.confirmed,
        isPositive: occupancy.confirmed > 70,
        label: 'confirmed rate'
      }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Room Statistics */}
      <div>
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
        >
          Room Statistics
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {roomCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MetricsCard
                title={card.title}
                value={card.value}
                subtitle={card.subtitle}
                icon={card.icon}
                iconColor={card.iconColor}
                valueColor={card.valueColor}
                trend={card.trend}
                isLoading={isLoading}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Occupancy Metrics */}
      <div>
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
        >
          Occupancy Metrics ({occupancy.label})
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {occupancyCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <MetricsCard
                title={card.title}
                value={card.value}
                subtitle={card.subtitle}
                icon={card.icon}
                iconColor={card.iconColor}
                valueColor={card.valueColor}
                trend={card.trend}
                isLoading={isLoading}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">
                Available: {data.availableRooms}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">
                Booked: {data.bookedRooms.reservation}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">
                Guests: {data.totalGuestsInHouse}
              </span>
            </div>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            {filterType === 'present' && 'Real-time data'}
            {filterType === 'future' && 'Forecast based on reservations'}
            {filterType === 'past' && 'Historical performance'}
            {filterType === 'custom' && 'Custom period analysis'}
          </div>
        </div>
      </motion.div>
    </div>
  )
}