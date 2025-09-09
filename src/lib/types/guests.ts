// Guests Types
// Converted from PostgreSQL guests table

export interface Guest {
  id: string
  reservationId?: string // Can be null for standalone guests
  name: string
  phone: string
  whatsapp?: string
  telegram?: string
  pincode?: string
  state?: string
  district?: string
  isPrimaryGuest: boolean
  createdBy: string // User ID
  updatedBy: string // User ID
  deletedBy?: string // User ID who deleted (soft delete)
  deletedAt?: string // ISO timestamp for soft delete
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
}

export interface CreateGuestData {
  reservationId?: string
  name: string
  phone: string
  whatsapp?: string
  telegram?: string
  pincode?: string
  state?: string
  district?: string
  isPrimaryGuest?: boolean // Defaults to false
}

export interface UpdateGuestData {
  name?: string
  phone?: string
  whatsapp?: string
  telegram?: string
  pincode?: string
  state?: string
  district?: string
  isPrimaryGuest?: boolean
}

export interface GuestFilters {
  reservationId?: string
  name?: string // Partial name search
  phone?: string // Partial phone search
  state?: string
  district?: string
  isPrimaryGuest?: boolean
  createdBy?: string
  isActive?: boolean // Filter for non-deleted guests
  dateRange?: {
    start: string
    end: string
  }
}

export interface BulkGuestData {
  reservationId: string
  guests: Array<{
    name: string
    phone: string
    whatsapp?: string
    telegram?: string
    pincode?: string
    state?: string
    district?: string
  }>
}

export interface GuestResult {
  guestId: string
  name: string
  phone: string
  isPrimaryGuest: boolean
  createdAt: string
}

export interface BulkGuestResult {
  reservationId: string
  createdGuests: GuestResult[]
  totalGuests: number
  primaryGuestId?: string
  errors?: Array<{
    guest: any
    error: string
  }>
}

export interface GuestSummary {
  reservationId?: string
  totalGuests: number
  primaryGuest?: Guest
  guestsByState: Record<string, number>
  guestsByDistrict: Record<string, number>
  hasAllContactInfo: boolean
  missingContactInfo: Array<{
    guestId: string
    name: string
    missingFields: string[]
  }>
}

export interface GuestValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions?: {
    formattedPhone?: string
    detectedState?: string
    detectedDistrict?: string
  }
}

export interface ContactInfo {
  phone: string
  whatsapp?: string
  telegram?: string
  hasWhatsApp: boolean
  hasTelegram: boolean
  preferredContact: 'phone' | 'whatsapp' | 'telegram'
}

export interface LocationInfo {
  pincode?: string
  state?: string
  district?: string
  isComplete: boolean
  missingFields: string[]
}

export interface GuestProfile {
  guest: Guest
  contactInfo: ContactInfo
  locationInfo: LocationInfo
  reservationHistory?: Array<{
    reservationId: string
    checkInDate: string
    checkOutDate: string
    status: string
  }>
  lastVisit?: string
  totalVisits: number
  isReturningGuest: boolean
}

export interface GuestAuditLog {
  guestId: string
  action: 'created' | 'updated' | 'deleted' | 'restored' | 'primary_changed'
  performedBy: string
  performedAt: string
  details?: Record<string, any>
  previousValues?: Partial<Guest>
  newValues?: Partial<Guest>
}

// Indian states list for validation
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
] as const

export type IndianState = typeof INDIAN_STATES[number]

// Guest validation constants
export const GUEST_VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 255,
    pattern: /^[a-zA-Z\s.-]+$/ // Allow letters, spaces, dots, and hyphens
  },
  phone: {
    minLength: 10,
    maxLength: 15,
    pattern: /^[+]?[0-9\s-()]+$/, // Allow digits, spaces, hyphens, parentheses, and plus
    indianPattern: /^(?:\+91|91)?[6-9]\d{9}$/ // Indian mobile number pattern
  },
  pincode: {
    length: 6,
    pattern: /^[1-9][0-9]{5}$/ // Indian pincode pattern
  }
}

// Contact preferences
export interface ContactPreference {
  type: 'phone' | 'whatsapp' | 'telegram'
  value: string
  isPrimary: boolean
  isVerified: boolean
}

export interface GuestContactPreferences {
  guestId: string
  preferences: ContactPreference[]
  preferredMethod: 'phone' | 'whatsapp' | 'telegram'
  allowMarketing: boolean
  allowNotifications: boolean
}

// Guest analytics
export interface GuestAnalytics {
  totalGuests: number
  newGuestsThisMonth: number
  returningGuests: number
  guestsByState: Array<{
    state: string
    count: number
    percentage: number
  }>
  guestsByDistrict: Array<{
    district: string
    state: string
    count: number
  }>
  contactMethodDistribution: {
    hasPhone: number
    hasWhatsApp: number
    hasTelegram: number
    hasMultipleContacts: number
  }
  topStates: IndianState[]
  guestGrowthTrend: Array<{
    month: string
    newGuests: number
    returningGuests: number
  }>
}

// Reservation guest management
export interface ReservationGuestSummary {
  reservationId: string
  totalGuests: number
  primaryGuest: Guest
  additionalGuests: Guest[]
  contactSummary: {
    totalContacts: number
    uniquePhones: number
    hasWhatsApp: number
    hasTelegram: number
  }
  locationSummary: {
    states: string[]
    districts: string[]
    pincodes: string[]
  }
  allGuestsHaveContact: boolean
  missingContactGuests: string[] // Guest IDs with missing contact info
}

// Guest search and matching
export interface GuestSearchResult {
  guests: Guest[]
  totalMatches: number
  searchQuery: string
  searchType: 'name' | 'phone' | 'location' | 'general'
  suggestions: string[]
}

export interface GuestMatchResult {
  exactMatches: Guest[]
  phoneMatches: Guest[]
  nameMatches: Guest[]
  locationMatches: Guest[]
  hasExactMatch: boolean
  hasPotentialDuplicate: boolean
  confidence: 'high' | 'medium' | 'low'
}

// Guest data export/import
export interface GuestExportData {
  guest: Guest
  reservationDetails?: {
    reservationId: string
    referenceNumber: string
    checkInDate: string
    checkOutDate: string
    totalPrice: number
  }
  visitHistory: number
  lastVisitDate?: string
}

export interface GuestImportData {
  name: string
  phone: string
  whatsapp?: string
  telegram?: string
  pincode?: string
  state?: string
  district?: string
  reservationId?: string
  isPrimaryGuest?: boolean
}

export interface GuestImportResult {
  successful: GuestResult[]
  failed: Array<{
    data: GuestImportData
    error: string
    lineNumber?: number
  }>
  duplicatesFound: Array<{
    data: GuestImportData
    existingGuest: Guest
    action: 'skipped' | 'updated' | 'created_duplicate'
  }>
  totalProcessed: number
  totalSuccessful: number
  totalFailed: number
}

// Guest communication
export interface GuestCommunication {
  guestId: string
  type: 'sms' | 'whatsapp' | 'telegram' | 'email'
  message: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  sentAt: string
  sentBy: string
  reservationId?: string
  templateUsed?: string
}

export interface BulkCommunication {
  guestIds: string[]
  type: 'sms' | 'whatsapp' | 'telegram'
  message: string
  templateId?: string
  scheduledAt?: string
}

// Dashboard metrics
export interface GuestDashboardMetrics {
  totalGuests: number
  newGuestsToday: number
  newGuestsThisMonth: number
  returningGuestsThisMonth: number
  topStates: Array<{
    state: string
    count: number
  }>
  contactMethodStats: {
    phoneOnly: number
    withWhatsApp: number
    withTelegram: number
    withBoth: number
  }
  recentGuests: Guest[]
  guestGrowthRate: number // Percentage growth from last month
}