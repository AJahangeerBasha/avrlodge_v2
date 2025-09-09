import { User } from 'lucide-react'
import { GuestFormData } from '@/services/guest.service'

interface PrimaryGuestFormProps {
  primaryGuest: GuestFormData
  errors: Record<string, string>
  primaryWhatsAppSame: boolean
  primaryTelegramSame: boolean
  onUpdateField: (field: keyof GuestFormData, value: string) => void
  onWhatsAppSameChange: (same: boolean) => void
  onTelegramSameChange: (same: boolean) => void
}

export default function PrimaryGuestForm({
  primaryGuest,
  errors,
  primaryWhatsAppSame,
  primaryTelegramSame,
  onUpdateField,
  onWhatsAppSameChange,
  onTelegramSameChange
}: PrimaryGuestFormProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <User className="w-5 h-5" />
        Primary Guest
      </h3>
      
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Guest Name *
          </label>
          <input
            type="text"
            value={primaryGuest.name}
            onChange={(e) => onUpdateField('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
              errors.primaryname ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter guest name"
          />
          {errors.primaryname && (
            <p className="text-red-500 text-sm mt-1">{errors.primaryname}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={primaryGuest.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 10)
              onUpdateField('phone', value)
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
              errors.primaryphone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="10-digit phone number"
          />
          {errors.primaryphone && (
            <p className="text-red-500 text-sm mt-1">{errors.primaryphone}</p>
          )}
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp Number
          </label>
          <div className="space-y-2">
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={primaryGuest.whatsapp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                onUpdateField('whatsapp', value)
              }}
              disabled={primaryWhatsAppSame}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                errors.primarywhatsapp ? 'border-red-500' : 'border-gray-300'
              } ${primaryWhatsAppSame ? 'bg-gray-100' : ''}`}
              placeholder="10-digit WhatsApp number"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="primaryWhatsAppSame"
                checked={primaryWhatsAppSame}
                onChange={(e) => {
                  onWhatsAppSameChange(e.target.checked)
                  if (e.target.checked) {
                    onUpdateField('whatsapp', primaryGuest.phone)
                  }
                }}
                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
              />
              <label htmlFor="primaryWhatsAppSame" className="text-sm text-gray-700 cursor-pointer">
                Same as phone number
              </label>
            </div>
          </div>
          {errors.primarywhatsapp && (
            <p className="text-red-500 text-sm mt-1">{errors.primarywhatsapp}</p>
          )}
        </div>

        {/* Telegram */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telegram Number (Optional)
          </label>
          <div className="space-y-2">
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={primaryGuest.telegram}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                onUpdateField('telegram', value)
              }}
              disabled={primaryTelegramSame}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                errors.primarytelegram ? 'border-red-500' : 'border-gray-300'
              } ${primaryTelegramSame ? 'bg-gray-100' : ''}`}
              placeholder="10-digit Telegram number"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="primaryTelegramSame"
                checked={primaryTelegramSame}
                onChange={(e) => {
                  onTelegramSameChange(e.target.checked)
                  if (e.target.checked) {
                    onUpdateField('telegram', primaryGuest.phone)
                  }
                }}
                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
              />
              <label htmlFor="primaryTelegramSame" className="text-sm text-gray-700 cursor-pointer">
                Same as phone number
              </label>
            </div>
          </div>
          {errors.primarytelegram && (
            <p className="text-red-500 text-sm mt-1">{errors.primarytelegram}</p>
          )}
        </div>
      </div>
    </div>
  )
}