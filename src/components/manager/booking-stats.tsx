import { motion } from 'framer-motion'
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Booking {
  id: string
  guest_name: string
  guest_email: string
  checkin_date: string
  checkout_date: string
  guest_count: number
  total_amount: number
  status: string
  payment_status: string
  created_at: string
}

interface BookingStatsProps {
  bookings: Booking[]
}

export function BookingStats({ bookings }: BookingStatsProps) {
  const calculateStats = () => {
    const totalBookings = bookings.length
    const pendingBookings = bookings.filter(b => b.status === 'pending').length
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length
    const completedBookings = bookings.filter(b => b.status === 'completed').length
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length
    
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
    const pendingRevenue = bookings
      .filter(b => b.status === 'pending')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0)
    
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0
    const occupancyRate = totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0

    // Calculate upcoming bookings (check-in date is in the future)
    const upcomingBookings = bookings.filter(b => {
      const checkInDate = new Date(b.checkin_date)
      const today = new Date()
      return checkInDate > today && b.status !== 'cancelled'
    }).length

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      pendingRevenue,
      averageBookingValue,
      occupancyRate,
      upcomingBookings
    }
  }

  const stats = calculateStats()

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'bg-blue-500',
      trend: '+12%',
      trendUp: true,
      description: 'All time bookings'
    },
    {
      title: 'Pending Bookings',
      value: stats.pendingBookings,
      icon: Clock,
      color: 'bg-yellow-500',
      trend: '+5%',
      trendUp: true,
      description: 'Awaiting confirmation'
    },
    {
      title: 'Confirmed Bookings',
      value: stats.confirmedBookings,
      icon: CheckCircle,
      color: 'bg-green-500',
      trend: '+8%',
      trendUp: true,
      description: 'Confirmed reservations'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      trend: '+15%',
      trendUp: true,
      description: 'Total earnings'
    },
    {
      title: 'Upcoming Stays',
      value: stats.upcomingBookings,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      trend: '+3%',
      trendUp: true,
      description: 'Future bookings'
    },
    {
      title: 'Occupancy Rate',
      value: `${stats.occupancyRate}%`,
      icon: Users,
      color: 'bg-orange-500',
      trend: '+7%',
      trendUp: true,
      description: 'Current occupancy'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -4, scale: 1.02 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend}
                  </div>
                </div>
              </div>
              
              <div className="mb-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {stat.title}
                </h4>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
} 