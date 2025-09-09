import { motion } from 'framer-motion'
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  DollarSign,
  Users,
  Target
} from 'lucide-react'

interface CompactStatsProps {
  bookings: any[]
}

export function CompactStats({ bookings }: CompactStatsProps) {
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
      title: 'Total',
      value: stats.total,
      icon: Calendar,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Upcoming',
      value: stats.upcoming,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Confirmed',
      value: stats.confirmed,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: Target,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Spent',
      value: `₹${(stats.totalSpent / 1000).toFixed(1)}k`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600'
    },
    {
      title: 'Avg Stay',
      value: `${stats.averageStay}d`,
      icon: Users,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600'
    }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Quick Stats
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center"
          >
            <div className={`inline-flex items-center justify-center w-8 h-8 ${stat.color} rounded-lg mb-2`}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
            <div className={`text-lg font-bold ${stat.textColor} dark:text-white`}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {stat.title}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Row */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-red-500" />
              <span className="text-gray-600 dark:text-gray-400">Cancelled: {stats.cancelled}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-orange-500" />
              <span className="text-gray-600 dark:text-gray-400">Pending: ₹{stats.pendingPayments.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {stats.total > 0 ? `${((stats.confirmed / stats.total) * 100).toFixed(0)}% confirmed` : 'No bookings'}
          </div>
        </div>
      </div>
    </div>
  )
} 