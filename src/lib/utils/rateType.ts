import { RateType } from '../types/specialCharges'

// Rate type configurations
export const RATE_TYPE_CONFIG = {
  per_day: {
    label: 'Per Day',
    color: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600',
    description: 'Charged per day of usage',
    unit: '/day'
  },
  per_person: {
    label: 'Per Person',
    color: 'bg-green-100 text-green-800',
    iconColor: 'text-green-600',
    description: 'Charged per person',
    unit: '/person'
  },
  fixed: {
    label: 'Fixed Rate',
    color: 'bg-purple-100 text-purple-800',
    iconColor: 'text-purple-600',
    description: 'One-time fixed charge',
    unit: 'fixed'
  }
} as const

// Get rate type configuration
export const getRateTypeConfig = (rateType: RateType) => {
  return RATE_TYPE_CONFIG[rateType] || RATE_TYPE_CONFIG.fixed
}

// Get all rate type options for dropdowns
export const getRateTypeOptions = () => {
  return Object.entries(RATE_TYPE_CONFIG).map(([value, config]) => ({
    value: value as RateType,
    label: config.label,
    description: config.description,
    unit: config.unit
  }))
}

// Format rate display with unit
export const formatRateDisplay = (rate: number, rateType: RateType): string => {
  const config = getRateTypeConfig(rateType)
  return `₹${rate.toLocaleString()}${config.unit !== 'fixed' ? ` ${config.unit}` : ''}`
}

// Format rate type for display
export const formatRateType = (rateType: RateType): string => {
  return getRateTypeConfig(rateType).label
}

// Get rate type priority for sorting
export const getRateTypePriority = (rateType: RateType): number => {
  switch (rateType) {
    case 'fixed': return 3
    case 'per_day': return 2
    case 'per_person': return 1
    default: return 0
  }
}