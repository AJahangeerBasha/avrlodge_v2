import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { updateReservation } from '@/lib/reservations'
import { getPrimaryGuestByReservationId, updateGuest } from '@/lib/guests'
import { Guest } from '@/lib/types/guests'
import { validatePhoneNumber, formatPhoneNumber, getPhoneValidationError } from '@/utils/phoneValidation'

interface Booking {
  id: string
  reference_number: string
  guest_name: string
  guest_phone: string
}

interface EditPrimaryGuestModalProps {
  booking: Booking
  isOpen: boolean
  onClose: () => void
  onUpdateComplete: () => void
}

export function EditPrimaryGuestModal({
  booking,
  isOpen,
  onClose,
  onUpdateComplete
}: EditPrimaryGuestModalProps) {
  const [primaryGuest, setPrimaryGuest] = useState<Guest | null>(null)
  const [guestForm, setGuestForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    usePhoneForWhatsapp: true
  })
  const [guestFormErrors, setGuestFormErrors] = useState({
    name: '',
    phone: '',
    whatsapp: ''
  })
  const [loadingGuestUpdate, setLoadingGuestUpdate] = useState(false)
  const { toast } = useToast()
  const { currentUser } = useAuth()

  // Load primary guest data
  const loadPrimaryGuest = useCallback(async () => {
    try {
      const guest = await getPrimaryGuestByReservationId(booking.id)
      setPrimaryGuest(guest)

      // Populate form with guest data
      if (guest) {
        setGuestForm({
          name: guest.name || '',
          phone: guest.phone || '',
          whatsapp: guest.whatsapp || '',
          usePhoneForWhatsapp: !guest.whatsapp || guest.whatsapp === guest.phone
        })
      } else {
        // Fallback to booking data
        setGuestForm({
          name: booking.guest_name || '',
          phone: booking.guest_phone || '',
          whatsapp: '',
          usePhoneForWhatsapp: true
        })
      }
    } catch (error) {
      console.error('Error loading primary guest:', error)
      // Fallback to booking data
      setGuestForm({
        name: booking.guest_name || '',
        phone: booking.guest_phone || '',
        whatsapp: '',
        usePhoneForWhatsapp: true
      })
    }
  }, [booking.id, booking.guest_name, booking.guest_phone])

  // Load guest data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPrimaryGuest()
      setGuestFormErrors({ name: '', phone: '', whatsapp: '' })
    }
  }, [isOpen, loadPrimaryGuest])

  // Handle guest form field changes
  const handleGuestFormChange = (field: string, value: string) => {
    if (field === 'phone' || field === 'whatsapp') {
      value = formatPhoneNumber(value)
    }

    setGuestForm(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (guestFormErrors[field as keyof typeof guestFormErrors]) {
      setGuestFormErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Handle "Same as phone number" checkbox logic for WhatsApp
    if (field === 'usePhoneForWhatsapp') {
      const usePhone = value === 'true'
      setGuestForm(prev => ({
        ...prev,
        usePhoneForWhatsapp: usePhone,
        whatsapp: usePhone ? prev.phone : ''
      }))
    }

    // Auto-sync whatsapp when usePhoneForWhatsapp is checked
    if (field === 'phone' && guestForm.usePhoneForWhatsapp) {
      setGuestForm(prev => ({ ...prev, whatsapp: value }))
    }
  }

  // Validate guest form
  const validateGuestForm = (): boolean => {
    const errors = { name: '', phone: '', whatsapp: '' }
    let isValid = true

    // Validate name
    if (!guestForm.name.trim()) {
      errors.name = 'Name is required'
      isValid = false
    }

    // Validate phone
    const phoneError = getPhoneValidationError(guestForm.phone)
    if (phoneError) {
      errors.phone = phoneError
      isValid = false
    }

    // Validate WhatsApp (only if provided and not same as phone)
    if (guestForm.whatsapp && !guestForm.usePhoneForWhatsapp) {
      const whatsappError = getPhoneValidationError(guestForm.whatsapp)
      if (whatsappError) {
        errors.whatsapp = whatsappError
        isValid = false
      }
    }

    setGuestFormErrors(errors)
    return isValid
  }

  // Handle primary guest update
  const handleUpdatePrimaryGuest = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to update guest details.",
        variant: "destructive",
      })
      return
    }

    if (!validateGuestForm()) {
      return
    }

    try {
      setLoadingGuestUpdate(true)

      const finalWhatsapp = guestForm.usePhoneForWhatsapp ? guestForm.phone : guestForm.whatsapp

      // Update reservation data
      await updateReservation(booking.id, {
        guestName: guestForm.name.trim(),
        guestPhone: guestForm.phone.trim()
      })

      // Update or create guest record
      if (primaryGuest) {
        // Update existing guest
        await updateGuest(primaryGuest.id, {
          name: guestForm.name.trim(),
          phone: guestForm.phone.trim(),
          whatsapp: finalWhatsapp?.trim() || null
        }, currentUser.uid)
      }

      toast({
        title: "Success",
        description: "Primary guest details updated successfully.",
      })

      onUpdateComplete()
      onClose()
    } catch (error) {
      console.error('Error updating primary guest:', error)
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update guest details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingGuestUpdate(false)
    }
  }

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
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Edit Primary Guest
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
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Full Name *
                  </Label>
                  <Input
                    type="text"
                    value={guestForm.name}
                    onChange={(e) => handleGuestFormChange('name', e.target.value)}
                    placeholder="Enter full name"
                    className={`w-full ${
                      guestFormErrors.name ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                  />
                  {guestFormErrors.name && (
                    <p className="text-sm text-red-600 mt-1">{guestFormErrors.name}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Phone Number *
                  </Label>
                  <Input
                    type="tel"
                    value={guestForm.phone}
                    onChange={(e) => handleGuestFormChange('phone', e.target.value)}
                    placeholder="Enter 10-digit phone number starting with 6-9"
                    maxLength={10}
                    className={`w-full ${
                      guestFormErrors.phone ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                  />
                  {guestFormErrors.phone && (
                    <p className="text-sm text-red-600 mt-1">{guestFormErrors.phone}</p>
                  )}
                </div>

                {/* WhatsApp */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    WhatsApp (Optional)
                  </Label>

                  {/* Same as phone number checkbox */}
                  <div className="mb-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={guestForm.usePhoneForWhatsapp}
                        onChange={(e) => handleGuestFormChange('usePhoneForWhatsapp', e.target.checked.toString())}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Same as phone number</span>
                    </label>
                  </div>

                  {!guestForm.usePhoneForWhatsapp && (
                    <Input
                      type="tel"
                      value={guestForm.whatsapp}
                      onChange={(e) => handleGuestFormChange('whatsapp', e.target.value)}
                      placeholder="Enter 10-digit WhatsApp number starting with 6-9"
                      maxLength={10}
                      className={`w-full ${
                        guestFormErrors.whatsapp ? 'border-red-500 focus:border-red-500' : ''
                      }`}
                    />
                  )}

                  {guestFormErrors.whatsapp && (
                    <p className="text-sm text-red-600 mt-1">{guestFormErrors.whatsapp}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 flex-shrink-0">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={loadingGuestUpdate}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePrimaryGuest}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loadingGuestUpdate}
              >
                {loadingGuestUpdate ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </div>
                ) : (
                  'Update'
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default EditPrimaryGuestModal
