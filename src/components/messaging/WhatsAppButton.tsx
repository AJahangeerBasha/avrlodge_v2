import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import WhatsAppModal from './WhatsAppModal'

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

// Union type to support both reservation data (from form) and booking data
interface WhatsAppData {
  referenceNumber: string
  totalAmount: number
  primaryGuest: Guest
  secondaryGuests: Guest[]
  checkInDate: string
  checkOutDate: string
  roomAllocations: RoomAllocation[]
  guestCount: number
}

interface WhatsAppButtonProps {
  data: WhatsAppData
  buttonText?: string
  variant?: 'default' | 'outline'
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function WhatsAppButton({
  data,
  buttonText = "Send WhatsApp",
  variant = "outline",
  className = "",
  size = "md"
}: WhatsAppButtonProps) {
  const [showModal, setShowModal] = useState(false)

  const buttonSizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-12 px-6 text-lg"
  }

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant={variant}
        className={`${buttonSizeClasses[size]} ${
          variant === 'outline' 
            ? 'border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400' 
            : 'bg-green-600 text-white hover:bg-green-700'
        } ${className}`}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        {buttonText}
      </Button>

      <WhatsAppModal
        data={data}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}