import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  Star,
  TrendingUp,
  Heart,
  Award,
  Sparkles
} from 'lucide-react'

interface GuestWelcomeCardProps {
  greeting: string
  userName: string
  upcomingCount: number
  totalBookings: number
}

export function GuestWelcomeCard({
  greeting,
  userName,
  upcomingCount,
  totalBookings
}: GuestWelcomeCardProps) {
  const getLoyaltyLevel = (bookings: number) => {
    if (bookings >= 10) return { level: 'Diamond', color: 'text-purple-400', icon: Sparkles }
    if (bookings >= 5) return { level: 'Gold', color: 'text-yellow-400', icon: Award }
    if (bookings >= 3) return { level: 'Silver', color: 'text-gray-400', icon: Star }
    return { level: 'Bronze', color: 'text-orange-400', icon: Heart }
  }

  const loyalty = getLoyaltyLevel(totalBookings)

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-green-500 to-blue-600 rounded-full blur-2xl transform -translate-x-24 translate-y-24"></div>
      </div>

      <div className="relative z-10 p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
                <loyalty.icon className={`w-4 h-4 ${loyalty.color}`} />
                <span className="text-sm font-medium text-white">{loyalty.level} Member</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">{totalBookings} stays</span>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold text-white mb-3"
            >
              {greeting}, {userName}! 👋
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-300 text-lg mb-8 max-w-2xl"
            >
              Welcome to your personalized AVR Lodge dashboard. Here's what's happening with your upcoming adventures and booking insights.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{upcomingCount}</div>
                    <div className="text-sm text-gray-300">Upcoming Stays</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {upcomingCount > 0 ? 'Your next adventure awaits!' : 'Ready to plan your next trip?'}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{totalBookings}</div>
                    <div className="text-sm text-gray-300">Total Bookings</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {totalBookings > 0 ? 'You\'re a valued guest!' : 'Start your journey with us'}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Award className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{loyalty.level}</div>
                    <div className="text-sm text-gray-300">Loyalty Level</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {loyalty.level === 'Diamond' ? 'Elite member benefits!' : 'Keep booking to level up'}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 pt-6 border-t border-white/20"
            >
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">
                  {upcomingCount > 0 
                    ? `Your next stay is just ${upcomingCount === 1 ? 'around the corner' : 'a few clicks away'}!`
                    : 'Ready to discover your next adventure?'
                  }
                </span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="w-40 h-40 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
                <div className="w-32 h-32 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp className="w-16 h-16 text-white" />
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <Star className="w-4 h-4 text-white" />
              </motion.div>
              
              <motion.div
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <Heart className="w-3 h-3 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 