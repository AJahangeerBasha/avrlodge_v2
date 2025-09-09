import { CreateReservationSpecialChargeData } from '../types/reservationSpecialCharges'

// Validation error types
export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Validate quantity
export const validateQuantity = (quantity: number): ValidationError | null => {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return {
      field: 'quantity',
      message: 'Quantity must be a positive integer',
      code: 'INVALID_QUANTITY'
    }
  }
  
  if (quantity > 1000) { // Reasonable upper limit
    return {
      field: 'quantity',
      message: 'Quantity cannot exceed 1000',
      code: 'QUANTITY_TOO_HIGH'
    }
  }
  
  return null
}

// Validate custom rate
export const validateCustomRate = (rate: number | undefined): ValidationError | null => {
  if (rate === undefined || rate === null) {
    return null // Custom rate is optional
  }
  
  if (rate < 0) {
    return {
      field: 'customRate',
      message: 'Custom rate cannot be negative',
      code: 'NEGATIVE_CUSTOM_RATE'
    }
  }
  
  if (rate > 1000000) { // Reasonable upper limit
    return {
      field: 'customRate',
      message: 'Custom rate exceeds maximum allowed amount',
      code: 'CUSTOM_RATE_TOO_HIGH'
    }
  }
  
  return null
}

// Validate total amount
export const validateTotalAmount = (totalAmount: number): ValidationError | null => {
  if (totalAmount < 0) {
    return {
      field: 'totalAmount',
      message: 'Total amount cannot be negative',
      code: 'NEGATIVE_TOTAL_AMOUNT'
    }
  }
  
  if (totalAmount === 0) {
    return {
      field: 'totalAmount',
      message: 'Total amount must be greater than 0',
      code: 'ZERO_TOTAL_AMOUNT'
    }
  }
  
  if (totalAmount > 10000000) { // Reasonable upper limit
    return {
      field: 'totalAmount',
      message: 'Total amount exceeds maximum allowed amount',
      code: 'TOTAL_AMOUNT_TOO_HIGH'
    }
  }
  
  return null
}

// Validate required string fields
export const validateRequiredString = (value: string | undefined, fieldName: string): ValidationError | null => {
  if (!value || value.trim().length === 0) {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
      code: 'REQUIRED_FIELD'
    }
  }
  
  return null
}

// Validate custom description length
export const validateCustomDescription = (description: string | undefined): ValidationError | null => {
  if (!description) {
    return null // Custom description is optional
  }
  
  if (description.length > 500) {
    return {
      field: 'customDescription',
      message: 'Custom description cannot exceed 500 characters',
      code: 'DESCRIPTION_TOO_LONG'
    }
  }
  
  return null
}

// Validate amount calculation consistency
export const validateAmountCalculation = (
  rate: number,
  quantity: number,
  totalAmount: number,
  tolerance: number = 0.01
): ValidationError | null => {
  const expectedTotal = rate * quantity
  const difference = Math.abs(expectedTotal - totalAmount)
  
  if (difference > tolerance) {
    return {
      field: 'totalAmount',
      message: `Total amount (${totalAmount}) does not match rate (${rate}) × quantity (${quantity}) = ${expectedTotal}`,
      code: 'AMOUNT_CALCULATION_MISMATCH'
    }
  }
  
  return null
}

// Comprehensive reservation special charge validation
export const validateReservationSpecialCharge = (data: CreateReservationSpecialChargeData): ValidationResult => {
  const errors: ValidationError[] = []
  
  // Validate required string fields
  const reservationIdError = validateRequiredString(data.reservationId, 'reservationId')
  if (reservationIdError) errors.push(reservationIdError)
  
  const specialChargeIdError = validateRequiredString(data.specialChargeId, 'specialChargeId')
  if (specialChargeIdError) errors.push(specialChargeIdError)
  
  // Validate quantity
  const quantityError = validateQuantity(data.quantity || 1)
  if (quantityError) errors.push(quantityError)
  
  // Validate custom rate if provided
  const customRateError = validateCustomRate(data.customRate)
  if (customRateError) errors.push(customRateError)
  
  // Validate total amount
  const totalAmountError = validateTotalAmount(data.totalAmount)
  if (totalAmountError) errors.push(totalAmountError)
  
  // Validate custom description if provided
  const customDescriptionError = validateCustomDescription(data.customDescription)
  if (customDescriptionError) errors.push(customDescriptionError)
  
  // If custom rate is provided, validate calculation
  if (data.customRate !== undefined && data.customRate !== null) {
    const calculationError = validateAmountCalculation(
      data.customRate,
      data.quantity || 1,
      data.totalAmount
    )
    if (calculationError) errors.push(calculationError)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate bulk special charges data
export const validateBulkSpecialCharges = (
  charges: CreateReservationSpecialChargeData[]
): ValidationResult => {
  const errors: ValidationError[] = []
  
  if (!charges || charges.length === 0) {
    errors.push({
      field: 'charges',
      message: 'At least one charge must be provided',
      code: 'EMPTY_CHARGES_ARRAY'
    })
    return { isValid: false, errors }
  }
  
  if (charges.length > 100) { // Reasonable limit for bulk operations
    errors.push({
      field: 'charges',
      message: 'Cannot process more than 100 charges at once',
      code: 'TOO_MANY_CHARGES'
    })
  }
  
  // Validate each charge
  charges.forEach((charge, index) => {
    const validation = validateReservationSpecialCharge(charge)
    if (!validation.isValid) {
      validation.errors.forEach(error => {
        errors.push({
          ...error,
          field: `charges[${index}].${error.field}`,
          message: `Charge ${index + 1}: ${error.message}`
        })
      })
    }
  })
  
  // Check for duplicate special charges in the same reservation
  const reservationCharges = new Map<string, Set<string>>()
  
  charges.forEach((charge, index) => {
    if (!charge.reservationId || !charge.specialChargeId) return
    
    if (!reservationCharges.has(charge.reservationId)) {
      reservationCharges.set(charge.reservationId, new Set())
    }
    
    const chargeIds = reservationCharges.get(charge.reservationId)!
    
    if (chargeIds.has(charge.specialChargeId)) {
      errors.push({
        field: `charges[${index}].specialChargeId`,
        message: `Duplicate special charge ${charge.specialChargeId} for reservation ${charge.reservationId}`,
        code: 'DUPLICATE_SPECIAL_CHARGE'
      })
    } else {
      chargeIds.add(charge.specialChargeId)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate special charge rate consistency with master data
export const validateRateConsistency = (
  defaultRate: number,
  rateType: string,
  customRate?: number,
  quantity?: number
): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = []
  
  // Check if custom rate deviates significantly from default rate
  if (customRate !== undefined && customRate !== null) {
    const deviation = Math.abs(customRate - defaultRate) / defaultRate
    
    if (deviation > 0.5) { // More than 50% difference
      warnings.push(
        `Custom rate (${customRate}) differs significantly from default rate (${defaultRate})`
      )
    }
    
    // Check rate type specific validations
    if (rateType === 'per_person' && quantity && quantity > 50) {
      warnings.push(
        `High quantity (${quantity}) for per-person charge - please verify`
      )
    }
    
    if (rateType === 'per_day' && quantity && quantity > 30) {
      warnings.push(
        `High quantity (${quantity}) for per-day charge - please verify`
      )
    }
  }
  
  return {
    isValid: true, // Warnings don't invalidate, just inform
    warnings
  }
}

// Calculate expected total amount
export const calculateExpectedTotal = (
  rate: number,
  quantity: number
): number => {
  return Math.round((rate * quantity) * 100) / 100 // Round to 2 decimal places
}

// Validate reservation special charge against master data
export const validateAgainstMasterData = (
  chargeData: CreateReservationSpecialChargeData,
  masterChargeData: {
    defaultRate: number
    rateType: string
    chargeName: string
  }
): ValidationResult => {
  const errors: ValidationError[] = []
  
  // Use custom rate if provided, otherwise use default rate
  const effectiveRate = chargeData.customRate ?? masterChargeData.defaultRate
  const quantity = chargeData.quantity || 1
  
  // Validate amount calculation against effective rate
  const calculationError = validateAmountCalculation(
    effectiveRate,
    quantity,
    chargeData.totalAmount
  )
  if (calculationError) errors.push(calculationError)
  
  return {
    isValid: errors.length === 0,
    errors
  }
}