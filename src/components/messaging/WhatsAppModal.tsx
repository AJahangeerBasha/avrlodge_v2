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
  roomId?: string
  roomNumber: string
  roomType: string
  capacity?: number
  tariff?: number
  guestCount: number
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
  agentReferral?: {
    agentName?: string
    agentCommission?: number
    agentPhone?: string
  }
}

interface WhatsAppModalProps {
  data: WhatsAppData
  isOpen: boolean
  onClose: () => void
}

export default function WhatsAppModal({ data, isOpen, onClose }: WhatsAppModalProps) {
  const { toast } = useToast()

  if (!isOpen) return null

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

  const guestsWithWhatsApp = getGuestsWithWhatsApp()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            WhatsApp Messages
          </h3>
          <button
            onClick={onClose}
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

        {guestsWithWhatsApp.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No guests with WhatsApp numbers found
          </div>
        ) : (
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
        )}
      </div>
    </div>
  )
}