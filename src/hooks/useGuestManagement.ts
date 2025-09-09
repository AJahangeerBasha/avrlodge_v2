import { useState, useCallback } from 'react'
import { GuestService, GuestFormData } from '@/services/guest.service'
import type { Guest } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

export function useGuestManagement(reservationId: string) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [primaryGuest, setPrimaryGuest] = useState<GuestFormData>({
    name: '',
    phone: '',
    whatsapp: '',
    telegram: ''
  })
  
  const [additionalGuests, setAdditionalGuests] = useState<Guest[]>([])
  const [primaryWhatsAppSame, setPrimaryWhatsAppSame] = useState(false)
  const [primaryTelegramSame, setPrimaryTelegramSame] = useState(false)
  const [guestWhatsAppSame, setGuestWhatsAppSame] = useState<boolean[]>([])
  const [guestTelegramSame, setGuestTelegramSame] = useState<boolean[]>([])

  const loadGuestDetails = useCallback(async (booking: any) => {
    try {
      const allGuests = await GuestService.getGuestsByReservation(reservationId)
      
      // Find primary guest
      const primaryGuestRecord = allGuests?.find(guest => guest.is_primary_guest)
      
      // Set primary guest details
      setPrimaryGuest({
        name: booking.guest_name || '',
        phone: booking.guest_phone || '',
        whatsapp: primaryGuestRecord?.whatsapp || '',
        telegram: primaryGuestRecord?.telegram || ''
      })
      
      // Reset checkbox states
      setPrimaryWhatsAppSame(primaryGuestRecord?.whatsapp === primaryGuestRecord?.phone)
      setPrimaryTelegramSame(primaryGuestRecord?.telegram === primaryGuestRecord?.phone)
      
      // Set additional guests
      const nonPrimaryGuests = (allGuests?.filter(guest => !guest.is_primary_guest) || []) as Guest[]
      setAdditionalGuests(nonPrimaryGuests)
      
      // Initialize checkbox states for additional guests
      const whatsappSameStates = nonPrimaryGuests.map(guest => guest.whatsapp === guest.phone)
      const telegramSameStates = nonPrimaryGuests.map(guest => guest.telegram === guest.phone)
      
      setGuestWhatsAppSame(whatsappSameStates)
      setGuestTelegramSame(telegramSameStates)
    } catch (error) {
      console.error('Error loading guest details:', error)
    }
  }, [reservationId])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate primary guest
    const primaryErrors = GuestService.validateGuest(primaryGuest, 'primary')
    Object.assign(newErrors, primaryErrors)

    // Validate additional guests
    additionalGuests.forEach((guest, index) => {
      const guestFormData: GuestFormData = {
        name: guest.name,
        phone: guest.phone || '',
        whatsapp: guest.whatsapp || '',
        telegram: guest.telegram || ''
      }
      const guestErrors = GuestService.validateGuest(guestFormData, `guest${index}`)
      Object.assign(newErrors, guestErrors)
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const saveGuestDetails = async (): Promise<boolean> => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      })
      return false
    }

    setLoading(true)
    try {
      const existingGuests = await GuestService.getGuestsByReservation(reservationId)
      
      // Update primary guest
      await GuestService.updatePrimaryGuest(reservationId, primaryGuest, existingGuests || [])
      
      // Update additional guests
      await GuestService.updateAdditionalGuests(reservationId, additionalGuests, existingGuests || [])

      toast({
        title: "Success",
        description: "Guest details updated successfully.",
      })
      
      return true
    } catch (error) {
      console.error('Error updating guest details:', error)
      toast({
        title: "Update Error",
        description: "Failed to update guest details.",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const addAdditionalGuest = () => {
    const newGuest: Guest = {
      id: crypto.randomUUID(),
      reservation_id: reservationId,
      name: '',
      phone: '',
      whatsapp: '',
      telegram: '',
      is_primary_guest: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    setAdditionalGuests([...additionalGuests, newGuest])
    setGuestWhatsAppSame([...guestWhatsAppSame, false])
    setGuestTelegramSame([...guestTelegramSame, false])
  }

  const removeAdditionalGuest = (index: number) => {
    setAdditionalGuests(additionalGuests.filter((_, i) => i !== index))
    setGuestWhatsAppSame(guestWhatsAppSame.filter((_, i) => i !== index))
    setGuestTelegramSame(guestTelegramSame.filter((_, i) => i !== index))
  }

  const updateAdditionalGuest = (index: number, field: keyof Guest, value: string) => {
    const updated = [...additionalGuests]
    updated[index] = { ...updated[index], [field]: value }
    
    if (field === 'phone' && guestWhatsAppSame[index]) {
      updated[index].whatsapp = value
    }
    
    if (field === 'phone' && guestTelegramSame[index]) {
      updated[index].telegram = value
    }
    
    setAdditionalGuests(updated)
  }

  const updatePrimaryGuestField = (field: keyof GuestFormData, value: string) => {
    const updatedGuest = { ...primaryGuest, [field]: value }
    
    if (field === 'phone') {
      if (primaryWhatsAppSame) {
        updatedGuest.whatsapp = value
      }
      if (primaryTelegramSame) {
        updatedGuest.telegram = value
      }
    }
    
    setPrimaryGuest(updatedGuest)
  }

  return {
    loading,
    errors,
    primaryGuest,
    additionalGuests,
    primaryWhatsAppSame,
    primaryTelegramSame,
    guestWhatsAppSame,
    guestTelegramSame,
    loadGuestDetails,
    saveGuestDetails,
    addAdditionalGuest,
    removeAdditionalGuest,
    updateAdditionalGuest,
    updatePrimaryGuestField,
    setPrimaryWhatsAppSame,
    setPrimaryTelegramSame,
    setGuestWhatsAppSame,
    setGuestTelegramSame
  }
}