import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock,
  ArrowRight,
  Eye
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface UpcomingStaysProps {
  bookings: any[]
  loading: boolean
}

export function UpcomingStays({ bookings, loading }: UpcomingStaysProps) {
  const calculateDaysUntil = (checkInDate: string) => {
    const checkIn = new Date(checkInDate)
    const today = new Date()
    const diffTime = checkIn.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Upcoming Stays
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Upcoming Stays
        </h3>
        <Link to="/profile/bookings">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            View All
          </motion.button>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">🏠</div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No upcoming stays
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Ready to plan your next adventure?
          </p>
          <Link to="/rooms">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Book a Room
            </motion.button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2, scale: 1.01 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Room {booking.rooms.room_number}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {booking.rooms.room_types.name}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">Check-in</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {new Date(booking.checkin_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">Duration</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {calculateNights(booking.checkin_date, booking.checkout_date)} nights
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                            {calculateDaysUntil(booking.checkin_date)} days until check-in
                          </span>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            ₹{booking.total_price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    <Link to={`/profile/bookings?booking=${booking.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
} 