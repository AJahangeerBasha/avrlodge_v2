import { 
  CreateGuestData,
  UpdateGuestData,
  GUEST_VALIDATION_RULES,
  INDIAN_STATES,
  IndianState,
  GuestValidationResult
} from '../types/guests'

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

// Validate guest name
export const validateGuestName = (name: string): ValidationError | null => {
  if (!name || name.trim().length === 0) {
    return {
      field: 'name',
      message: 'Guest name is required',
      code: 'REQUIRED_FIELD'
    }
  }
  
  const trimmedName = name.trim()
  
  if (trimmedName.length < GUEST_VALIDATION_RULES.name.minLength) {
    return {
      field: 'name',
      message: `Name must be at least ${GUEST_VALIDATION_RULES.name.minLength} characters long`,
      code: 'NAME_TOO_SHORT'
    }
  }
  
  if (trimmedName.length > GUEST_VALIDATION_RULES.name.maxLength) {
    return {
      field: 'name',
      message: `Name cannot exceed ${GUEST_VALIDATION_RULES.name.maxLength} characters`,
      code: 'NAME_TOO_LONG'
    }
  }
  
  if (!GUEST_VALIDATION_RULES.name.pattern.test(trimmedName)) {
    return {
      field: 'name',
      message: 'Name can only contain letters, spaces, dots, and hyphens',
      code: 'INVALID_NAME_FORMAT'
    }
  }
  
  // Check for suspicious patterns
  if (/^\s*[.-]+\s*$/.test(trimmedName)) {
    return {
      field: 'name',
      message: 'Please provide a valid name',
      code: 'INVALID_NAME_CONTENT'
    }
  }
  
  return null
}

// Validate phone number
export const validatePhoneNumber = (phone: string): ValidationError | null => {
  if (!phone || phone.trim().length === 0) {
    return {
      field: 'phone',
      message: 'Phone number is required',
      code: 'REQUIRED_FIELD'
    }
  }
  
  const trimmedPhone = phone.trim()
  
  if (trimmedPhone.length < GUEST_VALIDATION_RULES.phone.minLength) {
    return {
      field: 'phone',
      message: `Phone number must be at least ${GUEST_VALIDATION_RULES.phone.minLength} digits`,
      code: 'PHONE_TOO_SHORT'
    }
  }
  
  if (trimmedPhone.length > GUEST_VALIDATION_RULES.phone.maxLength) {
    return {
      field: 'phone',
      message: `Phone number cannot exceed ${GUEST_VALIDATION_RULES.phone.maxLength} characters`,
      code: 'PHONE_TOO_LONG'
    }
  }
  
  if (!GUEST_VALIDATION_RULES.phone.pattern.test(trimmedPhone)) {
    return {
      field: 'phone',
      message: 'Phone number can only contain digits, spaces, hyphens, parentheses, and plus sign',
      code: 'INVALID_PHONE_FORMAT'
    }
  }
  
  // Extract digits only for Indian mobile validation
  const digitsOnly = trimmedPhone.replace(/\D/g, '')
  
  // Check for Indian mobile number pattern if it looks like one
  if (digitsOnly.length === 10 || digitsOnly.length === 12 || digitsOnly.length === 13) {
    const cleanNumber = digitsOnly.length === 13 ? digitsOnly.slice(2) : 
                       digitsOnly.length === 12 ? digitsOnly.slice(2) : 
                       digitsOnly
    
    if (cleanNumber.length === 10 && !GUEST_VALIDATION_RULES.phone.indianPattern.test(`+91${cleanNumber}`)) {
      return {
        field: 'phone',
        message: 'Please provide a valid Indian mobile number',
        code: 'INVALID_INDIAN_MOBILE'
      }
    }
  }
  
  return null
}

// Validate WhatsApp number
export const validateWhatsAppNumber = (whatsapp: string | undefined): ValidationError | null => {
  if (!whatsapp || whatsapp.trim().length === 0) {
    return null // WhatsApp is optional
  }
  
  // Use same validation as phone number
  const phoneValidation = validatePhoneNumber(whatsapp)
  if (phoneValidation) {
    return {
      ...phoneValidation,
      field: 'whatsapp',
      message: phoneValidation.message.replace('Phone number', 'WhatsApp number')
    }
  }
  
  return null
}

// Validate Telegram handle
export const validateTelegramHandle = (telegram: string | undefined): ValidationError | null => {
  if (!telegram || telegram.trim().length === 0) {
    return null // Telegram is optional
  }
  
  const trimmedTelegram = telegram.trim()
  
  // Check if it's a phone number or username
  if (/^\d+$/.test(trimmedTelegram)) {
    // It's a phone number, validate as such
    return validatePhoneNumber(trimmedTelegram)
  }
  
  // It's a username, validate username format
  if (trimmedTelegram.length < 5 || trimmedTelegram.length > 32) {
    return {
      field: 'telegram',
      message: 'Telegram username must be between 5 and 32 characters',
      code: 'INVALID_TELEGRAM_LENGTH'
    }
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(trimmedTelegram)) {
    return {
      field: 'telegram',
      message: 'Telegram username can only contain letters, numbers, and underscores',
      code: 'INVALID_TELEGRAM_FORMAT'
    }
  }
  
  return null
}

// Validate pincode
export const validatePincode = (pincode: string | undefined): ValidationError | null => {
  if (!pincode || pincode.trim().length === 0) {
    return null // Pincode is optional
  }
  
  const trimmedPincode = pincode.trim()
  
  if (trimmedPincode.length !== GUEST_VALIDATION_RULES.pincode.length) {
    return {
      field: 'pincode',
      message: `Pincode must be exactly ${GUEST_VALIDATION_RULES.pincode.length} digits`,
      code: 'INVALID_PINCODE_LENGTH'
    }
  }
  
  if (!GUEST_VALIDATION_RULES.pincode.pattern.test(trimmedPincode)) {
    return {
      field: 'pincode',
      message: 'Please provide a valid Indian pincode',
      code: 'INVALID_PINCODE_FORMAT'
    }
  }
  
  return null
}

// Validate state
export const validateState = (state: string | undefined): ValidationError | null => {
  if (!state || state.trim().length === 0) {
    return null // State is optional
  }
  
  const trimmedState = state.trim()
  
  if (trimmedState.length > 100) {
    return {
      field: 'state',
      message: 'State name cannot exceed 100 characters',
      code: 'STATE_TOO_LONG'
    }
  }
  
  // Check if it's a valid Indian state (case-insensitive)
  const isValidState = INDIAN_STATES.some(validState => 
    validState.toLowerCase() === trimmedState.toLowerCase()
  )
  
  if (!isValidState) {
    return {
      field: 'state',
      message: 'Please provide a valid Indian state name',
      code: 'INVALID_STATE'
    }
  }
  
  return null
}

// Validate district
export const validateDistrict = (district: string | undefined): ValidationError | null => {
  if (!district || district.trim().length === 0) {
    return null // District is optional
  }
  
  const trimmedDistrict = district.trim()
  
  if (trimmedDistrict.length < 2) {
    return {
      field: 'district',
      message: 'District name must be at least 2 characters long',
      code: 'DISTRICT_TOO_SHORT'
    }
  }
  
  if (trimmedDistrict.length > 100) {
    return {
      field: 'district',
      message: 'District name cannot exceed 100 characters',
      code: 'DISTRICT_TOO_LONG'
    }
  }
  
  if (!/^[a-zA-Z\s.-]+$/.test(trimmedDistrict)) {
    return {
      field: 'district',
      message: 'District name can only contain letters, spaces, dots, and hyphens',
      code: 'INVALID_DISTRICT_FORMAT'
    }
  }
  
  return null
}

// Comprehensive guest validation
export const validateGuest = (data: CreateGuestData): ValidationResult => {
  const errors: ValidationError[] = []
  
  // Validate required fields
  const nameError = validateGuestName(data.name)
  if (nameError) errors.push(nameError)
  
  const phoneError = validatePhoneNumber(data.phone)
  if (phoneError) errors.push(phoneError)
  
  // Validate optional fields
  const whatsappError = validateWhatsAppNumber(data.whatsapp)
  if (whatsappError) errors.push(whatsappError)
  
  const telegramError = validateTelegramHandle(data.telegram)
  if (telegramError) errors.push(telegramError)
  
  const pincodeError = validatePincode(data.pincode)
  if (pincodeError) errors.push(pincodeError)
  
  const stateError = validateState(data.state)
  if (stateError) errors.push(stateError)
  
  const districtError = validateDistrict(data.district)
  if (districtError) errors.push(districtError)
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate guest update data
export const validateGuestUpdate = (data: UpdateGuestData): ValidationResult => {
  const errors: ValidationError[] = []
  
  // Validate fields if provided
  if (data.name !== undefined) {
    const nameError = validateGuestName(data.name)
    if (nameError) errors.push(nameError)
  }
  
  if (data.phone !== undefined) {
    const phoneError = validatePhoneNumber(data.phone)
    if (phoneError) errors.push(phoneError)
  }
  
  if (data.whatsapp !== undefined) {
    const whatsappError = validateWhatsAppNumber(data.whatsapp)
    if (whatsappError) errors.push(whatsappError)
  }
  
  if (data.telegram !== undefined) {
    const telegramError = validateTelegramHandle(data.telegram)
    if (telegramError) errors.push(telegramError)
  }
  
  if (data.pincode !== undefined) {
    const pincodeError = validatePincode(data.pincode)
    if (pincodeError) errors.push(pincodeError)
  }
  
  if (data.state !== undefined) {
    const stateError = validateState(data.state)
    if (stateError) errors.push(stateError)
  }
  
  if (data.district !== undefined) {
    const districtError = validateDistrict(data.district)
    if (districtError) errors.push(districtError)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate bulk guest data
export const validateBulkGuests = (
  guests: Array<{
    name: string
    phone: string
    whatsapp?: string
    telegram?: string
    pincode?: string
    state?: string
    district?: string
  }>
): ValidationResult => {
  const errors: ValidationError[] = []
  
  if (!guests || guests.length === 0) {
    errors.push({
      field: 'guests',
      message: 'At least one guest must be provided',
      code: 'EMPTY_GUESTS_ARRAY'
    })
    return { isValid: false, errors }
  }
  
  if (guests.length > 20) { // Reasonable limit for bulk creation
    errors.push({
      field: 'guests',
      message: 'Cannot create more than 20 guests at once',
      code: 'TOO_MANY_GUESTS'
    })
  }
  
  // Validate each guest
  guests.forEach((guest, index) => {
    const validation = validateGuest({
      reservationId: 'temp', // Will be set by calling function
      ...guest
    })
    
    if (!validation.isValid) {
      validation.errors.forEach(error => {
        // Skip the temp validation errors
        if (error.field === 'reservationId') {
          return
        }
        
        errors.push({
          ...error,
          field: `guests[${index}].${error.field}`,
          message: `Guest ${index + 1}: ${error.message}`
        })
      })
    }
  })
  
  // Check for duplicate phone numbers in the same batch
  const phoneNumbers = new Set<string>()
  guests.forEach((guest, index) => {
    const cleanPhone = guest.phone.replace(/\D/g, '')
    if (phoneNumbers.has(cleanPhone)) {
      errors.push({
        field: `guests[${index}].phone`,
        message: `Guest ${index + 1}: Duplicate phone number in batch`,
        code: 'DUPLICATE_PHONE_IN_BATCH'
      })
    } else {
      phoneNumbers.add(cleanPhone)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Advanced guest validation with suggestions
export const validateGuestWithSuggestions = (data: CreateGuestData): GuestValidationResult => {
  const validation = validateGuest(data)
  const warnings: string[] = []
  const suggestions: {
    formattedPhone?: string
    detectedState?: string
    detectedDistrict?: string
  } = {}
  
  // Phone formatting suggestions
  if (data.phone && !validation.errors.some(e => e.field === 'phone')) {
    const cleanPhone = data.phone.replace(/\D/g, '')
    
    if (cleanPhone.length === 10) {
      suggestions.formattedPhone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      const mobile = cleanPhone.slice(2)
      suggestions.formattedPhone = `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`
    }
  }
  
  // State name suggestions (auto-correct common typos)
  if (data.state && validation.errors.some(e => e.field === 'state' && e.code === 'INVALID_STATE')) {
    const inputState = data.state.toLowerCase().trim()
    
    // Common state name corrections
    const stateCorrections: Record<string, IndianState> = {
      'karnatak': 'Karnataka',
      'tamilnadu': 'Tamil Nadu',
      'tamil nadu': 'Tamil Nadu',
      'keral': 'Kerala',
      'maharashtr': 'Maharashtra',
      'rajsthan': 'Rajasthan',
      'gujrat': 'Gujarat',
      'punjab state': 'Punjab',
      'up': 'Uttar Pradesh',
      'uttarpradesh': 'Uttar Pradesh',
      'andhrapradesh': 'Andhra Pradesh',
      'andhra pradesh': 'Andhra Pradesh',
      'westbengal': 'West Bengal',
      'west bengal': 'West Bengal',
      'madhyapradesh': 'Madhya Pradesh',
      'madhya pradesh': 'Madhya Pradesh',
      'himachalpradesh': 'Himachal Pradesh',
      'himachal pradesh': 'Himachal Pradesh'
    }
    
    const correction = stateCorrections[inputState]
    if (correction) {
      suggestions.detectedState = correction
    } else {
      // Find closest match
      const possibleMatch = INDIAN_STATES.find(state => 
        state.toLowerCase().includes(inputState) || 
        inputState.includes(state.toLowerCase())
      )
      if (possibleMatch) {
        suggestions.detectedState = possibleMatch
      }
    }
  }
  
  // Contact method warnings
  if (!data.whatsapp && !data.telegram) {
    warnings.push('Consider adding WhatsApp or Telegram for better communication')
  }
  
  // Location completeness warnings
  if (data.state && !data.district) {
    warnings.push('District information helps with better guest management')
  }
  
  if (data.district && !data.pincode) {
    warnings.push('Pincode helps with location accuracy')
  }
  
  if (data.pincode && !data.state) {
    // Try to detect state from pincode (basic logic)
    const pincode = parseInt(data.pincode)
    if (pincode >= 110000 && pincode <= 140000) {
      suggestions.detectedState = 'Delhi'
    } else if (pincode >= 400000 && pincode <= 444000) {
      suggestions.detectedState = 'Maharashtra'
    } else if (pincode >= 560000 && pincode <= 592000) {
      suggestions.detectedState = 'Karnataka'
    } else if (pincode >= 600000 && pincode <= 643000) {
      suggestions.detectedState = 'Tamil Nadu'
    } else if (pincode >= 500000 && pincode <= 509000) {
      suggestions.detectedState = 'Telangana'
    }
    // Add more pincode ranges as needed
  }
  
  // Name formatting suggestions
  if (data.name && !validation.errors.some(e => e.field === 'name')) {
    const words = data.name.trim().split(/\s+/)
    if (words.some(word => word === word.toLowerCase())) {
      warnings.push('Consider using proper case for the name (e.g., "John Doe" instead of "john doe")')
    }
  }
  
  return {
    isValid: validation.isValid,
    errors: validation.errors.map(e => e.message),
    warnings,
    suggestions: Object.keys(suggestions).length > 0 ? suggestions : undefined
  }
}

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '')
  
  if (cleanPhone.length === 10) {
    return `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`
  } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    const mobile = cleanPhone.slice(2)
    return `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`
  } else if (cleanPhone.length === 13 && cleanPhone.startsWith('911')) {
    const mobile = cleanPhone.slice(3)
    return `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`
  }
  
  return phone // Return as-is if no standard format matches
}

// Normalize phone number for comparison
export const normalizePhoneNumber = (phone: string): string => {
  let cleanPhone = phone.replace(/\D/g, '')
  
  // Remove country code if present
  if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    cleanPhone = cleanPhone.slice(2)
  } else if (cleanPhone.length === 13 && cleanPhone.startsWith('911')) {
    cleanPhone = cleanPhone.slice(3)
  }
  
  return cleanPhone
}

// Check if two phone numbers are the same
export const arePhoneNumbersSame = (phone1: string, phone2: string): boolean => {
  return normalizePhoneNumber(phone1) === normalizePhoneNumber(phone2)
}

// Get state from pincode (basic mapping)
export const getStateFromPincode = (pincode: string): IndianState | null => {
  const pincodeNum = parseInt(pincode.replace(/\D/g, ''))
  
  if (isNaN(pincodeNum)) return null
  
  // Basic pincode to state mapping
  const pincodeRanges: Array<{ start: number; end: number; state: IndianState }> = [
    { start: 110000, end: 140000, state: 'Delhi' },
    { start: 400000, end: 444000, state: 'Maharashtra' },
    { start: 560000, end: 592000, state: 'Karnataka' },
    { start: 600000, end: 643000, state: 'Tamil Nadu' },
    { start: 500000, end: 509000, state: 'Telangana' },
    { start: 682000, end: 695000, state: 'Kerala' },
    { start: 380000, end: 396000, state: 'Gujarat' },
    { start: 302000, end: 345000, state: 'Rajasthan' },
    { start: 160000, end: 177000, state: 'Punjab' },
    { start: 201000, end: 285000, state: 'Uttar Pradesh' },
    { start: 700000, end: 743000, state: 'West Bengal' },
    { start: 452000, end: 488000, state: 'Madhya Pradesh' },
    { start: 800000, end: 855000, state: 'Bihar' },
    { start: 751000, end: 770000, state: 'Odisha' }
    // Add more ranges as needed
  ]
  
  const range = pincodeRanges.find(r => pincodeNum >= r.start && pincodeNum <= r.end)
  return range?.state || null
}

// Validate guest data completeness
export const validateGuestCompleteness = (guest: CreateGuestData): {
  completionPercentage: number
  missingFields: string[]
  recommendations: string[]
} => {
  const totalFields = 7 // name, phone, whatsapp, telegram, pincode, state, district
  let completedFields = 0
  const missingFields: string[] = []
  const recommendations: string[] = []
  
  // Required fields
  if (guest.name) completedFields++
  else missingFields.push('name')
  
  if (guest.phone) completedFields++
  else missingFields.push('phone')
  
  // Optional but recommended fields
  if (guest.whatsapp) completedFields++
  else {
    missingFields.push('whatsapp')
    recommendations.push('Add WhatsApp number for better communication')
  }
  
  if (guest.telegram) completedFields++
  else missingFields.push('telegram')
  
  if (guest.pincode) completedFields++
  else {
    missingFields.push('pincode')
    recommendations.push('Add pincode for accurate location details')
  }
  
  if (guest.state) completedFields++
  else {
    missingFields.push('state')
    recommendations.push('Add state information for guest analytics')
  }
  
  if (guest.district) completedFields++
  else {
    missingFields.push('district')
    recommendations.push('Add district for complete location information')
  }
  
  const completionPercentage = Math.round((completedFields / totalFields) * 100)
  
  return {
    completionPercentage,
    missingFields,
    recommendations
  }
}