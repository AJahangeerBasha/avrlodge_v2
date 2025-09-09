import { format, differenceInDays } from 'date-fns'

interface Guest {
  id: string
  name: string
  phone: string
  whatsapp?: string
  telegram?: string
}

interface RoomAllocation {
  id: string
  room_id?: string
  room_number: string
  room_type: string
  capacity?: number
  tariff?: number
  guest_count: number
}

interface SpecialCharge {
  name: string
  amount: number
  quantity?: number
}

interface WhatsAppTemplateData {
  referenceNumber: string
  totalAmount: number
  primaryGuest: Guest
  secondaryGuests: Guest[]
  checkInDate: string
  checkOutDate: string
  roomAllocations: RoomAllocation[]
  guestCount: number
  specialCharges?: SpecialCharge[]
  discountPercentage?: number
  discountAmount?: number
  discountType?: 'percentage' | 'fixed'
}

export function generateWhatsAppBookingMessage(
  data: WhatsAppTemplateData,
  guest: Guest
): string {
  const roomDetails = data.roomAllocations
    .map(room => `Room ${room.room_number} (${room.room_type})`)
    .join(', ')

  // Safe date formatting with fallback
  const formatSafeDate = (dateStr: string) => {
    try {
      if (!dateStr) return 'Not specified'
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return 'Invalid date'
      return format(date, 'dd MMM yyyy')
    } catch (error) {
      console.error('Date formatting error:', error)
      return 'Invalid date'
    }
  }

  // Calculate total nights
  const calculateNights = () => {
    try {
      const checkIn = new Date(data.checkInDate)
      const checkOut = new Date(data.checkOutDate)
      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return 0
      return differenceInDays(checkOut, checkIn)
    } catch (error) {
      console.error('Date calculation error:', error)
      return 0
    }
  }

  const checkIn = formatSafeDate(data.checkInDate)
  const checkOut = formatSafeDate(data.checkOutDate)
  const totalNights = calculateNights()

  // Build booking details section
  let bookingDetails = `📋 *Booking Details:*
• Reference: ${data.referenceNumber}
• Primary Guest: ${data.primaryGuest.name}
• Your Phone: ${guest.phone}
• Check-in: ${checkIn}
• Check-out: ${checkOut}
• Nights #: ${totalNights}
• Rooms: ${roomDetails || 'N/A'}
• Total Guests: ${data.guestCount}`

  // Add special charges if they exist
  if (data.specialCharges && data.specialCharges.length > 0) {
    bookingDetails += `\n• Special Charges:`
    data.specialCharges.forEach(charge => {
      const quantity = charge.quantity && charge.quantity > 1 ? ` (x${charge.quantity})` : ''
      bookingDetails += `\n  - ${charge.name}${quantity}: ₹${charge.amount.toLocaleString()}`
    })
  }

  // Add discount if it exists
  if (data.discountAmount && data.discountAmount > 0) {
    if (data.discountType === 'percentage' && data.discountPercentage) {
      bookingDetails += `\n• Discount: ${data.discountPercentage}% (₹${data.discountAmount.toLocaleString()})`
    } else {
      bookingDetails += `\n• Discount: ₹${data.discountAmount.toLocaleString()}`
    }
  }

  bookingDetails += `\n• Total Amount: ₹${data.totalAmount.toLocaleString()}`

  return `🏨 *AVR Lodge Reservation Confirmed*

Dear ${guest.name || 'Guest'},

Thank you for choosing AVR Lodge! Your reservation has been successfully confirmed.

${bookingDetails}

📍 *Location:* AVR Lodge, Kolli Hills. https://maps.app.goo.gl/Bv2G2d5PPhXEzESs7

We look forward to hosting you! Please feel free to contact us if you have any questions.

🙏 Thank you for choosing AVR Lodge!`
}