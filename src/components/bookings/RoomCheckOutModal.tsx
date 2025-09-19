import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, X, User, Home, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { checkOutReservationRoom } from '@/lib/reservationRooms'

interface Booking {
  id: string
  reference_number: string
  guest_name: string
  guest_email: string
  guest_phone: string
}

interface Room {
  id?: string
  room_number: string
  room_type: string
  guest_count: number
  room_status?: 'pending' | 'checked_in' | 'checked_out'
  check_in_datetime?: string | null
  check_out_datetime?: string | null
}

interface RoomCheckOutModalProps {
  booking: Booking
  room: Room | null
  isOpen: boolean
  onClose: () => void
  onCheckOutComplete: () => void
}

export function RoomCheckOutModal({
  booking,
  room,
  isOpen,
  onClose,
  onCheckOutComplete
}: RoomCheckOutModalProps) {
  const [checkOutTime, setCheckOutTime] = useState(() => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  })
  const [confirmationRoomNumber, setConfirmationRoomNumber] = useState('')
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()
  const { currentUser } = useAuth()

  // Reset confirmation field when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfirmationRoomNumber('')
    }
  }, [isOpen])

  const handleCheckOut = async () => {
    if (!currentUser || !room?.id) {
      toast({
        title: "Error",
        description: "Unable to check out room. Please try again.",
        variant: "destructive",
      })
      return
    }

    // Validate room number confirmation
    if (confirmationRoomNumber !== room.room_number) {
      toast({
        title: "Confirmation Required",
        description: `Please type "${room.room_number}" to confirm check-out.`,
        variant: "destructive",
      })
      return
    }

    try {
      setProcessing(true)

      // Create check-out datetime
      const today = new Date().toISOString().split('T')[0]
      const checkOutDateTime = new Date(`${today}T${checkOutTime}:00`).toISOString()

      await checkOutReservationRoom(room.id, {
        roomStatus: 'checked_out',
        checkOutDatetime: checkOutDateTime,
        checkedOutBy: currentUser.uid
      })

      toast({
        title: "Check-Out Successful",
        description: `Room ${room.room_number} has been checked out successfully.`,
      })

      onCheckOutComplete()
      onClose()
    } catch (error) {
      console.error('Error checking out room:', error)
      toast({
        title: "Check-Out Failed",
        description: error instanceof Error ? error.message : "Failed to check out room. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  if (!room) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Room Check-Out
                  </h2>
                  <p className="text-sm text-gray-500">
                    {booking.guest_name} • {booking.reference_number}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Room Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Room Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Room:</span>
                    <span className="font-semibold text-gray-900">
                      {room.room_number} ({room.room_type})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Guests:</span>
                    <span className="font-semibold text-gray-900">
                      {room.guest_count}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Check-In:</span>
                    <span className="font-semibold text-gray-900">
                      {room.check_in_datetime ?
                        new Date(room.check_in_datetime).toLocaleString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Check-Out Date:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date().toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Check-Out Time */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Check-Out Time
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
                  />
                </div>
              </div>

              {/* Room Number Confirmation */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Confirm Room Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    value={confirmationRoomNumber}
                    onChange={(e) => setConfirmationRoomNumber(e.target.value)}
                    className={`bg-gray-50 border-gray-200 pr-10 ${
                      confirmationRoomNumber === room.room_number
                        ? 'border-green-300 bg-green-50'
                        : confirmationRoomNumber !== '' && confirmationRoomNumber !== room.room_number
                        ? 'border-red-300 bg-red-50'
                        : ''
                    }`}
                    placeholder={`Type "${room.room_number}" to confirm`}
                  />
                  {confirmationRoomNumber === room.room_number && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
                  )}
                  {confirmationRoomNumber !== '' && confirmationRoomNumber !== room.room_number && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Type the room number "{room.room_number}" to enable check-out
                </p>
              </div>

              {/* Warning */}
              <div className="mb-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Confirm Check-Out
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        This action will mark the room as checked out and available for the next guest.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions - Fixed at bottom */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckOut}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
                  disabled={processing || confirmationRoomNumber !== room.room_number}
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Checking Out...
                    </div>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Check Out Room
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default RoomCheckOutModal