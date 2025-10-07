import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { cancelReservation } from '@/lib/reservations'

interface Booking {
  id: string
  reference_number: string
  guest_name: string
}

interface CancelReservationModalProps {
  booking: Booking
  isOpen: boolean
  onClose: () => void
  onCancelComplete: () => void
}

export function CancelReservationModal({
  booking,
  isOpen,
  onClose,
  onCancelComplete
}: CancelReservationModalProps) {
  const [cancellationConfirmation, setCancellationConfirmation] = useState('')
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()
  const { currentUser } = useAuth()

  // Get last 3 digits of reference number for confirmation
  const getLastThreeDigits = (): string => {
    return booking.reference_number.slice(-3)
  }

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

      await cancelReservation(booking.id, currentUser.uid, 'Cancelled via booking management interface')

      toast({
        title: "Reservation Cancelled",
        description: `Reservation ${booking.reference_number} has been cancelled successfully.`,
      })

      setCancellationConfirmation('')
      onCancelComplete()
      onClose()
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
  }

  const handleClose = () => {
    setCancellationConfirmation('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
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
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Cancel Reservation
                  </h2>
                  <p className="text-sm text-gray-500">
                    {booking.guest_name} • {booking.reference_number}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Warning */}
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

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 flex-shrink-0">
              <Button
                onClick={handleClose}
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
  )
}

export default CancelReservationModal
