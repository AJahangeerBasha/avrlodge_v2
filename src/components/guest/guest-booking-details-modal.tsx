import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Calendar, 
  Users, 
  Phone, 
  Mail, 
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface GuestBookingDetailsModalProps {
  booking: {
    id: string
    check_in_date: string
    check_out_date: string
    guest_count: number
    guest_name: string
    guest_email: string
    guest_phone: string
    special_requests?: string
    total_price: number
    status: string
    payment_received: number
    payment_status: string
    created_at: string
    updated_at: string
    rooms: {
      room_number: string
      room_types: {
        name: string
        price_per_night: number
      }
    }
  }
  isOpen: boolean
  onClose: () => void
  onCancel: (bookingId: string) => void
}

export function GuestBookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onCancel
}: GuestBookingDetailsModalProps) {
  const [isCancelling, setIsCancelling] = useState(false)
  const { toast } = useToast()

  const calculateNights = () => {
    const checkIn = new Date(booking.check_in_date)
    const checkOut = new Date(booking.check_out_date)
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
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
  const remainingAmount = booking.total_price - booking.payment_received

  const handleCancel = async () => {
    if (!canCancel || !isUpcoming) {
      toast({
        title: "Cannot Cancel",
        description: "This booking cannot be cancelled",
        variant: "destructive",
      })
      return
    }

    setIsCancelling(true)
    try {
      await onCancel(booking.id)
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Booking Details
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Room {booking.rooms.room_number} • {booking.rooms.room_types.name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Booking Status
                    </span>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Booked on: {new Date(booking.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Payment Status
                    </span>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.payment_status)}`}>
                      {getPaymentStatusText(booking.payment_status)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Paid: ₹{booking.payment_received.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Guest Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Guest Information
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {booking.guest_name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {booking.guest_count} guest{booking.guest_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div className="text-gray-900 dark:text-white">
                      {booking.guest_email}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div className="text-gray-900 dark:text-white">
                      {booking.guest_phone}
                    </div>
                  </div>

                  {booking.special_requests && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Special Requests:
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {booking.special_requests}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Booking Details
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Check-in</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {new Date(booking.check_in_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Check-out</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {new Date(booking.check_out_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Room</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Room {booking.rooms.room_number} • {booking.rooms.room_types.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {calculateNights()} night{calculateNights() !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Payment Information
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Price</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{booking.total_price.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount Paid</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      ₹{booking.payment_received.toLocaleString()}
                    </span>
                  </div>
                  
                  {remainingAmount > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Remaining Balance</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          ₹{remainingAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cancellation Notice */}
              {!isUpcoming && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm text-yellow-800 dark:text-yellow-200">
                      This booking has already started and cannot be cancelled
                    </span>
                  </div>
                </div>
              )}

              {!canCancel && booking.status !== 'cancelled' && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      This booking cannot be cancelled at this time
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Close
                </Button>

                {canCancel && isUpcoming && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isCancelling ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Cancelling...
                      </div>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Cancel Booking
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 