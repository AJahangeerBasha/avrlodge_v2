// Receipt Number Generation Utility
// Generates unique receipt numbers for payments with format PAY-MMYYYY-XXXXX

import { doc, runTransaction, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { ReceiptNumberCounter, RECEIPT_NUMBER_CONFIG } from '../types/payments'

const COUNTER_COLLECTION = 'receiptNumberCounters'

// Generate receipt number ID based on current date and reset period
const generateCounterId = (resetPeriod: 'daily' | 'monthly' | 'yearly'): string => {
  const now = new Date()
  
  switch (resetPeriod) {
    case 'daily':
      return `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`
    case 'monthly':
      return `${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`
    case 'yearly':
      return `${now.getFullYear()}`
    default:
      return `${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`
  }
}

// Format counter number with leading zeros
const formatCounterNumber = (counter: number, length: number): string => {
  return String(counter).padStart(length, '0')
}

// Generate next receipt number
export const generateReceiptNumber = async (): Promise<string> => {
  try {
    return await runTransaction(db, async (transaction) => {
      const counterId = generateCounterId(RECEIPT_NUMBER_CONFIG.resetPeriod)
      const counterRef = doc(db, COUNTER_COLLECTION, counterId)
      const counterDoc = await transaction.get(counterRef)
      
      let counter: number
      
      if (counterDoc.exists()) {
        // Increment existing counter
        const data = counterDoc.data() as ReceiptNumberCounter
        counter = data.counter + 1
        
        transaction.update(counterRef, {
          counter: counter,
          updatedAt: Timestamp.now()
        })
      } else {
        // Create new counter starting from 1
        counter = 1
        const newCounterData: Omit<ReceiptNumberCounter, 'id'> = {
          counter: counter,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        transaction.set(counterRef, {
          ...newCounterData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })
      }
      
      // Format the receipt number
      const counterString = formatCounterNumber(counter, RECEIPT_NUMBER_CONFIG.counterLength)
      const receiptNumber = `${RECEIPT_NUMBER_CONFIG.prefix}-${counterId}-${counterString}`
      
      return receiptNumber
    })
  } catch (error) {
    console.error('Error generating receipt number:', error)
    
    // Fallback: generate with timestamp if transaction fails
    const timestamp = Date.now().toString().slice(-6)
    const counterId = generateCounterId(RECEIPT_NUMBER_CONFIG.resetPeriod)
    return `${RECEIPT_NUMBER_CONFIG.prefix}-${counterId}-${timestamp}`
  }
}

// Get current counter value
export const getCurrentReceiptCounter = async (): Promise<{
  counterId: string
  counter: number
  nextReceiptNumber: string
} | null> => {
  try {
    const counterId = generateCounterId(RECEIPT_NUMBER_CONFIG.resetPeriod)
    const counterRef = doc(db, COUNTER_COLLECTION, counterId)
    const counterDoc = await getDoc(counterRef)
    
    if (counterDoc.exists()) {
      const data = counterDoc.data() as ReceiptNumberCounter
      const nextCounter = data.counter + 1
      const nextCounterString = formatCounterNumber(nextCounter, RECEIPT_NUMBER_CONFIG.counterLength)
      const nextReceiptNumber = `${RECEIPT_NUMBER_CONFIG.prefix}-${counterId}-${nextCounterString}`
      
      return {
        counterId,
        counter: data.counter,
        nextReceiptNumber
      }
    }
    
    return {
      counterId,
      counter: 0,
      nextReceiptNumber: `${RECEIPT_NUMBER_CONFIG.prefix}-${counterId}-${formatCounterNumber(1, RECEIPT_NUMBER_CONFIG.counterLength)}`
    }
  } catch (error) {
    console.error('Error getting current receipt counter:', error)
    return null
  }
}

// Validate receipt number format
export const validateReceiptNumber = (receiptNumber: string): {
  isValid: boolean
  errors: string[]
  parsed?: {
    prefix: string
    period: string
    counter: string
  }
} => {
  const errors: string[] = []
  
  if (!receiptNumber) {
    errors.push('Receipt number is required')
    return { isValid: false, errors }
  }
  
  // Check basic format: PAY-MMYYYY-XXXXX
  const parts = receiptNumber.split('-')
  
  if (parts.length !== 3) {
    errors.push('Receipt number must have format PAY-MMYYYY-XXXXX')
    return { isValid: false, errors }
  }
  
  const [prefix, period, counter] = parts
  
  // Validate prefix
  if (prefix !== RECEIPT_NUMBER_CONFIG.prefix) {
    errors.push(`Receipt number must start with ${RECEIPT_NUMBER_CONFIG.prefix}`)
  }
  
  // Validate period format (MMYYYY for monthly)
  if (RECEIPT_NUMBER_CONFIG.resetPeriod === 'monthly') {
    if (!/^\d{6}$/.test(period)) {
      errors.push('Period must be in MMYYYY format')
    } else {
      const month = parseInt(period.substring(0, 2))
      if (month < 1 || month > 12) {
        errors.push('Month in period must be between 01 and 12')
      }
    }
  }
  
  // Validate counter format
  if (!/^\d+$/.test(counter)) {
    errors.push('Counter must be numeric')
  } else if (counter.length !== RECEIPT_NUMBER_CONFIG.counterLength) {
    errors.push(`Counter must be ${RECEIPT_NUMBER_CONFIG.counterLength} digits`)
  }
  
  const isValid = errors.length === 0
  
  return {
    isValid,
    errors,
    parsed: isValid ? { prefix, period, counter } : undefined
  }
}

// Check if receipt number already exists (for duplicate prevention)
export const checkReceiptNumberExists = async (receiptNumber: string): Promise<boolean> => {
  try {
    // This would require a query on the payments collection
    // For now, we'll implement a basic validation
    const validation = validateReceiptNumber(receiptNumber)
    
    if (!validation.isValid) {
      return false // Invalid format means it doesn't exist in our system
    }
    
    // In a real implementation, you would query the payments collection:
    // const query = query(collection(db, 'payments'), where('receiptNumber', '==', receiptNumber))
    // const snapshot = await getDocs(query)
    // return !snapshot.empty
    
    return false // Assume it doesn't exist for now
  } catch (error) {
    console.error('Error checking receipt number existence:', error)
    return false
  }
}

// Generate receipt number with retry on collision (extra safety)
export const generateUniqueReceiptNumber = async (maxRetries: number = 3): Promise<string> => {
  let attempts = 0
  
  while (attempts < maxRetries) {
    try {
      const receiptNumber = await generateReceiptNumber()
      
      // Check if this receipt number already exists
      const exists = await checkReceiptNumberExists(receiptNumber)
      
      if (!exists) {
        return receiptNumber
      }
      
      attempts++
      console.warn(`Receipt number ${receiptNumber} already exists, retrying... (${attempts}/${maxRetries})`)
      
      // Wait a bit before retry
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      console.error(`Error generating unique receipt number (attempt ${attempts + 1}):`, error)
      attempts++
      
      if (attempts >= maxRetries) {
        throw error
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }
  
  throw new Error(`Failed to generate unique receipt number after ${maxRetries} attempts`)
}

// Get receipt number statistics
export const getReceiptNumberStats = async (): Promise<{
  currentPeriod: string
  totalReceiptsThisPeriod: number
  nextReceiptNumber: string
  periodStartDate: string
  resetPeriod: string
} | null> => {
  try {
    const counterId = generateCounterId(RECEIPT_NUMBER_CONFIG.resetPeriod)
    const counterRef = doc(db, COUNTER_COLLECTION, counterId)
    const counterDoc = await getDoc(counterRef)
    
    // Calculate period start date
    const now = new Date()
    let periodStartDate: string
    
    switch (RECEIPT_NUMBER_CONFIG.resetPeriod) {
      case 'daily':
        periodStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
        break
      case 'monthly':
        periodStartDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        break
      case 'yearly':
        periodStartDate = new Date(now.getFullYear(), 0, 1).toISOString()
        break
      default:
        periodStartDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    }
    
    if (counterDoc.exists()) {
      const data = counterDoc.data() as ReceiptNumberCounter
      const nextCounter = data.counter + 1
      const nextCounterString = formatCounterNumber(nextCounter, RECEIPT_NUMBER_CONFIG.counterLength)
      const nextReceiptNumber = `${RECEIPT_NUMBER_CONFIG.prefix}-${counterId}-${nextCounterString}`
      
      return {
        currentPeriod: counterId,
        totalReceiptsThisPeriod: data.counter,
        nextReceiptNumber,
        periodStartDate,
        resetPeriod: RECEIPT_NUMBER_CONFIG.resetPeriod
      }
    }
    
    return {
      currentPeriod: counterId,
      totalReceiptsThisPeriod: 0,
      nextReceiptNumber: `${RECEIPT_NUMBER_CONFIG.prefix}-${counterId}-${formatCounterNumber(1, RECEIPT_NUMBER_CONFIG.counterLength)}`,
      periodStartDate,
      resetPeriod: RECEIPT_NUMBER_CONFIG.resetPeriod
    }
  } catch (error) {
    console.error('Error getting receipt number stats:', error)
    return null
  }
}

// Reset counter (for admin use - be very careful!)
export const resetReceiptCounter = async (
  period?: string,
  newValue: number = 0
): Promise<void> => {
  try {
    const counterId = period || generateCounterId(RECEIPT_NUMBER_CONFIG.resetPeriod)
    const counterRef = doc(db, COUNTER_COLLECTION, counterId)
    
    await setDoc(counterRef, {
      counter: newValue,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }, { merge: true })
    
    console.log(`Receipt counter for period ${counterId} reset to ${newValue}`)
  } catch (error) {
    console.error('Error resetting receipt counter:', error)
    throw error
  }
}

// Parse receipt number to extract information
export const parseReceiptNumber = (receiptNumber: string): {
  prefix: string
  year: number
  month?: number
  day?: number
  counter: number
} | null => {
  const validation = validateReceiptNumber(receiptNumber)
  
  if (!validation.isValid || !validation.parsed) {
    return null
  }
  
  const { prefix, period, counter } = validation.parsed
  
  try {
    switch (RECEIPT_NUMBER_CONFIG.resetPeriod) {
      case 'daily': {
        // Format: DDMMYYYY
        const day = parseInt(period.substring(0, 2))
        const month = parseInt(period.substring(2, 4))
        const year = parseInt(period.substring(4, 8))
        return { prefix, year, month, day, counter: parseInt(counter) }
      }
      
      case 'monthly': {
        // Format: MMYYYY
        const monthOnly = parseInt(period.substring(0, 2))
        const yearOnly = parseInt(period.substring(2, 6))
        return { prefix, year: yearOnly, month: monthOnly, counter: parseInt(counter) }
      }
      
      case 'yearly': {
        // Format: YYYY
        const yearFull = parseInt(period)
        return { prefix, year: yearFull, counter: parseInt(counter) }
      }
      
      default:
        return null
    }
  } catch (error) {
    console.error('Error parsing receipt number:', error)
    return null
  }
}