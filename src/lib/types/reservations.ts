export type ReservationStatus = 'reservation' | 'booking' | 'checked_in' | 'checked_out' | 'cancelled'
export type PaymentStatus = 'pending' | 'partial' | 'paid'
export type GuestType = 'individual' | 'family' | 'group' | 'corporate' | 'wedding' | 'event'

export interface Reservation {
  id: string
  roomId: string
  checkInDate: string // ISO date string (YYYY-MM-DD)
  checkOutDate: string // ISO date string (YYYY-MM-DD)
  guestCount: number
  specialRequests?: string | null
  referenceNumber: string // Format: MMYYYY-XX (e.g., "012025-001")
  approxCheckInTime?: string | null // HH:MM format
  approxCheckOutTime?: string | null // HH:MM format
  guestType?: GuestType | null
  percentageDiscount: number // 0-100
  fixedDiscount: number
  totalQuote: number
  roomTariff: number
  advancePayment: number
  balancePayment: number
  totalPrice: number
  status: ReservationStatus
  paymentStatus: PaymentStatus
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  createdBy: string
  updatedBy: string
  deletedBy?: string | null
  // Populated fields (not stored in DB)
  room?: {
    id: string
    roomNumber: string
    roomTypeName: string
    pricePerNight: number
    maxGuests: number
  }
}

export interface CreateReservationData {
  roomId: string
  checkInDate: string
  checkOutDate: string
  guestCount: number
  specialRequests?: string
  approxCheckInTime?: string
  approxCheckOutTime?: string
  guestType?: GuestType
  percentageDiscount?: number
  fixedDiscount?: number
  totalQuote: number
  roomTariff: number
  advancePayment?: number
  balancePayment?: number
  totalPrice: number
  status?: ReservationStatus
  paymentStatus?: PaymentStatus
}

export interface UpdateReservationData extends Partial<CreateReservationData> {
  updatedBy: string
  updatedAt: string
}

export interface ReservationFilters {
  status?: ReservationStatus
  paymentStatus?: PaymentStatus
  roomId?: string
  guestType?: GuestType
  checkInDateFrom?: string
  checkInDateTo?: string
  checkOutDateFrom?: string
  checkOutDateTo?: string
  referenceNumber?: string
  createdBy?: string
}

export interface ReservationStats {
  totalReservations: number
  activeReservations: number
  completedReservations: number
  cancelledReservations: number
  pendingPayments: number
  totalRevenue: number
  averageStayDuration: number
  occupancyRate: number
}

export interface DateRange {
  start: string
  end: string
}

export interface ReferenceNumberCounter {
  id: string // Format: MMYYYY (e.g., "012025")
  counter: number
  month: number
  year: number
  lastUpdated: string
}