export const COLLECTIONS = {
  USERS: 'users',
  RESERVATIONS: 'reservations',
  RESERVATION_ROOMS: 'reservationRooms',
  RESERVATION_SPECIAL_CHARGES: 'reservationSpecialCharges',
  PAYMENTS: 'payments',
  GUESTS: 'guests',
  ROOMS: 'rooms',
  ROOM_TYPES: 'roomTypes',
  SPECIAL_CHARGES: 'specialCharges',
  ROOM_CHECKIN_DOCUMENTS: 'roomCheckinDocuments',
  REFERENCE_NUMBER_COUNTERS: 'referenceNumberCounters',
  RECEIPT_NUMBER_COUNTERS: 'receiptNumberCounters',
} as const

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS]