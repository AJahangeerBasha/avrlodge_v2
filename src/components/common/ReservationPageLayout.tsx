import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { CheckCircle, UserPlus } from 'lucide-react'
import { supabaseQueries } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/auth-provider'
import { useToast } from '@/hooks/use-toast'
import RegistrationHeader from '@/components/registration/RegistrationHeader'
import GuestDetailsForm from '@/components/registration/GuestDetailsForm'
import LocationDatesForm from '@/components/registration/LocationDatesForm'
import RoomAllocationForm from '@/components/registration/RoomAllocationForm'
import PaymentConfirmationForm from '@/components/registration/PaymentConfirmationForm'
import WhatsAppButton from '@/components/messaging/WhatsAppButton'
import ModernPageLayout from '@/components/common/ModernPageLayout'
import ModernCard from '@/components/common/ModernCard'

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
  id: string
  masterId: string
  name: string
  amount: number
  quantity?: number
  description?: string
}

interface ReservationPageLayoutProps {
  role: 'admin' | 'manager'
}

export default function ReservationPageLayout({ role }: ReservationPageLayoutProps) {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  
  // Edit mode state
  const editReservationId = searchParams.get('edit')
  const isEditMode = !!editReservationId
  const [isLoadingReservation, setIsLoadingReservation] = useState(false)
  const totalSteps = 4
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState<{
    referenceNumber: string
    totalAmount: number
    primaryGuest: Guest
    secondaryGuests: Guest[]
    checkInDate: string
    checkOutDate: string
    roomAllocations: RoomAllocation[]
    guestCount: number
  } | null>(null)

  // Step 1: Guest Details
  const [primaryGuest, setPrimaryGuest] = useState<Guest>({
    id: '1',
    name: '',
    phone: '',
    whatsapp: '',
    telegram: ''
  })
  const [secondaryGuests, setSecondaryGuests] = useState<Guest[]>([])
  
  // Track original guest list for edit mode to detect deletions
  const [originalSecondaryGuests, setOriginalSecondaryGuests] = useState<Guest[]>([])

  // Step 2: Location & Dates
  const [searchMethod, setSearchMethod] = useState<'pincode' | 'state-district'>('pincode')
  const [pincode, setPincode] = useState('')
  const [state, setState] = useState('')
  const [town, setTown] = useState('')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [guestCount, setGuestCount] = useState(1)
  const [guestType, setGuestType] = useState('')

  // Step 3: Room Allocation
  const [roomAllocations, setRoomAllocations] = useState<RoomAllocation[]>([])
  
  // Track original room allocations for edit mode to detect changes
  const [originalRoomAllocations, setOriginalRoomAllocations] = useState<RoomAllocation[]>([])

  // Step 4: Payment & Confirmation
  const [specialCharges, setSpecialCharges] = useState<SpecialCharge[]>([])
  const [discountType, setDiscountType] = useState<'percentage' | 'amount' | 'none'>('none')
  
  // Track original special charges for edit mode to detect changes
  const [originalSpecialCharges, setOriginalSpecialCharges] = useState<SpecialCharge[]>([])
  const [discountValue, setDiscountValue] = useState(0)

  // Ensure we always start at step 1
  useEffect(() => {
    setCurrentStep(1)
  }, [])

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  // Load existing reservation data in edit mode
  useEffect(() => {
    if (isEditMode && editReservationId && role === 'admin') {
      loadReservationForEdit(editReservationId)
    }
  }, [isEditMode, editReservationId, role])

  const loadReservationForEdit = async (reservationId: string) => {
    setIsLoadingReservation(true)
    try {
      // Get reservation basic data first
      const reservation = await supabaseQueries.getReservationById(reservationId)
      
      if (!reservation) {
        toast({
          title: "Reservation Not Found",
          description: "The reservation you're trying to edit could not be found.",
          variant: "destructive",
        })
        navigate(`/${role}/bookings`)
        console.log('Navigate to bookings')
        return
      }

      // Get related data separately to avoid relationship issues
      const guests = await supabaseQueries.getGuestsByReservation(reservationId)
      const reservationRooms = await supabaseQueries.getReservationRoomsWithStatus(reservationId)
      
      // Get special charges with a direct query
      const { data: specialChargesData } = await supabase
        .from('reservation_special_charges')
        .select(`
          *,
          special_charges_master (
            charge_name,
            default_rate,
            rate_type
          )
        `)
        .eq('reservation_id', reservationId)
        .is('deleted_at', null)

      // Set primary guest data
      const primaryGuestData = guests?.find(g => g.is_primary_guest)
      if (primaryGuestData || reservation) {
        setPrimaryGuest({
          id: primaryGuestData?.id || '1',
          name: reservation.guest_name || '',
          phone: reservation.guest_phone || '',
          whatsapp: primaryGuestData?.whatsapp || '',
          telegram: primaryGuestData?.telegram || ''
        })
      }

      // Set secondary guests
      const secondaryGuestsData = guests?.filter(g => !g.is_primary_guest) || []
      const mappedSecondaryGuests = secondaryGuestsData.map(g => ({
        id: g.id,
        name: g.name,
        phone: g.phone || '',
        whatsapp: g.whatsapp || '',
        telegram: g.telegram || ''
      }))
      setSecondaryGuests(mappedSecondaryGuests)
      
      // Store original list to track deletions
      setOriginalSecondaryGuests([...mappedSecondaryGuests])

      // Set dates and location data
      setCheckInDate(reservation.check_in_date || '')
      setCheckOutDate(reservation.check_out_date || '')
      setGuestCount(reservation.guest_count || 1)

      // Set room allocations
      if (reservationRooms && reservationRooms.length > 0) {
        console.log('🏠 reservationRooms data structure:', reservationRooms[0])
        
        const roomAllocations = reservationRooms.map((room: any) => {
          console.log('🏠 Processing room:', room)
          console.log('🏠 Room.rooms structure:', room.rooms)
          
          // Access room data from the nested rooms object
          const roomData = room.rooms || {}
          const roomTypeData = roomData.room_types || {}
          
          // Get values from the correct nested structure
          const capacity = roomTypeData.max_guests || roomData.capacity || room.capacity || 0
          const tariff = roomTypeData.price_per_night || roomData.tariff || room.tariff_per_night || room.tariff || 0
          const room_number = roomData.room_number || room.room_number || ''
          const room_type = roomTypeData.name || roomData.room_type || room.room_type || ''
          
          console.log('🏠 Extracted values:', { capacity, tariff, room_number, room_type })
          
          return {
            id: room.id,
            room_id: room.room_id,
            room_number,
            room_type,
            capacity,
            tariff,
            guest_count: room.guest_count || 1
          }
        })
        
        console.log('🏠 Final room allocations:', roomAllocations)
        setRoomAllocations(roomAllocations)
        
        // Store original list to track changes
        setOriginalRoomAllocations([...roomAllocations])
      }

      // Set special charges from direct query
      if (specialChargesData && specialChargesData.length > 0) {
        const charges = specialChargesData.map((charge: any) => ({
          id: charge.id,
          masterId: charge.special_charge_master_id || charge.special_charge_id,
          name: charge.special_charges_master?.charge_name || charge.custom_description || charge.notes || 'Special Charge',
          amount: charge.custom_rate || charge.total_amount || 0,
          quantity: charge.quantity || 1,
          description: charge.custom_description || charge.notes,
          totalAmount: charge.total_amount || 0
        }))
        setSpecialCharges(charges)
        
        // Store original list to track changes
        setOriginalSpecialCharges([...charges])
      }

      // Set guest type to 'friends' in edit mode
      setGuestType('friends')

      // Set discount if available
      if (reservation.percentage_discount && reservation.percentage_discount > 0) {
        setDiscountType('percentage')
        setDiscountValue(reservation.percentage_discount)
      } else if (reservation.fixed_discount && reservation.fixed_discount > 0) {
        setDiscountType('amount')
        setDiscountValue(reservation.fixed_discount)
      }

      toast({
        title: "Reservation Loaded",
        description: `Editing reservation ${reservation.reference_number}`,
      })

    } catch (error) {
      console.error('Error loading reservation for edit:', error)
      toast({
        title: "Error Loading Reservation",
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: "destructive",
      })
      navigate(`/${role}/bookings`)
        console.log('Navigate to bookings')
    } finally {
      setIsLoadingReservation(false)
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleConfirm = async () => {
    if (!user || !profile) {
      toast({
        title: "Authentication Required",
        description: `Please log in to ${isEditMode ? 'update' : 'create'} a reservation.`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      // Prepare reservation data
      const reservationData = {
        primaryGuest,
        secondaryGuests,
        location: {
          pincode,
          state,
          town
        },
        dates: {
          check_in: checkInDate,
          check_out: checkOutDate
        },
        guest_info: {
          count: guestCount,
          type: guestType
        },
        room_allocations: roomAllocations,
        special_charges: specialCharges,
        discount: {
          type: discountType,
          value: discountValue
        }
      }

      if (isEditMode && editReservationId) {
        // Update existing reservation
        console.log('Updating reservation with data:', reservationData)
        
        // Calculate totals
        console.log('💰 About to calculate total amount for reservation update')
        const totalAmount = calculateTotalAmount()
        console.log('💰 Calculated total amount:', totalAmount)
        
        // Get existing payments to calculate correct balance
        const existingPayments = await supabaseQueries.getPaymentsByReservation(editReservationId)
        const totalPaid = existingPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0
        const balancePayment = totalAmount - totalPaid
        console.log('💰 Payments calculation:', { 
          totalAmount, 
          existingPayments: existingPayments?.length || 0,
          totalPaid, 
          balancePayment 
        })
        
        // Update reservation basic data
        const updateData = {
          guest_name: reservationData.primaryGuest.name,
          guest_phone: reservationData.primaryGuest.phone,
          check_in_date: reservationData.dates.check_in,
          check_out_date: reservationData.dates.check_out,
          guest_count: reservationData.guest_info.count,
          total_price: totalAmount,
          total_quote: totalAmount,
          advance_payment: totalPaid,
          balance_payment: balancePayment,
          // Add discount fields if needed
          percentage_discount: reservationData.discount.type === 'percentage' ? reservationData.discount.value : undefined,
          fixed_discount: reservationData.discount.type === 'amount' ? reservationData.discount.value : undefined,
        }
        
        console.log('💾 About to update reservation with data:', updateData)
        console.log('💾 Financial fields being sent:', {
          total_price: updateData.total_price,
          total_quote: updateData.total_quote, 
          advance_payment: updateData.advance_payment,
          balance_payment: updateData.balance_payment,
          percentage_discount: updateData.percentage_discount,
          fixed_discount: updateData.fixed_discount
        })
        try {
          const updatedReservation = await supabaseQueries.updateReservation(editReservationId, updateData)
          console.log('💾 Reservation updated successfully:', updatedReservation)
          
          // Verify the update by fetching the record again
          try {
            const verificationResult = await supabaseQueries.getReservationById(editReservationId)
            console.log('🔍 Verification query result:', {
              total_price: verificationResult.total_price,
              total_quote: verificationResult.total_quote,
              advance_payment: verificationResult.advance_payment,
              balance_payment: verificationResult.balance_payment,
              percentage_discount: verificationResult.percentage_discount,
              fixed_discount: verificationResult.fixed_discount
            })
          } catch (verifyError) {
            console.error('🔍 Error verifying update:', verifyError)
          }
          
        } catch (error) {
          console.error('💾 Error updating reservation:', error)
          throw error
        }
        
        // Update primary guest details (WhatsApp, Telegram)
        if (primaryGuest.id && primaryGuest.id !== '1') { // '1' is default ID for new guests
          try {
            await supabaseQueries.updateGuest(primaryGuest.id, {
              name: primaryGuest.name,
              phone: primaryGuest.phone,
              whatsapp: primaryGuest.whatsapp || undefined,
              telegram: primaryGuest.telegram || undefined
            })
            console.log('Primary guest updated successfully')
          } catch (error) {
            console.error('Error updating primary guest:', error)
          }
        }
        
        // Handle deleted secondary guests (soft delete guests that were removed from the UI)
        const currentGuestIds = secondaryGuests.map(g => g.id).filter(id => id && id.length > 10) // Valid UUID-like IDs
        const deletedGuests = originalSecondaryGuests.filter(originalGuest => 
          originalGuest.id && originalGuest.id.length > 10 && !currentGuestIds.includes(originalGuest.id)
        )
        
        for (const deletedGuest of deletedGuests) {
          try {
            await supabaseQueries.deleteGuest(deletedGuest.id)
            console.log('Guest deleted successfully:', deletedGuest.name, deletedGuest.id)
          } catch (error) {
            console.error('Error deleting guest:', deletedGuest.name, error)
          }
        }
        
        // Handle secondary guests (create new ones, update existing ones)
        for (const guest of secondaryGuests) {
          // Check if this is a new guest (temporary ID from Date.now() or doesn't exist in DB)
          const isNewGuest = !guest.id || guest.id.length < 20 || guest.id.match(/^\d+$/) // timestamp IDs are numeric strings
          
          if (isNewGuest && guest.name.trim() && guest.phone.trim()) {
            // Create new guest
            try {
              await supabaseQueries.createGuest({
                name: guest.name,
                phone: guest.phone,
                whatsapp: guest.whatsapp || undefined,
                telegram: guest.telegram || undefined,
                reservation_id: editReservationId,
                is_primary_guest: false
              })
              console.log('New secondary guest created successfully:', guest.name)
            } catch (error) {
              console.error('Error creating new secondary guest:', error)
            }
          } else if (!isNewGuest && guest.id) {
            // Update existing guest
            try {
              await supabaseQueries.updateGuest(guest.id, {
                name: guest.name,
                phone: guest.phone,
                whatsapp: guest.whatsapp || undefined,
                telegram: guest.telegram || undefined
              })
              console.log('Secondary guest updated successfully:', guest.id)
            } catch (error) {
              console.error('Error updating secondary guest:', error)
            }
          }
        }
        
        // Handle room allocation changes (create new, update existing, delete removed)
        console.log('🏠 Processing room allocation changes...')
        console.log('🏠 Original rooms:', originalRoomAllocations)
        console.log('🏠 Current rooms:', roomAllocations)
        
        // 1. Handle deleted rooms (rooms that were in original but not in current)
        const currentRoomIds = roomAllocations.map(r => r.id).filter(id => id && id.length > 10) // Valid UUID-like IDs
        const deletedRooms = originalRoomAllocations.filter(originalRoom => 
          originalRoom.id && originalRoom.id.length > 10 && !currentRoomIds.includes(originalRoom.id)
        )
        
        for (const deletedRoom of deletedRooms) {
          try {
            await supabaseQueries.deleteReservationRoom(deletedRoom.id)
            console.log('🏠 Room deleted successfully:', deletedRoom.room_number, deletedRoom.id)
          } catch (error) {
            console.error('🏠 Error deleting room:', deletedRoom.room_number, error)
          }
        }
        
        // 2. Handle room updates and new room creation
        for (const room of roomAllocations) {
          // Check if this is a new room (temporary ID from crypto.randomUUID() or short ID)
          const isNewRoom = !room.id || room.id.length < 30 || !originalRoomAllocations.find(orig => orig.id === room.id)
          
          // Check if this is a room number change (same ID but different room_number or room_id)
          const originalRoom = originalRoomAllocations.find(orig => orig.id === room.id)
          const isRoomChanged = originalRoom && (
            originalRoom.room_number !== room.room_number || 
            originalRoom.room_id !== room.room_id
          )
          
          if (isRoomChanged && room.id) {
            // Room number/type changed - soft delete old record and create new one
            try {
              console.log(`🏠 Room changed: ${originalRoom.room_number} → ${room.room_number}, soft deleting old record and creating new one`)
              
              // Soft delete the old record
              await supabaseQueries.deleteReservationRoom(room.id)
              console.log('🏠 Old room soft deleted:', originalRoom.room_number, room.id)
              
              // Create new record with new room details
              await supabaseQueries.createReservationRoom({
                reservation_id: editReservationId,
                room_id: room.room_id,
                room_number: room.room_number,
                room_type: room.room_type,
                guest_count: room.guest_count,
                tariff_per_night: room.tariff
              })
              console.log('🏠 New room created for changed room:', room.room_number)
            } catch (error) {
              console.error('🏠 Error handling room change:', room.room_number, error)
            }
          } else if (isNewRoom && room.room_id) {
            // Create new room allocation
            try {
              await supabaseQueries.createReservationRoom({
                reservation_id: editReservationId,
                room_id: room.room_id,
                room_number: room.room_number,
                room_type: room.room_type,
                guest_count: room.guest_count,
                tariff_per_night: room.tariff
              })
              console.log('🏠 New room created successfully:', room.room_number)
            } catch (error) {
              console.error('🏠 Error creating new room:', room.room_number, error)
            }
          } else if (!isNewRoom && !isRoomChanged && room.id) {
            // Update existing room allocation (only guest_count or tariff changes)
            try {
              await supabaseQueries.updateReservationRoom(room.id, {
                room_id: room.room_id,
                room_number: room.room_number,
                room_type: room.room_type,
                guest_count: room.guest_count,
                tariff_per_night: room.tariff
              })
              console.log('🏠 Room updated successfully:', room.room_number, room.id)
            } catch (error) {
              console.error('🏠 Error updating room:', room.room_number, error)
            }
          }
        }
        
        // Handle special charges changes (create new, update existing, delete removed)
        console.log('💰 Processing special charges changes...')
        console.log('💰 Original charges:', originalSpecialCharges)
        console.log('💰 Current charges:', specialCharges)
        
        // 1. Handle deleted charges (charges that were in original but not in current)
        const currentChargeIds = specialCharges.map(c => c.id).filter(id => id && id.length > 10) // Valid UUID-like IDs
        const deletedCharges = originalSpecialCharges.filter(originalCharge => 
          originalCharge.id && originalCharge.id.length > 10 && !currentChargeIds.includes(originalCharge.id)
        )
        
        for (const deletedCharge of deletedCharges) {
          try {
            await supabaseQueries.deleteReservationSpecialCharge(deletedCharge.id)
            console.log('💰 Charge deleted successfully:', deletedCharge.name, deletedCharge.id)
          } catch (error) {
            console.error('💰 Error deleting charge:', deletedCharge.name, error)
          }
        }
        
        // 2. Handle charge updates and new charge creation using upsert
        for (const charge of specialCharges) {
          // Only process charges that have a masterId (charge_id)
          if (charge.masterId) {
            try {
              await supabaseQueries.upsertReservationSpecialCharge({
                reservation_id: editReservationId,
                charge_id: charge.masterId,
                custom_description: charge.description || charge.name,
                custom_rate: charge.amount || 0,
                quantity: charge.quantity || 1,
                total_amount: (charge.amount || 0) * (charge.quantity || 1)
              })
              console.log('💰 Charge upserted successfully:', charge.name)
            } catch (error) {
              console.error('💰 Error upserting charge:', charge.name, error)
            }
          } else {
            console.warn('💰 Skipping charge without masterId:', charge.name)
          }
        }
        
        toast({
          title: "Reservation Updated",
          description: "The reservation, guest details, room allocations, and special charges have been successfully updated.",
        })

        // Navigate back to bookings
        navigate(`/${role}/bookings`)
        console.log('Navigate to bookings')
        return

      } else {
        // Create new reservation
        console.log('Creating reservation with data:', reservationData)
        
        const { reservation, referenceNumber } = await supabaseQueries.createReservationFromRegistration(reservationData)
        
        console.log('Reservation created successfully:', { reservation, referenceNumber })
        
        // Show success modal - store data before resetting form
        setSuccessData({
          referenceNumber,
          totalAmount: calculateTotalAmount(),
          primaryGuest: { ...primaryGuest },
          secondaryGuests: [...secondaryGuests],
          checkInDate,
          checkOutDate,
          roomAllocations: [...roomAllocations],
          guestCount
        })
        setShowSuccessModal(true)
        
        // Reset form
        setCurrentStep(1)
        setPrimaryGuest({
          id: '1',
          name: '',
          phone: '',
          whatsapp: '',
          telegram: ''
        })
        setSecondaryGuests([])
        setSearchMethod('pincode')
        setPincode('')
        setState('')
        setTown('')
        setCheckInDate('')
        setCheckOutDate('')
        setGuestCount(1)
        setGuestType('')
        setRoomAllocations([])
        setSpecialCharges([])
        setDiscountType('none')
        setDiscountValue(0)
      }
      
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} reservation:`, error)
      toast({
        title: `Reservation ${isEditMode ? 'Update' : 'Creation'} Failed`,
        description: error instanceof Error ? error.message : `An unknown error occurred while ${isEditMode ? 'updating' : 'creating'} the reservation.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateTotalAmount = () => {
    console.log('💰 Current roomAllocations state:', roomAllocations)
    console.log('💰 Current specialCharges state:', specialCharges)
    
    // Calculate number of days
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const numberOfDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    
    const roomTariff = roomAllocations.reduce((total, room) => {
      const roomTotal = room.tariff * numberOfDays
      console.log('💰 Adding room tariff:', room.room_number, 'tariff:', room.tariff, 'days:', numberOfDays, 'total:', roomTotal)
      return total + roomTotal
    }, 0)
    
    const specialChargesTotal = specialCharges.reduce((total, charge) => {
      const chargeTotal = charge.amount * (charge.quantity || 1)
      console.log('💰 Adding special charge:', charge.name, 'amount:', charge.amount, 'quantity:', charge.quantity || 1, 'total:', chargeTotal)
      return total + chargeTotal
    }, 0)
    
    const subtotal = roomTariff + specialChargesTotal
    
    let discount = 0
    if (discountType === 'percentage') {
      discount = (subtotal * discountValue) / 100
    } else if (discountType === 'amount') {
      discount = discountValue
    }
    
    const finalTotal = subtotal - discount
    
    console.log('💰 Total calculation:', {
      roomTariff,
      specialChargesTotal,
      subtotal,
      discountType,
      discountValue,
      discount,
      finalTotal
    })
    
    return finalTotal
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <GuestDetailsForm
            primaryGuest={primaryGuest}
            secondaryGuests={secondaryGuests}
            onPrimaryGuestChange={setPrimaryGuest}
            onSecondaryGuestsChange={setSecondaryGuests}
            onNext={handleNext}
          />
        )
      case 2:
        return (
          <LocationDatesForm
            searchMethod={searchMethod}
            pincode={pincode}
            state={state}
            town={town}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            guestCount={guestCount}
            guestType={guestType}
            isEditMode={isEditMode}
            onSearchMethodChange={setSearchMethod}
            onPincodeChange={setPincode}
            onStateChange={setState}
            onTownChange={setTown}
            onCheckInDateChange={setCheckInDate}
            onCheckOutDateChange={setCheckOutDate}
            onGuestCountChange={setGuestCount}
            onGuestTypeChange={setGuestType}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 3:
        return (
          <RoomAllocationForm
            guestCount={guestCount}
            guestType={guestType}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            currentAllocations={roomAllocations}
            isEditMode={isEditMode}
            onRoomAllocationChange={setRoomAllocations}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 4:
        return (
          <PaymentConfirmationForm
            roomAllocations={roomAllocations}
            specialCharges={specialCharges}
            discountType={discountType}
            discountValue={discountValue}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            onSpecialChargesChange={setSpecialCharges}
            onDiscountTypeChange={setDiscountType}
            onDiscountValueChange={setDiscountValue}
            onConfirm={handleConfirm}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        )
      default:
        return null
    }
  }

  return (
    <ModernPageLayout
      title={isEditMode ? "Edit Reservation" : "Create Reservation"}
      subtitle={isEditMode ? "Update the reservation details below" : "Complete the form to create a new guest reservation"}
      icon={UserPlus}
      headerContent={
        <RegistrationHeader
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      }
      containerClassName="max-w-5xl"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ModernCard>
            {isLoadingReservation ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading reservation data...</p>
                </div>
              </div>
            ) : (
              renderCurrentStep()
            )}
          </ModernCard>
        </motion.div>
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && successData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Reservation Created Successfully!
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Reference Number</p>
                    <p className="text-lg font-mono font-semibold text-gray-900">
                      {successData.referenceNumber}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ₹{successData.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  
                  {successData && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-3">Send WhatsApp Confirmation</p>
                      <WhatsAppButton 
                        data={successData}
                        variant="default"
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 mb-6">
                  You can view this reservation in the {role} dashboard.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowSuccessModal(false)
                      navigate(`/${role}/bookings`)
        console.log('Navigate to bookings')
                    }}
                    className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Go to Bookings
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModernPageLayout>
  )
}