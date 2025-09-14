import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Phone, User, Hash, CreditCard, CheckCircle, Calendar, DollarSign, LogIn, FileText, LogOut, Edit, X, Users, Home, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import RoomCheckInModal from '@/components/admin/RoomCheckInModal'
import RoomCheckOutModal from '@/components/admin/RoomCheckOutModal'
import WhatsAppButton from '@/components/messaging/WhatsAppButton'
import { useAuth } from '@/providers/auth-provider'
import { supabaseQueries } from '@/lib/database'
import type { PaymentRecord } from '@/lib/types'

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

interface BookingCardProps {
  booking: Booking
  onPaymentUpdate?: (booking: Booking) => void
  onCheckIn?: (booking: Booking) => void
  onCheckOut?: (booking: Booking) => void
  onViewDocuments?: (booking: Booking) => void
  onEdit?: (booking: Booking) => void
  onCancel?: (booking: Booking) => void
  onStatusChange?: (bookingId: string, newStatus: string) => void
  onRoomCheckIn?: (roomId: string, roomNumber: string) => void
  onRoomCheckOut?: (roomId: string, roomNumber: string) => void
  updatingPayment?: boolean
  loadingDocuments?: boolean
  showActions?: boolean
  showRoomStatus?: boolean
  whatsAppData?: unknown // For WhatsApp messaging data
}

export default function BookingCard({
  booking,
  onPaymentUpdate,
  onViewDocuments,
  onEdit,
  onCancel,
  onRoomCheckIn,
  onRoomCheckOut,
  updatingPayment,
  loadingDocuments,
  showActions = true,
  showRoomStatus = false,
  whatsAppData,
}: BookingCardProps) {
  const [selectedRoomForCheckIn, setSelectedRoomForCheckIn] = useState<unknown>(null)
  const [selectedRoomForCheckOut, setSelectedRoomForCheckOut] = useState<unknown>(null)
  const [existingPayments, setExistingPayments] = useState<PaymentRecord[]>([])
  const { profile } = useAuth()

  // Load payments automatically for admin users
  useEffect(() => {
    const loadPayments = async () => {
      if (profile?.role === 'admin') {
        setLoadingPayments(true)
        try {
          const payments = await supabaseQueries.getPaymentsByReservation(booking.id)
          setExistingPayments(payments || [])
        } catch (error) {
          console.error('Error loading payments:', error)
          setExistingPayments([])
        } finally {
          setLoadingPayments(false)
        }
      }
    }
    loadPayments()
  }, [profile?.role, booking.id])

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checked_in':
        return <LogIn className="w-4 h-4" />
      case 'checked_out':
        return <CheckCircle className="w-4 h-4" />
      case 'booking':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <X className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
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

  const getRoomStatusIcon = (status?: string) => {
    switch (status) {
      case 'checked_in':
        return <LogIn className="w-3 h-3" />
      case 'checked_out':
        return <LogOut className="w-3 h-3" />
      case 'pending':
        return <Calendar className="w-3 h-3" />
      default:
        return <Calendar className="w-3 h-3" />
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'qr_jubair': return <CreditCard className="w-4 h-4" />
      case 'qr_basha': return <CreditCard className="w-4 h-4" />
      case 'cash': return <DollarSign className="w-4 h-4" />
      default: return <Receipt className="w-4 h-4" />
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
          
          {/* Right Column: Edit Button & Status Badge */}
          <div className="flex flex-col items-end gap-2">
            {/* Edit Button - Admin Only */}
            {profile?.role === 'admin' && onEdit && (
              <button
                onClick={() => onEdit(booking)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 hover:text-purple-900 text-sm font-medium rounded-lg border border-purple-200 hover:border-purple-300 transition-all duration-200"
                title="Edit Reservation"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}
            
            {/* Status Badge */}
            <span className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full border ${getStatusColor(booking.status)}`}>
              {getStatusIcon(booking.status)}
              <span className="capitalize">{booking.status.replace('_', ' ')}</span>
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
                      {getRoomStatusIcon(room.room_status)}
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
                          onClick={() => setSelectedRoomForCheckIn(room)}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                        >
                          Check In
                        </button>
                      )}
                      {room.room_status === 'checked_in' && (
                        <button
                          onClick={() => setSelectedRoomForCheckOut(room)}
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
                <div className="flex items-center justify-center gap-1">
                  {updatingPayment && (
                    <div className="animate-spin rounded-full h-2.5 w-2.5 border-b border-green-600"></div>
                  )}
                  <span className="text-sm font-semibold text-green-600">₹{booking.total_paid?.toLocaleString() || 0}</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-0.5">Remaining</span>
                <span className={`text-sm font-semibold ${
                  (booking.remaining_balance || 0) > 0 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  ₹{booking.remaining_balance?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History - Only for Admin and only if payments exist */}
        {profile?.role === 'admin' && existingPayments.length > 0 && (
          <div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-3.5 h-3.5 text-green-600" />
                <h3 className="text-xs font-semibold text-green-900">Payments</h3>
                <span className="bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full text-xs font-medium">
                  {existingPayments.length}
                </span>
              </div>
              
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {existingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="bg-white rounded p-2 border border-green-200/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-green-100 rounded-full">
                          {getPaymentMethodIcon(payment.payment_method)}
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-900">
                            ₹{Number(payment.amount).toLocaleString()}
                          </span>
                          <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                            {payment.payment_method.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {payment.created_at ? new Date(payment.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short'
                        }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Special Charges - Only for Admin/Manager and only if charges exist */}
        {(() => {
          console.log('BookingCard Debug:', {
            bookingRef: booking.reference_number,
            userRole: profile?.role,
            hasSpecialCharges: !!booking.reservation_special_charges,
            specialChargesCount: booking.reservation_special_charges?.length || 0,
            specialCharges: booking.reservation_special_charges
          })
          return null
        })()}
        {(profile?.role === 'admin' || profile?.role === 'manager') && 
         booking.reservation_special_charges && 
         booking.reservation_special_charges.length > 0 && (
          <div>
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-3 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="w-3.5 h-3.5 text-purple-600" />
                <h3 className="text-xs font-semibold text-purple-900">Special Charges</h3>
                <span className="bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full text-xs font-medium">
                  {booking.reservation_special_charges.length}
                </span>
              </div>
              
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {booking.reservation_special_charges.map((charge) => (
                  <div
                    key={charge.id}
                    className="bg-white rounded p-2 border border-purple-200/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-purple-100 rounded-full">
                            <Receipt className="w-3.5 h-3.5 text-purple-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-900 truncate">
                                {charge.special_charges_master?.charge_name || charge.custom_description || 'Special Charge'}
                              </span>
                              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium flex-shrink-0">
                                {charge.quantity}x
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-600">
                                ₹{Number(charge.custom_rate || charge.special_charges_master?.default_rate || 0).toLocaleString()} each
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end ml-2">
                        <span className="text-xs font-bold text-purple-700">
                          ₹{Number(charge.total_amount).toLocaleString()}
                        </span>
                        {charge.special_charges_master?.rate_type && (
                          <span className="text-xs text-gray-500 capitalize">
                            {charge.special_charges_master.rate_type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total Special Charges */}
              <div className="mt-2 pt-2 border-t border-purple-200/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-purple-900">
                    Total Special Charges:
                  </span>
                  <span className="text-sm font-bold text-purple-700">
                    ₹{booking.reservation_special_charges.reduce((total, charge) => total + Number(charge.total_amount), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div>
            {/* Primary Action Group */}
            <div className="mb-2">
              {onPaymentUpdate && (
                <Button
                  onClick={() => onPaymentUpdate(booking)}
                  disabled={(booking.remaining_balance || 0) === 0 || booking.status === 'cancelled'}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white min-h-[36px] text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 touch-manipulation disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                  Update Payment
                </Button>
              )}
            </div>

            {/* Secondary Action Group */}
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              {onViewDocuments && (
                <Button
                  onClick={() => onViewDocuments(booking)}
                  disabled={loadingDocuments}
                  variant="outline"
                  className="w-full sm:flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 min-h-[36px] text-sm font-medium rounded-lg touch-manipulation"
                >
                  {loadingDocuments ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-600 mr-1"></div>
                  ) : (
                    <FileText className="w-3 h-3 mr-1" />
                  )}
                  Documents
                </Button>
              )}

              {whatsAppData && (
                <div className="flex-1">
                  <WhatsAppButton
                    data={whatsAppData}
                    variant="outline"
                    buttonText="WhatsApp"
                    size="sm"
                    className="w-full min-h-[36px] text-sm font-medium rounded-lg border-green-300 text-green-700 hover:bg-green-50 touch-manipulation"
                  />
                </div>
              )}
            </div>

            {/* Destructive Action Group */}
            {onCancel && booking.status !== 'cancelled' && booking.status !== 'checked_out' && (
              <div className="pt-2 border-t border-gray-100">
                <Button
                  onClick={() => onCancel(booking)}
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 min-h-[36px] text-sm font-medium rounded-lg touch-manipulation"
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel Reservation
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Room Check-In Modal */}
      {selectedRoomForCheckIn && (
        <RoomCheckInModal
          booking={booking}
          room={selectedRoomForCheckIn}
          onClose={() => setSelectedRoomForCheckIn(null)}
          onCheckInComplete={() => {
            setSelectedRoomForCheckIn(null)
            if (onRoomCheckIn) {
              onRoomCheckIn(selectedRoomForCheckIn.id, selectedRoomForCheckIn.room_number)
            }
          }}
        />
      )}

      {/* Room Check-Out Modal */}
      {selectedRoomForCheckOut && (
        <RoomCheckOutModal
          booking={booking}
          room={selectedRoomForCheckOut}
          onClose={() => setSelectedRoomForCheckOut(null)}
          onCheckOutComplete={() => {
            setSelectedRoomForCheckOut(null)
            if (onRoomCheckOut) {
              onRoomCheckOut(selectedRoomForCheckOut.id, selectedRoomForCheckOut.room_number)
            }
          }}
        />
      )}
    </motion.div>
  )
}
