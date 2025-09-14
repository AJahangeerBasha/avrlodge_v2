import { useState, useEffect } from 'react'
import { useBookings } from '@/contexts/BookingsContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, User, Hash, Calendar, Clock, MapPin, Mail, Users, Home, DollarSign, LogIn, LogOut, X, AlertTriangle, History, FileText, Eye, CreditCard, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FirebasePaymentModal } from './FirebasePaymentModal'
import RoomCheckInModal from './RoomCheckInModal'
import RoomCheckOutModal from './RoomCheckOutModal'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { updateReservationRoom } from '@/lib/reservationRooms'
import { updateReservationStatus } from '@/lib/reservations'
import { getPaymentsByReservationId } from '@/lib/payments'
import { getRoomCheckinDocumentsByReservationId } from '@/lib/roomCheckinDocuments'
import { supabase } from '@/lib/supabase'

interface Booking {
  id: string
  reference_number: string
  guest_name: string
  guest_phone: string
  guest_email: string
  check_in_date: string
  check_out_date: string
  total_quote: number
  total_paid: number
  remaining_balance: number
  status: 'reservation' | 'booking' | 'checked_in' | 'checked_out' | 'cancelled'
  guest_count: number
  room_numbers?: string
  reservation_rooms?: Array<{
    id?: string
    room_number: string
    room_type: string
    guest_count: number
    room_status?: 'pending' | 'checked_in' | 'checked_out'
    check_in_datetime?: string | null
    check_out_datetime?: string | null
  }>
  reservation_special_charges?: Array<{
    id: string
    custom_rate: number
    custom_description?: string
    quantity: number
    total_amount: number
    special_charges_master?: {
      charge_name: string
      default_rate: number
      rate_type: string
    }
  }>
  created_at: string
}

interface FirebaseBookingCardProps {
  booking: Booking
  showActions?: boolean
  showRoomStatus?: boolean
  onPaymentUpdate?: () => void
}

export default function FirebaseBookingCard({
  booking,
  showActions = true,
  showRoomStatus = false,
  onPaymentUpdate,
}: FirebaseBookingCardProps) {
  const [showCancellationModal, setShowCancellationModal] = useState(false)
  const [cancellationConfirmation, setCancellationConfirmation] = useState('')
  const [showDocuments, setShowDocuments] = useState(false)
  const [showPaymentHistory, setShowPaymentHistory] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [loadingPayments, setLoadingPayments] = useState(true)
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [processing, setProcessing] = useState(false)
  const { actions } = useBookings()
  const { toast } = useToast()
  const { currentUser } = useAuth()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked_in':
        // CheckedIn → Blue
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'checked_out':
        // CheckedOut → Red
        return 'bg-red-100 text-red-800 border-red-300'
      case 'booking':
        // Booking → Yellow
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'cancelled':
        // Cancelled → Purple
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'reservation':
        // Reservation → Orange
        return 'bg-orange-100 text-orange-800 border-orange-300'
      default:
        // Default reservation → Orange
        return 'bg-orange-100 text-orange-800 border-orange-300'
    }
  }

  const calculateNights = (checkInDate: string, checkOutDate: string): number =>
    Math.max(
      Math.ceil(
        (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime())
        / (1000 * 60 * 60 * 24)
      ),
      0
    );

  const getRoomNumbers = (): string => {
    // Try to get room numbers from reservation_rooms first, then fallback to room_numbers
    if (booking.reservation_rooms && booking.reservation_rooms.length > 0) {
      return booking.reservation_rooms.map(room => room.room_number).join(', ')
    } else if (booking.room_numbers) {
      return booking.room_numbers
    }
    return 'Not assigned'
  }

  const formatPhone = (phone: string) => {
    if (!phone) return "";
    return phone.replace(/(\d{5})(\d{5})/, "$1 $2");
  };

  // Calculate dynamic status based on business rules
  const getCalculatedStatus = (): string => {
    // If already cancelled, keep cancelled
    if (booking.status === 'cancelled') {
      return 'cancelled'
    }

    // Check room states if we have reservation_rooms
    if (booking.reservation_rooms && booking.reservation_rooms.length > 0) {
      const roomStates = booking.reservation_rooms.map(room => room.room_status || 'pending')

      // If all rooms are checked out
      if (roomStates.every(status => status === 'checked_out')) {
        return 'checked_out'
      }

      // If all rooms are checked in
      if (roomStates.every(status => status === 'checked_in')) {
        return 'checked_in'
      }

      // If some rooms are checked in (partial check-in)
      if (roomStates.some(status => status === 'checked_in')) {
        return 'checked_in' // Still show as checked_in for partial
      }
    }

    // Check payment status for booking vs reservation - use calculated total paid
    const { totalPaid } = calculatePaymentTotals()
    if (totalPaid > 0) {
      return 'booking' // Payment made = booking status
    }

    // Default to reservation for new bookings with no payment
    return 'reservation'
  };

  // Get last 3 digits of reference number for confirmation
  const getLastThreeDigits = (): string => {
    return booking.reference_number.slice(-3)
  };

  // Handle cancellation with confirmation
  const handleCancellation = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to cancel a reservation.",
        variant: "destructive",
      })
      return
    }

    const expectedConfirmation = getLastThreeDigits()
    if (cancellationConfirmation !== expectedConfirmation) {
      toast({
        title: "Confirmation Required",
        description: `Please type "${expectedConfirmation}" to confirm cancellation.`,
        variant: "destructive",
      })
      return
    }

    try {
      setProcessing(true)

      await updateReservationStatus(booking.id, 'cancelled', currentUser.uid)

      toast({
        title: "Reservation Cancelled",
        description: `Reservation ${booking.reference_number} has been cancelled successfully.`,
      })

      setShowCancellationModal(false)
      setCancellationConfirmation('')

      // Refresh the bookings list
      if (onPaymentUpdate) {
        onPaymentUpdate()
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error)
      toast({
        title: "Cancellation Failed",
        description: error instanceof Error ? error.message : "Failed to cancel reservation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  };

  // Load payment history
  const loadPaymentHistory = async () => {
    try {
      setLoadingPayments(true)
      console.log('BookingCard: Loading payment history for booking', booking.reference_number)
      const paymentHistory = await getPaymentsByReservationId(booking.id)
      console.log('BookingCard: Loaded', paymentHistory.length, 'payments')
      setPayments(paymentHistory)
    } catch (error) {
      console.error('Error loading payment history:', error)
      toast({
        title: "Error",
        description: "Failed to load payment history.",
        variant: "destructive",
      })
    } finally {
      setLoadingPayments(false)
    }
  };

  // Load documents
  const loadDocuments = async () => {
    try {
      setLoadingDocuments(true)
      const docs = await getRoomCheckinDocumentsByReservationId(booking.id)
      setDocuments(docs)
    } catch (error) {
      console.error('FirebaseBookingCard: Error loading documents:', error)
      toast({
        title: "Error",
        description: `Failed to load documents: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setLoadingDocuments(false)
    }
  };

  // Calculate payment totals from actual payment history
  const calculatePaymentTotals = () => {
    if (payments.length === 0) {
      return {
        totalPaid: booking.total_paid || 0,
        remainingBalance: booking.remaining_balance || 0
      }
    }

    const totalPaid = payments
      .filter(payment => payment.paymentStatus === 'completed')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0)

    const remainingBalance = Math.max(0, (booking.total_quote || 0) - totalPaid)

    return { totalPaid, remainingBalance }
  }

  // Load payment history on component mount and when booking data changes
  useEffect(() => {
    loadPaymentHistory()
  }, [booking.id, booking.total_paid, booking.remaining_balance])

  // Refresh data when parent calls onPaymentUpdate
  useEffect(() => {
    // Re-load payments when payment updates occur
    loadPaymentHistory()
  }, [booking])

  // Also refresh when onPaymentUpdate function changes (indicates parent update)
  useEffect(() => {
    if (onPaymentUpdate) {
      loadPaymentHistory()
    }
  }, [onPaymentUpdate])

  // Handle documents modal
  const handleShowDocuments = () => {
    setShowDocuments(true)
    loadDocuments()
  };

  const getRoomStatusColor = (status?: string) => {
    switch (status) {
      case 'checked_in':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'checked_out':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  // Helper function to determine if file is an image
  const isImageFile = (fileName: string): boolean => {
    if (!fileName) return false
    const extension = fileName.toLowerCase().split('.').pop()
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')
  }

  // Helper function to determine if file is a PDF
  const isPdfFile = (fileName: string): boolean => {
    if (!fileName) return false
    const extension = fileName.toLowerCase().split('.').pop()
    return extension === 'pdf'
  }

  // Handle document preview
  const handleDocumentPreview = (doc: any) => {
    setSelectedDocument(doc)
  }

  // Close document preview
  const closeDocumentPreview = () => {
    setSelectedDocument(null)
  }

  // Get proper Supabase public URL for a document
  const getSupabasePublicURL = (doc: any): string => {
    if (!doc.fileUrl) return ''

    // If it's already a full Supabase URL, return as is
    if (doc.fileUrl.includes('supabase.co')) {
      return doc.fileUrl
    }

    // If it's a path, construct the public URL
    const { data } = supabase.storage
      .from('room-documents')
      .getPublicUrl(doc.fileUrl)

    return data.publicUrl
  }

  // Create a signed URL for private files (fallback)
  const getSignedURL = async (doc: any): Promise<string> => {
    try {
      if (!doc.fileUrl) return ''

      // Extract path from fileUrl if it's a full URL
      let filePath = doc.fileUrl
      if (filePath.includes('supabase.co')) {
        const url = new URL(filePath)
        filePath = url.pathname.split('/object/public/room-documents/')[1] || url.pathname
      }

      const { data, error } = await supabase.storage
        .from('room-documents')
        .createSignedUrl(filePath, 3600) // 1 hour expiry

      if (error) {
        console.error('Error creating signed URL:', error)
        return doc.fileUrl // fallback to original URL
      }

      return data.signedUrl
    } catch (error) {
      console.error('Error in getSignedURL:', error)
      return doc.fileUrl // fallback to original URL
    }
  }

  return (
    <motion.div
      key={booking.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-200 relative overflow-hidden group touch-manipulation"
    >

      {/* CARD HEADER */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100 px-4 sm:px-5 py-3">
        <div className="grid grid-cols-2 gap-4 items-start">
          {/* Left Column: Guest Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="font-mono text-sm font-bold text-gray-900 truncate">
                {booking.reference_number}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-base font-semibold text-gray-900 truncate">
                {booking.guest_name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Phone className="w-4 h-4 text-blue-600" />
              <a
                href={`tel:+91${booking.guest_phone}`}
                className="hover:text-blue-600 transition-colors font-medium truncate"
              >
                +91 {formatPhone(booking.guest_phone)}
              </a>
            </div>
          </div>
          
          {/* Right Column: Status Badge */}
          <div className="flex flex-col items-end gap-2">
            {/* Status Badge */}
            <span className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full border ${getStatusColor(getCalculatedStatus())}`}>
              <span className="capitalize">{getCalculatedStatus().replace('_', ' ')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="px-4 sm:px-5 py-3 space-y-3">
        
        {/* Dates */}
        <div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2.5 border border-blue-100">
            <div className="flex items-center gap-2 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-900">Stay Period</span>
            </div>
            <div className="text-xs text-gray-700 flex items-center justify-between">
              <span className="font-medium">
                {new Date(booking.check_in_date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })} - {new Date(booking.check_out_date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span className="bg-white px-2 py-0.5 rounded-full text-blue-700 font-medium border border-blue-200 text-xs">
                {(() => {
                  const nights = calculateNights(
                    booking.check_in_date,
                    booking.check_out_date
                  );
                  return `${nights} ${nights === 1 ? "Night" : "Nights"}`;
                })()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Room & Guest Info */}
        {showRoomStatus && booking.reservation_rooms && booking.reservation_rooms.length > 0 ? (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-600 font-medium mb-3">
              <div className="flex items-center gap-2">
                <Home className="w-3.5 h-3.5 text-gray-400" />
                <span>Rooms ({booking.reservation_rooms.length})</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <span>{booking.guest_count} {booking.guest_count === 1 ? 'Guest' : 'Guests'}</span>
              </div>
            </div>
            <div className="space-y-2">
              {booking.reservation_rooms.map((room, index) => (
                <div key={room.id || index} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="font-medium text-gray-900 text-sm">Room {room.room_number}</span>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">{room.room_type}</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border self-start sm:self-auto ${getRoomStatusColor(room.room_status)}`}>
                      <span className="capitalize">{(room.room_status || 'pending').replace('_', ' ')}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{room.guest_count} {room.guest_count === 1 ? 'guest' : 'guests'}</span>
                    <div className="flex gap-3">
                      {room.check_in_datetime && (
                        <span>In: {new Date(room.check_in_datetime).toLocaleDateString()}</span>
                      )}
                      {room.check_out_datetime && (
                        <span>Out: {new Date(room.check_out_datetime).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  {/* Room-level actions */}
                  {room.id && (
                    <div className="flex gap-2 mt-2">
                      {room.room_status === 'pending' && (
                        <button
                          onClick={() => actions.openCheckInModal(booking, room)}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                        >
                          Check In
                        </button>
                      )}
                      {room.room_status === 'checked_in' && (
                        <button
                          onClick={() => actions.openCheckOutModal(booking, room)}
                          className="px-3 py-1 text-xs bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
                        >
                          Check Out
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Home className="w-3.5 h-3.5 text-gray-400" />
                <div>
                  <span className="text-gray-400">Room:</span>
                  <span className="ml-1 font-medium text-gray-700">{getRoomNumbers()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <div>
                  <span className="text-gray-400">Guests:</span>
                  <span className="ml-1 font-medium text-gray-700">{booking.guest_count || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div>
          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-xs text-gray-500 block mb-0.5">Total</span>
                <span className="text-sm font-semibold text-gray-900">₹{booking.total_quote?.toLocaleString() || 0}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-0.5">Paid</span>
                <span className="text-sm font-semibold text-green-600">₹{calculatePaymentTotals().totalPaid.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-0.5">Remaining</span>
                <span className={`text-sm font-semibold ${
                  calculatePaymentTotals().remainingBalance > 0 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  ₹{calculatePaymentTotals().remainingBalance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History - Accordion - Only show if payments exist or are loading */}
        {(loadingPayments || payments.length > 0) && (
          <div>
            {/* Accordion Header */}
            <button
              onClick={() => setShowPaymentHistory(!showPaymentHistory)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Payment History</span>
                {loadingPayments && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                )}
                <span className="text-xs text-gray-500">({payments.length} records)</span>
              </div>
              {showPaymentHistory ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>

            {/* Accordion Content */}
            <AnimatePresence>
              {showPaymentHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2">
                    {loadingPayments ? (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center justify-center py-2">
                          <span className="text-xs text-gray-500">Loading payments...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {payments.map((payment, index) => (
                          <div key={payment.id || index} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <DollarSign className="w-3 h-3 text-green-600" />
                                  <span className="text-sm font-semibold text-gray-900">
                                    ₹{payment.amount?.toLocaleString() || '0'}
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                                    payment.paymentStatus === 'completed'
                                      ? 'bg-green-100 text-green-800'
                                      : payment.paymentStatus === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {payment.paymentStatus || 'Unknown'}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600">
                                  {payment.paymentMethod || 'Unknown method'} • {payment.paymentType?.replace('_', ' ') || 'Payment'}
                                </p>
                                {payment.receiptNumber && (
                                  <p className="text-xs text-gray-500">Receipt: {payment.receiptNumber}</p>
                                )}
                                {payment.notes && (
                                  <p className="text-xs text-gray-600 mt-1">{payment.notes}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">
                                  {payment.paymentDate
                                    ? new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short'
                                    })
                                    : 'Unknown'
                                  }
                                </p>
                                <p className="text-xs text-gray-400">
                                  {payment.paymentDate
                                    ? new Date(payment.paymentDate).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })
                                    : ''
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Contact Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Mail className="h-4 w-4" />
            <span>{booking.guest_email || 'No email'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Phone className="h-4 w-4" />
            <span>{booking.guest_phone}</span>
          </div>
          {booking.guest_count && (
            <div className="px-2 py-1 bg-gray-100 rounded text-xs">
              {booking.guest_count} guest{booking.guest_count !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Payment Actions */}
        {showActions && calculatePaymentTotals().remainingBalance > 0 && getCalculatedStatus() !== 'cancelled' && (
          <div className="pt-4 border-t border-gray-100">
            <Button
              onClick={() => actions.openPaymentModal(booking)}
              className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors mb-2"
              size="sm"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Update Payment (₹{calculatePaymentTotals().remainingBalance.toLocaleString()} remaining)
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className={`${calculatePaymentTotals().remainingBalance > 0 && getCalculatedStatus() !== 'cancelled' ? '' : 'pt-4 border-t border-gray-100'}`}>
            <div className="space-y-2">
              {/* View Documents Button */}
              <Button
                onClick={handleShowDocuments}
                variant="outline"
                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                size="sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                View Uploaded Documents
              </Button>

              {/* Cancel Reservation Button */}
              {getCalculatedStatus() !== 'cancelled' && (
                <Button
                  onClick={() => setShowCancellationModal(true)}
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Reservation
                </Button>
              )}
            </div>
          </div>
        )}
      </div>


      {/* Documents Viewer Modal */}
      <AnimatePresence>
        {showDocuments && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDocuments(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Compact Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Documents
                    </h3>
                    <p className="text-xs text-gray-500">
                      {booking.reference_number}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDocuments(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Compact Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {loadingDocuments ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading documents...</span>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-6">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No documents found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc, index) => (
                      <div key={doc.id || index} className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-blue-300">
                        <div className="flex items-center gap-3">
                          {/* Thumbnail or Icon */}
                          {isImageFile(doc.fileName) && doc.fileUrl ? (
                            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={getSupabasePublicURL(doc)}
                                alt={doc.fileName}
                                className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => handleDocumentPreview(doc)}
                                onError={async (e) => {
                                  const target = e.target as HTMLImageElement
                                  try {
                                    const signedUrl = await getSignedURL(doc)
                                    if (signedUrl !== doc.fileUrl) {
                                      target.src = signedUrl
                                      return
                                    }
                                  } catch (error) {
                                    console.error('Fallback signed URL failed:', error)
                                  }
                                  // Fallback to file icon
                                  const iconDiv = document.createElement('div')
                                  iconDiv.className = 'w-full h-full flex items-center justify-center bg-gray-100'
                                  iconDiv.innerHTML = '<svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" /></svg>'
                                  target.parentNode?.replaceChild(iconDiv, target)
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-blue-50 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                          )}

                          {/* Document Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-gray-900 text-sm capitalize truncate">
                                {doc.documentType?.replace('_', ' ') || 'Document'}
                              </h4>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                                Room {doc.roomId?.slice(-4) || 'Unknown'}
                              </span>
                            </div>

                            <p className="text-xs text-gray-500 mb-2 truncate">
                              {doc.fileName}
                            </p>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">
                                {doc.uploadedAt
                                  ? new Date(doc.uploadedAt).toLocaleDateString('en-IN', {
                                      day: '2-digit',
                                      month: 'short'
                                    })
                                  : 'Unknown'
                                }
                              </span>

                              {doc.fileUrl && (
                                <Button
                                  onClick={() => handleDocumentPreview(doc)}
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 px-3"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Preview
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Preview Modal */}
      <AnimatePresence>
        {selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={closeDocumentPreview}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      {selectedDocument.documentType?.replace('_', ' ') || 'Document'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedDocument.fileName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeDocumentPreview}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preview Content */}
              <div className="flex-1 overflow-auto p-4 bg-gray-50">
                <div className="flex items-center justify-center min-h-full">
                  {isImageFile(selectedDocument.fileName) ? (
                    <div className="max-w-full max-h-full">
                      <img
                        src={getSupabasePublicURL(selectedDocument)}
                        alt={selectedDocument.fileName}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        onError={async (e) => {
                          const target = e.target as HTMLImageElement

                          // Try signed URL as fallback
                          try {
                            const signedUrl = await getSignedURL(selectedDocument)
                            if (signedUrl !== selectedDocument.fileUrl && signedUrl !== target.src) {
                              target.src = signedUrl
                              return
                            }
                          } catch (error) {
                            console.error('Fallback signed URL failed:', error)
                          }

                          // If all fails, show error message
                          target.style.display = 'none'
                          const errorDiv = document.createElement('div')
                          errorDiv.className = 'text-center py-8'
                          errorDiv.innerHTML = `
                            <div class="text-gray-400 mb-2">
                              <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                              </svg>
                            </div>
                            <p class="text-gray-500">Unable to load image preview</p>
                            <p class="text-xs text-gray-400 mt-1">Trying Supabase URL: ${getSupabasePublicURL(selectedDocument)}</p>
                            <p class="text-xs text-gray-400 mt-1">Original URL: ${selectedDocument.fileUrl}</p>
                          `
                          target.parentNode?.appendChild(errorDiv)
                        }}
                      />
                    </div>
                  ) : isPdfFile(selectedDocument.fileName) ? (
                    <div className="w-full h-full min-h-[500px]">
                      <iframe
                        src={getSupabasePublicURL(selectedDocument)}
                        className="w-full h-full border-0 rounded-lg"
                        title={selectedDocument.fileName}
                        onError={() => {
                          // Handle PDF loading error
                        }}
                      />
                      {/* Fallback for PDF */}
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>PDF preview not available</p>
                        <a
                          href={getSupabasePublicURL(selectedDocument)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center mt-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Open in New Tab
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 mb-2">Preview not available for this file type</p>
                      <p className="text-xs text-gray-400 mb-4">{selectedDocument.fileName}</p>
                      <a
                        href={getSupabasePublicURL(selectedDocument)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Open in New Tab
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Room:</span> {selectedDocument.roomId}
                  </div>
                  <div>
                    <span className="font-medium">Uploaded:</span> {selectedDocument.uploadedAt
                      ? new Date(selectedDocument.uploadedAt).toLocaleDateString('en-IN')
                      : 'Unknown date'
                    }
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancellation Confirmation Modal */}
      <AnimatePresence>
        {showCancellationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowCancellationModal(false)
              setCancellationConfirmation('')
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Cancel Reservation
                  </h3>
                  <p className="text-sm text-gray-500">
                    {booking.reference_number}
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700">
                    <strong>Warning:</strong> This action cannot be undone. The reservation will be permanently cancelled.
                  </p>
                </div>

                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Type the last 3 digits of reference number to confirm
                </Label>
                <p className="text-xs text-gray-500 mb-2">
                  Reference: {booking.reference_number} → Type: <strong>{getLastThreeDigits()}</strong>
                </p>
                <Input
                  value={cancellationConfirmation}
                  onChange={(e) => setCancellationConfirmation(e.target.value)}
                  placeholder="Enter last 3 digits"
                  className="mb-2"
                  maxLength={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowCancellationModal(false)
                    setCancellationConfirmation('')
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCancellation}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={processing || cancellationConfirmation !== getLastThreeDigits()}
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Cancelling...
                    </div>
                  ) : (
                    'Confirm Cancellation'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}