import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Phone, MessageCircle, Plus, X, Users, Info } from 'lucide-react'

interface Guest {
  id: string
  name: string
  phone: string
  whatsapp?: string
  telegram?: string
}

interface GuestDetailsFormProps {
  primaryGuest: Guest
  secondaryGuests: Guest[]
  onPrimaryGuestChange: (guest: Guest) => void
  onSecondaryGuestsChange: (guests: Guest[]) => void
  onNext: () => void
}

export default function GuestDetailsForm({
  primaryGuest,
  secondaryGuests,
  onPrimaryGuestChange,
  onSecondaryGuestsChange,
  onNext
}: GuestDetailsFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!primaryGuest.name.trim()) {
      newErrors.primaryName = 'Primary guest name is required'
    }

    if (!primaryGuest.phone.trim()) {
      newErrors.primaryPhone = 'Primary guest phone is required'
    } else if (!/^[6-9][0-9]{9}$/.test(primaryGuest.phone.replace(/\D/g, ''))) {
      newErrors.primaryPhone = 'Please enter a valid 10-digit number starting with 6-9'
    }

    // Validate secondary guests
    secondaryGuests.forEach((guest, index) => {
      if (guest.name.trim() && !guest.phone.trim()) {
        newErrors[`secondaryPhone${index}`] = 'Phone number is required when name is provided'
      }
      if (guest.phone.trim() && !guest.name.trim()) {
        newErrors[`secondaryName${index}`] = 'Name is required when phone is provided'
      }
      if (guest.phone.trim() && !/^[6-9][0-9]{9}$/.test(guest.phone.replace(/\D/g, ''))) {
        newErrors[`secondaryPhone${index}`] = 'Please enter a valid 10-digit number starting with 6-9'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext()
    }
  }

  const addSecondaryGuest = () => {
    const newGuest: Guest = {
      id: Date.now().toString(),
      name: '',
      phone: '',
      whatsapp: '',
      telegram: ''
    }
    onSecondaryGuestsChange([...secondaryGuests, newGuest])
  }

  const removeSecondaryGuest = (id: string) => {
    onSecondaryGuestsChange(secondaryGuests.filter(guest => guest.id !== id))
  }

  const updateSecondaryGuest = (id: string, field: keyof Guest, value: string) => {
    onSecondaryGuestsChange(
      secondaryGuests.map(guest =>
        guest.id === id ? { ...guest, [field]: value } : guest
      )
    )
  }

  const copyPhoneToWhatsApp = (guestId: string) => {
    const guest = secondaryGuests.find(g => g.id === guestId)
    if (guest && guest.phone.trim()) {
      updateSecondaryGuest(guestId, 'whatsapp', guest.phone)
    }
  }

  const handlePhoneInput = (value: string, guestId?: string, field: 'phone' | 'whatsapp' | 'telegram' = 'phone') => {
    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, '')
    
    // Limit to 10 digits
    const limitedDigits = digitsOnly.slice(0, 10)
    
    // For phone field, ensure it starts with 6-9
    if (field === 'phone' && limitedDigits.length > 0 && !/^[6-9]/.test(limitedDigits)) {
      return // Don't update if it doesn't start with 6-9
    }
    
    if (guestId) {
      updateSecondaryGuest(guestId, field, limitedDigits)
    } else {
      onPrimaryGuestChange({ ...primaryGuest, [field]: limitedDigits })
    }
  }

  const handleWhatsAppCheckbox = (guestId?: string) => {
    if (guestId) {
      const guest = secondaryGuests.find(g => g.id === guestId)
      if (guest && guest.phone.trim()) {
        updateSecondaryGuest(guestId, 'whatsapp', guest.phone)
      }
    } else {
      if (primaryGuest.phone.trim()) {
        onPrimaryGuestChange({ ...primaryGuest, whatsapp: primaryGuest.phone })
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-3"
    >
      {/* Primary Guest Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-3"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1 bg-gray-900 rounded-md">
            <User className="w-3 h-3 text-white" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900">Primary Guest</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Guest Name *
            </label>
            <input
              type="text"
              value={primaryGuest.name}
              onChange={(e) => onPrimaryGuestChange({ ...primaryGuest, name: e.target.value })}
              className={`w-full px-2 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-gray-900 focus:border-transparent transition-colors ${
                errors.primaryName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter guest name"
            />
            {errors.primaryName && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-xs mt-1"
              >
                {errors.primaryName}
              </motion.p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={primaryGuest.phone}
              onChange={(e) => handlePhoneInput(e.target.value)}
              className={`w-full px-2 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-gray-900 focus:border-transparent transition-colors ${
                errors.primaryPhone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="6XXXXXXXXX"
              inputMode="numeric"
            />
            <div className="flex items-center gap-1 mt-0.5">
              <Info className="w-2.5 h-2.5 text-gray-500" />
              <span className="text-xs text-gray-500">10-digit starting with 6-9</span>
            </div>
            {errors.primaryPhone && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-xs mt-1"
              >
                {errors.primaryPhone}
              </motion.p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={primaryGuest.whatsapp || ''}
              onChange={(e) => handlePhoneInput(e.target.value, undefined, 'whatsapp')}
              className={`w-full px-2 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-gray-900 focus:border-transparent transition-colors ${
                primaryGuest.phone === primaryGuest.whatsapp ? 'bg-gray-50' : ''
              }`}
              placeholder="6XXXXXXXXX"
              inputMode="numeric"
              disabled={primaryGuest.phone === primaryGuest.whatsapp}
            />
            <div className="mt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={primaryGuest.phone === primaryGuest.whatsapp}
                  onChange={() => handleWhatsAppCheckbox()}
                  disabled={!primaryGuest.phone.trim()}
                  className="w-3 h-3 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
                <span className="text-xs font-medium text-gray-700">Same as phone</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Telegram (Optional)
            </label>
            <input
              type="tel"
              value={primaryGuest.telegram || ''}
              onChange={(e) => handlePhoneInput(e.target.value, undefined, 'telegram')}
              className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-gray-900 focus:border-transparent transition-colors"
              placeholder="6XXXXXXXXX"
              inputMode="numeric"
            />
          </div>
        </div>
      </motion.div>

      {/* Secondary Guests Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-3"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-gray-900 rounded-md">
              <Users className="w-3 h-3 text-white" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Additional Guests</h2>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addSecondaryGuest}
            className="flex items-center gap-1 px-2 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-all duration-200 shadow-sm touch-manipulation font-medium text-xs"
          >
            <Plus className="w-3 h-3" />
            Add Guest
          </motion.button>
        </div>

        <AnimatePresence>
          {secondaryGuests.map((guest, index) => (
            <motion.div
              key={guest.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border border-gray-200 rounded-md p-2 mb-2"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-gray-900">Guest {index + 1}</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeSecondaryGuest(guest.id)}
                  className="p-0.5 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Guest Name
                  </label>
                  <input
                    type="text"
                    value={guest.name}
                    onChange={(e) => updateSecondaryGuest(guest.id, 'name', e.target.value)}
                    className={`w-full px-2 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-gray-900 focus:border-transparent transition-colors ${
                      errors[`secondaryName${index}`] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter guest name"
                  />
                  {errors[`secondaryName${index}`] && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-xs mt-1"
                    >
                      {errors[`secondaryName${index}`]}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={guest.phone}
                    onChange={(e) => handlePhoneInput(e.target.value, guest.id, 'phone')}
                    className={`w-full px-2 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-gray-900 focus:border-transparent transition-colors ${
                      errors[`secondaryPhone${index}`] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="6XXXXXXXXX"
                    inputMode="numeric"
                  />
                  {errors[`secondaryPhone${index}`] && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-xs mt-1"
                    >
                      {errors[`secondaryPhone${index}`]}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    value={guest.whatsapp || ''}
                    onChange={(e) => handlePhoneInput(e.target.value, guest.id, 'whatsapp')}
                    className={`w-full px-2 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-gray-900 focus:border-transparent transition-colors ${
                      guest.phone === guest.whatsapp ? 'bg-gray-50' : ''
                    }`}
                    placeholder="6XXXXXXXXX"
                    inputMode="numeric"
                    disabled={guest.phone === guest.whatsapp}
                  />
                  <div className="mt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={guest.phone === guest.whatsapp}
                        onChange={() => handleWhatsAppCheckbox(guest.id)}
                        disabled={!guest.phone.trim()}
                        className="w-3 h-3 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                      />
                      <span className="text-xs font-medium text-gray-700">Same as phone</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Telegram (Optional)
                  </label>
                  <input
                    type="tel"
                    value={guest.telegram || ''}
                    onChange={(e) => handlePhoneInput(e.target.value, guest.id, 'telegram')}
                    className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-gray-900 focus:border-transparent transition-colors"
                    placeholder="6XXXXXXXXX"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {secondaryGuests.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4 text-gray-500"
          >
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-xs">No additional guests added yet</p>
            <p className="text-xs">Click "Add Guest" to include more guests</p>
          </motion.div>
        )}
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="flex justify-end"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          className="w-full sm:w-auto px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-all duration-200 shadow-sm touch-manipulation font-medium text-sm"
        >
          Next: Location & Dates
        </motion.button>
      </motion.div>
    </motion.div>
  )
} 