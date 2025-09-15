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
import { Room, CreateRoomData, UpdateRoomData, RoomFilters, RoomStats, RoomStatus } from './types/rooms'
import { getRoomTypeById } from './roomTypes'

const ROOMS_COLLECTION = 'rooms'

// Convert Firestore data to Room interface
const convertFirestoreToRoom = (doc: any): Room => {
  const data = doc.data()
  return {
    id: doc.id,
    roomNumber: data.roomNumber,
    roomTypeId: data.roomTypeId,
    floorNumber: data.floorNumber || null,
    isActive: data.isActive ?? true,
    status: data.status || 'available',
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    deletedAt: data.deletedAt ? 
      (data.deletedAt instanceof Timestamp ? data.deletedAt.toDate().toISOString() : data.deletedAt) : null,
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    deletedBy: data.deletedBy || null
  }
}

// Get all rooms
export const getAllRooms = async (filters?: RoomFilters): Promise<Room[]> => {
  try {
    const roomsRef = collection(db, ROOMS_COLLECTION)
    
    // Try with optimized query first (may require index)
    try {
      let q = query(roomsRef)
      
      // Apply filters
      if (filters?.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive))
      }
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }
      if (filters?.roomTypeId) {
        q = query(q, where('roomTypeId', '==', filters.roomTypeId))
      }
      if (filters?.floorNumber) {
        q = query(q, where('floorNumber', '==', filters.floorNumber))
      }
      
      // Order by room number (may require composite index)
      if (!filters || Object.keys(filters).length <= 1) {
        q = query(q, orderBy('roomNumber'))
      }
      
      const querySnapshot = await getDocs(q)
      const rooms = querySnapshot.docs.map(convertFirestoreToRoom)
      
      // Client-side sorting if we couldn't use orderBy
      if (filters && Object.keys(filters).length > 1) {
        rooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber))
      }
      
      return rooms
    } catch (indexError) {
      // Fallback: Get all docs and filter/sort in client
      console.warn('Index not ready, using client-side filtering:', indexError.message)
      const querySnapshot = await getDocs(roomsRef)
      let rooms = querySnapshot.docs.map(convertFirestoreToRoom)
      
      // Apply filters client-side
      if (filters?.isActive !== undefined) {
        rooms = rooms.filter(room => room.isActive === filters.isActive)
      }
      if (filters?.status) {
        rooms = rooms.filter(room => room.status === filters.status)
      }
      if (filters?.roomTypeId) {
        rooms = rooms.filter(room => room.roomTypeId === filters.roomTypeId)
      }
      if (filters?.floorNumber) {
        rooms = rooms.filter(room => room.floorNumber === filters.floorNumber)
      }
      
      // Sort by room number
      rooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber))
      
      return rooms
    }
  } catch (error) {
    console.error('Error getting rooms:', error)
    throw error
  }
}

// Get room by ID
export const getRoomById = async (id: string): Promise<Room | null> => {
  try {
    const docRef = doc(db, ROOMS_COLLECTION, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return convertFirestoreToRoom(docSnap)
    }

    return null
  } catch (error) {
    console.error('Error getting room:', error)
    throw error
  }
}

// Get room by room number
export const getRoomByNumber = async (roomNumber: string): Promise<Room | null> => {
  try {
    const roomsRef = collection(db, ROOMS_COLLECTION)
    const q = query(roomsRef, where('roomNumber', '==', roomNumber))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    return convertFirestoreToRoom(querySnapshot.docs[0])
  } catch (error) {
    console.error('Error getting room by number:', error)
    throw error
  }
}

// Get rooms with room type details
export const getRoomsWithType = async (filters?: RoomFilters): Promise<Room[]> => {
  try {
    const rooms = await getAllRooms(filters)
    
    // Fetch room type details for each room
    const roomsWithType = await Promise.all(
      rooms.map(async (room) => {
        try {
          const roomType = await getRoomTypeById(room.roomTypeId)
          return {
            ...room,
            roomType: roomType ? {
              id: roomType.id,
              name: roomType.name,
              pricePerNight: roomType.pricePerNight,
              maxGuests: roomType.maxGuests
            } : undefined
          }
        } catch (error) {
          console.error(`Error fetching room type for room ${room.id}:`, error)
          return room
        }
      })
    )
    
    return roomsWithType
  } catch (error) {
    console.error('Error getting rooms with type:', error)
    throw error
  }
}

// Create new room
export const createRoom = async (
  data: CreateRoomData, 
  userId: string
): Promise<string> => {
  try {
    const roomsRef = collection(db, ROOMS_COLLECTION)
    const roomData = {
      ...data,
      isActive: data.isActive ?? true,
      status: data.status ?? 'available',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
      updatedBy: userId,
      deletedAt: null,
      deletedBy: null
    }
    
    const docRef = await addDoc(roomsRef, roomData)
    return docRef.id
  } catch (error) {
    console.error('Error creating room:', error)
    throw error
  }
}

// Update room
export const updateRoom = async (
  id: string, 
  data: UpdateRoomData
): Promise<void> => {
  try {
    const docRef = doc(db, ROOMS_COLLECTION, id)
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    }
    
    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error('Error updating room:', error)
    throw error
  }
}

// Update room status
export const updateRoomStatus = async (
  id: string, 
  status: RoomStatus,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, ROOMS_COLLECTION, id)
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })
  } catch (error) {
    console.error('Error updating room status:', error)
    throw error
  }
}

// Soft delete room
export const deleteRoom = async (id: string, userId: string): Promise<void> => {
  try {
    const docRef = doc(db, ROOMS_COLLECTION, id)
    await updateDoc(docRef, {
      isActive: false,
      deletedAt: serverTimestamp(),
      deletedBy: userId,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })
  } catch (error) {
    console.error('Error deleting room:', error)
    throw error
  }
}

// Hard delete room (admin only)
export const hardDeleteRoom = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, ROOMS_COLLECTION, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error hard deleting room:', error)
    throw error
  }
}

// Get available rooms
export const getAvailableRooms = async (): Promise<Room[]> => {
  return getAllRooms({
    isActive: true,
    status: 'available'
  })
}

// Get rooms by status
export const getRoomsByStatus = async (status: RoomStatus): Promise<Room[]> => {
  return getAllRooms({
    isActive: true,
    status
  })
}

// Get room statistics
export const getRoomStats = async (): Promise<RoomStats> => {
  try {
    const rooms = await getAllRooms({ isActive: true })
    
    const stats = rooms.reduce((acc, room) => {
      acc.totalRooms++
      switch (room.status) {
        case 'available':
          acc.availableRooms++
          break
        case 'occupied':
          acc.occupiedRooms++
          break
        case 'maintenance':
          acc.maintenanceRooms++
          break
        case 'reserved':
          acc.reservedRooms++
          break
      }
      return acc
    }, {
      totalRooms: 0,
      availableRooms: 0,
      occupiedRooms: 0,
      maintenanceRooms: 0,
      reservedRooms: 0,
      occupancyRate: 0
    })
    
    stats.occupancyRate = stats.totalRooms > 0 
      ? ((stats.occupiedRooms + stats.reservedRooms) / stats.totalRooms) * 100 
      : 0
    
    return stats
  } catch (error) {
    console.error('Error getting room stats:', error)
    throw error
  }
}

// Get rooms by floor
export const getRoomsByFloor = async (floorNumber: number): Promise<Room[]> => {
  return getAllRooms({
    isActive: true,
    floorNumber
  })
}

// Search rooms by room number
export const searchRoomsByNumber = async (searchTerm: string): Promise<Room[]> => {
  try {
    const rooms = await getAllRooms({ isActive: true })
    return rooms.filter(room =>
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
  } catch (error) {
    console.error('Error searching rooms:', error)
    throw error
  }
}

// Subscribe to real-time rooms updates
export const subscribeToRooms = (
  callback: (rooms: Room[]) => void,
  filters?: RoomFilters
): Unsubscribe => {
  try {
    let q = query(collection(db, ROOMS_COLLECTION), orderBy('createdAt', 'desc'))

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status))
    }

    if (filters?.roomTypeId) {
      q = query(q, where('roomTypeId', '==', filters.roomTypeId))
    }

    if (filters?.floorNumber !== undefined) {
      q = query(q, where('floorNumber', '==', filters.floorNumber))
    }

    if (filters?.isActive !== undefined) {
      q = query(q, where('isActive', '==', filters.isActive))
    }

    return onSnapshot(q, async (querySnapshot) => {
      let rooms = querySnapshot.docs.map(convertFirestoreToRoom)

      // Populate room types
      const roomsWithType = await Promise.all(
        rooms.map(async (room) => {
          try {
            const roomType = await getRoomTypeById(room.roomTypeId)
            return {
              ...room,
              roomType: roomType ? {
                id: roomType.id,
                name: roomType.name,
                pricePerNight: roomType.pricePerNight,
                maxGuests: roomType.maxGuests
              } : undefined
            }
          } catch (error) {
            console.error(`Failed to load room type for room ${room.id}:`, error)
            return room
          }
        })
      )

      callback(roomsWithType)
    })
  } catch (error) {
    console.error('Error subscribing to rooms:', error)
    throw new Error('Failed to subscribe to rooms')
  }
}