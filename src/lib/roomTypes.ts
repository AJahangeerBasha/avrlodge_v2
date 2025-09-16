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
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore'
import { db } from './firebase'
import { RoomType, CreateRoomTypeData, UpdateRoomTypeData } from './types/roomTypes'

const ROOM_TYPES_COLLECTION = 'roomTypes'

// Convert Firestore data to RoomType interface
const convertFirestoreToRoomType = (doc: any): RoomType => {
  const data = doc.data()
  return {
    id: doc.id,
    name: data.name,
    pricePerNight: data.pricePerNight,
    maxGuests: data.maxGuests,
    numberOfRooms: data.numberOfRooms,
    description: data.description || null,
    amenities: data.amenities || [],
    isActive: data.isActive ?? true,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    deletedAt: data.deletedAt ? 
      (data.deletedAt instanceof Timestamp ? data.deletedAt.toDate().toISOString() : data.deletedAt) : null,
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    deletedBy: data.deletedBy || null
  }
}

// Get all room types
export const getAllRoomTypes = async (): Promise<RoomType[]> => {
  try {
    const roomTypesRef = collection(db, ROOM_TYPES_COLLECTION)
    
    // Try with composite query first (requires index)
    try {
      const q = query(
        roomTypesRef, 
        where('isActive', '==', true),
        orderBy('name')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(convertFirestoreToRoomType)
    } catch (indexError) {
      // Fallback: Get all docs and filter/sort in client
      console.warn('Index not ready, using client-side filtering:', indexError.message)
      const querySnapshot = await getDocs(roomTypesRef)
      const roomTypes = querySnapshot.docs
        .map(convertFirestoreToRoomType)
        .filter(roomType => roomType.isActive)
        .sort((a, b) => a.name.localeCompare(b.name))
      
      return roomTypes
    }
  } catch (error) {
    console.error('Error getting room types:', error)
    throw error
  }
}

// Get room type by ID
export const getRoomTypeById = async (id: string): Promise<RoomType | null> => {
  try {
    const docRef = doc(db, ROOM_TYPES_COLLECTION, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return convertFirestoreToRoomType(docSnap)
    }
    
    return null
  } catch (error) {
    console.error('Error getting room type:', error)
    throw error
  }
}

// Create new room type
export const createRoomType = async (
  data: CreateRoomTypeData, 
  userId: string
): Promise<string> => {
  try {
    const roomTypesRef = collection(db, ROOM_TYPES_COLLECTION)
    const roomTypeData = {
      ...data,
      isActive: data.isActive ?? true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
      updatedBy: userId,
      deletedAt: null,
      deletedBy: null
    }
    
    const docRef = await addDoc(roomTypesRef, roomTypeData)
    return docRef.id
  } catch (error) {
    console.error('Error creating room type:', error)
    throw error
  }
}

// Update room type
export const updateRoomType = async (
  id: string, 
  data: UpdateRoomTypeData
): Promise<void> => {
  try {
    const docRef = doc(db, ROOM_TYPES_COLLECTION, id)
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    }
    
    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error('Error updating room type:', error)
    throw error
  }
}

// Soft delete room type
export const deleteRoomType = async (id: string, userId: string): Promise<void> => {
  try {
    const docRef = doc(db, ROOM_TYPES_COLLECTION, id)
    await updateDoc(docRef, {
      isActive: false,
      deletedAt: serverTimestamp(),
      deletedBy: userId,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })
  } catch (error) {
    console.error('Error deleting room type:', error)
    throw error
  }
}

// Hard delete room type (admin only)
export const hardDeleteRoomType = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, ROOM_TYPES_COLLECTION, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error hard deleting room type:', error)
    throw error
  }
}

// Get available room types (active and with available rooms)
export const getAvailableRoomTypes = async (): Promise<RoomType[]> => {
  try {
    const roomTypesRef = collection(db, ROOM_TYPES_COLLECTION)
    const q = query(
      roomTypesRef,
      where('isActive', '==', true),
      where('numberOfRooms', '>', 0),
      orderBy('pricePerNight')
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(convertFirestoreToRoomType)
  } catch (error) {
    console.error('Error getting available room types:', error)
    throw error
  }
}

// Subscribe to real-time room types updates
export const subscribeToRoomTypes = (
  callback: (roomTypes: RoomType[]) => void,
  filters?: { isActive?: boolean }
): Unsubscribe => {
  try {
    let q = query(collection(db, ROOM_TYPES_COLLECTION), orderBy('createdAt', 'desc'))

    if (filters?.isActive !== undefined) {
      q = query(q, where('isActive', '==', filters.isActive))
    }

    return onSnapshot(q, (querySnapshot) => {
      const roomTypes = querySnapshot.docs.map(convertFirestoreToRoomType)
      callback(roomTypes)
    })
  } catch (error) {
    console.error('Error subscribing to room types:', error)
    throw new Error('Failed to subscribe to room types')
  }
}