import { 
  CreatePaymentData,
  UpdatePaymentData,
  PaymentType,
  PaymentMethod,
  PaymentStatus,
  PAYMENT_TYPE_INFO,
  PAYMENT_METHOD_INFO,
  PAYMENT_LIMITS,
  PaymentValidationResult
} from '../types/payments'
import { validateReceiptNumber } from './receiptNumber'

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

// Validate payment amount
export const validatePaymentAmount = (amount: number): ValidationError | null => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return {
      field: 'amount',
      message: 'Payment amount is required',
      code: 'REQUIRED_FIELD'
    }
  }
  
  if (amount < PAYMENT_LIMITS.minAmount) {
    return {
      field: 'amount',
      message: `Payment amount must be at least ₹${PAYMENT_LIMITS.minAmount}`,
      code: 'AMOUNT_TOO_LOW'
    }
  }
  
  if (amount > PAYMENT_LIMITS.maxAmount) {
    return {
      field: 'amount',
      message: `Payment amount cannot exceed ₹${PAYMENT_LIMITS.maxAmount}`,
      code: 'AMOUNT_TOO_HIGH'
    }
  }
  
  // Check for reasonable decimal places (max 2)
  if (!Number.isInteger(amount * 100)) {
    return {
      field: 'amount',
      message: 'Payment amount cannot have more than 2 decimal places',
      code: 'INVALID_DECIMAL_PLACES'
    }
  }
  
  return null
}

// Validate payment type
export const validatePaymentType = (paymentType: PaymentType): ValidationError | null => {
  const validTypes = Object.keys(PAYMENT_TYPE_INFO) as PaymentType[]
  
  if (!validTypes.includes(paymentType)) {
    return {
      field: 'paymentType',
      message: `Invalid payment type. Must be one of: ${validTypes.join(', ')}`,
      code: 'INVALID_PAYMENT_TYPE'
    }
  }
  
  return null
}

// Validate payment method
export const validatePaymentMethod = (paymentMethod: PaymentMethod): ValidationError | null => {
  const validMethods = Object.keys(PAYMENT_METHOD_INFO) as PaymentMethod[]
  
  if (!validMethods.includes(paymentMethod)) {
    return {
      field: 'paymentMethod',
      message: `Invalid payment method. Must be one of: ${validMethods.join(', ')}`,
      code: 'INVALID_PAYMENT_METHOD'
    }
  }
  
  return null
}

// Validate payment status
export const validatePaymentStatus = (paymentStatus: PaymentStatus): ValidationError | null => {
  const validStatuses: PaymentStatus[] = ['pending', 'completed', 'failed', 'refunded', 'cancelled']
  
  if (!validStatuses.includes(paymentStatus)) {
    return {
      field: 'paymentStatus',
      message: `Invalid payment status. Must be one of: ${validStatuses.join(', ')}`,
      code: 'INVALID_PAYMENT_STATUS'
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

// Validate transaction ID format
export const validateTransactionId = (transactionId: string | undefined): ValidationError | null => {
  if (!transactionId) {
    return null // Transaction ID is optional
  }
  
  if (transactionId.length < 3 || transactionId.length > 100) {
    return {
      field: 'transactionId',
      message: 'Transaction ID must be between 3 and 100 characters',
      code: 'INVALID_TRANSACTION_ID_LENGTH'
    }
  }
  
  // Check for potentially dangerous characters
  const dangerousChars = /[<>"/\\|?\x00-\x1f]/
  if (dangerousChars.test(transactionId)) {
    return {
      field: 'transactionId',
      message: 'Transaction ID contains invalid characters',
      code: 'INVALID_TRANSACTION_ID_CHARS'
    }
  }
  
  return null
}

// Validate notes field
export const validateNotes = (notes: string | undefined): ValidationError | null => {
  if (!notes) {
    return null // Notes are optional
  }
  
  if (notes.length > 1000) {
    return {
      field: 'notes',
      message: 'Notes cannot exceed 1000 characters',
      code: 'NOTES_TOO_LONG'
    }
  }
  
  return null
}

// Validate payment date
export const validatePaymentDate = (paymentDate: string | undefined): ValidationError | null => {
  if (!paymentDate) {
    return null // Payment date is optional (defaults to current time)
  }
  
  let date: Date
  try {
    date = new Date(paymentDate)
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date')
    }
  } catch {
    return {
      field: 'paymentDate',
      message: 'Payment date must be a valid ISO date string',
      code: 'INVALID_PAYMENT_DATE'
    }
  }
  
  // Check if date is not in the future (with some tolerance)
  const now = new Date()
  const maxFutureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours in future
  
  if (date > maxFutureDate) {
    return {
      field: 'paymentDate',
      message: 'Payment date cannot be more than 24 hours in the future',
      code: 'PAYMENT_DATE_TOO_FUTURE'
    }
  }
  
  // Check if date is not too far in the past (1 year)
  const minPastDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) // 1 year ago
  
  if (date < minPastDate) {
    return {
      field: 'paymentDate',
      message: 'Payment date cannot be more than 1 year in the past',
      code: 'PAYMENT_DATE_TOO_PAST'
    }
  }
  
  return null
}

// Validate payment method against amount constraints
export const validatePaymentMethodConstraints = (
  paymentMethod: PaymentMethod,
  amount: number
): ValidationError | null => {
  const methodInfo = PAYMENT_METHOD_INFO[paymentMethod]
  
  if (!methodInfo) {
    return {
      field: 'paymentMethod',
      message: 'Unknown payment method',
      code: 'UNKNOWN_PAYMENT_METHOD'
    }
  }
  
  // Check amount limits for specific payment methods
  if (methodInfo.maxAmount && amount > methodInfo.maxAmount) {
    return {
      field: 'amount',
      message: `${methodInfo.displayName} has a maximum limit of ₹${methodInfo.maxAmount}`,
      code: 'AMOUNT_EXCEEDS_METHOD_LIMIT'
    }
  }
  
  return null
}

// Validate payment type and method combination
export const validatePaymentTypeMethodCombination = (
  paymentType: PaymentType,
  paymentMethod: PaymentMethod
): ValidationError[] => {
  const errors: ValidationError[] = []
  const typeInfo = PAYMENT_TYPE_INFO[paymentType]
  
  if (!typeInfo) {
    errors.push({
      field: 'paymentType',
      message: 'Unknown payment type',
      code: 'UNKNOWN_PAYMENT_TYPE'
    })
    return errors
  }
  
  // Check if payment method is suitable for the payment type
  if (!typeInfo.defaultMethods.includes(paymentMethod) && paymentMethod !== 'other') {
    errors.push({
      field: 'paymentMethod',
      message: `${paymentMethod} is not recommended for ${typeInfo.displayName}. Recommended methods: ${typeInfo.defaultMethods.join(', ')}`,
      code: 'PAYMENT_METHOD_NOT_RECOMMENDED'
    })
  }
  
  // Special validation rules
  if (paymentType === 'refund' && !['cash', 'bank_transfer', 'other'].includes(paymentMethod)) {
    errors.push({
      field: 'paymentMethod',
      message: 'Refunds should typically be processed via cash, bank transfer, or other methods',
      code: 'INVALID_REFUND_METHOD'
    })
  }
  
  if (paymentType === 'cancellation_fee' && paymentMethod === 'cheque') {
    errors.push({
      field: 'paymentMethod',
      message: 'Cancellation fees should not be collected via cheque',
      code: 'INVALID_CANCELLATION_METHOD'
    })
  }
  
  return errors
}

// Comprehensive payment validation
export const validatePayment = (data: CreatePaymentData): ValidationResult => {
  const errors: ValidationError[] = []
  
  // Validate required fields
  const amountError = validatePaymentAmount(data.amount)
  if (amountError) errors.push(amountError)
  
  const paymentTypeError = validatePaymentType(data.paymentType)
  if (paymentTypeError) errors.push(paymentTypeError)
  
  const paymentMethodError = validatePaymentMethod(data.paymentMethod)
  if (paymentMethodError) errors.push(paymentMethodError)
  
  // Validate optional fields
  const transactionIdError = validateTransactionId(data.transactionId)
  if (transactionIdError) errors.push(transactionIdError)
  
  const notesError = validateNotes(data.notes)
  if (notesError) errors.push(notesError)
  
  const paymentDateError = validatePaymentDate(data.paymentDate)
  if (paymentDateError) errors.push(paymentDateError)
  
  // Validate constraints
  if (!amountError && !paymentMethodError) {
    const constraintError = validatePaymentMethodConstraints(data.paymentMethod, data.amount)
    if (constraintError) errors.push(constraintError)
  }
  
  // Validate combinations
  if (!paymentTypeError && !paymentMethodError) {
    const combinationErrors = validatePaymentTypeMethodCombination(data.paymentType, data.paymentMethod)
    errors.push(...combinationErrors)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate payment update data
export const validatePaymentUpdate = (data: UpdatePaymentData): ValidationResult => {
  const errors: ValidationError[] = []
  
  // Validate fields if provided
  if (data.amount !== undefined) {
    const amountError = validatePaymentAmount(data.amount)
    if (amountError) errors.push(amountError)
  }
  
  if (data.paymentType !== undefined) {
    const paymentTypeError = validatePaymentType(data.paymentType)
    if (paymentTypeError) errors.push(paymentTypeError)
  }
  
  if (data.paymentMethod !== undefined) {
    const paymentMethodError = validatePaymentMethod(data.paymentMethod)
    if (paymentMethodError) errors.push(paymentMethodError)
  }
  
  if (data.paymentStatus !== undefined) {
    const statusError = validatePaymentStatus(data.paymentStatus)
    if (statusError) errors.push(statusError)
  }
  
  if (data.transactionId !== undefined) {
    const transactionIdError = validateTransactionId(data.transactionId)
    if (transactionIdError) errors.push(transactionIdError)
  }
  
  if (data.notes !== undefined) {
    const notesError = validateNotes(data.notes)
    if (notesError) errors.push(notesError)
  }
  
  if (data.paymentDate !== undefined) {
    const paymentDateError = validatePaymentDate(data.paymentDate)
    if (paymentDateError) errors.push(paymentDateError)
  }
  
  // Validate constraints if both amount and method are being updated
  if (data.amount !== undefined && data.paymentMethod !== undefined) {
    const constraintError = validatePaymentMethodConstraints(data.paymentMethod, data.amount)
    if (constraintError) errors.push(constraintError)
  }
  
  // Validate combinations if both type and method are being updated
  if (data.paymentType !== undefined && data.paymentMethod !== undefined) {
    const combinationErrors = validatePaymentTypeMethodCombination(data.paymentType, data.paymentMethod)
    errors.push(...combinationErrors)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate bulk payment data
export const validateBulkPayments = (
  payments: Array<{
    amount: number
    paymentType: PaymentType
    paymentMethod: PaymentMethod
    transactionId?: string
    notes?: string
    paymentDate?: string
  }>
): ValidationResult => {
  const errors: ValidationError[] = []
  
  if (!payments || payments.length === 0) {
    errors.push({
      field: 'payments',
      message: 'At least one payment must be provided',
      code: 'EMPTY_PAYMENTS_ARRAY'
    })
    return { isValid: false, errors }
  }
  
  if (payments.length > PAYMENT_LIMITS.maxPaymentsPerReservation) {
    errors.push({
      field: 'payments',
      message: `Cannot process more than ${PAYMENT_LIMITS.maxPaymentsPerReservation} payments at once`,
      code: 'TOO_MANY_PAYMENTS'
    })
  }
  
  // Validate each payment
  payments.forEach((payment, index) => {
    const validation = validatePayment({
      reservationId: 'temp', // Will be set by calling function
      ...payment
    })
    
    if (!validation.isValid) {
      validation.errors.forEach(error => {
        // Skip the temp validation errors
        if (error.field === 'reservationId') {
          return
        }
        
        errors.push({
          ...error,
          field: `payments[${index}].${error.field}`,
          message: `Payment ${index + 1}: ${error.message}`
        })
      })
    }
  })
  
  // Validate total amount doesn't exceed reasonable limits
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
  if (totalAmount > PAYMENT_LIMITS.maxAmount) {
    errors.push({
      field: 'payments',
      message: `Total payment amount (₹${totalAmount}) exceeds maximum limit (₹${PAYMENT_LIMITS.maxAmount})`,
      code: 'TOTAL_AMOUNT_TOO_HIGH'
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate refund amount
export const validateRefundAmount = (
  refundAmount: number,
  originalAmount: number,
  existingRefunds: number = 0
): ValidationResult => {
  const errors: ValidationError[] = []
  
  const amountError = validatePaymentAmount(refundAmount)
  if (amountError) {
    errors.push({
      ...amountError,
      field: 'refundAmount'
    })
  }
  
  if (refundAmount > originalAmount) {
    errors.push({
      field: 'refundAmount',
      message: 'Refund amount cannot exceed original payment amount',
      code: 'REFUND_EXCEEDS_ORIGINAL'
    })
  }
  
  const totalRefunds = existingRefunds + refundAmount
  if (totalRefunds > originalAmount) {
    errors.push({
      field: 'refundAmount',
      message: `Total refunds (₹${totalRefunds}) would exceed original payment amount (₹${originalAmount})`,
      code: 'TOTAL_REFUNDS_EXCEED_ORIGINAL'
    })
  }
  
  const maxRefundAllowed = (originalAmount * PAYMENT_LIMITS.maxRefundPercentage) / 100
  if (totalRefunds > maxRefundAllowed) {
    errors.push({
      field: 'refundAmount',
      message: `Total refunds cannot exceed ${PAYMENT_LIMITS.maxRefundPercentage}% of original amount`,
      code: 'REFUND_PERCENTAGE_EXCEEDED'
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate payment against reservation constraints
export const validatePaymentAgainstReservation = (
  paymentAmount: number,
  paymentType: PaymentType,
  reservationTotal: number,
  existingPayments: number = 0
): PaymentValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []
  let suggestedAmount: number | undefined
  
  const totalAfterPayment = existingPayments + paymentAmount
  
  // Check for overpayment
  if (totalAfterPayment > reservationTotal) {
    const overpayment = totalAfterPayment - reservationTotal
    if (paymentType !== 'security_deposit' && paymentType !== 'additional_charges') {
      warnings.push(`Payment would result in overpayment of ₹${overpayment}`)
    }
  }
  
  // Check for reasonable advance amounts
  if (paymentType === 'booking_advance') {
    const advancePercentage = (paymentAmount / reservationTotal) * 100
    
    if (advancePercentage < 10) {
      warnings.push(`Advance amount is very low (${advancePercentage.toFixed(1)}% of total). Consider at least 20% advance.`)
      suggestedAmount = Math.ceil(reservationTotal * 0.2)
    }
    
    if (advancePercentage > 80) {
      warnings.push(`Advance amount is very high (${advancePercentage.toFixed(1)}% of total). Consider reducing to 50% or less.`)
      suggestedAmount = Math.ceil(reservationTotal * 0.5)
    }
  }
  
  // Check for full payment accuracy
  if (paymentType === 'full_payment') {
    const outstandingAmount = reservationTotal - existingPayments
    
    if (Math.abs(paymentAmount - outstandingAmount) > 1) { // Allow ₹1 tolerance
      warnings.push(`Full payment amount (₹${paymentAmount}) doesn't match outstanding amount (₹${outstandingAmount})`)
      suggestedAmount = outstandingAmount
    }
  }
  
  // Check for partial payment reasonableness
  if (paymentType === 'partial_payment') {
    const remainingAfterPayment = reservationTotal - totalAfterPayment
    
    if (remainingAfterPayment < 0) {
      errors.push(`Partial payment would exceed reservation total`)
    } else if (remainingAfterPayment < 100 && remainingAfterPayment > 0) {
      warnings.push(`Very small amount (₹${remainingAfterPayment}) remaining after partial payment. Consider full payment.`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestedAmount
  }
}

// Check if payment method requires additional verification
export const getPaymentMethodRequirements = (paymentMethod: PaymentMethod): {
  requiresVerification: boolean
  requiresTransactionId: boolean
  hasProcessingFee: boolean
  processingFeePercentage?: number
  maxAmount?: number
  isInstant: boolean
  additionalInfo: string[]
} => {
  const methodInfo = PAYMENT_METHOD_INFO[paymentMethod]
  
  if (!methodInfo) {
    return {
      requiresVerification: true,
      requiresTransactionId: false,
      hasProcessingFee: false,
      isInstant: false,
      additionalInfo: ['Unknown payment method']
    }
  }
  
  const additionalInfo: string[] = []
  
  if (methodInfo.maxAmount) {
    additionalInfo.push(`Maximum amount: ₹${methodInfo.maxAmount}`)
  }
  
  if (methodInfo.processingFee) {
    additionalInfo.push(`Processing fee: ${methodInfo.processingFee}%`)
  }
  
  if (!methodInfo.isInstant) {
    additionalInfo.push('Payment may take time to process')
  }
  
  return {
    requiresVerification: methodInfo.requiresVerification,
    requiresTransactionId: methodInfo.requiresVerification,
    hasProcessingFee: !!methodInfo.processingFee,
    processingFeePercentage: methodInfo.processingFee,
    maxAmount: methodInfo.maxAmount,
    isInstant: methodInfo.isInstant,
    additionalInfo
  }
}