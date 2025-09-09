export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'reserved'

export interface Room {
  id: string
  roomNumber: string
  roomTypeId: string
  floorNumber?: number | null
  isActive: boolean
  status: RoomStatus
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  createdBy: string
  updatedBy: string
  deletedBy?: string | null
  // Populated fields (not stored in DB)
  roomType?: {
    id: string
    name: string
    pricePerNight: number
    maxGuests: number
  }
}

export interface CreateRoomData {
  roomNumber: string
  roomTypeId: string
  floorNumber?: number | null
  isActive?: boolean
  status?: RoomStatus
}

export interface UpdateRoomData extends Partial<CreateRoomData> {
  updatedBy: string
  updatedAt: string
}

export interface RoomFilters {
  status?: RoomStatus
  roomTypeId?: string
  floorNumber?: number
  isActive?: boolean
}

export interface RoomStats {
  totalRooms: number
  availableRooms: number
  occupiedRooms: number
  maintenanceRooms: number
  reservedRooms: number
  occupancyRate: number
}