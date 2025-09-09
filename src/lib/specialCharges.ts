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
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import { SpecialCharge, CreateSpecialChargeData, UpdateSpecialChargeData, SpecialChargeFilters, SpecialChargeStats, RateType } from './types/specialCharges'

const SPECIAL_CHARGES_COLLECTION = 'specialCharges'

// Convert Firestore data to SpecialCharge interface
const convertFirestoreToSpecialCharge = (doc: any): SpecialCharge => {
  const data = doc.data()
  return {
    id: doc.id,
    chargeName: data.chargeName,
    defaultRate: data.defaultRate,
    rateType: data.rateType,
    description: data.description || null,
    isActive: data.isActive ?? true,
    createdBy: data.createdBy || null,
    updatedBy: data.updatedBy || null,
    deletedBy: data.deletedBy || null,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    deletedAt: data.deletedAt ? 
      (data.deletedAt instanceof Timestamp ? data.deletedAt.toDate().toISOString() : data.deletedAt) : null
  }
}

// Get all special charges
export const getAllSpecialCharges = async (filters?: SpecialChargeFilters): Promise<SpecialCharge[]> => {
  try {
    const chargesRef = collection(db, SPECIAL_CHARGES_COLLECTION)
    
    // Try with optimized query first
    try {
      let q = query(chargesRef)
      
      // Apply filters
      if (filters?.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive))
      }
      if (filters?.rateType) {
        q = query(q, where('rateType', '==', filters.rateType))
      }
      
      // Order by charge name
      if (!filters || Object.keys(filters).length <= 1) {
        q = query(q, orderBy('chargeName'))
      }
      
      const querySnapshot = await getDocs(q)
      let charges = querySnapshot.docs.map(convertFirestoreToSpecialCharge)
      
      // Client-side sorting if we couldn't use orderBy
      if (filters && Object.keys(filters).length > 1) {
        charges.sort((a, b) => a.chargeName.localeCompare(b.chargeName))
      }
      
      return charges
    } catch (indexError) {
      // Fallback: Get all docs and filter/sort in client
      console.warn('Index not ready, using client-side filtering:', indexError.message)
      const querySnapshot = await getDocs(chargesRef)
      let charges = querySnapshot.docs.map(convertFirestoreToSpecialCharge)
      
      // Apply filters client-side
      if (filters?.isActive !== undefined) {
        charges = charges.filter(charge => charge.isActive === filters.isActive)
      }
      if (filters?.rateType) {
        charges = charges.filter(charge => charge.rateType === filters.rateType)
      }
      
      // Sort by charge name
      charges.sort((a, b) => a.chargeName.localeCompare(b.chargeName))
      
      return charges
    }
  } catch (error) {
    console.error('Error getting special charges:', error)
    throw error
  }
}

// Get special charge by ID
export const getSpecialChargeById = async (id: string): Promise<SpecialCharge | null> => {
  try {
    const docRef = doc(db, SPECIAL_CHARGES_COLLECTION, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return convertFirestoreToSpecialCharge(docSnap)
    }
    
    return null
  } catch (error) {
    console.error('Error getting special charge:', error)
    throw error
  }
}

// Create new special charge
export const createSpecialCharge = async (
  data: CreateSpecialChargeData, 
  userId: string
): Promise<string> => {
  try {
    const chargesRef = collection(db, SPECIAL_CHARGES_COLLECTION)
    const chargeData = {
      ...data,
      isActive: data.isActive ?? true,
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
    console.error('Error creating special charge:', error)
    throw error
  }
}

// Update special charge
export const updateSpecialCharge = async (
  id: string, 
  data: UpdateSpecialChargeData
): Promise<void> => {
  try {
    const docRef = doc(db, SPECIAL_CHARGES_COLLECTION, id)
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    }
    
    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error('Error updating special charge:', error)
    throw error
  }
}

// Soft delete special charge
export const deleteSpecialCharge = async (id: string, userId: string): Promise<void> => {
  try {
    const docRef = doc(db, SPECIAL_CHARGES_COLLECTION, id)
    await updateDoc(docRef, {
      isActive: false,
      deletedAt: serverTimestamp(),
      deletedBy: userId,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })
  } catch (error) {
    console.error('Error deleting special charge:', error)
    throw error
  }
}

// Hard delete special charge (admin only)
export const hardDeleteSpecialCharge = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, SPECIAL_CHARGES_COLLECTION, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error hard deleting special charge:', error)
    throw error
  }
}

// Get active special charges
export const getActiveSpecialCharges = async (): Promise<SpecialCharge[]> => {
  return getAllSpecialCharges({ isActive: true })
}

// Get special charges by rate type
export const getSpecialChargesByRateType = async (rateType: RateType): Promise<SpecialCharge[]> => {
  return getAllSpecialCharges({ isActive: true, rateType })
}

// Get special charges statistics
export const getSpecialChargesStats = async (): Promise<SpecialChargeStats> => {
  try {
    const charges = await getAllSpecialCharges({ isActive: true })
    
    const stats = charges.reduce((acc, charge) => {
      acc.totalCharges++
      if (charge.isActive) {
        acc.activeCharges++
      }
      
      switch (charge.rateType) {
        case 'per_day':
          acc.perDayCharges++
          break
        case 'per_person':
          acc.perPersonCharges++
          break
        case 'fixed':
          acc.fixedCharges++
          break
      }
      
      return acc
    }, {
      totalCharges: 0,
      activeCharges: 0,
      perDayCharges: 0,
      perPersonCharges: 0,
      fixedCharges: 0,
      averageRate: 0
    })
    
    // Calculate average rate
    if (charges.length > 0) {
      stats.averageRate = charges.reduce((sum, charge) => sum + charge.defaultRate, 0) / charges.length
    }
    
    return stats
  } catch (error) {
    console.error('Error getting special charges stats:', error)
    throw error
  }
}

// Search special charges by name
export const searchSpecialCharges = async (searchTerm: string): Promise<SpecialCharge[]> => {
  try {
    const charges = await getAllSpecialCharges({ isActive: true })
    return charges.filter(charge => 
      charge.chargeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charge.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  } catch (error) {
    console.error('Error searching special charges:', error)
    throw error
  }
}