import { ReservationStatus, PaymentStatus, GuestType, CreateReservationData } from '../types/reservations'

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

// Validate guest count
export const validateGuestCount = (guestCount: number): ValidationError | null => {
  if (!Number.isInteger(guestCount) || guestCount <= 0) {
    return {
      field: 'guestCount',
      message: 'Guest count must be a positive integer',
      code: 'INVALID_GUEST_COUNT'
    }
  }
  return null
}

// Validate date format and range
export const validateDateRange = (checkInDate: string, checkOutDate: string): ValidationError[] => {
  const errors: ValidationError[] = []
  
  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  
  if (!dateRegex.test(checkInDate)) {
    errors.push({
      field: 'checkInDate',
      message: 'Check-in date must be in YYYY-MM-DD format',
      code: 'INVALID_DATE_FORMAT'
    })
  }
  
  if (!dateRegex.test(checkOutDate)) {
    errors.push({
      field: 'checkOutDate',
      message: 'Check-out date must be in YYYY-MM-DD format',
      code: 'INVALID_DATE_FORMAT'
    })
  }
  
  if (errors.length > 0) return errors
  
  const checkIn = new Date(checkInDate)
  const checkOut = new Date(checkOutDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time for date comparison
  
  // Validate dates are valid
  if (isNaN(checkIn.getTime())) {
    errors.push({
      field: 'checkInDate',
      message: 'Invalid check-in date',
      code: 'INVALID_CHECK_IN_DATE'
    })
  }
  
  if (isNaN(checkOut.getTime())) {
    errors.push({
      field: 'checkOutDate',
      message: 'Invalid check-out date',
      code: 'INVALID_CHECK_OUT_DATE'
    })
  }
  
  if (errors.length > 0) return errors
  
  // Validate check-in is not in the past
  if (checkIn < today) {
    errors.push({
      field: 'checkInDate',
      message: 'Check-in date cannot be in the past',
      code: 'CHECK_IN_DATE_PAST'
    })
  }
  
  // Validate check-out is after check-in
  if (checkOut <= checkIn) {
    errors.push({
      field: 'checkOutDate',
      message: 'Check-out date must be after check-in date',
      code: 'INVALID_DATE_RANGE'
    })
  }
  
  return errors
}

// Validate time format (HH:MM)
export const validateTime = (time: string | undefined, fieldName: string): ValidationError | null => {
  if (!time) return null
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  
  if (!timeRegex.test(time)) {
    return {
      field: fieldName,
      message: 'Time must be in HH:MM format (24-hour)',
      code: 'INVALID_TIME_FORMAT'
    }
  }
  
  return null
}

// Validate percentage discount
export const validatePercentageDiscount = (discount: number): ValidationError | null => {
  if (discount < 0 || discount > 100) {
    return {
      field: 'percentageDiscount',
      message: 'Percentage discount must be between 0 and 100',
      code: 'INVALID_PERCENTAGE_DISCOUNT'
    }
  }
  return null
}

// Validate monetary amounts
export const validateAmount = (amount: number, fieldName: string, allowZero: boolean = true): ValidationError | null => {
  if (!allowZero && amount === 0) {
    return {
      field: fieldName,
      message: `${fieldName} must be greater than 0`,
      code: 'AMOUNT_MUST_BE_POSITIVE'
    }
  }
  
  if (amount < 0) {
    return {
      field: fieldName,
      message: `${fieldName} cannot be negative`,
      code: 'NEGATIVE_AMOUNT'
    }
  }
  
  // Check for reasonable upper limit (10 million)
  if (amount > 10000000) {
    return {
      field: fieldName,
      message: `${fieldName} exceeds maximum allowed amount`,
      code: 'AMOUNT_TOO_LARGE'
    }
  }
  
  return null
}

// Validate status values
export const validateStatus = (status: string): ValidationError | null => {
  const validStatuses: ReservationStatus[] = ['reservation', 'booking', 'checked_in', 'checked_out', 'cancelled']
  
  if (!validStatuses.includes(status as ReservationStatus)) {
    return {
      field: 'status',
      message: 'Invalid reservation status',
      code: 'INVALID_STATUS'
    }
  }
  
  return null
}

// Validate payment status
export const validatePaymentStatus = (paymentStatus: string): ValidationError | null => {
  const validPaymentStatuses: PaymentStatus[] = ['pending', 'partial', 'paid']
  
  if (!validPaymentStatuses.includes(paymentStatus as PaymentStatus)) {
    return {
      field: 'paymentStatus',
      message: 'Invalid payment status',
      code: 'INVALID_PAYMENT_STATUS'
    }
  }
  
  return null
}

// Validate guest type
export const validateGuestType = (guestType: string | undefined): ValidationError | null => {
  if (!guestType) return null
  
  const validGuestTypes: GuestType[] = ['individual', 'family', 'friends', 'couple']
  
  if (!validGuestTypes.includes(guestType as GuestType)) {
    return {
      field: 'guestType',
      message: 'Invalid guest type',
      code: 'INVALID_GUEST_TYPE'
    }
  }
  
  return null
}

// Validate payment amounts consistency
export const validatePaymentConsistency = (data: CreateReservationData): ValidationError[] => {
  const errors: ValidationError[] = []
  
  const { totalPrice, advancePayment = 0, balancePayment = 0, paymentStatus = 'pending' } = data
  
  // Check if advance + balance equals total
  // if (Math.abs((advancePayment + balancePayment) - totalPrice) > 0.01) {
  //   errors.push({
  //     field: 'payments',
  //     message: 'Advance payment + Balance payment must equal Total price',
  //     code: 'PAYMENT_MISMATCH'
  //   })
  // }
  
  // Validate payment status consistency
  // if (paymentStatus === 'paid' && (advancePayment + balancePayment) < totalPrice) {
  //   errors.push({
  //     field: 'paymentStatus',
  //     message: 'Payment status cannot be "paid" when total payments are less than total price',
  //     code: 'INCONSISTENT_PAYMENT_STATUS'
  //   })
  // }
  
  // if (paymentStatus === 'pending' && (advancePayment > 0 || balancePayment > 0)) {
  //   errors.push({
  //     field: 'paymentStatus',
  //     message: 'Payment status should not be "pending" when payments have been made',
  //     code: 'INCONSISTENT_PAYMENT_STATUS'
  //   })
  // }
  
  return errors
}

// Comprehensive reservation validation
export const validateReservation = (data: CreateReservationData): ValidationResult => {
  const errors: ValidationError[] = []
  
  // Validate guest count
  const guestCountError = validateGuestCount(data.guestCount)
  if (guestCountError) errors.push(guestCountError)
  
  // Validate date range
  errors.push(...validateDateRange(data.checkInDate, data.checkOutDate))
  
  // Validate times
  const checkInTimeError = validateTime(data.approxCheckInTime, 'approxCheckInTime')
  if (checkInTimeError) errors.push(checkInTimeError)
  
  const checkOutTimeError = validateTime(data.approxCheckOutTime, 'approxCheckOutTime')
  if (checkOutTimeError) errors.push(checkOutTimeError)
  
  // Validate discounts
  const percentageDiscountError = validatePercentageDiscount(data.percentageDiscount || 0)
  if (percentageDiscountError) errors.push(percentageDiscountError)
  
  // Validate amounts
  const fixedDiscountError = validateAmount(data.fixedDiscount || 0, 'fixedDiscount')
  if (fixedDiscountError) errors.push(fixedDiscountError)
  
  const totalQuoteError = validateAmount(data.totalQuote, 'totalQuote', false)
  if (totalQuoteError) errors.push(totalQuoteError)
  
  const roomTariffError = validateAmount(data.roomTariff, 'roomTariff', false)
  if (roomTariffError) errors.push(roomTariffError)
  
  const totalPriceError = validateAmount(data.totalPrice, 'totalPrice', false)
  if (totalPriceError) errors.push(totalPriceError)
  
  // const advancePaymentError = validateAmount(data.advancePayment || 0, 'advancePayment')
  // if (advancePaymentError) errors.push(advancePaymentError)
  
  // const balancePaymentError = validateAmount(data.balancePayment || 0, 'balancePayment')
  // if (balancePaymentError) errors.push(balancePaymentError)
  
  // Validate status values
  const statusError = validateStatus(data.status || 'reservation')
  if (statusError) errors.push(statusError)
  
  const paymentStatusError = validatePaymentStatus(data.paymentStatus || 'pending')
  if (paymentStatusError) errors.push(paymentStatusError)
  
  const guestTypeError = validateGuestType(data.guestType)
  if (guestTypeError) errors.push(guestTypeError)
  
  // Validate payment consistency
  // errors.push(...validatePaymentConsistency(data))
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Calculate stay duration in days
export const calculateStayDuration = (checkInDate: string, checkOutDate: string): number => {
  const checkIn = new Date(checkInDate)
  const checkOut = new Date(checkOutDate)
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}