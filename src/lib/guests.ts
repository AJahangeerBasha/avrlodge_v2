// Guests Firestore Operations
// Handles CRUD operations for guests

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
  Guest,
  CreateGuestData,
  UpdateGuestData,
  GuestFilters,
  BulkGuestData,
  BulkGuestResult,
  GuestResult,
  GuestSummary,
  GuestAuditLog,
  ReservationGuestSummary,
  GuestSearchResult,
  GuestMatchResult
} from './types/guests'

const COLLECTION_NAME = 'guests'
const AUDIT_COLLECTION_NAME = 'guestAudits'

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

// Helper function to convert guest data
const convertGuestData = (doc: DocumentSnapshot): Guest | null => {
  if (!doc.exists()) return null
  
  const data = doc.data()
  return {
    id: doc.id,
    reservationId: data.reservationId,
    name: data.name,
    phone: data.phone,
    whatsapp: data.whatsapp,
    telegram: data.telegram,
    pincode: data.pincode,
    state: data.state,
    district: data.district,
    isPrimaryGuest: data.isPrimaryGuest || false,
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    deletedBy: data.deletedBy,
    deletedAt: data.deletedAt ? timestampToString(data.deletedAt) : undefined,
    createdAt: timestampToString(data.createdAt),
    updatedAt: timestampToString(data.updatedAt)
  }
}

// Create audit log entry
const createAuditLog = async (
  guestId: string,
  action: 'created' | 'updated' | 'deleted' | 'restored' | 'primary_changed',
  performedBy: string,
  details?: Record<string, any>,
  previousValues?: Partial<Guest>,
  newValues?: Partial<Guest>
): Promise<void> => {
  try {
    const auditData: Omit<GuestAuditLog, 'id'> = {
      guestId,
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
    console.error('Error creating guest audit log:', error)
    // Don't throw error for audit log failures
  }
}

// Create a new guest
export const createGuest = async (
  data: CreateGuestData,
  userId: string
): Promise<string> => {
  try {
    const now = Timestamp.now()
    
    const guestData = {
      reservationId: data.reservationId || null,
      name: data.name.trim(),
      phone: data.phone.trim(),
      whatsapp: data.whatsapp?.trim(),
      telegram: data.telegram?.trim(),
      pincode: data.pincode?.trim(),
      state: data.state?.trim(),
      district: data.district?.trim(),
      isPrimaryGuest: data.isPrimaryGuest || false,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), guestData)
    
    // Create audit log
    await createAuditLog(docRef.id, 'created', userId, {
      name: data.name,
      phone: data.phone,
      reservationId: data.reservationId,
      isPrimaryGuest: data.isPrimaryGuest
    })

    return docRef.id
  } catch (error) {
    console.error('Error creating guest:', error)
    throw error
  }
}

// Update a guest
export const updateGuest = async (
  guestId: string,
  data: UpdateGuestData,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, guestId)
    
    // Get current guest for audit
    const currentDoc = await getDoc(docRef)
    const currentData = currentDoc.exists() ? convertGuestData(currentDoc) : null
    
    const updateData: any = {
      updatedAt: Timestamp.now(),
      updatedBy: userId
    }
    
    // Only update provided fields and trim strings
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.phone !== undefined) updateData.phone = data.phone.trim()
    if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp?.trim() || null
    if (data.telegram !== undefined) updateData.telegram = data.telegram?.trim() || null
    if (data.pincode !== undefined) updateData.pincode = data.pincode?.trim() || null
    if (data.state !== undefined) updateData.state = data.state?.trim() || null
    if (data.district !== undefined) updateData.district = data.district?.trim() || null
    if (data.isPrimaryGuest !== undefined) updateData.isPrimaryGuest = data.isPrimaryGuest

    await updateDoc(docRef, updateData)
    
    // Create audit log
    await createAuditLog(guestId, 'updated', userId, {
      changes: data
    }, currentData || undefined, data)
  } catch (error) {
    console.error('Error updating guest:', error)
    throw error
  }
}

// Set primary guest for a reservation
export const setPrimaryGuest = async (
  guestId: string,
  reservationId: string,
  userId: string
): Promise<void> => {
  try {
    return await runTransaction(db, async (transaction) => {
      // First, unset any existing primary guest for this reservation
      const existingPrimaryQuery = query(
        collection(db, COLLECTION_NAME),
        where('reservationId', '==', reservationId),
        where('isPrimaryGuest', '==', true),
        where('deletedAt', '==', null)
      )
      
      const existingPrimarySnapshot = await getDocs(existingPrimaryQuery)
      
      existingPrimarySnapshot.docs.forEach(doc => {
        if (doc.id !== guestId) {
          transaction.update(doc.ref, {
            isPrimaryGuest: false,
            updatedAt: Timestamp.now(),
            updatedBy: userId
          })
        }
      })
      
      // Set the new primary guest
      const guestRef = doc(db, COLLECTION_NAME, guestId)
      transaction.update(guestRef, {
        isPrimaryGuest: true,
        updatedAt: Timestamp.now(),
        updatedBy: userId
      })
    })
    
    // Create audit log
    await createAuditLog(guestId, 'primary_changed', userId, {
      reservationId,
      newPrimaryGuest: true
    })
  } catch (error) {
    console.error('Error setting primary guest:', error)
    throw error
  }
}

// Soft delete a guest
export const deleteGuest = async (
  guestId: string,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, guestId)
    
    // Get current guest for audit
    const currentDoc = await getDoc(docRef)
    const currentData = currentDoc.exists() ? convertGuestData(currentDoc) : null
    
    const deleteData = {
      deletedAt: Timestamp.now(),
      deletedBy: userId,
      updatedAt: Timestamp.now(),
      updatedBy: userId
    }

    await updateDoc(docRef, deleteData)
    
    // Create audit log
    await createAuditLog(guestId, 'deleted', userId, {
      guest: currentData
    })
  } catch (error) {
    console.error('Error deleting guest:', error)
    throw error
  }
}

// Restore a soft deleted guest
export const restoreGuest = async (
  guestId: string,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, guestId)
    
    const updateData = {
      deletedAt: null,
      deletedBy: null,
      updatedAt: Timestamp.now(),
      updatedBy: userId
    }

    await updateDoc(docRef, updateData)
    
    // Create audit log
    await createAuditLog(guestId, 'restored', userId)
  } catch (error) {
    console.error('Error restoring guest:', error)
    throw error
  }
}

// Get a single guest by ID
export const getGuestById = async (
  guestId: string
): Promise<Guest | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, guestId)
    const docSnap = await getDoc(docRef)
    return convertGuestData(docSnap)
  } catch (error) {
    console.error('Error getting guest:', error)
    throw error
  }
}

// Get guests with filters
export const getGuests = async (
  filters?: GuestFilters,
  limitCount?: number
): Promise<Guest[]> => {
  try {
    let q: Query = collection(db, COLLECTION_NAME)

    // Apply filters
    if (filters?.reservationId) {
      q = query(q, where('reservationId', '==', filters.reservationId))
    }
    
    if (filters?.state) {
      q = query(q, where('state', '==', filters.state))
    }
    
    if (filters?.district) {
      q = query(q, where('district', '==', filters.district))
    }
    
    if (filters?.isPrimaryGuest !== undefined) {
      q = query(q, where('isPrimaryGuest', '==', filters.isPrimaryGuest))
    }
    
    if (filters?.createdBy) {
      q = query(q, where('createdBy', '==', filters.createdBy))
    }

    // Filter out soft deleted guests by default
    if (filters?.isActive !== false) {
      q = query(q, where('deletedAt', '==', null))
    }

    // Add ordering and limit
    q = query(q, orderBy('createdAt', 'desc'))
    
    if (limitCount) {
      q = query(q, limit(limitCount))
    }

    const querySnapshot = await getDocs(q)
    let guests = querySnapshot.docs
      .map(doc => convertGuestData(doc))
      .filter((guest): guest is Guest => guest !== null)

    // Apply client-side filters for fields that don't work well with Firestore queries
    if (filters?.name) {
      const nameSearch = filters.name.toLowerCase()
      guests = guests.filter(guest => 
        guest.name.toLowerCase().includes(nameSearch)
      )
    }
    
    if (filters?.phone) {
      const phoneSearch = filters.phone.replace(/\D/g, '') // Remove non-digits
      guests = guests.filter(guest => 
        guest.phone.replace(/\D/g, '').includes(phoneSearch)
      )
    }
    
    if (filters?.dateRange) {
      const startDate = new Date(filters.dateRange.start)
      const endDate = new Date(filters.dateRange.end)
      
      guests = guests.filter(guest => {
        const guestDate = new Date(guest.createdAt)
        return guestDate >= startDate && guestDate <= endDate
      })
    }

    return guests
  } catch (error) {
    console.error('Error getting guests:', error)
    
    // Fallback: get all guests and filter client-side
    try {
      const allQuery = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc'),
        ...(limitCount ? [limit(limitCount)] : [])
      )
      
      const fallbackSnapshot = await getDocs(allQuery)
      let guests = fallbackSnapshot.docs
        .map(doc => convertGuestData(doc))
        .filter((guest): guest is Guest => guest !== null)

      // Apply all filters client-side
      if (filters?.reservationId) {
        guests = guests.filter(guest => guest.reservationId === filters.reservationId)
      }
      
      if (filters?.state) {
        guests = guests.filter(guest => guest.state === filters.state)
      }
      
      if (filters?.district) {
        guests = guests.filter(guest => guest.district === filters.district)
      }
      
      if (filters?.isPrimaryGuest !== undefined) {
        guests = guests.filter(guest => guest.isPrimaryGuest === filters.isPrimaryGuest)
      }
      
      if (filters?.createdBy) {
        guests = guests.filter(guest => guest.createdBy === filters.createdBy)
      }
      
      if (filters?.isActive !== false) {
        guests = guests.filter(guest => !guest.deletedAt)
      }
      
      if (filters?.name) {
        const nameSearch = filters.name.toLowerCase()
        guests = guests.filter(guest => 
          guest.name.toLowerCase().includes(nameSearch)
        )
      }
      
      if (filters?.phone) {
        const phoneSearch = filters.phone.replace(/\D/g, '')
        guests = guests.filter(guest => 
          guest.phone.replace(/\D/g, '').includes(phoneSearch)
        )
      }
      
      if (filters?.dateRange) {
        const startDate = new Date(filters.dateRange.start)
        const endDate = new Date(filters.dateRange.end)
        
        guests = guests.filter(guest => {
          const guestDate = new Date(guest.createdAt)
          return guestDate >= startDate && guestDate <= endDate
        })
      }

      return guests
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError)
      throw fallbackError
    }
  }
}

// Get guests by reservation ID
export const getGuestsByReservationId = async (
  reservationId: string
): Promise<Guest[]> => {
  return getGuests({ reservationId, isActive: true })
}

// Get primary guest for a reservation
export const getPrimaryGuestByReservationId = async (
  reservationId: string
): Promise<Guest | null> => {
  try {
    const guests = await getGuests({ 
      reservationId, 
      isPrimaryGuest: true, 
      isActive: true 
    }, 1)
    
    return guests.length > 0 ? guests[0] : null
  } catch (error) {
    console.error('Error getting primary guest:', error)
    throw error
  }
}

// Search guests by phone number (exact and partial matches)
export const searchGuestsByPhone = async (
  phone: string
): Promise<Guest[]> => {
  try {
    const cleanPhone = phone.replace(/\D/g, '') // Remove non-digits
    
    // Try exact match first
    const exactMatches = await getGuests({ phone, isActive: true })
    
    if (exactMatches.length > 0) {
      return exactMatches
    }
    
    // Fallback to partial search (client-side)
    const allGuests = await getGuests({ isActive: true }, 1000)
    
    return allGuests.filter(guest => {
      const guestPhone = guest.phone.replace(/\D/g, '')
      return guestPhone.includes(cleanPhone) || cleanPhone.includes(guestPhone)
    })
  } catch (error) {
    console.error('Error searching guests by phone:', error)
    throw error
  }
}

// Subscribe to guests with real-time updates
export const subscribeToGuests = (
  filters: GuestFilters,
  callback: (guests: Guest[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  try {
    let q: Query = collection(db, COLLECTION_NAME)

    // Apply basic filters that work with Firestore
    if (filters.reservationId) {
      q = query(q, where('reservationId', '==', filters.reservationId))
    }
    
    if (filters.state) {
      q = query(q, where('state', '==', filters.state))
    }
    
    if (filters.isPrimaryGuest !== undefined) {
      q = query(q, where('isPrimaryGuest', '==', filters.isPrimaryGuest))
    }
    
    // Filter out deleted guests
    if (filters.isActive !== false) {
      q = query(q, where('deletedAt', '==', null))
    }
    
    q = query(q, orderBy('createdAt', 'desc'))

    return onSnapshot(
      q,
      (querySnapshot) => {
        let guests = querySnapshot.docs
          .map(doc => convertGuestData(doc))
          .filter((guest): guest is Guest => guest !== null)

        // Apply additional filters client-side
        if (filters.name) {
          const nameSearch = filters.name.toLowerCase()
          guests = guests.filter(guest => 
            guest.name.toLowerCase().includes(nameSearch)
          )
        }
        
        if (filters.phone) {
          const phoneSearch = filters.phone.replace(/\D/g, '')
          guests = guests.filter(guest => 
            guest.phone.replace(/\D/g, '').includes(phoneSearch)
          )
        }
        
        if (filters.district) {
          guests = guests.filter(guest => guest.district === filters.district)
        }
        
        if (filters.createdBy) {
          guests = guests.filter(guest => guest.createdBy === filters.createdBy)
        }
        
        if (filters.dateRange) {
          const startDate = new Date(filters.dateRange.start)
          const endDate = new Date(filters.dateRange.end)
          
          guests = guests.filter(guest => {
            const guestDate = new Date(guest.createdAt)
            return guestDate >= startDate && guestDate <= endDate
          })
        }

        callback(guests)
      },
      (error) => {
        console.error('Error in guests subscription:', error)
        if (onError) onError(error)
      }
    )
  } catch (error) {
    console.error('Error setting up guests subscription:', error)
    if (onError) onError(error as Error)
    return () => {} // Return empty unsubscribe function
  }
}

// Bulk create guests
export const createBulkGuests = async (
  data: BulkGuestData,
  userId: string
): Promise<BulkGuestResult> => {
  try {
    const batch = writeBatch(db)
    const createdGuests: GuestResult[] = []
    const errors: Array<{ guest: any; error: string }> = []
    let primaryGuestId: string | undefined
    
    for (const [index, guest] of data.guests.entries()) {
      try {
        const docRef = doc(collection(db, COLLECTION_NAME))
        const now = Timestamp.now()
        
        // First guest is primary by default
        const isPrimaryGuest = index === 0
        
        const guestData = {
          reservationId: data.reservationId,
          name: guest.name.trim(),
          phone: guest.phone.trim(),
          whatsapp: guest.whatsapp?.trim(),
          telegram: guest.telegram?.trim(),
          pincode: guest.pincode?.trim(),
          state: guest.state?.trim(),
          district: guest.district?.trim(),
          isPrimaryGuest,
          createdAt: now,
          updatedAt: now,
          createdBy: userId,
          updatedBy: userId
        }
        
        batch.set(docRef, guestData)
        
        createdGuests.push({
          guestId: docRef.id,
          name: guest.name,
          phone: guest.phone,
          isPrimaryGuest,
          createdAt: new Date().toISOString()
        })
        
        if (isPrimaryGuest) {
          primaryGuestId = docRef.id
        }
        
        // Create audit log (fire and forget)
        createAuditLog(docRef.id, 'created', userId, {
          name: guest.name,
          phone: guest.phone,
          reservationId: data.reservationId,
          isPrimaryGuest,
          bulkOperation: true
        })
        
      } catch (error) {
        errors.push({
          guest,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    if (createdGuests.length > 0) {
      await batch.commit()
    }
    
    return {
      reservationId: data.reservationId,
      createdGuests,
      totalGuests: createdGuests.length,
      primaryGuestId,
      errors: errors.length > 0 ? errors : undefined
    }
  } catch (error) {
    console.error('Error in bulk guest creation:', error)
    throw error
  }
}

// Delete all guests for a reservation (soft delete)
export const deleteGuestsByReservationId = async (
  reservationId: string,
  userId: string
): Promise<{ deletedCount: number }> => {
  try {
    const guests = await getGuestsByReservationId(reservationId)
    
    if (guests.length === 0) {
      return { deletedCount: 0 }
    }
    
    const batch = writeBatch(db)
    const now = Timestamp.now()
    
    for (const guest of guests) {
      const docRef = doc(db, COLLECTION_NAME, guest.id)
      batch.update(docRef, {
        deletedAt: now,
        deletedBy: userId,
        updatedAt: now,
        updatedBy: userId
      })
      
      // Create audit log (fire and forget)
      createAuditLog(guest.id, 'deleted', userId, {
        reservationId,
        bulkOperation: true
      })
    }
    
    await batch.commit()
    
    return { deletedCount: guests.length }
  } catch (error) {
    console.error('Error deleting guests by reservation ID:', error)
    throw error
  }
}

// Get guest summary for a reservation
export const getGuestSummary = async (
  reservationId: string
): Promise<GuestSummary | null> => {
  try {
    const guests = await getGuestsByReservationId(reservationId)
    
    if (guests.length === 0) {
      return null
    }
    
    // Find primary guest
    const primaryGuest = guests.find(guest => guest.isPrimaryGuest)
    
    // Count by state
    const guestsByState = guests.reduce((acc, guest) => {
      if (guest.state) {
        acc[guest.state] = (acc[guest.state] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
    
    // Count by district
    const guestsByDistrict = guests.reduce((acc, guest) => {
      if (guest.district) {
        acc[guest.district] = (acc[guest.district] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
    
    // Check contact information completeness
    const missingContactInfo = guests
      .filter(guest => !guest.phone || (!guest.whatsapp && !guest.telegram))
      .map(guest => ({
        guestId: guest.id,
        name: guest.name,
        missingFields: [
          !guest.phone ? 'phone' : '',
          !guest.whatsapp ? 'whatsapp' : '',
          !guest.telegram ? 'telegram' : ''
        ].filter(field => field !== '')
      }))
    
    return {
      reservationId,
      totalGuests: guests.length,
      primaryGuest,
      guestsByState,
      guestsByDistrict,
      hasAllContactInfo: missingContactInfo.length === 0,
      missingContactInfo
    }
  } catch (error) {
    console.error('Error getting guest summary:', error)
    throw error
  }
}

// Get reservation guest summary with detailed info
export const getReservationGuestSummary = async (
  reservationId: string
): Promise<ReservationGuestSummary | null> => {
  try {
    const guests = await getGuestsByReservationId(reservationId)
    
    if (guests.length === 0) {
      return null
    }
    
    const primaryGuest = guests.find(guest => guest.isPrimaryGuest)
    const additionalGuests = guests.filter(guest => !guest.isPrimaryGuest)
    
    if (!primaryGuest) {
      throw new Error('No primary guest found for reservation')
    }
    
    // Contact summary
    const uniquePhones = new Set(guests.map(guest => guest.phone)).size
    const hasWhatsApp = guests.filter(guest => guest.whatsapp).length
    const hasTelegram = guests.filter(guest => guest.telegram).length
    
    // Location summary
    const states = [...new Set(guests.map(guest => guest.state).filter(Boolean))]
    const districts = [...new Set(guests.map(guest => guest.district).filter(Boolean))]
    const pincodes = [...new Set(guests.map(guest => guest.pincode).filter(Boolean))]
    
    // Missing contact info
    const missingContactGuests = guests
      .filter(guest => !guest.phone)
      .map(guest => guest.id)
    
    return {
      reservationId,
      totalGuests: guests.length,
      primaryGuest,
      additionalGuests,
      contactSummary: {
        totalContacts: guests.length,
        uniquePhones,
        hasWhatsApp,
        hasTelegram
      },
      locationSummary: {
        states,
        districts,
        pincodes
      },
      allGuestsHaveContact: missingContactGuests.length === 0,
      missingContactGuests
    }
  } catch (error) {
    console.error('Error getting reservation guest summary:', error)
    throw error
  }
}

// Advanced guest search
export const searchGuests = async (
  searchQuery: string,
  searchType: 'name' | 'phone' | 'location' | 'general' = 'general',
  limitCount: number = 50
): Promise<GuestSearchResult> => {
  try {
    let guests: Guest[] = []
    const suggestions: string[] = []
    
    const cleanQuery = searchQuery.trim().toLowerCase()
    
    if (searchType === 'phone' || (searchType === 'general' && /\d/.test(cleanQuery))) {
      // Phone search
      guests = await searchGuestsByPhone(searchQuery)
    } else {
      // Get all guests for comprehensive search (in production, use search service)
      const allGuests = await getGuests({ isActive: true }, 1000)
      
      if (searchType === 'name' || searchType === 'general') {
        guests = allGuests.filter(guest =>
          guest.name.toLowerCase().includes(cleanQuery)
        )
      }
      
      if (searchType === 'location' || (searchType === 'general' && guests.length < 5)) {
        const locationMatches = allGuests.filter(guest =>
          guest.state?.toLowerCase().includes(cleanQuery) ||
          guest.district?.toLowerCase().includes(cleanQuery) ||
          guest.pincode?.includes(cleanQuery)
        )
        
        // Merge and deduplicate
        const guestIds = new Set(guests.map(g => g.id))
        locationMatches.forEach(guest => {
          if (!guestIds.has(guest.id)) {
            guests.push(guest)
          }
        })
      }
    }
    
    // Limit results
    guests = guests.slice(0, limitCount)
    
    // Generate suggestions
    if (guests.length === 0) {
      suggestions.push('Try searching with partial name or phone number')
      suggestions.push('Check spelling or try different keywords')
    } else if (guests.length === 1) {
      suggestions.push('Try related searches like phone number or location')
    }
    
    return {
      guests,
      totalMatches: guests.length,
      searchQuery,
      searchType,
      suggestions
    }
  } catch (error) {
    console.error('Error searching guests:', error)
    throw error
  }
}

// Find potential duplicate guests
export const findGuestMatches = async (
  guestData: CreateGuestData
): Promise<GuestMatchResult> => {
  try {
    const cleanPhone = guestData.phone.replace(/\D/g, '')
    const cleanName = guestData.name.toLowerCase().trim()
    
    // Get all guests for matching (in production, use indexed search)
    const allGuests = await getGuests({ isActive: true }, 1000)
    
    // Exact phone matches
    const phoneMatches = allGuests.filter(guest =>
      guest.phone.replace(/\D/g, '') === cleanPhone
    )
    
    // Exact name matches
    const nameMatches = allGuests.filter(guest =>
      guest.name.toLowerCase().trim() === cleanName
    )
    
    // Location matches (same state and district)
    const locationMatches = allGuests.filter(guest =>
      guestData.state && guestData.district &&
      guest.state === guestData.state &&
      guest.district === guestData.district
    )
    
    // Find exact matches (same phone OR same name)
    const exactMatches = [...phoneMatches, ...nameMatches]
      .filter((guest, index, arr) => arr.findIndex(g => g.id === guest.id) === index)
    
    // Determine confidence
    let confidence: 'high' | 'medium' | 'low' = 'low'
    
    if (phoneMatches.length > 0) {
      confidence = 'high' // Phone number is the strongest indicator
    } else if (nameMatches.length > 0) {
      confidence = 'medium'
    } else if (locationMatches.length > 0) {
      confidence = 'low'
    }
    
    return {
      exactMatches,
      phoneMatches,
      nameMatches,
      locationMatches,
      hasExactMatch: exactMatches.length > 0,
      hasPotentialDuplicate: exactMatches.length > 0 || 
                           (nameMatches.length > 0 && locationMatches.length > 0),
      confidence
    }
  } catch (error) {
    console.error('Error finding guest matches:', error)
    throw error
  }
}

// Get guest audit logs
export const getGuestAuditLogs = async (
  guestId: string,
  limitCount: number = 50
): Promise<GuestAuditLog[]> => {
  try {
    const q = query(
      collection(db, AUDIT_COLLECTION_NAME),
      where('guestId', '==', guestId),
      orderBy('performedAt', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      ...doc.data() as Omit<GuestAuditLog, 'performedAt'>,
      performedAt: timestampToString(doc.data().performedAt)
    }))
  } catch (error) {
    console.error('Error getting guest audit logs:', error)
    throw error
  }
}