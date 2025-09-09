import { useState } from 'react'
import { MessageCircle, Copy, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { generateWhatsAppBookingMessage } from '@/lib/whatsapp-template'

interface Guest {
  id: string
  name: string
  phone: string
  whatsapp?: string
  telegram?: string
}

interface RoomAllocation {
  id: string
  room_id: string
  room_number: string
  room_type: string
  capacity: number
  tariff: number
  guest_count: number
}

interface SpecialCharge {
  name: string
  amount: number
  quantity?: number
}

interface WhatsAppData {
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

interface WhatsAppMessagingProps {
  data: WhatsAppData
  mode?: 'inline' | 'modal'
  onClose?: () => void
  trigger?: React.ReactNode
}

export default function WhatsAppMessaging({ 
  data, 
  mode = 'inline', 
  onClose,
  trigger 
}: WhatsAppMessagingProps) {
  const { toast } = useToast()
  const [showModal, setShowModal] = useState(false)

  const generateWhatsAppMessage = (guest: Guest) => {
    return generateWhatsAppBookingMessage(data, guest)
  }

  const getGuestsWithWhatsApp = () => {
    const allGuests = [data.primaryGuest, ...data.secondaryGuests]
    return allGuests.filter(guest => guest.whatsapp && guest.whatsapp.trim() !== '')
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to Clipboard",
        description: "WhatsApp message copied successfully!",
      })
    } catch (error) {
      console.error('Failed to copy text:', error)
      toast({
        title: "Copy Failed",
        description: "Failed to copy message to clipboard.",
        variant: "destructive",
      })
    }
  }

  const openWhatsApp = (whatsappNumber: string, message: string) => {
    const cleanWhatsApp = whatsappNumber.replace(/[^0-9]/g, '')
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/91${cleanWhatsApp}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  const handleTriggerClick = () => {
    if (mode === 'modal') {
      setShowModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    onClose?.()
  }

  const renderContent = () => {
    const guestsWithWhatsApp = getGuestsWithWhatsApp()
    
    if (guestsWithWhatsApp.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          No guests with WhatsApp numbers found
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {guestsWithWhatsApp.map((guest, index) => (
          <div key={guest.id || index} className="border-b border-blue-200 last:border-b-0 pb-3 last:pb-0">
            <p className="text-sm font-medium text-gray-900 mb-2">
              {guest.name} - {guest.whatsapp}
              {guest.id === data.primaryGuest.id && (
                <span className="ml-2 px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">Primary</span>
              )}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(generateWhatsAppMessage(guest))}
                className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
              >
                <Copy className="h-4 w-4" />
                Copy Message
              </button>
              <button
                onClick={() => openWhatsApp(guest.whatsapp!, generateWhatsAppMessage(guest))}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <MessageCircle className="h-4 w-4" />
                Send WhatsApp
              </button>
            </div>
          </div>
        ))}
        
        {guestsWithWhatsApp.length > 1 && (
          <div className="pt-2 border-t border-blue-200">
            <button
              onClick={() => {
                const allMessages = guestsWithWhatsApp.map(guest => 
                  `${guest.name} (${guest.whatsapp}):\n${generateWhatsAppMessage(guest)}`
                ).join('\n\n---\n\n')
                copyToClipboard(allMessages)
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              <Copy className="h-4 w-4" />
              Copy All Messages
            </button>
          </div>
        )}
      </div>
    )
  }

  if (mode === 'modal') {
    return (
      <>
        {/* Trigger */}
        <div onClick={handleTriggerClick}>
          {trigger || (
            <button className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
              <MessageCircle className="h-4 w-4" />
              Send WhatsApp
            </button>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  WhatsApp Messages
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Reference: <span className="font-mono font-semibold">{data.referenceNumber}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Primary Guest: <span className="font-semibold">{data.primaryGuest.name}</span>
                </p>
              </div>

              {renderContent()}
            </div>
          </div>
        )}
      </>
    )
  }

  // Inline mode
  return (
    <div className="bg-blue-50 rounded-lg p-4">
      <p className="text-sm text-gray-600 mb-3">Send WhatsApp Confirmation</p>
      {renderContent()}
    </div>
  )
}