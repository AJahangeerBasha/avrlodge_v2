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
  Crown,
  Trophy,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface CompactInsightsProps {
  bookings: any[]
}

export function CompactInsights({ bookings }: CompactInsightsProps) {
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
      <div className="text-center py-6">
        <div className="text-gray-400 dark:text-gray-500 text-2xl mb-2">💡</div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">No insights available</p>
        <Link to="/rooms">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
          >
            <MapPin className="w-4 h-4" />
            Explore Rooms
          </motion.button>
        </Link>
      </div>
    )
  }

  const recommendations = [
    {
      title: 'Try New Room',
      description: `You've mostly stayed in ${insights.favoriteRoomType}. Try something new!`,
      icon: MapPin,
      color: 'bg-blue-500',
      action: 'Browse',
      href: '/rooms'
    },
    {
      title: 'Extend Stay',
      description: `Your avg stay is ${Math.round(insights.avgStayDuration)} days. Longer stays = better rates!`,
      icon: Calendar,
      color: 'bg-green-500',
      action: 'View',
      href: '/rooms'
    },
    {
      title: 'Invite Friends',
      description: 'Share your experience and earn rewards when friends book.',
      icon: Users,
      color: 'bg-purple-500',
      action: 'Share',
      href: '/profile'
    }
  ]

  return (
    <div className="space-y-4">
      {/* Loyalty Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold mb-1">Loyalty Status</h3>
            <div className="flex items-center gap-3">
              <div className="text-xl font-bold">{insights.loyaltyLevel}</div>
              <div className="text-xs text-gray-300">
                <div>₹{insights.totalSpent.toLocaleString()} spent</div>
                <div>{bookings.length} bookings</div>
              </div>
            </div>
          </div>
          <Crown className="w-8 h-8 text-yellow-400" />
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Achievements
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {insights.achievements.map((achievement, index) => (
            <motion.div
              key={achievement.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <achievement.icon className={`w-4 h-4 ${achievement.color}`} />
              <div>
                <div className="text-xs font-medium text-gray-900 dark:text-white">{achievement.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Unlocked!</div>
              </div>
            </motion.div>
          ))}
          
          {insights.achievements.length < 4 && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <Sparkles className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {insights.nextMilestone - bookings.length} more
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">to next</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Recommendations
          </h3>
        </div>
        
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${rec.color} text-white`}>
                  <rec.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {rec.description}
                  </p>
                </div>
              </div>
              
              <Link to={rec.href}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  {rec.action}
                  <ArrowRight className="w-3 h-3" />
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Your Summary
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {bookings.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Bookings</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              ₹{(insights.totalSpent / 1000).toFixed(1)}k
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Spent</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {Math.round(insights.avgStayDuration)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Avg Days</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {insights.favoriteRoomType}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Favorite</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 