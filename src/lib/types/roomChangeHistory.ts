export interface RoomChangeHistory {
  id: string
  reservationId: string
  fromRoomId?: string | null
  fromRoomNumber?: string | null
  fromRoomType?: string | null
  toRoomId: string
  toRoomNumber: string
  toRoomType?: string | null
  changeReason?: string
  changeDate: string
  changedBy: string
  changedByUserName?: string
  guestCount?: number
  preservedStatus?: 'pending' | 'checked_in' | 'checked_out'
  preservedCheckInDate?: string | null
  preservedCheckOutDate?: string | null
  notes?: string
  createdAt: string
  updatedAt?: string
}

export interface CreateRoomChangeHistoryData {
  reservationId: string
  fromRoomId?: string | null
  fromRoomNumber?: string | null
  fromRoomType?: string | null
  toRoomId: string
  toRoomNumber: string
  toRoomType?: string | null
  changeReason?: string
  guestCount?: number
  preservedStatus?: 'pending' | 'checked_in' | 'checked_out'
  preservedCheckInDate?: string | null
  preservedCheckOutDate?: string | null
  notes?: string
}

export interface RoomChangeHistoryFilters {
  reservationId?: string
  fromRoomId?: string
  toRoomId?: string
  changedBy?: string
  startDate?: string
  endDate?: string
  isActive?: boolean
}

export interface RoomChangeHistorySummary {
  reservationId: string
  totalChanges: number
  lastChangeDate?: string
  lastChangedBy?: string
  roomHistory: Array<{
    roomNumber: string
    roomType?: string
    period: string
    status?: string
  }>
}