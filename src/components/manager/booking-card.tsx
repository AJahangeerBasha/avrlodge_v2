import { motion } from 'framer-motion'
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Booking {
  id: string
  guest_name: string
  guest_email: string
  guest_phone?: string
  checkin_date: string
  checkout_date: string
  guest_count: number
  total_amount: number
  status: string
  payment_status: string
  payment_received?: number
  created_at: string
  special_requests?: string
}

interface BookingCardProps {
  booking: Booking
  onViewDetails: () => void
  onUpdateStatus: (bookingId: string, status: string) => void
  onPayment: () => void
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => React.ReactNode
}

export function BookingCard({ 
  booking, 
  onViewDetails, 
  onUpdateStatus, 
  onPayment,
  getStatusColor,
  getStatusIcon 
}: BookingCardProps) {
  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const diffTime = checkOutDate.getTime() - checkInDate.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {booking.guest_name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {booking.guest_email}
              </p>
            </div>
          </div>
          <Badge className={`${getStatusColor(booking.status)}`}>
            <span className="flex items-center gap-1">
              {getStatusIcon(booking.status)}
              {booking.status}
            </span>
          </Badge>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Check-in</p>
              <p className="text-gray-600 dark:text-gray-400">{formatDate(booking.checkin_date)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Check-out</p>
              <p className="text-gray-600 dark:text-gray-400">{formatDate(booking.checkout_date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Guests</p>
              <p className="text-gray-600 dark:text-gray-400">
                {booking.guest_count} • {calculateNights(booking.checkin_date, booking.checkout_date)} nights
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Total</p>
              <p className="text-gray-600 dark:text-gray-400">{formatCurrency(booking.total_amount)}</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        {booking.guest_phone && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Phone className="w-4 h-4" />
            <span>{booking.guest_phone}</span>
          </div>
        )}

        {/* Payment Status */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Payment: {booking.payment_status}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(booking.created_at)}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700">
        <div className="flex gap-2">
          <Button
            onClick={onViewDetails}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            Details
          </Button>
          
          <Button
            onClick={onPayment}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Payment
          </Button>
        </div>

        {/* Status Update */}
        <div className="mt-3 flex gap-2">
          {booking.status !== 'confirmed' && (
            <Button
              onClick={() => onUpdateStatus(booking.id, 'confirmed')}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm
            </Button>
          )}
          
          {booking.status !== 'cancelled' && (
            <Button
              onClick={() => onUpdateStatus(booking.id, 'cancelled')}
              size="sm"
              variant="outline"
              className="flex-1 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
} 