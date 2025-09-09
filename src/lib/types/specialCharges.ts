export type RateType = 'per_day' | 'per_person' | 'fixed'

export interface SpecialCharge {
  id: string
  chargeName: string
  defaultRate: number
  rateType: RateType
  description?: string | null
  isActive: boolean
  createdBy?: string | null
  updatedBy?: string | null
  deletedBy?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface CreateSpecialChargeData {
  chargeName: string
  defaultRate: number
  rateType: RateType
  description?: string
  isActive?: boolean
}

export interface UpdateSpecialChargeData extends Partial<CreateSpecialChargeData> {
  updatedBy: string
  updatedAt: string
}

export interface SpecialChargeFilters {
  isActive?: boolean
  rateType?: RateType
}

export interface SpecialChargeStats {
  totalCharges: number
  activeCharges: number
  perDayCharges: number
  perPersonCharges: number
  fixedCharges: number
  averageRate: number
}