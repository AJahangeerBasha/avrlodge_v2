import { RoomStatus, CreateReservationRoomData, CheckInData, CheckOutData } from '../types/reservationRooms'

// Validation error types
export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Validate guest count
export const validateGuestCount = (guestCount: number): ValidationError | null => {
  if (!Number.isInteger(guestCount) || guestCount <= 0) {
    return {
      field: 'guestCount',
      message: 'Guest count must be a positive integer',
      code: 'INVALID_GUEST_COUNT'
    }
  }
  
  if (guestCount > 20) { // Reasonable upper limit
    return {
      field: 'guestCount',
      message: 'Guest count cannot exceed 20 per room',
      code: 'GUEST_COUNT_TOO_HIGH'
    }
  }
  
  return null
}

// Validate tariff per night
export const validateTariffPerNight = (tariff: number): ValidationError | null => {
  if (tariff < 0) {
    return {
      field: 'tariffPerNight',
      message: 'Tariff per night cannot be negative',
      code: 'NEGATIVE_TARIFF'
    }
  }
  
  if (tariff === 0) {
    return {
      field: 'tariffPerNight',
      message: 'Tariff per night must be greater than 0',
      code: 'ZERO_TARIFF'
    }
  }
  
  if (tariff > 100000) { // Reasonable upper limit
    return {
      field: 'tariffPerNight',
      message: 'Tariff per night exceeds maximum allowed amount',
      code: 'TARIFF_TOO_HIGH'
    }
  }
  
  return null
}

// Validate room status
export const validateRoomStatus = (status: string): ValidationError | null => {
  const validStatuses: RoomStatus[] = ['pending', 'checked_in', 'checked_out', 'cancelled', 'no_show']
  
  if (!validStatuses.includes(status as RoomStatus)) {
    return {
      field: 'roomStatus',
      message: 'Invalid room status',
      code: 'INVALID_ROOM_STATUS'
    }
  }
  
  return null
}

// Validate datetime format
export const validateDatetime = (datetime: string | undefined, fieldName: string, required: boolean = false): ValidationError | null => {
  if (!datetime) {
    if (required) {
      return {
        field: fieldName,
        message: `${fieldName} is required`,
        code: 'REQUIRED_FIELD'
      }
    }
    return null
  }
  
  const date = new Date(datetime)
  
  if (isNaN(date.getTime())) {
    return {
      field: fieldName,
      message: `${fieldName} must be a valid ISO datetime string`,
      code: 'INVALID_DATETIME'
    }
  }
  
  return null
}

// Validate room number format
export const validateRoomNumber = (roomNumber: string): ValidationError | null => {
  if (!roomNumber || roomNumber.trim().length === 0) {
    return {
      field: 'roomNumber',
      message: 'Room number is required',
      code: 'REQUIRED_FIELD'
    }
  }
  
  if (roomNumber.length > 10) {
    return {
      field: 'roomNumber',
      message: 'Room number cannot exceed 10 characters',
      code: 'ROOM_NUMBER_TOO_LONG'
    }
  }
  
  // Basic alphanumeric validation
  const roomNumberRegex = /^[A-Za-z0-9-]+$/
  if (!roomNumberRegex.test(roomNumber)) {
    return {
      field: 'roomNumber',
      message: 'Room number can only contain letters, numbers, and hyphens',
      code: 'INVALID_ROOM_NUMBER_FORMAT'
    }
  }
  
  return null
}

// Validate room type
export const validateRoomType = (roomType: string): ValidationError | null => {
  if (!roomType || roomType.trim().length === 0) {
    return {
      field: 'roomType',
      message: 'Room type is required',
      code: 'REQUIRED_FIELD'
    }
  }
  
  if (roomType.length > 100) {
    return {
      field: 'roomType',
      message: 'Room type cannot exceed 100 characters',
      code: 'ROOM_TYPE_TOO_LONG'
    }
  }
  
  return null
}

// Validate check-in/check-out datetime relationship
export const validateCheckInOutTimes = (
  checkInDatetime?: string, 
  checkOutDatetime?: string
): ValidationError[] => {
  const errors: ValidationError[] = []
  
  if (checkInDatetime && checkOutDatetime) {
    const checkIn = new Date(checkInDatetime)
    const checkOut = new Date(checkOutDatetime)
    
    if (checkOut <= checkIn) {
      errors.push({
        field: 'checkOutDatetime',
        message: 'Check-out datetime must be after check-in datetime',
        code: 'INVALID_CHECKOUT_TIME'
      })
    }
    
    // Check if the stay is reasonable (not more than 30 days)
    const diffMs = checkOut.getTime() - checkIn.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    
    if (diffDays > 30) {
      errors.push({
        field: 'checkOutDatetime',
        message: 'Stay duration cannot exceed 30 days',
        code: 'STAY_TOO_LONG'
      })
    }
  }
  
  return errors
}

// Validate status transition
export const validateStatusTransition = (
  currentStatus: RoomStatus, 
  newStatus: RoomStatus
): ValidationError | null => {
  const validTransitions: Record<RoomStatus, RoomStatus[]> = {
    pending: ['checked_in', 'cancelled', 'no_show'],
    checked_in: ['checked_out', 'cancelled'],
    checked_out: [], // Final state
    cancelled: [], // Final state
    no_show: [] // Final state
  }
  
  if (!validTransitions[currentStatus].includes(newStatus)) {
    return {
      field: 'roomStatus',
      message: `Cannot change status from ${currentStatus} to ${newStatus}`,
      code: 'INVALID_STATUS_TRANSITION'
    }
  }
  
  return null
}

// Comprehensive reservation room validation
export const validateReservationRoom = (data: CreateReservationRoomData): ValidationResult => {
  const errors: ValidationError[] = []
  
  // Validate required string fields
  if (!data.reservationId || data.reservationId.trim().length === 0) {
    errors.push({
      field: 'reservationId',
      message: 'Reservation ID is required',
      code: 'REQUIRED_FIELD'
    })
  }
  
  if (!data.roomId || data.roomId.trim().length === 0) {
    errors.push({
      field: 'roomId',
      message: 'Room ID is required',
      code: 'REQUIRED_FIELD'
    })
  }
  
  // Validate room number
  const roomNumberError = validateRoomNumber(data.roomNumber)
  if (roomNumberError) errors.push(roomNumberError)
  
  // Validate room type
  const roomTypeError = validateRoomType(data.roomType)
  if (roomTypeError) errors.push(roomTypeError)
  
  // Validate guest count
  const guestCountError = validateGuestCount(data.guestCount || 1)
  if (guestCountError) errors.push(guestCountError)
  
  // Validate tariff
  const tariffError = validateTariffPerNight(data.tariffPerNight)
  if (tariffError) errors.push(tariffError)
  
  // Validate room status
  const statusError = validateRoomStatus(data.roomStatus || 'pending')
  if (statusError) errors.push(statusError)
  
  // Validate datetime fields
  const checkInError = validateDatetime(data.checkInDatetime, 'checkInDatetime')
  if (checkInError) errors.push(checkInError)
  
  const checkOutError = validateDatetime(data.checkOutDatetime, 'checkOutDatetime')
  if (checkOutError) errors.push(checkOutError)
  
  // Validate check-in/check-out relationship
  errors.push(...validateCheckInOutTimes(data.checkInDatetime, data.checkOutDatetime))
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate check-in data
export const validateCheckIn = (data: CheckInData): ValidationResult => {
  const errors: ValidationError[] = []
  
  // Check-in datetime is required
  const datetimeError = validateDatetime(data.checkInDatetime, 'checkInDatetime', true)
  if (datetimeError) errors.push(datetimeError)
  
  // Checked-in by is required
  if (!data.checkedInBy || data.checkedInBy.trim().length === 0) {
    errors.push({
      field: 'checkedInBy',
      message: 'Checked-in by user ID is required',
      code: 'REQUIRED_FIELD'
    })
  }
  
  // Validate room status if provided
  if (data.roomStatus) {
    const statusError = validateRoomStatus(data.roomStatus)
    if (statusError) errors.push(statusError)
  }
  
  // Check-in should not be in the future by more than 24 hours
  if (data.checkInDatetime) {
    const checkInTime = new Date(data.checkInDatetime).getTime()
    const now = new Date().getTime()
    const dayInMs = 24 * 60 * 60 * 1000
    
    if (checkInTime > now + dayInMs) {
      errors.push({
        field: 'checkInDatetime',
        message: 'Check-in time cannot be more than 24 hours in the future',
        code: 'CHECKIN_TOO_FUTURE'
      })
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate check-out data
export const validateCheckOut = (data: CheckOutData, checkInDatetime?: string): ValidationResult => {
  const errors: ValidationError[] = []
  
  // Check-out datetime is required
  const datetimeError = validateDatetime(data.checkOutDatetime, 'checkOutDatetime', true)
  if (datetimeError) errors.push(datetimeError)
  
  // Checked-out by is required
  if (!data.checkedOutBy || data.checkedOutBy.trim().length === 0) {
    errors.push({
      field: 'checkedOutBy',
      message: 'Checked-out by user ID is required',
      code: 'REQUIRED_FIELD'
    })
  }
  
  // Validate room status if provided
  if (data.roomStatus) {
    const statusError = validateRoomStatus(data.roomStatus)
    if (statusError) errors.push(statusError)
  }
  
  // Check-out should be after check-in
  if (data.checkOutDatetime && checkInDatetime) {
    errors.push(...validateCheckInOutTimes(checkInDatetime, data.checkOutDatetime))
  }
  
  // Check-out should not be in the future by more than 24 hours
  if (data.checkOutDatetime) {
    const checkOutTime = new Date(data.checkOutDatetime).getTime()
    const now = new Date().getTime()
    const dayInMs = 24 * 60 * 60 * 1000
    
    if (checkOutTime > now + dayInMs) {
      errors.push({
        field: 'checkOutDatetime',
        message: 'Check-out time cannot be more than 24 hours in the future',
        code: 'CHECKOUT_TOO_FUTURE'
      })
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Calculate stay duration in hours
export const calculateStayDuration = (checkInDatetime: string, checkOutDatetime: string): number => {
  const checkIn = new Date(checkInDatetime)
  const checkOut = new Date(checkOutDatetime)
  const diffMs = checkOut.getTime() - checkIn.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  return Math.max(0, diffHours)
}