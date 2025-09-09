import { Plus, User } from 'lucide-react'
import type { Guest } from '@/lib/types'
import AdditionalGuestCard from './AdditionalGuestCard'

interface AdditionalGuestsSectionProps {
  additionalGuests: Guest[]
  errors: Record<string, string>
  guestWhatsAppSame: boolean[]
  guestTelegramSame: boolean[]
  onAddGuest: () => void
  onUpdateGuest: (index: number, field: keyof Guest, value: string) => void
  onRemoveGuest: (index: number) => void
  onWhatsAppSameChange: (states: boolean[]) => void
  onTelegramSameChange: (states: boolean[]) => void
}

export default function AdditionalGuestsSection({
  additionalGuests,
  errors,
  guestWhatsAppSame,
  guestTelegramSame,
  onAddGuest,
  onUpdateGuest,
  onRemoveGuest,
  onWhatsAppSameChange,
  onTelegramSameChange
}: AdditionalGuestsSectionProps) {
  const handleWhatsAppSameChange = (index: number, same: boolean) => {
    const newStates = [...guestWhatsAppSame]
    newStates[index] = same
    onWhatsAppSameChange(newStates)
  }

  const handleTelegramSameChange = (index: number, same: boolean) => {
    const newStates = [...guestTelegramSame]
    newStates[index] = same
    onTelegramSameChange(newStates)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5" />
          Additional Guests ({additionalGuests.length})
        </h3>
        <button
          onClick={onAddGuest}
          className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Guest
        </button>
      </div>

      <div className="space-y-6">
        {additionalGuests.map((guest, index) => (
          <AdditionalGuestCard
            key={index}
            guest={guest}
            index={index}
            errors={errors}
            whatsappSame={guestWhatsAppSame[index] || false}
            telegramSame={guestTelegramSame[index] || false}
            onUpdate={onUpdateGuest}
            onRemove={onRemoveGuest}
            onWhatsAppSameChange={handleWhatsAppSameChange}
            onTelegramSameChange={handleTelegramSameChange}
          />
        ))}
      </div>

      {additionalGuests.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No additional guests added</p>
          <p className="text-sm">Click "Add Guest" to add additional guests</p>
        </div>
      )}
    </div>
  )
}