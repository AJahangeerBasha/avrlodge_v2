import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate reference number
export function generateReferenceNumber(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `AVR${timestamp}${random}`.toUpperCase()
}

// Calculate room allocation based on guest count and type
export function calculateRoomAllocation(guestCount: number, guestType: string): {
  roomNumbers: string[]
  tariff: number
} {
  // Room allocation logic based on scope.md
  if (guestType === 'Couple' && guestCount <= 2) {
    return { roomNumbers: ['OB-L3'], tariff: 1200 }
  }
  if (guestCount <= 4) {
    return { roomNumbers: ['OB-L2'], tariff: 2200 }
  }
  if (guestCount <= 6) {
    return { roomNumbers: ['OB-L1'], tariff: 3000 }
  }
  if (guestCount <= 10) {
    return { roomNumbers: ['OB-D10'], tariff: 3000 }
  }
  // For larger groups, allocate multiple rooms
  const rooms = ['OB-L1', 'OB-L2']
  return { roomNumbers: rooms, tariff: 5200 } // 3000 + 2200
}

// Calculate total with special charges and discounts
export function calculateTotal(
  roomTariff: number,
  specialCharges: number,
  percentageDiscount: number = 0,
  fixedDiscount: number = 0
): number {
  const subtotal = roomTariff + specialCharges
  const totalAfterPercentage = subtotal - (subtotal * percentageDiscount / 100)
  return totalAfterPercentage - fixedDiscount
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Format date
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

// Format date and time
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Get status color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'reservation':
      return 'bg-yellow-100 text-yellow-800'
    case 'booking':
      return 'bg-blue-100 text-blue-800'
    case 'checked_in':
      return 'bg-green-100 text-green-800'
    case 'checked_out':
      return 'bg-gray-100 text-gray-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get payment status color
export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-red-100 text-red-800'
    case 'partial':
      return 'bg-yellow-100 text-yellow-800'
    case 'paid':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Validate phone number (Indian format)
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

// Validate pincode (Indian format)
export function validatePincode(pincode: string): boolean {
  const pincodeRegex = /^[1-9][0-9]{5}$/
  return pincodeRegex.test(pincode)
}

// Get address from pincode using API
export async function getAddressFromPincode(pincode: string): Promise<{
  state?: string
  district?: string
  error?: string
}> {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
    const data = await response.json()
    
    if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
      const postOffice = data[0].PostOffice[0]
      return {
        state: postOffice.State,
        district: postOffice.District
      }
    } else {
      return { error: 'Invalid pincode' }
    }
  } catch (error) {
    return { error: 'Failed to fetch address' }
  }
}

// WhatsApp message templates
export const whatsappTemplates = {
  paymentRequest: (referenceNumber: string, amount: number) => 
    `Plz review and make advance payment of 50% (₹${amount}) to confirm your booking. Ref: ${referenceNumber}`,
  
  paymentConfirmation: (referenceNumber: string, balance: number) =>
    `Thanks for your advance payment. Balance of ₹${balance} to be paid upon check-in. Ref: ${referenceNumber}`,
  
  reservationDetails: (reservation: any) => {
    const total = formatCurrency(reservation.total_quote)
    const advance = formatCurrency(reservation.advance_payment)
    const balance = formatCurrency(reservation.total_quote - reservation.advance_payment)
    
    return `Reservation Details:
Ref: ${reservation.reference_number}
Check-in: ${formatDate(reservation.check_in_date)}
Check-out: ${formatDate(reservation.check_out_date)}
Guests: ${reservation.guest_count}
Total: ${total}
Advance: ${advance}
Balance: ${balance}`
  }
}

// Calculate number of nights
export function calculateNights(checkInDate: string, checkOutDate: string): number {
  const checkIn = new Date(checkInDate)
  const checkOut = new Date(checkOutDate)
  const diffTime = checkOut.getTime() - checkIn.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Get room type display name
export function getRoomTypeDisplayName(roomType: string): string {
  switch (roomType) {
    case 'Couple':
      return 'Couple Cove'
    case 'Quad':
      return 'Quad Room'
    case 'Family/Group':
      return 'Family Nest'
    case 'Dormitory':
      return 'Dormitory Stay'
    default:
      return roomType
  }
}

// Get guest type display name
export function getGuestTypeDisplayName(guestType: string): string {
  switch (guestType) {
    case 'Individual':
      return 'Individual'
    case 'Couple':
      return 'Couple'
    case 'Family':
      return 'Family'
    case 'Friends':
      return 'Friends'
    default:
      return guestType
  }
}