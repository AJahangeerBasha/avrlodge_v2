export type RoomStatus = 'pending' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'

export interface ReservationRoom {
  id: string
  reservationId: string
  roomId: string
  roomNumber: string
  roomType: string
  guestCount: number
  tariffPerNight: number
  roomStatus: RoomStatus
  checkInDatetime?: string | null // ISO datetime string
  checkOutDatetime?: string | null // ISO datetime string
  checkedInBy?: string | null // Firebase user ID
  checkedOutBy?: string | null // Firebase user ID
  checkInNotes?: string | null
  checkOutNotes?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  createdBy: string
  updatedBy: string
  deletedBy?: string | null
  // Populated fields (not stored in DB)
  reservation?: {
    id: string
    referenceNumber: string
    checkInDate: string
    checkOutDate: string
    totalPrice: number
  }
  room?: {
    id: string
    roomNumber: string
    roomTypeName: string
    maxGuests: number
    status: string
  }
}

export interface CreateReservationRoomData {
  reservationId: string
  roomId: string
  roomNumber: string
  roomType: string
  guestCount?: number
  tariffPerNight: number
  roomStatus?: RoomStatus
  checkInDatetime?: string
  checkOutDatetime?: string
  checkedInBy?: string
  checkedOutBy?: string
  checkInNotes?: string
  checkOutNotes?: string
}

export interface UpdateReservationRoomData extends Partial<CreateReservationRoomData> {
  updatedBy: string
  updatedAt: string
}

export interface CheckInData {
  checkInDatetime: string
  checkedInBy: string
  checkInNotes?: string
  roomStatus?: RoomStatus
}

export interface CheckOutData {
  checkOutDatetime: string
  checkedOutBy: string
  checkOutNotes?: string
  roomStatus?: RoomStatus
}

export interface ReservationRoomFilters {
  reservationId?: string
  roomId?: string
  roomStatus?: RoomStatus
  roomType?: string
  checkedInBy?: string
  checkedOutBy?: string
  createdBy?: string
  checkInDateFrom?: string
  checkInDateTo?: string
  checkOutDateFrom?: string
  checkOutDateTo?: string
}

export interface ReservationRoomStats {
  totalRooms: number
  pendingRooms: number
  checkedInRooms: number
  checkedOutRooms: number
  cancelledRooms: number
  noShowRooms: number
  totalRevenue: number
  averageStayDuration: number
  occupancyRate: number
}

export interface ReservationRoomSummary {
  reservationId: string
  totalRooms: number
  totalGuests: number
  totalTariff: number
  roomStatuses: Record<RoomStatus, number>
  rooms: ReservationRoom[]
}