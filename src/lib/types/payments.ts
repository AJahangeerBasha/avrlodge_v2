// Payments Types
// Converted from PostgreSQL payments table

export type PaymentType = 
  | 'booking_advance'
  | 'full_payment'
  | 'partial_payment'
  | 'security_deposit'
  | 'additional_charges'
  | 'refund'
  | 'cancellation_fee'
  | 'extra_services'

export type PaymentMethod = 
  | 'cash'
  | 'card'
  | 'upi'
  | 'net_banking'
  | 'wallet'
  | 'bank_transfer'
  | 'cheque'
  | 'other'

export type PaymentStatus = 
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled'

export interface Payment {
  id: string
  reservationId?: string // Can be null for standalone payments
  amount: number
  paymentType: PaymentType
  paymentMethod: PaymentMethod
  receiptNumber: string // Auto-generated
  paymentStatus: PaymentStatus
  transactionId?: string // External transaction reference
  gatewayResponse?: string // Payment gateway response
  notes?: string
  createdBy: string // User ID
  updatedBy: string // User ID
  deletedBy?: string // User ID who deleted (soft delete)
  deletedAt?: string // ISO timestamp for soft delete
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
  paymentDate: string // ISO timestamp - when payment was actually made
}

export interface CreatePaymentData {
  reservationId?: string
  amount: number
  paymentType: PaymentType
  paymentMethod: PaymentMethod
  transactionId?: string
  gatewayResponse?: string
  notes?: string
  paymentDate?: string // Defaults to current time if not provided
}

export interface UpdatePaymentData {
  amount?: number
  paymentType?: PaymentType
  paymentMethod?: PaymentMethod
  paymentStatus?: PaymentStatus
  transactionId?: string
  gatewayResponse?: string
  notes?: string
  paymentDate?: string
}

export interface PaymentFilters {
  reservationId?: string
  paymentType?: PaymentType
  paymentMethod?: PaymentMethod
  paymentStatus?: PaymentStatus
  createdBy?: string
  minAmount?: number
  maxAmount?: number
  dateRange?: {
    start: string
    end: string
  }
  isActive?: boolean // Filter for non-deleted payments
}

export interface BulkPaymentData {
  reservationId: string
  payments: Array<{
    amount: number
    paymentType: PaymentType
    paymentMethod: PaymentMethod
    transactionId?: string
    notes?: string
    paymentDate?: string
  }>
}

export interface PaymentResult {
  paymentId: string
  receiptNumber: string
  amount: number
  paymentType: PaymentType
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentDate: string
}

export interface BulkPaymentResult {
  reservationId: string
  processedPayments: PaymentResult[]
  totalAmount: number
  totalPayments: number
  errors?: Array<{
    payment: any
    error: string
  }>
}

export interface PaymentSummary {
  reservationId?: string
  totalAmount: number
  totalPayments: number
  paymentsByType: Record<PaymentType, number>
  paymentsByMethod: Record<PaymentMethod, number>
  paymentsByStatus: Record<PaymentStatus, number>
  lastPaymentDate?: string
  lastPaymentAmount?: number
  outstandingAmount?: number // If linked to reservation
}

export interface ReceiptNumberCounter {
  id: string // Format: MMYYYY or daily/monthly as needed
  counter: number
  createdAt: string
  updatedAt: string
}

export interface PaymentValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestedAmount?: number
}

export interface PaymentTypeInfo {
  type: PaymentType
  displayName: string
  description: string
  isRefundable: boolean
  requiresApproval: boolean
  defaultMethods: PaymentMethod[]
}

export interface PaymentMethodInfo {
  method: PaymentMethod
  displayName: string
  description: string
  isInstant: boolean
  requiresVerification: boolean
  maxAmount?: number
  processingFee?: number
}

// Payment type definitions with business rules
export const PAYMENT_TYPE_INFO: Record<PaymentType, PaymentTypeInfo> = {
  booking_advance: {
    type: 'booking_advance',
    displayName: 'Booking Advance',
    description: 'Initial advance payment to confirm booking',
    isRefundable: true,
    requiresApproval: false,
    defaultMethods: ['cash', 'upi', 'card', 'net_banking']
  },
  full_payment: {
    type: 'full_payment',
    displayName: 'Full Payment',
    description: 'Complete payment for the reservation',
    isRefundable: false,
    requiresApproval: false,
    defaultMethods: ['cash', 'card', 'upi', 'net_banking']
  },
  partial_payment: {
    type: 'partial_payment',
    displayName: 'Partial Payment',
    description: 'Partial payment towards total amount',
    isRefundable: false,
    requiresApproval: false,
    defaultMethods: ['cash', 'card', 'upi', 'net_banking']
  },
  security_deposit: {
    type: 'security_deposit',
    displayName: 'Security Deposit',
    description: 'Refundable security deposit',
    isRefundable: true,
    requiresApproval: false,
    defaultMethods: ['cash', 'card']
  },
  additional_charges: {
    type: 'additional_charges',
    displayName: 'Additional Charges',
    description: 'Extra charges for services or damages',
    isRefundable: false,
    requiresApproval: true,
    defaultMethods: ['cash', 'card', 'upi']
  },
  refund: {
    type: 'refund',
    displayName: 'Refund',
    description: 'Refund of previous payments',
    isRefundable: false,
    requiresApproval: true,
    defaultMethods: ['cash', 'bank_transfer']
  },
  cancellation_fee: {
    type: 'cancellation_fee',
    displayName: 'Cancellation Fee',
    description: 'Fee charged for cancellation',
    isRefundable: false,
    requiresApproval: true,
    defaultMethods: ['cash', 'card']
  },
  extra_services: {
    type: 'extra_services',
    displayName: 'Extra Services',
    description: 'Payment for additional services',
    isRefundable: false,
    requiresApproval: false,
    defaultMethods: ['cash', 'card', 'upi']
  }
}

// Payment method definitions with constraints
export const PAYMENT_METHOD_INFO: Record<PaymentMethod, PaymentMethodInfo> = {
  cash: {
    method: 'cash',
    displayName: 'Cash',
    description: 'Cash payment',
    isInstant: true,
    requiresVerification: false,
    maxAmount: 200000 // ₹2,00,000 limit for cash
  },
  card: {
    method: 'card',
    displayName: 'Credit/Debit Card',
    description: 'Card payment via POS or online',
    isInstant: true,
    requiresVerification: true,
    processingFee: 2 // 2% processing fee
  },
  upi: {
    method: 'upi',
    displayName: 'UPI',
    description: 'UPI payment',
    isInstant: true,
    requiresVerification: true,
    maxAmount: 100000 // ₹1,00,000 UPI limit
  },
  net_banking: {
    method: 'net_banking',
    displayName: 'Net Banking',
    description: 'Internet banking payment',
    isInstant: false,
    requiresVerification: true,
    processingFee: 1 // 1% processing fee
  },
  wallet: {
    method: 'wallet',
    displayName: 'Digital Wallet',
    description: 'Payment via digital wallet',
    isInstant: true,
    requiresVerification: true,
    maxAmount: 50000 // ₹50,000 wallet limit
  },
  bank_transfer: {
    method: 'bank_transfer',
    displayName: 'Bank Transfer',
    description: 'Direct bank transfer',
    isInstant: false,
    requiresVerification: true
  },
  cheque: {
    method: 'cheque',
    displayName: 'Cheque',
    description: 'Cheque payment',
    isInstant: false,
    requiresVerification: true,
    maxAmount: 1000000 // ₹10,00,000 cheque limit
  },
  other: {
    method: 'other',
    displayName: 'Other',
    description: 'Other payment methods',
    isInstant: false,
    requiresVerification: true
  }
}

// Receipt number generation settings
export const RECEIPT_NUMBER_CONFIG = {
  prefix: 'PAY',
  format: 'PAY-MMYYYY-XXXXX', // PAY-012025-00001
  counterLength: 5,
  resetPeriod: 'monthly' as 'daily' | 'monthly' | 'yearly'
}

// Payment limits and validation
export const PAYMENT_LIMITS = {
  minAmount: 1, // Minimum ₹1
  maxAmount: 10000000, // Maximum ₹1,00,00,000
  maxPaymentsPerReservation: 50,
  maxRefundPercentage: 100
}

// Payment analytics interfaces
export interface PaymentAnalytics {
  totalRevenue: number
  totalPayments: number
  averagePaymentAmount: number
  paymentMethodDistribution: Array<{
    method: PaymentMethod
    count: number
    amount: number
    percentage: number
  }>
  paymentTypeDistribution: Array<{
    type: PaymentType
    count: number
    amount: number
    percentage: number
  }>
  dailyRevenue: Array<{
    date: string
    revenue: number
    paymentCount: number
  }>
  topPaymentMethods: PaymentMethod[]
  refundRate: number
  cancellationRate: number
}

export interface ReservationPaymentStatus {
  reservationId: string
  totalAmount: number // From reservation
  paidAmount: number
  outstandingAmount: number
  refundedAmount: number
  paymentCount: number
  lastPaymentDate?: string
  paymentCompletionPercentage: number
  status: 'not_paid' | 'partially_paid' | 'fully_paid' | 'overpaid' | 'refunded'
  nextDueAmount?: number
  nextDueDate?: string
}

export interface PaymentAuditLog {
  paymentId: string
  action: 'created' | 'updated' | 'deleted' | 'refunded' | 'cancelled'
  performedBy: string
  performedAt: string
  details?: Record<string, any>
  previousValues?: Partial<Payment>
  newValues?: Partial<Payment>
}

// Dashboard metrics
export interface PaymentDashboardMetrics {
  todayRevenue: number
  monthRevenue: number
  yearRevenue: number
  todayPaymentCount: number
  monthPaymentCount: number
  yearPaymentCount: number
  pendingPayments: number
  failedPayments: number
  refundRequests: number
  avgPaymentAmount: number
  topPaymentMethod: PaymentMethod
  recentTransactions: Payment[]
}