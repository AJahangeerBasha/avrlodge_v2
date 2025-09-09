import { useState, useCallback, useEffect, useRef } from 'react'
import { PaymentService, SpecialCharge, SpecialChargeMaster, RoomAllocation, PaymentCalculation } from '@/services/payment.service'

const DEFAULT_SPECIAL_CHARGES = [
  { id: 'kitchen', name: 'Kitchen', defaultAmount: 2000, description: 'Per day' },
  { id: 'campfire', name: 'Campfire', defaultAmount: 300, description: 'Per day' },
  { id: 'conference', name: 'Conference Hall', defaultAmount: 5000, description: 'Per day' },
  { id: 'extra_person', name: 'Extra Person', defaultAmount: 300, description: 'Per person per day' }
]

export function usePaymentCalculation(
  roomAllocations: RoomAllocation[],
  checkInDate: string,
  checkOutDate: string,
  initialSpecialCharges: SpecialCharge[] = [],
  initialDiscountType: 'percentage' | 'amount' | 'none' = 'none',
  initialDiscountValue: number = 0
) {
  const [specialCharges, setSpecialCharges] = useState<SpecialCharge[]>(initialSpecialCharges)
  const [discountType, setDiscountType] = useState<'percentage' | 'amount' | 'none'>(initialDiscountType)
  const [discountValue, setDiscountValue] = useState(initialDiscountValue)
  const [masterCharges, setMasterCharges] = useState<SpecialChargeMaster[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const lastExtraPersonCalculation = useRef<{count: number, days: number, amount: number} | null>(null)

  // Load master charges on mount
  useEffect(() => {
    PaymentService.loadSpecialChargesMaster().then(setMasterCharges)
  }, [])

  // Auto-manage extra person charges
  useEffect(() => {
    const extraPersonsCount = PaymentService.calculateExtraPersons(roomAllocations)
    const numberOfDays = PaymentService.calculateNumberOfDays(checkInDate, checkOutDate)
    
    // Check if calculation has changed to prevent infinite loops
    const lastCalc = lastExtraPersonCalculation.current
    if (lastCalc && 
        lastCalc.count === extraPersonsCount && 
        lastCalc.days === numberOfDays) {
      return
    }
    
    // Update the ref
    lastExtraPersonCalculation.current = {
      count: extraPersonsCount,
      days: numberOfDays,
      amount: extraPersonsCount * 300 * numberOfDays
    }
    
    // Find Extra Person master charge
    const extraPersonMaster = masterCharges.find(charge => charge.charge_name === 'Extra Person')
    
    if (!extraPersonMaster) {
      console.warn('Extra Person charge not found in master charges.')
      return
    }
    
    // Get current charges excluding extra person charges
    const otherCharges = specialCharges.filter(charge => !charge.name.startsWith('Extra Person'))
    
    if (extraPersonsCount > 0) {
      const extraPersonCharge = PaymentService.generateExtraPersonCharge(
        extraPersonsCount, 
        numberOfDays, 
        extraPersonMaster
      )
      
      if (extraPersonCharge) {
        setSpecialCharges([...otherCharges, extraPersonCharge])
      }
    } else {
      if (specialCharges.some(charge => charge.name.startsWith('Extra Person'))) {
        setSpecialCharges(otherCharges)
      }
    }
  }, [roomAllocations, checkInDate, checkOutDate, masterCharges, specialCharges])

  const calculation = useCallback((): PaymentCalculation => {
    return PaymentService.calculatePaymentSummary(
      roomAllocations,
      specialCharges,
      checkInDate,
      checkOutDate,
      discountType,
      discountValue
    )
  }, [roomAllocations, specialCharges, checkInDate, checkOutDate, discountType, discountValue])

  const addCustomCharge = () => {
    const newCharge: SpecialCharge = {
      id: Date.now().toString(),
      masterId: '',
      name: '',
      amount: 0,
      quantity: 1,
      description: ''
    }
    setSpecialCharges([...specialCharges, newCharge])
  }

  const addDefaultCharge = (chargeType: string) => {
    const defaultCharge = DEFAULT_SPECIAL_CHARGES.find(c => c.id === chargeType)
    const masterCharge = masterCharges.find(c => c.charge_name === defaultCharge?.name)
    
    if (defaultCharge && masterCharge) {
      const existingChargeIndex = specialCharges.findIndex(charge => charge.masterId === masterCharge.id)
      
      if (existingChargeIndex !== -1) {
        // Increment quantity
        const updatedCharges = [...specialCharges]
        const existingCharge = updatedCharges[existingChargeIndex]
        existingCharge.quantity = (existingCharge.quantity || 1) + 1
        setSpecialCharges(updatedCharges)
      } else {
        // Add new charge
        const newCharge: SpecialCharge = {
          id: `${masterCharge.id}_${Date.now()}`,
          masterId: masterCharge.id,
          name: defaultCharge.name,
          amount: masterCharge.default_rate,
          quantity: 1,
          description: masterCharge.description || defaultCharge.description
        }
        setSpecialCharges([...specialCharges, newCharge])
      }
    } else {
      console.warn(`Cannot add charge ${defaultCharge?.name}: Master charge not found`)
    }
  }

  const removeCharge = (id: string) => {
    setSpecialCharges(specialCharges.filter(charge => charge.id !== id))
  }

  const updateCharge = (id: string, field: keyof SpecialCharge, value: string | number) => {
    setSpecialCharges(
      specialCharges.map(charge =>
        charge.id === id ? { ...charge, [field]: value } : charge
      )
    )
  }

  const validateForm = (): boolean => {
    const newErrors = PaymentService.validatePayment(selectedPaymentMethod)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return {
    specialCharges,
    discountType,
    discountValue,
    selectedPaymentMethod,
    errors,
    calculation: calculation(),
    masterCharges,
    setDiscountType,
    setDiscountValue,
    setSelectedPaymentMethod,
    addCustomCharge,
    addDefaultCharge,
    removeCharge,
    updateCharge,
    validateForm
  }
}