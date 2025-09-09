import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Zap
} from 'lucide-react'

interface BookingAnalyticsProps {
  bookings: any[]
}

export function BookingAnalytics({ bookings }: BookingAnalyticsProps) {
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
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Analytics Data
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start booking rooms to see your analytics
        </p>
      </div>
    )
  }

  const metricCards = [
    {
      title: 'Total Spent',
      value: `₹${analytics.totalSpent.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Avg Booking Value',
      value: `₹${analytics.avgBookingValue.toLocaleString()}`,
      icon: Target,
      color: 'bg-blue-500',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Avg Stay Duration',
      value: `${Math.round(analytics.avgStayDuration)} days`,
      icon: Clock,
      color: 'bg-purple-500',
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'Payment Efficiency',
      value: `${analytics.paymentEfficiency.toFixed(1)}%`,
      icon: Award,
      color: 'bg-orange-500',
      trend: '+15%',
      trendUp: true
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Booking Analytics
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Detailed insights into your booking patterns and preferences
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${metric.color} text-white`}>
                <metric.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                metric.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {metric.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {metric.trend}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {metric.title}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {metric.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Monthly Booking Trends
            </h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(analytics.monthlyData).map(([month, count], index) => (
              <div key={month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {month}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(Number(count) / Math.max(...Object.values(analytics.monthlyData) as number[])) * 100}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white w-8 text-right">
                    {Number(count)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Room Type Preferences */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <PieChart className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Room Type Preferences
            </h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(analytics.roomTypeData)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .map(([roomType, count], index) => (
                <div key={roomType} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {roomType}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(Number(count) / Math.max(...Object.values(analytics.roomTypeData) as number[])) * 100}%` }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                        className="h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white w-8 text-right">
                      {Number(count)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>

      {/* Status Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Booking Status Distribution
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(analytics.statusData).map(([status, count], index) => (
            <div key={status} className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {Number(count)}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                {status}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {((Number(count) / bookings.length) * 100).toFixed(1)}% of total
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
} 