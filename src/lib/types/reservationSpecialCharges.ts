export interface ReservationSpecialCharge {
  id: string
  reservationId: string
  specialChargeId: string
  customRate?: number | null // Override the default rate
  customDescription?: string | null // Override the default description
  quantity: number // Number of units/occurrences
  totalAmount: number // customRate (or default rate) * quantity
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
  specialCharge?: {
    id: string
    chargeName: string
    defaultRate: number
    rateType: string
    description?: string
  }
}

export interface CreateReservationSpecialChargeData {
  reservationId: string
  specialChargeId: string
  customRate?: number
  customDescription?: string
  quantity?: number
  totalAmount: number
}

export interface UpdateReservationSpecialChargeData extends Partial<CreateReservationSpecialChargeData> {
  updatedBy: string
  updatedAt: string
}

export interface ReservationSpecialChargeFilters {
  reservationId?: string
  specialChargeId?: string
  createdBy?: string
  updatedBy?: string
  minAmount?: number
  maxAmount?: number
  minQuantity?: number
  maxQuantity?: number
}

export interface ReservationSpecialChargeSummary {
  reservationId: string
  totalCharges: number
  totalAmount: number
  averageAmount: number
  charges: ReservationSpecialCharge[]
  chargesByType: Record<string, {
    count: number
    totalAmount: number
    charges: ReservationSpecialCharge[]
  }>
}

export interface SpecialChargeCalculation {
  specialChargeId: string
  chargeName: string
  defaultRate: number
  rateType: string
  customRate?: number
  finalRate: number
  quantity: number
  totalAmount: number
  description: string
}

export interface BulkSpecialChargeData {
  reservationId: string
  charges: Array<{
    specialChargeId: string
    customRate?: number
    customDescription?: string
    quantity?: number
  }>
}