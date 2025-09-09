import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, QrCode, Calculator, CheckCircle, Percent, DollarSign } from 'lucide-react'

interface SpecialCharge {
  id: string // Unique React key for each charge instance
  masterId: string // UUID from special_charges_master table
  name: string
  amount: number // Rate per unit
  quantity?: number // Number of instances
  description?: string
}

interface RoomAllocation {
  room_id: string
  room_number: string
  room_type: string
  capacity: number
  tariff: number
  guest_count: number
}

interface PaymentConfirmationFormProps {
  roomAllocations: RoomAllocation[]
  specialCharges: SpecialCharge[]
  discountType: 'percentage' | 'amount' | 'none'
  discountValue: number
  checkInDate: string
  checkOutDate: string
  onSpecialChargesChange: (charges: SpecialCharge[]) => void
  onDiscountTypeChange: (type: 'percentage' | 'amount' | 'none') => void
  onDiscountValueChange: (value: number) => void
  onConfirm: () => void
  onBack: () => void
  isSubmitting?: boolean
}

const DEFAULT_SPECIAL_CHARGES = [
  { id: 'kitchen', name: 'Kitchen', defaultAmount: 2000, description: 'Per day' },
  { id: 'campfire', name: 'Campfire', defaultAmount: 300, description: 'Per day' },
  { id: 'conference', name: 'Conference Hall', defaultAmount: 5000, description: 'Per day' },
  { id: 'extra_person', name: 'Extra Person', defaultAmount: 300, description: 'Per person per day' }
]

interface SpecialChargeMaster {
  id: string
  charge_name: string
  default_rate: number
  rate_type: 'per_day' | 'per_person' | 'fixed'
  description: string
  is_active: boolean
}

export default function PaymentConfirmationForm({
  roomAllocations,
  specialCharges,
  discountType,
  discountValue,
  checkInDate,
  checkOutDate,
  onSpecialChargesChange,
  onDiscountTypeChange,
  onDiscountValueChange,
  onConfirm,
  onBack,
  isSubmitting = false
}: PaymentConfirmationFormProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [masterCharges, setMasterCharges] = useState<SpecialChargeMaster[]>([])
  const [isCalculatingExtraPersons, setIsCalculatingExtraPersons] = useState(false)
  const [masterChargesLoading, setMasterChargesLoading] = useState(true)
  const lastExtraPersonCalculation = useRef<{ count: number, days: number, amount: number } | null>(null)

  // Calculate total extra persons needed
  const calculateExtraPersons = useCallback(() => {
    return roomAllocations.reduce((total, room) => {
      const extraPersons = Math.max(0, room.guest_count - room.capacity)
      return total + extraPersons
    }, 0)
  }, [roomAllocations])

  // Calculate number of days for charges
  const getNumberOfDays = useCallback(() => {
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  }, [checkInDate, checkOutDate])

  // Load master charges from database
  useEffect(() => {
    const loadMasterCharges = async () => {
      setMasterChargesLoading(true)
      try {
        const response = await fetch('/api/special-charges')
        if (response.ok) {
          const data = await response.json()
          console.log('API response:', data)
          // The API returns { specialCharges: [...] }
          if (data.specialCharges && Array.isArray(data.specialCharges)) {
            setMasterCharges(data.specialCharges)
          } else {
            console.error('Expected specialCharges array in response:', data)
            setMasterCharges([])
          }
        } else {
          console.error('API request failed:', response.status, response.statusText)
          setMasterCharges([])
        }
      } catch (error) {
        console.error('Error loading master charges:', error)
        setMasterCharges([])
      } finally {
        setMasterChargesLoading(false)
      }
    }
    loadMasterCharges()
  }, [])

  // Auto-add or update Extra Person charges when dependencies change
  useEffect(() => {
    const processExtraPersonCalculation = async () => {
      // Wait for master charges to load before processing
      if (masterChargesLoading || masterCharges.length === 0) {
        console.log('Extra Person Logic - Waiting for master charges to load...')
        return
      }

      // Set calculating state
      setIsCalculatingExtraPersons(true)

      try {
        const extraPersonsCount = calculateExtraPersons()
        const numberOfDays = getNumberOfDays()

        console.log('Extra Person Logic - Room allocations:', roomAllocations)
        console.log('Extra Person Logic - Extra persons count:', extraPersonsCount)
        console.log('Extra Person Logic - Number of days:', numberOfDays)
        console.log('Extra Person Logic - Master charges loaded:', masterCharges.length)

        // Check if calculation has changed since last update to prevent infinite loops
        const lastCalc = lastExtraPersonCalculation.current
        if (lastCalc &&
          lastCalc.count === extraPersonsCount &&
          lastCalc.days === numberOfDays) {
          console.log('Extra Person Logic - No change needed, skipping update')
          return // No change needed
        }

        // Add a small delay to show the loading state
        await new Promise(resolve => setTimeout(resolve, 500))

        // Update the ref to prevent unnecessary recalculations
        lastExtraPersonCalculation.current = {
          count: extraPersonsCount,
          days: numberOfDays,
          amount: extraPersonsCount * 300 * numberOfDays
        }

        // Find the Extra Person charge in master charges
        const extraPersonMaster = masterCharges.find(charge => charge.charge_name === 'Extra Person')
        
        // Get current charges excluding extra person charges
        const otherCharges = specialCharges.filter(charge => !charge.name.startsWith('Extra Person'))

        // If there are extra persons, add disabled Extra Person charge to Special Charges for display
        if (extraPersonsCount > 0 && extraPersonMaster) {
          const extraPersonCharge: SpecialCharge = {
            id: 'extra_person_auto', // Fixed ID for auto-generated extra person charge
            masterId: extraPersonMaster.id, // Use actual master ID from database
            name: 'Extra Person',
            amount: 300, // Rate per person per night
            quantity: extraPersonsCount * numberOfDays, // Total person-nights
            description: `${extraPersonsCount} extra guest${extraPersonsCount > 1 ? 's' : ''} × ${numberOfDays} night${numberOfDays > 1 ? 's' : ''} (Auto-generated)`
          }

          // Check if Extra Person charge already exists
          const hasExtraPersonCharge = specialCharges.some(charge => charge.id === 'extra_person_auto')
          
          if (!hasExtraPersonCharge) {
            console.log('Extra Person Logic - Adding disabled Extra Person charge to Special Charges for display:', extraPersonCharge)
            onSpecialChargesChange([...otherCharges, extraPersonCharge])
          } else {
            // Update existing Extra Person charge
            console.log('Extra Person Logic - Updating existing Extra Person charge:', extraPersonCharge)
            const updatedCharges = specialCharges.map(charge => 
              charge.id === 'extra_person_auto' ? extraPersonCharge : charge
            )
            onSpecialChargesChange(updatedCharges)
          }
        } else if (extraPersonsCount > 0 && !extraPersonMaster) {
          // If there are extra persons but no master charge found, warn and don't create auto charge
          console.warn('Extra Person charge not found in master charges. Cannot auto-generate Extra Person charges. Please ensure the Extra Person charge exists in special_charges_master table.')
          // Remove existing auto charges if they exist
          if (specialCharges.some(charge => charge.id === 'extra_person_auto')) {
            onSpecialChargesChange(otherCharges)
          }
        } else {
          // Remove Extra Person charges when there are no extra persons
          if (specialCharges.some(charge => charge.id === 'extra_person_auto')) {
            console.log('Removing Extra Person charges since there are no extra guests')
            onSpecialChargesChange(otherCharges)
          }
        }
      } catch (error) {
        console.error('Error in extra person calculation:', error)
      } finally {
        setIsCalculatingExtraPersons(false)
      }
    }

    processExtraPersonCalculation()
    // Intentionally not including specialCharges and onSpecialChargesChange in deps to avoid infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomAllocations, checkInDate, checkOutDate, masterCharges, masterChargesLoading, calculateExtraPersons, getNumberOfDays])

  const calculateRoomTariff = () => {
    // Calculate number of days
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const numberOfDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

    // Calculate total tariff including extra guest charges (tariff per night * number of days)
    return roomAllocations.reduce((total, room) => {
      const extraGuests = Math.max(0, room.guest_count - room.capacity);
      // const extraGuestCharge = extraGuests * 300; // ₹300 per extra guest per night
      // const totalRoomRatePerNight = room.tariff + extraGuestCharge;
      const totalRoomRatePerNight = room.tariff;
      return total + (totalRoomRatePerNight * numberOfDays);
    }, 0)
  }

  const calculateSpecialChargesTotal = () => {
    return specialCharges
      .reduce((total, charge) => total + (charge.amount * (charge.quantity || 1)), 0)
  }

  const calculateSubtotal = () => {
    return calculateRoomTariff() + calculateSpecialChargesTotal()
  }

  const calculateDiscount = () => {
    if (discountType === 'percentage') {
      return (calculateSubtotal() * discountValue) / 100
    } else if (discountType === 'amount') {
      return discountValue
    }
    return 0
  }

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount()
  }

  // Helper function to check if any room has extra guests
  const hasAnyExtraGuests = () => {
    return roomAllocations.some(room => room.guest_count > room.capacity)
  }

  // Helper function to check if a charge is auto-generated (disabled)
  const isAutoGeneratedCharge = (chargeId: string) => {
    return chargeId === 'extra_person_auto'
  }

  // Calculate total room rate per night including extra guest charges
  const calculateTotalRoomRatePerNight = () => {
    return roomAllocations.reduce((total, room) => {
      const extraGuests = Math.max(0, room.guest_count - room.capacity);
      const extraGuestCharge = extraGuests * 300; // ₹300 per extra guest per night
      return total + room.tariff + extraGuestCharge;
    }, 0);
  }

  const addSpecialCharge = () => {
    const newCharge: SpecialCharge = {
      id: Date.now().toString(),
      masterId: '', // Will be set when user selects a charge type or creates custom
      name: '',
      amount: 0,
      quantity: 1,
      description: ''
    }
    onSpecialChargesChange([...specialCharges, newCharge])
  }

  const removeSpecialCharge = (id: string) => {
    // Prevent removal of auto-generated Extra Person charges
    if (id === 'extra_person_auto') {
      return
    }
    onSpecialChargesChange(specialCharges.filter(charge => charge.id !== id))
  }

  const updateSpecialCharge = (id: string, field: keyof SpecialCharge, value: string | number) => {
    // Prevent updates to auto-generated Extra Person charges
    if (id === 'extra_person_auto') {
      return
    }
    onSpecialChargesChange(
      specialCharges.map(charge =>
        charge.id === id ? { ...charge, [field]: value } : charge
      )
    )
  }

  const addDefaultCharge = (chargeType: string) => {
    const defaultCharge = DEFAULT_SPECIAL_CHARGES.find(c => c.id === chargeType)
    const masterCharge = Array.isArray(masterCharges)
      ? masterCharges.find(c => c.charge_name === defaultCharge?.name)
      : null

    if (defaultCharge && masterCharge) {
      // Check if this charge type already exists
      const existingChargeIndex = specialCharges.findIndex(charge => charge.masterId === masterCharge.id)

      if (existingChargeIndex !== -1) {
        // Increment quantity of existing charge
        const updatedCharges = [...specialCharges]
        const existingCharge = updatedCharges[existingChargeIndex]
        existingCharge.quantity = (existingCharge.quantity || 1) + 1
        onSpecialChargesChange(updatedCharges)
      } else {
        // Add new charge
        const newCharge: SpecialCharge = {
          id: `${masterCharge.id}_${Date.now()}`, // Unique React key
          masterId: masterCharge.id, // UUID from master table for database operations
          name: defaultCharge.name,
          amount: masterCharge.default_rate, // Rate per unit
          quantity: 1,
          description: masterCharge.description || defaultCharge.description
        }
        onSpecialChargesChange([...specialCharges, newCharge])
      }
    } else {
      console.warn(`Cannot add charge ${defaultCharge?.name}: Master charge not found in database. Please run database migration.`)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!selectedPaymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleConfirm = () => {
    if (validateForm()) {
      onConfirm()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Room Tariff Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-900 rounded-lg">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Room Tariff Summary</h2>
        </div>

        <div className="space-y-4">
          {roomAllocations.map((room, index) => {
            const extraGuests = Math.max(0, room.guest_count - room.capacity);
            const hasExtraGuests = extraGuests > 0;
            const extraGuestCharge = extraGuests * 300; // ₹300 per extra guest per night
            const totalRoomRate = room.tariff + extraGuestCharge;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900">{room.room_number} - {room.room_type}</div>
                  <div className="text-sm text-gray-600">{room.guest_count} guests</div>
                </div>
                <div className="text-right">
                  {hasExtraGuests ? (
                    <div className="font-bold text-gray-900">
                      ₹{room.tariff}/night
                    </div>
                  ) : (
                    <div className="font-bold text-gray-900">₹{room.tariff}/night</div>
                  )}
                  <div className="text-sm text-gray-600">Capacity: {room.capacity}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total Room Tariff</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">₹{calculateRoomTariff()}</span>
              <div className="text-sm text-gray-500">
                {(() => {
                  const checkIn = new Date(checkInDate)
                  const checkOut = new Date(checkOutDate)
                  const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
                  return `${days} night${days !== 1 ? 's' : ''}`
                })()}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Special Charges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-900 rounded-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Special Charges</h2>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addSpecialCharge}
            className="w-full sm:w-auto px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-center"
          >
            Add Custom Charge
          </motion.button>
        </div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-6">
          {DEFAULT_SPECIAL_CHARGES.map(charge => (
            <motion.button
              key={charge.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addDefaultCharge(charge.id)}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm text-center leading-tight"
            >
              <span className="block font-medium">{charge.name}</span>
              <span className="block text-xs text-gray-600">₹{charge.defaultAmount}</span>
            </motion.button>
          ))}
        </div>

        {/* Special Charges List */}
        <div className="space-y-4">
          {/* Loading indicator for extra person calculation */}
          {(masterChargesLoading || isCalculatingExtraPersons) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 border border-gray-200 rounded-lg bg-blue-50"
            >
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium text-blue-700">
                  {masterChargesLoading ? 'Loading special charges...' : 'Calculating extra person charges...'}
                </span>
              </div>
            </motion.div>
          )}
          
          {specialCharges.map((charge, index) => {
            const isDisabled = isAutoGeneratedCharge(charge.id)
            return (
              <motion.div
                key={charge.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 border rounded-lg ${isDisabled 
                  ? 'border-gray-200 bg-gray-50' 
                  : 'border-gray-200 bg-white'
                }`}
              >
                {/* Mobile Layout */}
                <div className="block sm:hidden space-y-3">
                  <div>
                    <span className={`font-medium ${isDisabled ? 'text-blue-800' : 'text-gray-900'}`}>
                      {charge.name || "Charge name"}
                    </span>
                    {isDisabled && (
                      <div className="text-xs text-blue-600 mt-1">
                        {charge.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Rate</label>
                      <input
                        type="number"
                        value={charge.amount}
                        onChange={(e) => updateSpecialCharge(charge.id, 'amount', parseFloat(e.target.value) || 0)}
                        disabled={isDisabled}
                        className={`w-full px-3 py-2 border rounded-lg text-sm ${
                          isDisabled 
                            ? 'border-gray-200 bg-gray-100 text-gray-800 cursor-not-allowed' 
                            : 'border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                        }`}
                        placeholder="Rate"
                      />
                    </div>
                    <div className="w-20">
                      <label className="block text-xs text-gray-600 mb-1">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={charge.quantity || 1}
                        onChange={(e) => updateSpecialCharge(charge.id, 'quantity', parseInt(e.target.value) || 1)}
                        disabled={isDisabled}
                        className={`w-full px-3 py-2 border rounded-lg text-sm ${
                          isDisabled 
                            ? 'border-gray-200 bg-gray-100 text-gray-800 cursor-not-allowed' 
                            : 'border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                        }`}
                        placeholder="Qty"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className={`font-semibold ${isDisabled ? 'text-blue-800' : 'text-gray-900'}`}>
                      Total: ₹{((charge.amount || 0) * (charge.quantity || 1)).toLocaleString()}
                      {isDisabled && <span className="text-xs text-blue-600 block">(Auto-generated)</span>}
                    </div>
                    {!isDisabled && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeSpecialCharge(charge.id)}
                        className="text-red-600 hover:text-red-800 transition-colors text-sm"
                      >
                        Remove
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex sm:items-center sm:gap-4">
                  <div className="flex-1">
                    <span className={`font-medium ${isDisabled ? 'text-blue-800' : 'text-gray-900'}`}>
                      {charge.name || "Charge name"}
                    </span>
                    {isDisabled && (
                      <div className="text-xs text-blue-600 mt-1">
                        {charge.description}
                      </div>
                    )}
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      value={charge.amount}
                      onChange={(e) => updateSpecialCharge(charge.id, 'amount', parseFloat(e.target.value) || 0)}
                      disabled={isDisabled}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDisabled 
                          ? 'border-gray-200 bg-gray-100 text-gray-800 cursor-not-allowed' 
                          : 'border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                      }`}
                      placeholder="Rate"
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      value={charge.quantity || 1}
                      onChange={(e) => updateSpecialCharge(charge.id, 'quantity', parseInt(e.target.value) || 1)}
                      disabled={isDisabled}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDisabled 
                          ? 'border-gray-200 bg-gray-100 text-gray-800 cursor-not-allowed' 
                          : 'border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                      }`}
                      placeholder="Qty"
                    />
                  </div>
                  <div className="w-24 text-right">
                    <div className={`font-semibold ${isDisabled ? 'text-blue-800' : 'text-gray-900'}`}>
                      ₹{((charge.amount || 0) * (charge.quantity || 1)).toLocaleString()}
                    </div>
                    {isDisabled && (
                      <div className="text-xs text-blue-600 mt-1">(Auto-generated)</div>
                    )}
                  </div>
                  {!isDisabled && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeSpecialCharge(charge.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      Remove
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {specialCharges.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Total Special Charges</span>
              <span className="font-bold text-gray-900">₹{calculateSpecialChargesTotal()}</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Discount Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-900 rounded-lg">
            <Percent className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Discount</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
            <select
              value={discountType}
              onChange={(e) => onDiscountTypeChange(e.target.value as 'percentage' | 'amount' | 'none')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="none">No Discount</option>
              <option value="percentage">Percentage (%)</option>
              <option value="amount">Fixed Amount (₹)</option>
            </select>
          </div>

          {(discountType === 'percentage' || discountType === 'amount') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => onDiscountValueChange(parseFloat(e.target.value) || 0)}
                min="0"
                max={discountType === 'percentage' ? 100 : undefined}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder={discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Payment Method */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-900 rounded-lg">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedPaymentMethod('jubair_qr')}
            className={`p-6 border-2 rounded-lg transition-colors ${selectedPaymentMethod === 'jubair_qr'
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="flex items-center gap-3">
              <QrCode className="w-6 h-6 text-gray-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Jubair QR Code</div>
                <div className="text-sm text-gray-600">Scan to pay via Jubair</div>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedPaymentMethod('basha_qr')}
            className={`p-6 border-2 rounded-lg transition-colors ${selectedPaymentMethod === 'basha_qr'
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="flex items-center gap-3">
              <QrCode className="w-6 h-6 text-gray-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Basha QR Code</div>
                <div className="text-sm text-gray-600">Scan to pay via Basha</div>
              </div>
            </div>
          </motion.button>
        </div>

        {errors.paymentMethod && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 text-sm mt-2"
          >
            {errors.paymentMethod}
          </motion.p>
        )}
      </motion.div>

      {/* Final Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-900 rounded-lg">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Final Summary</h2>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Room Tariff</span>
            <span className="font-medium">₹{calculateRoomTariff()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Special Charges</span>
            <span className="font-medium">₹{calculateSpecialChargesTotal()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">₹{calculateSubtotal()}</span>
          </div>
          {discountType !== 'none' && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span className="font-medium">-₹{calculateDiscount()}</span>
            </div>
          )}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Total Amount</span>
              <span className="text-2xl font-bold text-gray-900">₹{calculateTotal()}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex justify-between"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Back: Room Allocation
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleConfirm}
          disabled={isSubmitting || masterChargesLoading || isCalculatingExtraPersons}
          className={`px-8 py-3 rounded-lg transition-colors font-medium ${(isSubmitting || masterChargesLoading || isCalculatingExtraPersons)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating Reservation...
            </div>
          ) : masterChargesLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Loading Charges...
            </div>
          ) : isCalculatingExtraPersons ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Calculating Extras...
            </div>
          ) : (
            'Confirm Reservation'
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  )
} 