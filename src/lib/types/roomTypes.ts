export interface RoomType {
  id: string
  name: string
  pricePerNight: number
  maxGuests: number
  numberOfRooms: number
  description?: string
  amenities: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  createdBy: string
  updatedBy: string
  deletedBy?: string | null
}

export interface CreateRoomTypeData {
  name: string
  pricePerNight: number
  maxGuests: number
  numberOfRooms: number
  description?: string
  amenities: string[]
  isActive?: boolean
}

export interface UpdateRoomTypeData extends Partial<CreateRoomTypeData> {
  updatedBy: string
  updatedAt: string
}