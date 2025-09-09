import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import type { Guest } from '@/lib/types'

interface AdditionalGuestCardProps {
  guest: Guest
  index: number
  errors: Record<string, string>
  whatsappSame: boolean
  telegramSame: boolean
  onUpdate: (index: number, field: keyof Guest, value: string) => void
  onRemove: (index: number) => void
  onWhatsAppSameChange: (index: number, same: boolean) => void
  onTelegramSameChange: (index: number, same: boolean) => void
}

export default function AdditionalGuestCard({
  guest,
  index,
  errors,
  whatsappSame,
  telegramSame,
  onUpdate,
  onRemove,
  onWhatsAppSameChange,
  onTelegramSameChange
}: AdditionalGuestCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Guest {index + 1}</h4>
        <button
          onClick={() => onRemove(index)}
          className="text-red-600 hover:text-red-800 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Guest Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Guest Name *
        </label>
        <input
          type="text"
          value={guest.name}
          onChange={(e) => onUpdate(index, 'name', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
            errors[`guest${index}name`] ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter guest name"
        />
        {errors[`guest${index}name`] && (
          <p className="text-red-500 text-sm mt-1">{errors[`guest${index}name`]}</p>
        )}
      </div>

      {/* Guest Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number *
        </label>
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={guest.phone}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 10)
            onUpdate(index, 'phone', value)
          }}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
            errors[`guest${index}phone`] ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="10-digit phone number"
        />
        {errors[`guest${index}phone`] && (
          <p className="text-red-500 text-sm mt-1">{errors[`guest${index}phone`]}</p>
        )}
      </div>

      {/* Guest WhatsApp */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          WhatsApp Number
        </label>
        <div className="space-y-2">
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={guest.whatsapp || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 10)
              onUpdate(index, 'whatsapp', value)
            }}
            disabled={whatsappSame}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
              errors[`guest${index}whatsapp`] ? 'border-red-500' : 'border-gray-300'
            } ${whatsappSame ? 'bg-gray-100' : ''}`}
            placeholder="10-digit WhatsApp number"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`guest${index}WhatsAppSame`}
              checked={whatsappSame}
              onChange={(e) => {
                onWhatsAppSameChange(index, e.target.checked)
                if (e.target.checked) {
                  onUpdate(index, 'whatsapp', guest.phone || '')
                }
              }}
              className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
            />
            <label htmlFor={`guest${index}WhatsAppSame`} className="text-sm text-gray-700 cursor-pointer">
              Same as phone number
            </label>
          </div>
        </div>
        {errors[`guest${index}whatsapp`] && (
          <p className="text-red-500 text-sm mt-1">{errors[`guest${index}whatsapp`]}</p>
        )}
      </div>

      {/* Guest Telegram */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Telegram Number (Optional)
        </label>
        <div className="space-y-2">
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={guest.telegram || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 10)
              onUpdate(index, 'telegram', value)
            }}
            disabled={telegramSame}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
              errors[`guest${index}telegram`] ? 'border-red-500' : 'border-gray-300'
            } ${telegramSame ? 'bg-gray-100' : ''}`}
            placeholder="10-digit Telegram number"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`guest${index}TelegramSame`}
              checked={telegramSame}
              onChange={(e) => {
                onTelegramSameChange(index, e.target.checked)
                if (e.target.checked) {
                  onUpdate(index, 'telegram', guest.phone || '')
                }
              }}
              className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
            />
            <label htmlFor={`guest${index}TelegramSame`} className="text-sm text-gray-700 cursor-pointer">
              Same as phone number
            </label>
          </div>
        </div>
        {errors[`guest${index}telegram`] && (
          <p className="text-red-500 text-sm mt-1">{errors[`guest${index}telegram`]}</p>
        )}
      </div>
    </motion.div>
  )
}