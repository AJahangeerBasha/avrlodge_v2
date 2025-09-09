import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react'

interface GuestBookingStatsProps {
  bookings: any[]
}

export function GuestBookingStats({ bookings }: GuestBookingStatsProps) {
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    upcoming: bookings.filter(b => new Date(b.check_in_date) > new Date()).length,
    totalSpent: bookings.reduce((sum, b) => sum + b.payment_received, 0),
    pendingPayments: bookings.reduce((sum, b) => sum + (b.total_price - b.payment_received), 0)
  }

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.total,
      icon: Calendar,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Upcoming',
      value: stats.upcoming,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Confirmed',
      value: stats.confirmed,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Spent',
      value: `₹${stats.totalSpent.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Pending Payments',
      value: `₹${stats.pendingPayments.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -2, scale: 1.02 }}
          className={`${stat.bgColor} dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 touch-manipulation`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {stat.title}
              </p>
              <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${stat.textColor} dark:text-white truncate`}>
                {stat.value}
              </p>
            </div>
            <div className={`p-2 sm:p-3 rounded-lg ${stat.color} text-white flex-shrink-0 ml-3`}>
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          
          {/* Progress indicator for numeric stats */}
          {typeof stat.value === 'number' && stat.title !== 'Total Bookings' && (
            <div className="mt-3 sm:mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{Math.round((stat.value / stats.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stat.value / stats.total) * 100}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                  className={`h-1.5 sm:h-2 rounded-full ${stat.color}`}
                />
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
} 