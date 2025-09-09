// Payments Firestore Operations
// Handles CRUD operations for payments

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  writeBatch,
  runTransaction,
  Timestamp,
  DocumentSnapshot,
  Query,
  Unsubscribe
} from 'firebase/firestore'
import { db } from './firebase'
import { 
  Payment,
  CreatePaymentData,
  UpdatePaymentData,
  PaymentFilters,
  BulkPaymentData,
  BulkPaymentResult,
  PaymentResult,
  PaymentSummary,
  PaymentAuditLog,
  PaymentType,
  PaymentMethod,
  PaymentStatus,
  ReservationPaymentStatus,
  PaymentAnalytics
} from './types/payments'
import { generateUniqueReceiptNumber } from './utils/receiptNumber'

const COLLECTION_NAME = 'payments'
const AUDIT_COLLECTION_NAME = 'paymentAudits'

// Helper function to convert Firestore timestamp to ISO string
const timestampToString = (timestamp: any): string => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString()
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString()
  }
  return timestamp || new Date().toISOString()
}

// Helper function to convert payment data
const convertPaymentData = (doc: DocumentSnapshot): Payment | null => {
  if (!doc.exists()) return null
  
  const data = doc.data()
  return {
    id: doc.id,
    reservationId: data.reservationId,
    amount: data.amount,
    paymentType: data.paymentType,
    paymentMethod: data.paymentMethod,
    receiptNumber: data.receiptNumber,
    paymentStatus: data.paymentStatus || 'completed',
    transactionId: data.transactionId,
    gatewayResponse: data.gatewayResponse,
    notes: data.notes,
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    deletedBy: data.deletedBy,
    deletedAt: data.deletedAt ? timestampToString(data.deletedAt) : undefined,
    createdAt: timestampToString(data.createdAt),
    updatedAt: timestampToString(data.updatedAt),
    paymentDate: timestampToString(data.paymentDate)
  }
}

// Create audit log entry
const createAuditLog = async (
  paymentId: string,
  action: 'created' | 'updated' | 'deleted' | 'refunded' | 'cancelled',
  performedBy: string,
  details?: Record<string, any>,
  previousValues?: Partial<Payment>,
  newValues?: Partial<Payment>
): Promise<void> => {
  try {
    const auditData: Omit<PaymentAuditLog, 'id'> = {
      paymentId,
      action,
      performedBy,
      performedAt: new Date().toISOString(),
      details,
      previousValues,
      newValues
    }
    
    await addDoc(collection(db, AUDIT_COLLECTION_NAME), {
      ...auditData,
      performedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error creating payment audit log:', error)
    // Don't throw error for audit log failures
  }
}

// Create a new payment
export const createPayment = async (
  data: CreatePaymentData,
  userId: string
): Promise<string> => {
  try {
    // Generate receipt number
    const receiptNumber = await generateUniqueReceiptNumber()
    
    const now = Timestamp.now()
    const paymentDate = data.paymentDate ? Timestamp.fromDate(new Date(data.paymentDate)) : now
    
    const paymentData = {
      reservationId: data.reservationId || null,
      amount: data.amount,
      paymentType: data.paymentType,
      paymentMethod: data.paymentMethod,
      receiptNumber,
      paymentStatus: 'completed' as PaymentStatus, // Default to completed
      transactionId: data.transactionId,
      gatewayResponse: data.gatewayResponse,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
      paymentDate: paymentDate,
      createdBy: userId,
      updatedBy: userId
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), paymentData)
    
    // Create audit log
    await createAuditLog(docRef.id, 'created', userId, {
      amount: data.amount,
      paymentType: data.paymentType,
      paymentMethod: data.paymentMethod,
      receiptNumber,
      reservationId: data.reservationId
    })

    return docRef.id
  } catch (error) {
    console.error('Error creating payment:', error)
    throw error
  }
}

// Update a payment
export const updatePayment = async (
  paymentId: string,
  data: UpdatePaymentData,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, paymentId)
    
    // Get current payment for audit
    const currentDoc = await getDoc(docRef)
    const currentData = currentDoc.exists() ? convertPaymentData(currentDoc) : null
    
    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now(),
      updatedBy: userId
    }
    
    // Convert paymentDate to Timestamp if provided
    if (data.paymentDate) {
      updateData.paymentDate = Timestamp.fromDate(new Date(data.paymentDate))
    }

    await updateDoc(docRef, updateData)
    
    // Create audit log
    await createAuditLog(paymentId, 'updated', userId, {
      changes: data
    }, currentData || undefined, data)
  } catch (error) {
    console.error('Error updating payment:', error)
    throw error
  }
}

// Soft delete a payment
export const deletePayment = async (
  paymentId: string,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, paymentId)
    
    // Get current payment for audit
    const currentDoc = await getDoc(docRef)
    const currentData = currentDoc.exists() ? convertPaymentData(currentDoc) : null
    
    const deleteData = {
      deletedAt: Timestamp.now(),
      deletedBy: userId,
      updatedAt: Timestamp.now(),
      updatedBy: userId
    }

    await updateDoc(docRef, deleteData)
    
    // Create audit log
    await createAuditLog(paymentId, 'deleted', userId, {
      payment: currentData
    })
  } catch (error) {
    console.error('Error deleting payment:', error)
    throw error
  }
}

// Restore a soft deleted payment
export const restorePayment = async (
  paymentId: string,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, paymentId)
    
    const updateData = {
      deletedAt: null,
      deletedBy: null,
      updatedAt: Timestamp.now(),
      updatedBy: userId
    }

    await updateDoc(docRef, updateData)
    
    // Create audit log
    await createAuditLog(paymentId, 'created', userId, {
      action: 'restored'
    })
  } catch (error) {
    console.error('Error restoring payment:', error)
    throw error
  }
}

// Get a single payment by ID
export const getPaymentById = async (
  paymentId: string
): Promise<Payment | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, paymentId)
    const docSnap = await getDoc(docRef)
    return convertPaymentData(docSnap)
  } catch (error) {
    console.error('Error getting payment:', error)
    throw error
  }
}

// Get payments with filters
export const getPayments = async (
  filters?: PaymentFilters,
  limitCount?: number
): Promise<Payment[]> => {
  try {
    let q: Query = collection(db, COLLECTION_NAME)

    // Apply filters
    if (filters?.reservationId) {
      q = query(q, where('reservationId', '==', filters.reservationId))
    }
    
    if (filters?.paymentType) {
      q = query(q, where('paymentType', '==', filters.paymentType))
    }
    
    if (filters?.paymentMethod) {
      q = query(q, where('paymentMethod', '==', filters.paymentMethod))
    }
    
    if (filters?.paymentStatus) {
      q = query(q, where('paymentStatus', '==', filters.paymentStatus))
    }
    
    if (filters?.createdBy) {
      q = query(q, where('createdBy', '==', filters.createdBy))
    }

    // Filter out soft deleted payments by default
    if (filters?.isActive !== false) {
      q = query(q, where('deletedAt', '==', null))
    }

    // Add ordering and limit
    q = query(q, orderBy('createdAt', 'desc'))
    
    if (limitCount) {
      q = query(q, limit(limitCount))
    }

    const querySnapshot = await getDocs(q)
    let payments = querySnapshot.docs
      .map(doc => convertPaymentData(doc))
      .filter((payment): payment is Payment => payment !== null)

    // Apply client-side filters
    if (filters?.minAmount !== undefined) {
      payments = payments.filter(payment => payment.amount >= filters.minAmount!)
    }
    
    if (filters?.maxAmount !== undefined) {
      payments = payments.filter(payment => payment.amount <= filters.maxAmount!)
    }
    
    if (filters?.dateRange) {
      const startDate = new Date(filters.dateRange.start)
      const endDate = new Date(filters.dateRange.end)
      
      payments = payments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate)
        return paymentDate >= startDate && paymentDate <= endDate
      })
    }

    return payments
  } catch (error) {
    console.error('Error getting payments:', error)
    
    // Fallback: get all payments and filter client-side
    try {
      const allQuery = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc'),
        ...(limitCount ? [limit(limitCount)] : [])
      )
      
      const fallbackSnapshot = await getDocs(allQuery)
      let payments = fallbackSnapshot.docs
        .map(doc => convertPaymentData(doc))
        .filter((payment): payment is Payment => payment !== null)

      // Apply all filters client-side
      if (filters?.reservationId) {
        payments = payments.filter(payment => payment.reservationId === filters.reservationId)
      }
      
      if (filters?.paymentType) {
        payments = payments.filter(payment => payment.paymentType === filters.paymentType)
      }
      
      if (filters?.paymentMethod) {
        payments = payments.filter(payment => payment.paymentMethod === filters.paymentMethod)
      }
      
      if (filters?.paymentStatus) {
        payments = payments.filter(payment => payment.paymentStatus === filters.paymentStatus)
      }
      
      if (filters?.createdBy) {
        payments = payments.filter(payment => payment.createdBy === filters.createdBy)
      }
      
      if (filters?.isActive !== false) {
        payments = payments.filter(payment => !payment.deletedAt)
      }
      
      if (filters?.minAmount !== undefined) {
        payments = payments.filter(payment => payment.amount >= filters.minAmount!)
      }
      
      if (filters?.maxAmount !== undefined) {
        payments = payments.filter(payment => payment.amount <= filters.maxAmount!)
      }
      
      if (filters?.dateRange) {
        const startDate = new Date(filters.dateRange.start)
        const endDate = new Date(filters.dateRange.end)
        
        payments = payments.filter(payment => {
          const paymentDate = new Date(payment.paymentDate)
          return paymentDate >= startDate && paymentDate <= endDate
        })
      }

      return payments
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError)
      throw fallbackError
    }
  }
}

// Get payments by reservation ID
export const getPaymentsByReservationId = async (
  reservationId: string
): Promise<Payment[]> => {
  return getPayments({ reservationId, isActive: true })
}

// Get payments by receipt number
export const getPaymentByReceiptNumber = async (
  receiptNumber: string
): Promise<Payment | null> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('receiptNumber', '==', receiptNumber),
      where('deletedAt', '==', null),
      limit(1)
    )
    
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }
    
    return convertPaymentData(querySnapshot.docs[0])
  } catch (error) {
    console.error('Error getting payment by receipt number:', error)
    throw error
  }
}

// Subscribe to payments with real-time updates
export const subscribeToPayments = (
  filters: PaymentFilters,
  callback: (payments: Payment[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  try {
    let q: Query = collection(db, COLLECTION_NAME)

    // Apply basic filters that work with Firestore
    if (filters.reservationId) {
      q = query(q, where('reservationId', '==', filters.reservationId))
    }
    
    if (filters.paymentType) {
      q = query(q, where('paymentType', '==', filters.paymentType))
    }
    
    if (filters.paymentMethod) {
      q = query(q, where('paymentMethod', '==', filters.paymentMethod))
    }
    
    // Filter out deleted payments
    if (filters.isActive !== false) {
      q = query(q, where('deletedAt', '==', null))
    }
    
    q = query(q, orderBy('createdAt', 'desc'))

    return onSnapshot(
      q,
      (querySnapshot) => {
        let payments = querySnapshot.docs
          .map(doc => convertPaymentData(doc))
          .filter((payment): payment is Payment => payment !== null)

        // Apply additional filters client-side
        if (filters.paymentStatus) {
          payments = payments.filter(payment => payment.paymentStatus === filters.paymentStatus)
        }
        
        if (filters.createdBy) {
          payments = payments.filter(payment => payment.createdBy === filters.createdBy)
        }
        
        if (filters.minAmount !== undefined) {
          payments = payments.filter(payment => payment.amount >= filters.minAmount!)
        }
        
        if (filters.maxAmount !== undefined) {
          payments = payments.filter(payment => payment.amount <= filters.maxAmount!)
        }
        
        if (filters.dateRange) {
          const startDate = new Date(filters.dateRange.start)
          const endDate = new Date(filters.dateRange.end)
          
          payments = payments.filter(payment => {
            const paymentDate = new Date(payment.paymentDate)
            return paymentDate >= startDate && paymentDate <= endDate
          })
        }

        callback(payments)
      },
      (error) => {
        console.error('Error in payments subscription:', error)
        if (onError) onError(error)
      }
    )
  } catch (error) {
    console.error('Error setting up payments subscription:', error)
    if (onError) onError(error as Error)
    return () => {} // Return empty unsubscribe function
  }
}

// Bulk create payments
export const createBulkPayments = async (
  data: BulkPaymentData,
  userId: string
): Promise<BulkPaymentResult> => {
  try {
    const batch = writeBatch(db)
    const processedPayments: PaymentResult[] = []
    const errors: Array<{ payment: any; error: string }> = []
    let totalAmount = 0
    
    for (const payment of data.payments) {
      try {
        const receiptNumber = await generateUniqueReceiptNumber()
        const docRef = doc(collection(db, COLLECTION_NAME))
        const now = Timestamp.now()
        const paymentDate = payment.paymentDate ? Timestamp.fromDate(new Date(payment.paymentDate)) : now
        
        const paymentData = {
          reservationId: data.reservationId,
          amount: payment.amount,
          paymentType: payment.paymentType,
          paymentMethod: payment.paymentMethod,
          receiptNumber,
          paymentStatus: 'completed' as PaymentStatus,
          transactionId: payment.transactionId,
          notes: payment.notes,
          createdAt: now,
          updatedAt: now,
          paymentDate: paymentDate,
          createdBy: userId,
          updatedBy: userId
        }
        
        batch.set(docRef, paymentData)
        
        processedPayments.push({
          paymentId: docRef.id,
          receiptNumber,
          amount: payment.amount,
          paymentType: payment.paymentType,
          paymentMethod: payment.paymentMethod,
          paymentStatus: 'completed',
          paymentDate: new Date().toISOString()
        })
        
        totalAmount += payment.amount
        
        // Create audit log (fire and forget)
        createAuditLog(docRef.id, 'created', userId, {
          amount: payment.amount,
          paymentType: payment.paymentType,
          paymentMethod: payment.paymentMethod,
          receiptNumber,
          reservationId: data.reservationId,
          bulkOperation: true
        })
        
      } catch (error) {
        errors.push({
          payment,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    if (processedPayments.length > 0) {
      await batch.commit()
    }
    
    return {
      reservationId: data.reservationId,
      processedPayments,
      totalAmount,
      totalPayments: processedPayments.length,
      errors: errors.length > 0 ? errors : undefined
    }
  } catch (error) {
    console.error('Error in bulk payment creation:', error)
    throw error
  }
}

// Delete all payments for a reservation (soft delete)
export const deletePaymentsByReservationId = async (
  reservationId: string,
  userId: string
): Promise<{ deletedCount: number; totalAmount: number }> => {
  try {
    const payments = await getPaymentsByReservationId(reservationId)
    
    if (payments.length === 0) {
      return { deletedCount: 0, totalAmount: 0 }
    }
    
    const batch = writeBatch(db)
    const now = Timestamp.now()
    let totalAmount = 0
    
    for (const payment of payments) {
      const docRef = doc(db, COLLECTION_NAME, payment.id)
      batch.update(docRef, {
        deletedAt: now,
        deletedBy: userId,
        updatedAt: now,
        updatedBy: userId
      })
      
      totalAmount += payment.amount
      
      // Create audit log (fire and forget)
      createAuditLog(payment.id, 'deleted', userId, {
        reservationId,
        bulkOperation: true
      })
    }
    
    await batch.commit()
    
    return { deletedCount: payments.length, totalAmount }
  } catch (error) {
    console.error('Error deleting payments by reservation ID:', error)
    throw error
  }
}

// Get payment summary for a reservation
export const getPaymentSummary = async (
  reservationId: string
): Promise<PaymentSummary | null> => {
  try {
    const payments = await getPaymentsByReservationId(reservationId)
    
    if (payments.length === 0) {
      return null
    }
    
    // Calculate totals
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
    
    // Count by type
    const paymentsByType = payments.reduce((acc, payment) => {
      acc[payment.paymentType] = (acc[payment.paymentType] || 0) + payment.amount
      return acc
    }, {} as Record<PaymentType, number>)
    
    // Count by method
    const paymentsByMethod = payments.reduce((acc, payment) => {
      acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + payment.amount
      return acc
    }, {} as Record<PaymentMethod, number>)
    
    // Count by status
    const paymentsByStatus = payments.reduce((acc, payment) => {
      acc[payment.paymentStatus] = (acc[payment.paymentStatus] || 0) + payment.amount
      return acc
    }, {} as Record<PaymentStatus, number>)
    
    // Find latest payment
    const sortedByDate = [...payments].sort((a, b) => 
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    )
    const latestPayment = sortedByDate[0]
    
    return {
      reservationId,
      totalAmount,
      totalPayments: payments.length,
      paymentsByType,
      paymentsByMethod,
      paymentsByStatus,
      lastPaymentDate: latestPayment?.paymentDate,
      lastPaymentAmount: latestPayment?.amount
    }
  } catch (error) {
    console.error('Error getting payment summary:', error)
    throw error
  }
}

// Process refund
export const processRefund = async (
  originalPaymentId: string,
  refundAmount: number,
  userId: string,
  notes?: string
): Promise<string> => {
  try {
    // Get original payment
    const originalPayment = await getPaymentById(originalPaymentId)
    if (!originalPayment) {
      throw new Error('Original payment not found')
    }
    
    if (refundAmount > originalPayment.amount) {
      throw new Error('Refund amount cannot exceed original payment amount')
    }
    
    // Create refund payment
    const refundData: CreatePaymentData = {
      reservationId: originalPayment.reservationId,
      amount: -refundAmount, // Negative amount for refund
      paymentType: 'refund',
      paymentMethod: originalPayment.paymentMethod,
      notes: notes || `Refund for payment ${originalPayment.receiptNumber}`
    }
    
    const refundPaymentId = await createPayment(refundData, userId)
    
    // Update original payment status if fully refunded
    if (refundAmount === originalPayment.amount) {
      await updatePayment(originalPaymentId, {
        paymentStatus: 'refunded'
      }, userId)
    }
    
    // Create audit logs
    await createAuditLog(originalPaymentId, 'refunded', userId, {
      refundAmount,
      refundPaymentId,
      notes
    })
    
    return refundPaymentId
  } catch (error) {
    console.error('Error processing refund:', error)
    throw error
  }
}

// Get payment audit logs
export const getPaymentAuditLogs = async (
  paymentId: string,
  limitCount: number = 50
): Promise<PaymentAuditLog[]> => {
  try {
    const q = query(
      collection(db, AUDIT_COLLECTION_NAME),
      where('paymentId', '==', paymentId),
      orderBy('performedAt', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      ...doc.data() as Omit<PaymentAuditLog, 'performedAt'>,
      performedAt: timestampToString(doc.data().performedAt)
    }))
  } catch (error) {
    console.error('Error getting payment audit logs:', error)
    throw error
  }
}