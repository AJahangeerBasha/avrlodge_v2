import { X, Phone, MessageCircle, CreditCard, FileText, Users, Calendar, MapPin } from 'lucide-react'
import type { Reservation, Guest, PaymentRecord } from '@/lib/types'

interface ReservationModalProps {
  reservation: Reservation | null
  guests?: Guest[]
  payments?: PaymentRecord[]
  isOpen: boolean
  onClose: () => void
  onCheckIn?: () => void
  onCheckOut?: () => void
  onPayment?: () => void
  onWhatsApp?: () => void
  onEdit?: () => void
  role: 'admin' | 'manager'
}

export default function ReservationModal({
  reservation,
  guests = [],
  payments = [],
  isOpen,
  onClose,
  onCheckIn,
  onCheckOut,
  onPayment,
  onWhatsApp,
  onEdit,
  role
}: ReservationModalProps) {
  if (!reservation) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reservation':
        return 'bg-yellow-100 text-yellow-800'
      case 'booking':
        return 'bg-blue-100 text-blue-800'
      case 'checked_in':
        return 'bg-green-100 text-green-800'
      case 'checked_out':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const totalQuote = reservation.total_quote || 0
  const balanceAmount = totalQuote - totalPaid

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Bottom Sheet Modal */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '90vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                {reservation.status.replace('_', ' ').toUpperCase()}
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {reservation.reference_number}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-3 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          <div className="p-4 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Check-in / Check-out</div>
                  <div className="font-medium">
                    {formatDate(reservation.check_in_date)} - {formatDate(reservation.check_out_date)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Guests</div>
                  <div className="font-medium">
                    {reservation.guest_count} ({reservation.guest_type})
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Rooms</div>
                  <div className="font-medium">
                    {reservation.room_numbers?.join(', ') || 'Not assigned'}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">Financial Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Room Tariff</span>
                  <span className="font-medium">{formatCurrency(reservation.room_tariff || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Quote</span>
                  <span className="font-medium">{formatCurrency(totalQuote)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Advance Paid</span>
                  <span className="font-medium">{formatCurrency(totalPaid)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Balance</span>
                  <span className={`font-semibold ${balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(balanceAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Guest List */}
            {guests.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Guests</h3>
                <div className="space-y-2">
                  {guests.map((guest) => (
                    <div key={guest.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{guest.name}</div>
                        <div className="text-sm text-gray-600">{guest.phone}</div>
                      </div>
                      {guest.is_primary_guest && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment History */}
            {payments.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Payment History</h3>
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{formatCurrency(payment.amount)}</div>
                        <div className="text-sm text-gray-600">
                          {payment.payment_method}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
            {onWhatsApp && (
              <button 
                onClick={onWhatsApp}
                className="flex-1 min-h-[48px] py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors touch-manipulation shadow-md hover:shadow-lg active:scale-95"
                aria-label="Contact via WhatsApp"
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                WhatsApp
              </button>
            )}
            
            {onPayment && balanceAmount > 0 && (
              <button 
                onClick={onPayment}
                className="flex-1 min-h-[48px] py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 touch-manipulation shadow-md hover:shadow-lg active:scale-95"
                aria-label="Make payment"
              >
                <CreditCard className="w-4 h-4 inline mr-2" />
                Payment
              </button>
            )}
            
            {onCheckIn && reservation.status === 'confirmed' && (
              <button 
                onClick={onCheckIn}
                className="flex-1 min-h-[48px] py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all duration-200 touch-manipulation shadow-md hover:shadow-lg active:scale-95"
                aria-label="Check-in guest"
              >
                Check-in
              </button>
            )}
            
            {onCheckOut && reservation.status === 'confirmed' && (
              <button 
                onClick={onCheckOut}
                className="flex-1 min-h-[48px] py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all duration-200 touch-manipulation shadow-md hover:shadow-lg active:scale-95"
                aria-label="Check-out guest"
              >
                Check-out
              </button>
            )}
            
            {onEdit && role === 'admin' && (
              <button 
                onClick={onEdit}
                className="flex-1 min-h-[48px] py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-all duration-200 touch-manipulation shadow-md hover:shadow-lg active:scale-95"
                aria-label="Edit reservation"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 