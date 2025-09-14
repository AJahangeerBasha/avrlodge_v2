import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'
import { 
  ReservationSpecialCharge, 
  CreateReservationSpecialChargeData, 
  UpdateReservationSpecialChargeData, 
  ReservationSpecialChargeFilters,
  ReservationSpecialChargeSummary,
  SpecialChargeCalculation,
  BulkSpecialChargeData
} from './types/reservationSpecialCharges'
import { 
  validateReservationSpecialCharge, 
  validateBulkSpecialCharges,
  validateAgainstMasterData,
  calculateExpectedTotal
} from './utils/reservationSpecialChargeValidation'
import { getReservationById } from './reservations'
import { getSpecialChargeById } from './specialCharges'

const RESERVATION_SPECIAL_CHARGES_COLLECTION = 'reservationSpecialCharges'

// Convert Firestore data to ReservationSpecialCharge interface
const convertFirestoreToReservationSpecialCharge = (doc: any): ReservationSpecialCharge => {
  const data = doc.data()
  return {
    id: doc.id,
    reservationId: data.reservationId,
    specialChargeId: data.specialChargeId,
    customRate: data.customRate || null,
    customDescription: data.customDescription || null,
    quantity: data.quantity || 1,
    totalAmount: data.totalAmount || 0,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    deletedAt: data.deletedAt ? 
      (data.deletedAt instanceof Timestamp ? data.deletedAt.toDate().toISOString() : data.deletedAt) : null,
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    deletedBy: data.deletedBy || null
  }
}

// Get all reservation special charges with filters
export const getAllReservationSpecialCharges = async (filters?: ReservationSpecialChargeFilters): Promise<ReservationSpecialCharge[]> => {
  try {
    const chargesRef = collection(db, RESERVATION_SPECIAL_CHARGES_COLLECTION)
    
    // Try with optimized query first
    try {
      let q = query(chargesRef)
      
      // Apply filters
      if (filters?.reservationId) {
        q = query(q, where('reservationId', '==', filters.reservationId))
      }
      if (filters?.specialChargeId) {
        q = query(q, where('specialChargeId', '==', filters.specialChargeId))
      }
      if (filters?.createdBy) {
        q = query(q, where('createdBy', '==', filters.createdBy))
      }
      if (filters?.updatedBy) {
        q = query(q, where('updatedBy', '==', filters.updatedBy))
      }
      
      // Order by creation date (most recent first)
      if (!filters || Object.keys(filters).length <= 1) {
        q = query(q, orderBy('createdAt', 'desc'))
      }
      
      const querySnapshot = await getDocs(q)
      let charges = querySnapshot.docs.map(convertFirestoreToReservationSpecialCharge)
      
      // Client-side filtering for numeric ranges
      if (filters) {
        charges = charges.filter(charge => {
          if (filters.minAmount && charge.totalAmount < filters.minAmount) return false
          if (filters.maxAmount && charge.totalAmount > filters.maxAmount) return false
          if (filters.minQuantity && charge.quantity < filters.minQuantity) return false
          if (filters.maxQuantity && charge.quantity > filters.maxQuantity) return false
          return true
        })
      }
      
      // Client-side sorting if we couldn't use orderBy
      if (filters && Object.keys(filters).length > 1) {
        charges.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }
      
      return charges
    } catch (indexError) {
      // Fallback: Get all docs and filter/sort in client
      console.warn('Index not ready, using client-side filtering:', indexError.message)
      const querySnapshot = await getDocs(chargesRef)
      let charges = querySnapshot.docs.map(convertFirestoreToReservationSpecialCharge)
      
      // Apply all filters client-side
      if (filters) {
        charges = charges.filter(charge => {
          if (filters.reservationId && charge.reservationId !== filters.reservationId) return false
          if (filters.specialChargeId && charge.specialChargeId !== filters.specialChargeId) return false
          if (filters.createdBy && charge.createdBy !== filters.createdBy) return false
          if (filters.updatedBy && charge.updatedBy !== filters.updatedBy) return false
          if (filters.minAmount && charge.totalAmount < filters.minAmount) return false
          if (filters.maxAmount && charge.totalAmount > filters.maxAmount) return false
          if (filters.minQuantity && charge.quantity < filters.minQuantity) return false
          if (filters.maxQuantity && charge.quantity > filters.maxQuantity) return false
          return true
        })
      }
      
      // Sort by creation date
      charges.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      return charges
    }
  } catch (error) {
    console.error('Error getting reservation special charges:', error)
    throw error
  }
}

// Get reservation special charge by ID
export const getReservationSpecialChargeById = async (id: string): Promise<ReservationSpecialCharge | null> => {
  try {
    const docRef = doc(db, RESERVATION_SPECIAL_CHARGES_COLLECTION, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return convertFirestoreToReservationSpecialCharge(docSnap)
    }
    
    return null
  } catch (error) {
    console.error('Error getting reservation special charge:', error)
    throw error
  }
}

// Get reservation special charges for a specific reservation
export const getReservationSpecialChargesByReservationId = async (reservationId: string): Promise<ReservationSpecialCharge[]> => {
  return getAllReservationSpecialCharges({ reservationId })
}

// Get reservation special charges with full details
export const getReservationSpecialChargesWithDetails = async (filters?: ReservationSpecialChargeFilters): Promise<ReservationSpecialCharge[]> => {
  try {
    const charges = await getAllReservationSpecialCharges(filters)
    
    // Fetch reservation and special charge details
    const chargesWithDetails = await Promise.all(
      charges.map(async (charge) => {
        try {
          const [reservation, specialCharge] = await Promise.all([
            getReservationById(charge.reservationId),
            getSpecialChargeById(charge.specialChargeId)
          ])
          
          return {
            ...charge,
            reservation: reservation ? {
              id: reservation.id,
              referenceNumber: reservation.referenceNumber,
              checkInDate: reservation.checkInDate,
              checkOutDate: reservation.checkOutDate,
              totalPrice: reservation.totalPrice
            } : undefined,
            specialCharge: specialCharge ? {
              id: specialCharge.id,
              chargeName: specialCharge.chargeName,
              defaultRate: specialCharge.defaultRate,
              rateType: specialCharge.rateType,
              description: specialCharge.description
            } : undefined
          }
        } catch (error) {
          console.error(`Error fetching details for reservation special charge ${charge.id}:`, error)
          return charge
        }
      })
    )
    
    return chargesWithDetails
  } catch (error) {
    console.error('Error getting reservation special charges with details:', error)
    throw error
  }
}

// Create new reservation special charge
export const createReservationSpecialCharge = async (
  data: CreateReservationSpecialChargeData, 
  userId: string
): Promise<string> => {
  try {
    // Validate reservation special charge data
    const validation = validateReservationSpecialCharge(data)
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }
    
    // Validate against master special charge data if needed
    const masterCharge = await getSpecialChargeById(data.specialChargeId)
    if (masterCharge) {
      const masterValidation = validateAgainstMasterData(data, {
        defaultRate: masterCharge.defaultRate,
        rateType: masterCharge.rateType,
        chargeName: masterCharge.chargeName
      })
      if (!masterValidation.isValid) {
        throw new Error(`Master data validation failed: ${masterValidation.errors.map(e => e.message).join(', ')}`)
      }
    }
    
    const chargesRef = collection(db, RESERVATION_SPECIAL_CHARGES_COLLECTION)
    const chargeData = {
      ...data,
      quantity: data.quantity || 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
      updatedBy: userId,
      deletedAt: null,
      deletedBy: null
    }
    
    const docRef = await addDoc(chargesRef, chargeData)
    return docRef.id
  } catch (error) {
    console.error('Error creating reservation special charge:', error)
    throw error
  }
}

// Create multiple reservation special charges in batch
export const createReservationSpecialChargesBatch = async (
  chargesData: CreateReservationSpecialChargeData[],
  userId: string
): Promise<string[]> => {
  try {
    // Validate all charges data
    const validation = validateBulkSpecialCharges(chargesData)
    if (!validation.isValid) {
      throw new Error(`Bulk validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }
    
    const batch = writeBatch(db)
    const docIds: string[] = []
    
    for (const data of chargesData) {
      const docRef = doc(collection(db, RESERVATION_SPECIAL_CHARGES_COLLECTION))
      const chargeData = {
        ...data,
        quantity: data.quantity || 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
        updatedBy: userId,
        deletedAt: null,
        deletedBy: null
      }
      
      batch.set(docRef, chargeData)
      docIds.push(docRef.id)
    }
    
    await batch.commit()
    return docIds
  } catch (error) {
    console.error('Error creating reservation special charges batch:', error)
    throw error
  }
}

// Update reservation special charge
export const updateReservationSpecialCharge = async (
  id: string, 
  data: UpdateReservationSpecialChargeData
): Promise<void> => {
  try {
    const docRef = doc(db, RESERVATION_SPECIAL_CHARGES_COLLECTION, id)
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    }
    
    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error('Error updating reservation special charge:', error)
    throw error
  }
}

// Soft delete reservation special charge
export const deleteReservationSpecialCharge = async (id: string, userId: string): Promise<void> => {
  try {
    const docRef = doc(db, RESERVATION_SPECIAL_CHARGES_COLLECTION, id)
    await updateDoc(docRef, {
      deletedAt: serverTimestamp(),
      deletedBy: userId,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })
  } catch (error) {
    console.error('Error deleting reservation special charge:', error)
    throw error
  }
}

// Hard delete reservation special charge (admin only)
export const hardDeleteReservationSpecialCharge = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, RESERVATION_SPECIAL_CHARGES_COLLECTION, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error hard deleting reservation special charge:', error)
    throw error
  }
}

// Delete all reservation special charges for a reservation
export const deleteReservationSpecialChargesByReservationId = async (
  reservationId: string, 
  userId: string
): Promise<void> => {
  try {
    const charges = await getReservationSpecialChargesByReservationId(reservationId)
    const batch = writeBatch(db)
    
    for (const charge of charges) {
      const docRef = doc(db, RESERVATION_SPECIAL_CHARGES_COLLECTION, charge.id)
      batch.update(docRef, {
        deletedAt: serverTimestamp(),
        deletedBy: userId,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      })
    }
    
    await batch.commit()
  } catch (error) {
    console.error('Error deleting reservation special charges by reservation ID:', error)
    throw error
  }
}

// Get reservation special charges by special charge ID
export const getReservationSpecialChargesBySpecialChargeId = async (specialChargeId: string): Promise<ReservationSpecialCharge[]> => {
  return getAllReservationSpecialCharges({ specialChargeId })
}

// Get reservation special charge summary by reservation ID
export const getReservationSpecialChargeSummary = async (reservationId: string): Promise<ReservationSpecialChargeSummary | null> => {
  try {
    const charges = await getReservationSpecialChargesWithDetails({ reservationId })
    
    if (charges.length === 0) {
      return null
    }
    
    const summary: ReservationSpecialChargeSummary = {
      reservationId,
      totalCharges: charges.length,
      totalAmount: charges.reduce((sum, charge) => sum + charge.totalAmount, 0),
      averageAmount: 0,
      charges,
      chargesByType: {}
    }
    
    // Calculate average amount
    summary.averageAmount = summary.totalAmount / summary.totalCharges
    
    // Group charges by type
    charges.forEach(charge => {
      const chargeType = charge.specialCharge?.chargeName || 'Unknown'
      
      if (!summary.chargesByType[chargeType]) {
        summary.chargesByType[chargeType] = {
          count: 0,
          totalAmount: 0,
          charges: []
        }
      }
      
      summary.chargesByType[chargeType].count++
      summary.chargesByType[chargeType].totalAmount += charge.totalAmount
      summary.chargesByType[chargeType].charges.push(charge)
    })
    
    return summary
  } catch (error) {
    console.error('Error getting reservation special charge summary:', error)
    throw error
  }
}

// Calculate special charge with master data
export const calculateSpecialCharge = async (
  specialChargeId: string,
  quantity: number = 1,
  customRate?: number,
  customDescription?: string
): Promise<SpecialChargeCalculation | null> => {
  try {
    const masterCharge = await getSpecialChargeById(specialChargeId)
    if (!masterCharge) {
      return null
    }
    
    const finalRate = customRate ?? masterCharge.defaultRate
    const totalAmount = calculateExpectedTotal(finalRate, quantity)
    const description = customDescription || masterCharge.description || masterCharge.chargeName
    
    return {
      specialChargeId,
      chargeName: masterCharge.chargeName,
      defaultRate: masterCharge.defaultRate,
      rateType: masterCharge.rateType,
      customRate,
      finalRate,
      quantity,
      totalAmount,
      description
    }
  } catch (error) {
    console.error('Error calculating special charge:', error)
    throw error
  }
}

// Add bulk special charges to reservation
export const addBulkSpecialChargesToReservation = async (
  bulkData: BulkSpecialChargeData,
  userId: string
): Promise<{ chargeIds: string[]; totalAmount: number; summary: SpecialChargeCalculation[] }> => {
  try {
    // Calculate each charge first
    const calculations = await Promise.all(
      bulkData.charges.map(charge => 
        calculateSpecialCharge(
          charge.specialChargeId,
          charge.quantity,
          charge.customRate,
          charge.customDescription
        )
      )
    )
    
    // Filter out null calculations
    const validCalculations = calculations.filter((calc): calc is SpecialChargeCalculation => calc !== null)
    
    if (validCalculations.length === 0) {
      throw new Error('No valid special charges found')
    }
    
    // Convert to CreateReservationSpecialChargeData
    const chargesData: CreateReservationSpecialChargeData[] = validCalculations.map(calc => ({
      reservationId: bulkData.reservationId,
      specialChargeId: calc.specialChargeId,
      customRate: calc.customRate,
      customDescription: calc.description !== calc.chargeName ? calc.description : undefined,
      quantity: calc.quantity,
      totalAmount: calc.totalAmount
    }))
    
    // Create all charges in batch
    const chargeIds = await createReservationSpecialChargesBatch(chargesData, userId)
    
    const totalAmount = validCalculations.reduce((sum, calc) => sum + calc.totalAmount, 0)
    
    return {
      chargeIds,
      totalAmount,
      summary: validCalculations
    }
  } catch (error) {
    console.error('Error adding bulk special charges to reservation:', error)
    throw error
  }
}

// Update reservation total with special charges
export const updateReservationTotalWithSpecialCharges = async (
  reservationId: string,
  userId: string
): Promise<{ originalTotal: number; specialChargesTotal: number; newTotal: number }> => {
  try {
    const [reservation, chargesSummary] = await Promise.all([
      getReservationById(reservationId),
      getReservationSpecialChargeSummary(reservationId)
    ])
    
    if (!reservation) {
      throw new Error('Reservation not found')
    }
    
    const originalTotal = reservation.totalPrice
    const specialChargesTotal = chargesSummary?.totalAmount || 0
    const newTotal = originalTotal + specialChargesTotal
    
    // Update reservation total
    await updateDoc(doc(db, 'reservations', reservationId), {
      totalPrice: newTotal,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })
    
    return {
      originalTotal,
      specialChargesTotal,
      newTotal
    }
  } catch (error) {
    console.error('Error updating reservation total with special charges:', error)
    throw error
  }
}

// Get special charges usage statistics
export const getSpecialChargesUsageStats = async (specialChargeId?: string) => {
  try {
    const filters = specialChargeId ? { specialChargeId } : undefined
    const charges = await getAllReservationSpecialCharges(filters)
    
    const stats = charges.reduce((acc, charge) => {
      acc.totalUsage++
      acc.totalAmount += charge.totalAmount
      acc.totalQuantity += charge.quantity
      
      if (charge.customRate !== null && charge.customRate !== undefined) {
        acc.customRateUsage++
      }
      
      return acc
    }, {
      totalUsage: 0,
      totalAmount: 0,
      totalQuantity: 0,
      customRateUsage: 0,
      averageAmount: 0,
      averageQuantity: 0
    })
    
    // Calculate averages
    if (stats.totalUsage > 0) {
      stats.averageAmount = stats.totalAmount / stats.totalUsage
      stats.averageQuantity = stats.totalQuantity / stats.totalUsage
    }
    
    return stats
  } catch (error) {
    console.error('Error getting special charges usage stats:', error)
    throw error
  }
}