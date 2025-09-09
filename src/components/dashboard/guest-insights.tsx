import { motion } from 'framer-motion'
import { 
  Lightbulb, 
  Star, 
  Award, 
  Target, 
  TrendingUp, 
  Heart,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Zap,
  Compass,
  Gift,
  Crown,
  Trophy,
  Sparkles
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface GuestInsightsProps {
  bookings: any[]
}

export function GuestInsights({ bookings }: GuestInsightsProps) {
  const calculateInsights = () => {
    if (bookings.length === 0) return null

    const totalSpent = bookings.reduce((sum, b) => sum + b.payment_received, 0)
    const avgStayDuration = bookings.reduce((sum, b) => {
      const checkIn = new Date(b.checkin_date)
              const checkOut = new Date(b.checkout_date)
      return sum + Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    }, 0) / bookings.length

    // Favorite room type
    const roomTypeCounts = bookings.reduce((acc, booking) => {
      const roomType = booking.rooms.room_types.name
      acc[roomType] = (acc[roomType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const favoriteRoomType = Object.entries(roomTypeCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0]

    // Loyalty level based on total spent
    let loyaltyLevel = 'Bronze'
    if (totalSpent >= 50000) loyaltyLevel = 'Diamond'
    else if (totalSpent >= 25000) loyaltyLevel = 'Platinum'
    else if (totalSpent >= 10000) loyaltyLevel = 'Gold'
    else if (totalSpent >= 5000) loyaltyLevel = 'Silver'

    // Achievements
    const achievements = []
    if (bookings.length >= 5) achievements.push({ name: 'Frequent Guest', icon: Star, color: 'text-yellow-500' })
    if (totalSpent >= 10000) achievements.push({ name: 'Big Spender', icon: DollarSign, color: 'text-green-500' })
    if (avgStayDuration >= 3) achievements.push({ name: 'Extended Stayer', icon: Calendar, color: 'text-blue-500' })
    if (bookings.length >= 10) achievements.push({ name: 'Loyal Customer', icon: Heart, color: 'text-red-500' })

    return {
      totalSpent,
      avgStayDuration,
      favoriteRoomType,
      loyaltyLevel,
      achievements,
      nextMilestone: bookings.length < 5 ? 5 : bookings.length < 10 ? 10 : 15
    }
  }

  const insights = calculateInsights()

  if (!insights) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">💡</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Insights Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Start booking rooms to unlock personalized insights
        </p>
        <Link to="/rooms">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Compass className="w-4 h-4" />
            Explore Rooms
          </motion.button>
        </Link>
      </div>
    )
  }

  const recommendations = [
    {
      title: 'Try a New Room Type',
      description: `You've mostly stayed in ${insights.favoriteRoomType}. Why not try our other amazing options?`,
      icon: MapPin,
      color: 'bg-blue-500',
      action: 'Browse Rooms',
      href: '/rooms'
    },
    {
      title: 'Extend Your Stay',
      description: `Your average stay is ${Math.round(insights.avgStayDuration)} days. Consider longer stays for better rates!`,
      icon: Calendar,
      color: 'bg-green-500',
      action: 'View Packages',
      href: '/rooms'
    },
    {
      title: 'Invite Friends',
      description: 'Share your experience and earn rewards when friends book through your referral.',
      icon: Users,
      color: 'bg-purple-500',
      action: 'Get Referral Link',
      href: '/profile'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Insights
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Personalized recommendations and achievements based on your booking history
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Loyalty Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Loyalty Status</h3>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold">{insights.loyaltyLevel}</div>
              <div className="text-gray-300">
                <div>Total Spent: ₹{insights.totalSpent.toLocaleString()}</div>
                <div className="text-sm">Bookings: {bookings.length}</div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Crown className="w-12 h-12 text-yellow-400 mb-2" />
            <div className="text-sm text-gray-300">
              {insights.loyaltyLevel === 'Diamond' ? 'Elite Member' :
               insights.loyaltyLevel === 'Platinum' ? 'Premium Member' :
               insights.loyaltyLevel === 'Gold' ? 'Valued Member' :
               insights.loyaltyLevel === 'Silver' ? 'Regular Member' : 'New Member'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Achievements
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.achievements.map((achievement, index) => (
            <motion.div
              key={achievement.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{achievement.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Unlocked!</div>
              </div>
            </motion.div>
          ))}
          
          {insights.achievements.length < 4 && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <Sparkles className="w-6 h-6 text-gray-400" />
              <div>
                <div className="font-medium text-gray-600 dark:text-gray-400">
                  {insights.nextMilestone - bookings.length} more bookings
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-500">to next achievement</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Personalized Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${rec.color} text-white`}>
                  <rec.icon className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {rec.title}
                </h4>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {rec.description}
              </p>
              
              <Link to={rec.href}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  {rec.action}
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Booking Summary
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {bookings.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{insights.totalSpent.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Spent</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(insights.avgStayDuration)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Days</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {insights.favoriteRoomType}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Favorite Room</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 