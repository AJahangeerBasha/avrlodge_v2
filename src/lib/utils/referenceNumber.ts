import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore'
import { db } from '../firebase'
import { ReferenceNumberCounter } from '../types/reservations'

const REFERENCE_COUNTERS_COLLECTION = 'referenceCounters'

// Generate reference number in format MMYYYY-XXX
export const generateReferenceNumber = async (): Promise<string> => {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12
  const year = now.getFullYear()
  
  // Create counter ID in format MMYYYY
  const counterId = `${month.toString().padStart(2, '0')}${year}`
  
  try {
    return await runTransaction(db, async (transaction) => {
      const counterRef = doc(db, REFERENCE_COUNTERS_COLLECTION, counterId)
      const counterDoc = await transaction.get(counterRef)
      
      let counter: number
      
      if (!counterDoc.exists()) {
        // Create new counter for this month/year
        counter = 1
        transaction.set(counterRef, {
          id: counterId,
          counter,
          month,
          year,
          lastUpdated: serverTimestamp()
        })
      } else {
        // Increment existing counter
        const data = counterDoc.data() as ReferenceNumberCounter
        counter = data.counter + 1
        transaction.update(counterRef, {
          counter,
          lastUpdated: serverTimestamp()
        })
      }
      
      // Format: MMYYYY-XXX (e.g., 012025-001)
      const referenceNumber = `${counterId}-${counter.toString().padStart(3, '0')}`
      return referenceNumber
    })
  } catch (error) {
    console.error('Error generating reference number:', error)
    // Fallback: use timestamp-based reference if transaction fails
    const timestamp = Date.now().toString().slice(-6)
    return `${counterId}-${timestamp}`
  }
}

// Get current counter for a given month/year
export const getCurrentCounter = async (month: number, year: number): Promise<number> => {
  try {
    const counterId = `${month.toString().padStart(2, '0')}${year}`
    const counterRef = doc(db, REFERENCE_COUNTERS_COLLECTION, counterId)
    const counterDoc = await getDoc(counterRef)
    
    if (counterDoc.exists()) {
      const data = counterDoc.data() as ReferenceNumberCounter
      return data.counter
    }
    
    return 0
  } catch (error) {
    console.error('Error getting current counter:', error)
    return 0
  }
}

// Parse reference number to extract components
export const parseReferenceNumber = (referenceNumber: string): {
  month: number
  year: number
  counter: number
  isValid: boolean
} => {
  try {
    // Expected format: MMYYYY-XXX
    const parts = referenceNumber.split('-')
    if (parts.length !== 2) {
      return { month: 0, year: 0, counter: 0, isValid: false }
    }
    
    const [monthYear, counterStr] = parts
    
    if (monthYear.length !== 6 || counterStr.length !== 3) {
      return { month: 0, year: 0, counter: 0, isValid: false }
    }
    
    const month = parseInt(monthYear.substring(0, 2), 10)
    const year = parseInt(monthYear.substring(2), 10)
    const counter = parseInt(counterStr, 10)
    
    if (isNaN(month) || isNaN(year) || isNaN(counter)) {
      return { month: 0, year: 0, counter: 0, isValid: false }
    }
    
    if (month < 1 || month > 12) {
      return { month: 0, year: 0, counter: 0, isValid: false }
    }
    
    return { month, year, counter, isValid: true }
  } catch (error) {
    return { month: 0, year: 0, counter: 0, isValid: false }
  }
}

// Validate reference number format
export const isValidReferenceNumber = (referenceNumber: string): boolean => {
  return parseReferenceNumber(referenceNumber).isValid
}

// Get reference numbers for a specific month/year
export const getReferenceNumbersForPeriod = (month: number, year: number): string => {
  const counterId = `${month.toString().padStart(2, '0')}${year}`
  return counterId
}

// Reset counter (admin function - use with caution)
export const resetCounter = async (month: number, year: number): Promise<void> => {
  try {
    const counterId = `${month.toString().padStart(2, '0')}${year}`
    const counterRef = doc(db, REFERENCE_COUNTERS_COLLECTION, counterId)
    
    await setDoc(counterRef, {
      id: counterId,
      counter: 0,
      month,
      year,
      lastUpdated: serverTimestamp()
    })
  } catch (error) {
    console.error('Error resetting counter:', error)
    throw error
  }
}