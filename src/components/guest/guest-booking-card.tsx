import { motion } from 'framer-motion'
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Phone, 
  Mail,
  Eye,
  XCircle,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface GuestBookingCardProps {
  booking: {
    id: string
    check_in_date: string
    check_out_date: string
    guest_count: number
    guest_name: string
    guest_email: string
    guest_phone: string
    total_price: number
    status: string
    payment_received: number
    payment_status: string
    created_at: string
    rooms: {
      room_number: string
      room_types: {
        name: string
        price_per_night: number
      }
    }
  }
  onViewDetails: () => void
  onCancel: (bookingId: string) => void
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => React.ReactNode
}

export function GuestBookingCard({
  booking,
  onViewDetails,
  onCancel,
  getStatusColor,
  getStatusIcon
}: GuestBookingCardProps) {
  const calculateNights = () => {
    const checkIn = new Date(booking.check_in_date)
    const checkOut = new Date(booking.check_out_date)
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'full': return 'text-green-600 bg-green-100'
      case 'partial': return 'text-yellow-600 bg-yellow-100'
      case 'pending': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'full': return 'Paid'
      case 'partial': return 'Partial'
      case 'pending': return 'Pending'
      default: return 'Unknown'
    }
  }

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed'
  const isUpcoming = new Date(booking.check_in_date) > new Date()

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Room {booking.rooms.room_number}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {booking.rooms.room_types.name}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(booking.status)}`}>
            {getStatusIcon(booking.status)}
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </div>
        </div>

        {/* Booking Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>{booking.guest_count} guest{booking.guest_count !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{calculateNights()} night{calculateNights() !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Price</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ₹{booking.total_price.toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Payment Status</span>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.payment_status)}`}>
            {getPaymentStatusText(booking.payment_status)}
          </div>
        </div>

        {booking.payment_received > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Amount Paid</span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              ₹{booking.payment_received.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onViewDetails}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Details
          </motion.button>
          
          {canCancel && isUpcoming && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCancel(booking.id)}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </motion.button>
          )}
        </div>

        {/* Cancellation Notice */}
        {!isUpcoming && (
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-xs text-yellow-800 dark:text-yellow-200">
                This booking has already started
              </span>
            </div>
          </div>
        )}

        {!canCancel && booking.status !== 'cancelled' && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                This booking cannot be cancelled
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
} 