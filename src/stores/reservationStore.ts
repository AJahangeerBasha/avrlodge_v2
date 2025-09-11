import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types for the reservation store
export interface Guest {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  telegram?: string;
  usePhoneForWhatsapp?: boolean;
}

export interface RoomAllocation {
  id: string;
  roomId: string;
  roomNumber: string;
  roomType: string;
  capacity: number;
  tariff: number;
  guestCount: number;
}

export interface SpecialCharge {
  id: string;
  masterId: string;
  name: string;
  amount: number;
  quantity?: number;
  description?: string;
}

export interface ReservationState {
  // Current step
  currentStep: number;
  
  // Guest Details (Step 1)
  primaryGuest: Guest;
  secondaryGuests: Guest[];
  
  // Location & Dates (Step 2)
  selectedState: string;
  selectedDistrict: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  guestType: 'Individual' | 'Couple' | 'Family' | 'Friends' | '';
  
  // Room Allocation (Step 3)
  roomAllocations: RoomAllocation[];
  
  // Special Charges & Payment (Step 4)
  specialCharges: SpecialCharge[];
  discountType: 'percentage' | 'amount' | 'none';
  discountValue: number;
  
  // UI State
  isSubmitting: boolean;
  error: string;
  
  // Actions
  setCurrentStep: (step: number) => void;
  
  // Primary Guest Actions
  setPrimaryGuest: (guest: Guest) => void;
  updatePrimaryGuestField: (field: keyof Guest, value: string | boolean) => void;
  
  // Secondary Guests Actions
  addSecondaryGuest: () => void;
  removeSecondaryGuest: (id: string) => void;
  updateSecondaryGuest: (id: string, updates: Partial<Guest>) => void;
  setSecondaryGuests: (guests: Guest[]) => void;
  
  // Location & Dates Actions
  setSelectedState: (state: string) => void;
  setSelectedDistrict: (district: string) => void;
  setCheckInDate: (date: string) => void;
  setCheckOutDate: (date: string) => void;
  setGuestCount: (count: number) => void;
  setGuestType: (type: 'Individual' | 'Couple' | 'Family' | 'Friends' | '') => void;
  
  // Room Allocation Actions
  addRoomAllocation: (room: RoomAllocation) => void;
  removeRoomAllocation: (id: string) => void;
  setRoomAllocations: (rooms: RoomAllocation[]) => void;
  
  // Special Charges Actions
  addSpecialCharge: (charge: SpecialCharge) => void;
  removeSpecialCharge: (id: string) => void;
  setSpecialCharges: (charges: SpecialCharge[]) => void;
  setDiscountType: (type: 'percentage' | 'amount' | 'none') => void;
  setDiscountValue: (value: number) => void;
  
  // UI Actions
  setIsSubmitting: (isSubmitting: boolean) => void;
  setError: (error: string) => void;
  
  // Utility Actions
  resetForm: () => void;
  calculateTotalAmount: () => number;
}

// Initial state
const initialState = {
  currentStep: 1,
  
  // Guest Details
  primaryGuest: {
    id: '1',
    name: '',
    phone: '',
    whatsapp: '',
    telegram: '',
    usePhoneForWhatsapp: false,
  },
  secondaryGuests: [],
  
  // Location & Dates
  selectedState: 'Tamil Nadu', // Default to Tamil Nadu
  selectedDistrict: '',
  checkInDate: '',
  checkOutDate: '',
  guestCount: 1,
  guestType: '' as const,
  
  // Room Allocation
  roomAllocations: [],
  
  // Special Charges
  specialCharges: [],
  discountType: 'none' as const,
  discountValue: 0,
  
  // UI State
  isSubmitting: false,
  error: '',
};

export const useReservationStore = create<ReservationState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Navigation Actions
      setCurrentStep: (step) => set({ currentStep: step }),
      
      // Primary Guest Actions
      setPrimaryGuest: (guest) => set({ primaryGuest: guest }),
      updatePrimaryGuestField: (field, value) => set((state) => ({
        primaryGuest: {
          ...state.primaryGuest,
          [field]: value,
          // Auto-update WhatsApp if "same as phone" is checked
          ...(field === 'phone' && state.primaryGuest.usePhoneForWhatsapp 
            ? { whatsapp: value as string } 
            : {}),
        }
      })),
      
      // Secondary Guests Actions
      addSecondaryGuest: () => set((state) => ({
        secondaryGuests: [
          ...state.secondaryGuests,
          {
            id: crypto.randomUUID(),
            name: '',
            phone: '',
            whatsapp: '',
            telegram: '',
            usePhoneForWhatsapp: false,
          }
        ]
      })),
      
      removeSecondaryGuest: (id) => set((state) => ({
        secondaryGuests: state.secondaryGuests.filter(guest => guest.id !== id)
      })),
      
      updateSecondaryGuest: (id, updates) => set((state) => ({
        secondaryGuests: state.secondaryGuests.map(guest => 
          guest.id === id 
            ? {
                ...guest,
                ...updates,
                // Auto-update WhatsApp if "same as phone" is checked
                ...(updates.phone && guest.usePhoneForWhatsapp 
                  ? { whatsapp: updates.phone } 
                  : {}),
              }
            : guest
        )
      })),
      
      setSecondaryGuests: (guests) => set({ secondaryGuests: guests }),
      
      // Location & Dates Actions
      setSelectedState: (state) => set({ selectedState: state, selectedDistrict: '' }), // Reset district when state changes
      setSelectedDistrict: (district) => set({ selectedDistrict: district }),
      setCheckInDate: (date) => set({ checkInDate: date }),
      setCheckOutDate: (date) => set({ checkOutDate: date }),
      setGuestCount: (count) => set({ guestCount: count }),
      setGuestType: (type) => set({ guestType: type }),
      
      // Room Allocation Actions
      addRoomAllocation: (room) => set((state) => ({
        roomAllocations: [...state.roomAllocations, room]
      })),
      
      removeRoomAllocation: (id) => set((state) => ({
        roomAllocations: state.roomAllocations.filter(room => room.id !== id)
      })),
      
      setRoomAllocations: (rooms) => set({ roomAllocations: rooms }),
      
      // Special Charges Actions
      addSpecialCharge: (charge) => set((state) => ({
        specialCharges: [...state.specialCharges, charge]
      })),
      
      removeSpecialCharge: (id) => set((state) => ({
        specialCharges: state.specialCharges.filter(charge => charge.id !== id)
      })),
      
      setSpecialCharges: (charges) => set({ specialCharges: charges }),
      setDiscountType: (type) => set({ discountType: type }),
      setDiscountValue: (value) => set({ discountValue: value }),
      
      // UI Actions
      setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
      setError: (error) => set({ error }),
      
      // Utility Actions
      resetForm: () => set(initialState),
      
      calculateTotalAmount: () => {
        const state = get();
        
        // Calculate number of days
        const checkIn = new Date(state.checkInDate);
        const checkOut = new Date(state.checkOutDate);
        const numberOfDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        
        const roomTariff = state.roomAllocations.reduce((total, room) => {
          return total + (room.tariff * numberOfDays);
        }, 0);
        
        const specialChargesTotal = state.specialCharges.reduce((total, charge) => {
          return total + (charge.amount * (charge.quantity || 1));
        }, 0);
        
        const subtotal = roomTariff + specialChargesTotal;
        
        let discount = 0;
        if (state.discountType === 'percentage') {
          discount = (subtotal * state.discountValue) / 100;
        } else if (state.discountType === 'amount') {
          discount = state.discountValue;
        }
        
        return subtotal - discount;
      },
    }),
    {
      name: 'reservation-store',
    }
  )
);