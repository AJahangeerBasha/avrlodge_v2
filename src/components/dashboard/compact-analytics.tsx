import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock,
  BarChart3,
  Activity,
  Target
} from 'lucide-react'

interface CompactAnalyticsProps {
  bookings: any[]
}

export function CompactAnalytics({ bookings }: CompactAnalyticsProps) {
  const calculateAnalytics = () => {
    if (bookings.length === 0) return null

    const totalSpent = bookings.reduce((sum, b) => sum + b.payment_received, 0)
    const totalBooked = bookings.reduce((sum, b) => sum + b.total_price, 0)
    const avgBookingValue = totalSpent / bookings.length
    const avgStayDuration = bookings.reduce((sum, b) => {
      const checkIn = new Date(b.checkin_date)
      const checkOut = new Date(b.checkout_date)
      return sum + Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    }, 0) / bookings.length

    // Monthly trends
    const monthlyData = bookings.reduce((acc, booking) => {
      const month = new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short' })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Room type preferences
    const roomTypeData = bookings.reduce((acc, booking) => {
      const roomType = booking.rooms.room_types.name
      acc[roomType] = (acc[roomType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Status distribution
    const statusData = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalSpent,
      totalBooked,
      avgBookingValue,
      avgStayDuration,
      monthlyData,
      roomTypeData,
      statusData,
      paymentEfficiency: (totalSpent / totalBooked) * 100
    }
  }

  const analytics = calculateAnalytics()

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 dark:text-gray-500 text-3xl mb-2">📊</div>
        <p className="text-sm text-gray-600 dark:text-gray-400">No analytics data available</p>
      </div>
    )
  }

  const metricCards = [
    {
      title: 'Total Spent',
      value: `₹${(analytics.totalSpent / 1000).toFixed(1)}k`,
      icon: DollarSign,
      color: 'bg-green-500',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Avg Value',
      value: `₹${analytics.avgBookingValue.toLocaleString()}`,
      icon: Target,
      color: 'bg-blue-500',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Avg Stay',
      value: `${Math.round(analytics.avgStayDuration)}d`,
      icon: Clock,
      color: 'bg-purple-500',
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'Efficiency',
      value: `${analytics.paymentEfficiency.toFixed(0)}%`,
      icon: Activity,
      color: 'bg-orange-500',
      trend: '+15%',
      trendUp: true
    }
  ]

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${metric.color} text-white`}>
                <metric.icon className="w-4 h-4" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                metric.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {metric.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {metric.trend}
              </div>
            </div>
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {metric.title}
            </h3>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {metric.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Trends */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Monthly Trends
            </h3>
          </div>
          
          <div className="space-y-2">
            {Object.entries(analytics.monthlyData).map(([month, count], _index) => (
              <div key={month} className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {month}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((count as number) / Math.max(...Object.values(analytics.monthlyData) as number[])) * 100}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                      className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white w-6 text-right">
                    {count as number}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Room Preferences */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Room Preferences
            </h3>
          </div>
          
          <div className="space-y-2">
            {Object.entries(analytics.roomTypeData)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .slice(0, 4)
              .map(([roomType, count], index) => (
                <div key={roomType} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                    {roomType}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((count as number) / Math.max(...Object.values(analytics.roomTypeData) as number[])) * 100}%` }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                        className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white w-6 text-right">
                      {count as number}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>

      {/* Status Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Status Distribution
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(analytics.statusData).map(([status, count], _index) => (
            <div key={status} className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {count as number}
              </div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">
                {status}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {(((count as number) / bookings.length) * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
} 