// Payment Management Utilities
// High-level utilities for managing payments and reservation payment status

import {
  createPayment,
  createBulkPayments,
  getPaymentsByReservationId,
  getPaymentSummary,
  processRefund,
  updatePayment,
  deletePayment,
  getPaymentById
} from '../payments'
import { 
  Payment,
  CreatePaymentData,
  PaymentType,
  PaymentMethod,
  PaymentStatus,
  BulkPaymentData,
  PaymentSummary,
  ReservationPaymentStatus,
  PaymentDashboardMetrics,
  PaymentAnalytics,
  PAYMENT_TYPE_INFO,
  PAYMENT_METHOD_INFO
} from '../types/payments'
import {
  validatePayment,
  validatePaymentAgainstReservation,
  validateRefundAmount,
  getPaymentMethodRequirements
} from './paymentValidation'
import { getReservationById } from '../reservations'

// Process a payment with comprehensive validation and business logic
export const processPayment = async (
  data: CreatePaymentData,
  userId: string,
  validateAgainstReservation: boolean = true
): Promise<{
  paymentId: string
  receiptNumber: string
  warnings?: string[]
  suggestions?: string[]
}> => {
  try {
    const warnings: string[] = []
    const suggestions: string[] = []
    
    // Basic validation
    const validation = validatePayment(data)
    if (!validation.isValid) {
      throw new Error(`Payment validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }
    
    // Validate against reservation if provided and requested
    if (data.reservationId && validateAgainstReservation) {
      const reservation = await getReservationById(data.reservationId)
      if (!reservation) {
        throw new Error('Reservation not found')
      }
      
      // Get existing payments
      const existingPayments = await getPaymentsByReservationId(data.reservationId)
      const existingTotal = existingPayments
        .filter(p => p.paymentStatus === 'completed')
        .reduce((sum, p) => sum + p.amount, 0)
      
      const reservationValidation = validatePaymentAgainstReservation(
        data.amount,
        data.paymentType,
        reservation.totalPrice,
        existingTotal
      )
      
      if (!reservationValidation.isValid) {
        throw new Error(`Reservation validation failed: ${reservationValidation.errors.join(', ')}`)
      }
      
      warnings.push(...reservationValidation.warnings)
      
      if (reservationValidation.suggestedAmount && reservationValidation.suggestedAmount !== data.amount) {
        suggestions.push(`Suggested amount: ₹${reservationValidation.suggestedAmount}`)
      }
    }
    
    // Check payment method requirements
    const methodRequirements = getPaymentMethodRequirements(data.paymentMethod)
    
    if (methodRequirements.requiresTransactionId && !data.transactionId) {
      warnings.push(`${PAYMENT_METHOD_INFO[data.paymentMethod].displayName} typically requires a transaction ID`)
    }
    
    if (methodRequirements.hasProcessingFee && methodRequirements.processingFeePercentage) {
      const processingFee = (data.amount * methodRequirements.processingFeePercentage) / 100
      suggestions.push(`Processing fee: ₹${processingFee.toFixed(2)} (${methodRequirements.processingFeePercentage}%)`)
    }
    
    // Create the payment
    const paymentId = await createPayment(data, userId)
    const payment = await getPaymentById(paymentId)
    
    if (!payment) {
      throw new Error('Failed to retrieve created payment')
    }
    
    return {
      paymentId,
      receiptNumber: payment.receiptNumber,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    }
  } catch (error) {
    console.error('Error processing payment:', error)
    throw error
  }
}

// Process multiple payments for a reservation
export const processMultiplePayments = async (
  data: BulkPaymentData,
  userId: string
): Promise<{
  totalAmount: number
  processedCount: number
  receiptNumbers: string[]
  warnings: string[]
  errors: string[]
}> => {
  try {
    const warnings: string[] = []
    const errors: string[] = []
    
    // Validate reservation exists
    if (data.reservationId) {
      const reservation = await getReservationById(data.reservationId)
      if (!reservation) {
        throw new Error('Reservation not found')
      }
    }
    
    // Process bulk payments
    const result = await createBulkPayments(data, userId)
    
    // Collect receipt numbers
    const receiptNumbers = result.processedPayments.map(p => p.receiptNumber)
    
    // Add any errors from bulk processing
    if (result.errors) {
      result.errors.forEach(error => {
        errors.push(`${error.payment.paymentType}: ${error.error}`)
      })
    }
    
    // Add processing warnings
    if (result.totalAmount > 500000) { // Large amount warning
      warnings.push('Large total payment amount - please verify all details')
    }
    
    return {
      totalAmount: result.totalAmount,
      processedCount: result.totalPayments,
      receiptNumbers,
      warnings,
      errors
    }
  } catch (error) {
    console.error('Error processing multiple payments:', error)
    throw error
  }
}

// Get comprehensive payment status for a reservation
export const getReservationPaymentStatus = async (
  reservationId: string
): Promise<ReservationPaymentStatus> => {
  try {
    // Get reservation details
    const reservation = await getReservationById(reservationId)
    if (!reservation) {
      throw new Error('Reservation not found')
    }
    
    // Get all payments
    const payments = await getPaymentsByReservationId(reservationId)
    
    // Calculate amounts
    const completedPayments = payments.filter(p => p.paymentStatus === 'completed')
    const refundedPayments = payments.filter(p => p.paymentStatus === 'refunded')
    const refunds = payments.filter(p => p.amount < 0) // Negative amounts are refunds
    
    const paidAmount = completedPayments.reduce((sum, p) => sum + (p.amount > 0 ? p.amount : 0), 0)
    const refundedAmount = Math.abs(refunds.reduce((sum, p) => sum + p.amount, 0))
    const outstandingAmount = Math.max(0, reservation.totalPrice - paidAmount)
    
    // Determine status
    let status: ReservationPaymentStatus['status']
    if (paidAmount === 0) {
      status = 'not_paid'
    } else if (paidAmount < reservation.totalPrice) {
      status = 'partially_paid'
    } else if (paidAmount === reservation.totalPrice) {
      status = 'fully_paid'
    } else if (paidAmount > reservation.totalPrice) {
      status = 'overpaid'
    } else {
      status = 'partially_paid'
    }
    
    // If there are significant refunds, adjust status
    if (refundedAmount > 0 && refundedAmount >= paidAmount * 0.8) {
      status = 'refunded'
    }
    
    // Calculate completion percentage
    const paymentCompletionPercentage = Math.min(100, Math.round((paidAmount / reservation.totalPrice) * 100))
    
    // Find last payment
    const sortedPayments = completedPayments.sort((a, b) => 
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    )
    const lastPayment = sortedPayments[0]
    
    return {
      reservationId,
      totalAmount: reservation.totalPrice,
      paidAmount,
      outstandingAmount,
      refundedAmount,
      paymentCount: payments.length,
      lastPaymentDate: lastPayment?.paymentDate,
      paymentCompletionPercentage,
      status
    }
  } catch (error) {
    console.error('Error getting reservation payment status:', error)
    throw error
  }
}

// Process a refund with validation
export const processPaymentRefund = async (
  originalPaymentId: string,
  refundAmount: number,
  userId: string,
  reason?: string
): Promise<{
  refundPaymentId: string
  refundReceiptNumber: string
  warnings?: string[]
}> => {
  try {
    const warnings: string[] = []
    
    // Get original payment
    const originalPayment = await getPaymentById(originalPaymentId)
    if (!originalPayment) {
      throw new Error('Original payment not found')
    }
    
    // Check if payment is refundable
    const paymentTypeInfo = PAYMENT_TYPE_INFO[originalPayment.paymentType]
    if (!paymentTypeInfo.isRefundable) {
      warnings.push(`${paymentTypeInfo.displayName} is typically non-refundable`)
    }
    
    // Get existing refunds for this payment
    if (originalPayment.reservationId) {
      const allPayments = await getPaymentsByReservationId(originalPayment.reservationId)
      const existingRefunds = allPayments
        .filter(p => p.paymentType === 'refund' && p.notes?.includes(originalPayment.receiptNumber))
        .reduce((sum, p) => sum + Math.abs(p.amount), 0)
      
      // Validate refund amount
      const refundValidation = validateRefundAmount(refundAmount, originalPayment.amount, existingRefunds)
      if (!refundValidation.isValid) {
        throw new Error(`Refund validation failed: ${refundValidation.errors.map(e => e.message).join(', ')}`)
      }
    }
    
    // Process the refund
    const refundPaymentId = await processRefund(
      originalPaymentId,
      refundAmount,
      userId,
      reason
    )
    
    const refundPayment = await getPaymentById(refundPaymentId)
    if (!refundPayment) {
      throw new Error('Failed to retrieve refund payment')
    }
    
    return {
      refundPaymentId,
      refundReceiptNumber: refundPayment.receiptNumber,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  } catch (error) {
    console.error('Error processing refund:', error)
    throw error
  }
}

// Calculate payment analytics for dashboard
export const calculatePaymentAnalytics = async (
  dateRange?: { start: string; end: string },
  reservationId?: string
): Promise<PaymentAnalytics> => {
  try {
    // This would typically use aggregation queries in a real implementation
    // For now, we'll implement a basic version by fetching payments
    
    let payments: Payment[] = []
    
    if (reservationId) {
      payments = await getPaymentsByReservationId(reservationId)
    } else {
      // Get all payments (this would need pagination in production)
      const { getPayments } = await import('../payments')
      payments = await getPayments({ 
        isActive: true,
        dateRange 
      }, 1000) // Limit to 1000 for performance
    }
    
    // Filter by date range if provided
    if (dateRange && !reservationId) {
      const startDate = new Date(dateRange.start)
      const endDate = new Date(dateRange.end)
      
      payments = payments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate)
        return paymentDate >= startDate && paymentDate <= endDate
      })
    }
    
    // Calculate totals
    const completedPayments = payments.filter(p => p.paymentStatus === 'completed')
    const totalRevenue = completedPayments.reduce((sum, p) => sum + (p.amount > 0 ? p.amount : 0), 0)
    const totalPayments = completedPayments.length
    const averagePaymentAmount = totalPayments > 0 ? totalRevenue / totalPayments : 0
    
    // Payment method distribution
    const methodCounts = completedPayments.reduce((acc, payment) => {
      if (payment.amount > 0) { // Only positive amounts (not refunds)
        acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + payment.amount
      }
      return acc
    }, {} as Record<PaymentMethod, number>)
    
    const paymentMethodDistribution = Object.entries(methodCounts).map(([method, amount]) => ({
      method: method as PaymentMethod,
      count: completedPayments.filter(p => p.paymentMethod === method && p.amount > 0).length,
      amount,
      percentage: Math.round((amount / totalRevenue) * 100)
    })).sort((a, b) => b.amount - a.amount)
    
    // Payment type distribution
    const typeCounts = completedPayments.reduce((acc, payment) => {
      if (payment.amount > 0) { // Only positive amounts (not refunds)
        acc[payment.paymentType] = (acc[payment.paymentType] || 0) + payment.amount
      }
      return acc
    }, {} as Record<PaymentType, number>)
    
    const paymentTypeDistribution = Object.entries(typeCounts).map(([type, amount]) => ({
      type: type as PaymentType,
      count: completedPayments.filter(p => p.paymentType === type && p.amount > 0).length,
      amount,
      percentage: Math.round((amount / totalRevenue) * 100)
    })).sort((a, b) => b.amount - a.amount)
    
    // Daily revenue (last 30 days or within date range)
    const days = new Map<string, { revenue: number; count: number }>()
    
    completedPayments.forEach(payment => {
      const date = new Date(payment.paymentDate).toISOString().split('T')[0]
      const existing = days.get(date) || { revenue: 0, count: 0 }
      
      if (payment.amount > 0) {
        existing.revenue += payment.amount
        existing.count += 1
        days.set(date, existing)
      }
    })
    
    const dailyRevenue = Array.from(days.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      paymentCount: data.count
    })).sort((a, b) => a.date.localeCompare(b.date))
    
    // Top payment methods
    const topPaymentMethods = paymentMethodDistribution
      .slice(0, 3)
      .map(item => item.method)
    
    // Calculate rates
    const refundCount = payments.filter(p => p.paymentType === 'refund').length
    const refundRate = totalPayments > 0 ? Math.round((refundCount / totalPayments) * 100) : 0
    
    const cancellationCount = payments.filter(p => p.paymentType === 'cancellation_fee').length
    const cancellationRate = totalPayments > 0 ? Math.round((cancellationCount / totalPayments) * 100) : 0
    
    return {
      totalRevenue,
      totalPayments,
      averagePaymentAmount: Math.round(averagePaymentAmount),
      paymentMethodDistribution,
      paymentTypeDistribution,
      dailyRevenue,
      topPaymentMethods,
      refundRate,
      cancellationRate
    }
  } catch (error) {
    console.error('Error calculating payment analytics:', error)
    throw error
  }
}

// Get payment dashboard metrics
export const getPaymentDashboardMetrics = async (): Promise<PaymentDashboardMetrics> => {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisYear = new Date(now.getFullYear(), 0, 1)
    
    const { getPayments } = await import('../payments')
    
    // Get recent payments for analysis
    const recentPayments = await getPayments({ 
      isActive: true,
      dateRange: {
        start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        end: now.toISOString()
      }
    }, 2000)
    
    const completedPayments = recentPayments.filter(p => p.paymentStatus === 'completed' && p.amount > 0)
    
    // Today's metrics
    const todayPayments = completedPayments.filter(p => 
      new Date(p.paymentDate) >= today
    )
    const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0)
    
    // This month's metrics
    const monthPayments = completedPayments.filter(p => 
      new Date(p.paymentDate) >= thisMonth
    )
    const monthRevenue = monthPayments.reduce((sum, p) => sum + p.amount, 0)
    
    // This year's metrics
    const yearPayments = completedPayments.filter(p => 
      new Date(p.paymentDate) >= thisYear
    )
    const yearRevenue = yearPayments.reduce((sum, p) => sum + p.amount, 0)
    
    // Status counts
    const pendingPayments = recentPayments.filter(p => p.paymentStatus === 'pending').length
    const failedPayments = recentPayments.filter(p => p.paymentStatus === 'failed').length
    const refundRequests = recentPayments.filter(p => p.paymentType === 'refund').length
    
    // Average payment amount
    const avgPaymentAmount = completedPayments.length > 0 
      ? Math.round(completedPayments.reduce((sum, p) => sum + p.amount, 0) / completedPayments.length)
      : 0
    
    // Top payment method
    const methodCounts = completedPayments.reduce((acc, payment) => {
      acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + 1
      return acc
    }, {} as Record<PaymentMethod, number>)
    
    const topPaymentMethod = Object.entries(methodCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as PaymentMethod || 'cash'
    
    // Recent transactions (last 10)
    const recentTransactions = recentPayments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
    
    return {
      todayRevenue,
      monthRevenue,
      yearRevenue,
      todayPaymentCount: todayPayments.length,
      monthPaymentCount: monthPayments.length,
      yearPaymentCount: yearPayments.length,
      pendingPayments,
      failedPayments,
      refundRequests,
      avgPaymentAmount,
      topPaymentMethod,
      recentTransactions
    }
  } catch (error) {
    console.error('Error getting payment dashboard metrics:', error)
    throw error
  }
}

// Reconcile payments for a reservation (check for discrepancies)
export const reconcileReservationPayments = async (
  reservationId: string
): Promise<{
  isReconciled: boolean
  discrepancies: string[]
  summary: {
    expectedTotal: number
    actualPaid: number
    difference: number
    paymentCount: number
  }
  recommendations: string[]
}> => {
  try {
    const discrepancies: string[] = []
    const recommendations: string[] = []
    
    // Get reservation and payment data
    const reservation = await getReservationById(reservationId)
    if (!reservation) {
      throw new Error('Reservation not found')
    }
    
    const payments = await getPaymentsByReservationId(reservationId)
    const paymentSummary = await getPaymentSummary(reservationId)
    
    // Calculate totals
    const completedPayments = payments.filter(p => p.paymentStatus === 'completed')
    const actualPaid = completedPayments
      .filter(p => p.amount > 0)
      .reduce((sum, p) => sum + p.amount, 0)
    
    const refunds = completedPayments
      .filter(p => p.amount < 0)
      .reduce((sum, p) => sum + Math.abs(p.amount), 0)
    
    const netPaid = actualPaid - refunds
    const difference = reservation.totalPrice - netPaid
    
    // Check for discrepancies
    if (Math.abs(difference) > 1) { // Allow ₹1 tolerance
      if (difference > 0) {
        discrepancies.push(`Underpayment of ₹${difference}`)
        recommendations.push('Collect remaining payment amount')
      } else {
        discrepancies.push(`Overpayment of ₹${Math.abs(difference)}`)
        recommendations.push('Process refund for overpaid amount')
      }
    }
    
    // Check for failed payments
    const failedPayments = payments.filter(p => p.paymentStatus === 'failed')
    if (failedPayments.length > 0) {
      discrepancies.push(`${failedPayments.length} failed payment(s)`)
      recommendations.push('Review and retry failed payments')
    }
    
    // Check for pending payments
    const pendingPayments = payments.filter(p => p.paymentStatus === 'pending')
    if (pendingPayments.length > 0) {
      discrepancies.push(`${pendingPayments.length} pending payment(s)`)
      recommendations.push('Follow up on pending payments')
    }
    
    // Check payment sequence logic
    const advances = completedPayments.filter(p => p.paymentType === 'booking_advance')
    const fullPayments = completedPayments.filter(p => p.paymentType === 'full_payment')
    
    if (advances.length > 0 && fullPayments.length > 0) {
      const advanceTotal = advances.reduce((sum, p) => sum + p.amount, 0)
      const fullTotal = fullPayments.reduce((sum, p) => sum + p.amount, 0)
      
      if (advanceTotal + fullTotal > reservation.totalPrice + 100) { // Allow small tolerance
        discrepancies.push('Both advance and full payment recorded - potential double payment')
        recommendations.push('Review payment sequence for accuracy')
      }
    }
    
    const isReconciled = discrepancies.length === 0
    
    return {
      isReconciled,
      discrepancies,
      summary: {
        expectedTotal: reservation.totalPrice,
        actualPaid: netPaid,
        difference,
        paymentCount: payments.length
      },
      recommendations
    }
  } catch (error) {
    console.error('Error reconciling reservation payments:', error)
    throw error
  }
}

// Auto-suggest payment type based on context
export const suggestPaymentType = (
  reservationTotal: number,
  existingPayments: number,
  checkInStatus: 'not_checked_in' | 'checked_in' | 'checked_out'
): {
  suggestedType: PaymentType
  suggestedAmount: number
  reason: string
  alternatives: Array<{
    type: PaymentType
    amount: number
    reason: string
  }>
} => {
  const outstanding = reservationTotal - existingPayments
  const paidPercentage = (existingPayments / reservationTotal) * 100
  
  let suggestedType: PaymentType
  let suggestedAmount: number
  let reason: string
  
  const alternatives: Array<{ type: PaymentType; amount: number; reason: string }> = []
  
  if (existingPayments === 0) {
    // No payments made yet
    if (checkInStatus === 'not_checked_in') {
      suggestedType = 'booking_advance'
      suggestedAmount = Math.ceil(reservationTotal * 0.3) // 30% advance
      reason = 'Initial booking advance recommended (30% of total)'
      
      alternatives.push({
        type: 'full_payment',
        amount: reservationTotal,
        reason: 'Full payment upfront'
      })
    } else {
      suggestedType = 'full_payment'
      suggestedAmount = reservationTotal
      reason = 'Guest is checked in - collect full payment'
    }
  } else if (paidPercentage < 50) {
    // Less than 50% paid
    suggestedType = 'partial_payment'
    suggestedAmount = Math.ceil(outstanding * 0.5) // Half of outstanding
    reason = 'Partial payment to reach 50% of total'
    
    alternatives.push({
      type: 'full_payment',
      amount: outstanding,
      reason: 'Complete remaining payment'
    })
  } else if (paidPercentage < 100) {
    // More than 50% but not fully paid
    suggestedType = 'full_payment'
    suggestedAmount = outstanding
    reason = 'Complete remaining payment'
    
    if (outstanding > 1000) {
      alternatives.push({
        type: 'partial_payment',
        amount: Math.ceil(outstanding * 0.7),
        reason: '70% of remaining amount'
      })
    }
  } else {
    // Fully paid - suggest additional services
    suggestedType = 'extra_services'
    suggestedAmount = Math.ceil(reservationTotal * 0.1) // 10% of total
    reason = 'Additional services or charges'
    
    alternatives.push({
      type: 'security_deposit',
      amount: 1000, // Standard deposit
      reason: 'Security deposit for room/services'
    })
  }
  
  return {
    suggestedType,
    suggestedAmount,
    reason,
    alternatives
  }
}