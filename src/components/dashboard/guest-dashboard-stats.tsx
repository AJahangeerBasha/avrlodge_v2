import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  DollarSign,
  MapPin,
  Users
} from 'lucide-react'

interface GuestDashboardStatsProps {
  bookings: any[]
}

export function GuestDashboardStats({ bookings }: GuestDashboardStatsProps) {
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    // Set the date on the client side to avoid hydration mismatch
    setCurrentDate(new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }))
  }, [])

  const stats = {
    total: bookings.length,
            upcoming: bookings.filter(b => new Date(b.checkin_date) > new Date() && b.status !== 'cancelled').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalSpent: bookings.reduce((sum, b) => sum + b.payment_received, 0),
    pendingPayments: bookings.reduce((sum, b) => sum + (b.total_price - b.payment_received), 0),
    averageStay: bookings.length > 0 ? 
      Math.round(bookings.reduce((sum, b) => {
        const checkIn = new Date(b.checkin_date)
                  const checkOut = new Date(b.checkout_date)
        return sum + Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      }, 0) / bookings.length) : 0
  }

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.total,
      icon: Calendar,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'All time bookings'
    },
    {
      title: 'Upcoming Stays',
      value: stats.upcoming,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Future reservations'
    },
    {
      title: 'Confirmed',
      value: stats.confirmed,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Active bookings'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Past stays'
    },
    {
      title: 'Total Spent',
      value: `₹${stats.totalSpent.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Amount paid'
    },
    {
      title: 'Avg Stay',
      value: `${stats.averageStay} days`,
      icon: Users,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Average duration'
    }
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your Booking Statistics
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Last updated: {currentDate || 'Loading...'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`${stat.bgColor} dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 relative overflow-hidden`}
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <stat.icon className="w-full h-full text-gray-400" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${stat.textColor} dark:text-white`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stat.description}
              </p>

              {/* Progress indicator for numeric stats */}
              {typeof stat.value === 'number' && stat.title !== 'Total Bookings' && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((stat.value / Math.max(stats.total, 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stat.value / Math.max(stats.total, 1)) * 100}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                      className={`h-2 rounded-full ${stat.color}`}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cancelled</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{stats.cancelled}</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending Payments</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">₹{stats.pendingPayments.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Favorite Room Type</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {bookings.length > 0 ? 
                  (() => {
                    const roomTypeCounts = bookings.reduce((acc, booking) => {
                      const roomType = booking.rooms.room_types.name
                      acc[roomType] = (acc[roomType] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                    
                    const sortedTypes = Object.entries(roomTypeCounts)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                    
                    return sortedTypes[0]?.[0] || 'N/A'
                  })()
                  : 'N/A'
                }
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 