import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// Types
export type DateFilterType = 'today' | 'yesterday' | 'tomorrow' | 'this_weekend' | 'current_week' | 'last_week' | 'next_week' | 'current_month' | 'previous_month' | 'next_month' | 'all' | string
export type StatusFilterType = 'all_status' | 'reservation' | 'booking' | 'checked_in' | 'checked_out' | 'cancelled' | 'pending_payments'

export interface Booking {
  id: string
  reference_number: string
  guest_name: string
  guest_phone: string
  guest_email: string
  check_in_date: string
  check_out_date: string
  total_quote: number
  total_paid: number
  remaining_balance: number
  status: 'reservation' | 'booking' | 'checked_in' | 'checked_out' | 'cancelled'
  payment_status: 'pending' | 'partial' | 'paid'
  guest_count: number
  room_numbers?: string
  agent_id?: string | null
  agent_commission?: number | null
  agent_name?: string | null
  reservation_rooms?: Array<{
    id?: string
    room_number: string
    room_type: string
    guest_count: number
    room_status?: 'pending' | 'checked_in' | 'checked_out'
    check_in_datetime?: string | null
    check_out_datetime?: string | null
  }>
  reservation_special_charges?: Array<{
    id: string
    custom_rate: number
    quantity: number
    total_amount: number
    special_charges_master?: {
      charge_name: string
      default_rate: number
      rate_type: string
    }
  }>
  created_at: string
}

interface BookingsState {
  // Data
  bookings: Booking[]
  filteredBookings: Booking[]

  // UI State
  loading: boolean
  error: string | null
  isSearchMode: boolean
  searchQuery: string
  refreshing: boolean
  hasLoadedOnce: boolean

  // Filters (persisted in localStorage)
  dateFilter: DateFilterType
  statusFilter: StatusFilterType

  // Modal State
  modals: {
    payment: { isOpen: boolean; booking: Booking | null }
    checkIn: { isOpen: boolean; booking: Booking | null; room: any | null }
    checkOut: { isOpen: boolean; booking: Booking | null; room: any | null }
    roomChange: { isOpen: boolean; booking: Booking | null; room: any | null }
  }
}

interface BookingsActions {
  // Data Actions
  setBookings: (bookings: Booking[]) => void
  loadBookings: (statusFilter?: StatusFilterType, dateFilter?: DateFilterType) => Promise<void>
  refreshBookings: () => Promise<void>

  // UI Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSearchMode: (isSearchMode: boolean) => void
  setSearchQuery: (query: string) => void
  setRefreshing: (refreshing: boolean) => void
  setHasLoadedOnce: (hasLoaded: boolean) => void

  // Filter Actions
  setDateFilter: (filter: DateFilterType) => void
  setStatusFilter: (filter: StatusFilterType) => void
  applyFilters: () => void

  // Modal Actions
  openPaymentModal: (booking: Booking) => void
  closePaymentModal: () => void
  openCheckInModal: (booking: Booking, room: any) => void
  closeCheckInModal: () => void
  openCheckOutModal: (booking: Booking, room: any) => void
  closeCheckOutModal: () => void
  openRoomChangeModal: (booking: Booking, room: any) => void
  closeRoomChangeModal: () => void

  // Search Actions
  searchBookings: (query: string) => Promise<void>
  clearSearch: () => void
}

type BookingsStore = BookingsState & BookingsActions

// Helper function to get localStorage values safely
const getLocalStorageValue = (key: string, defaultValue: string): string => {
  if (typeof window === 'undefined') return defaultValue
  return localStorage.getItem(key) || defaultValue
}

// Helper function to set localStorage values safely
const setLocalStorageValue = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value)
  }
}

export const useBookingsStore = create<BookingsStore>()(
  devtools(
    immer(
      persist(
        (set, get) => ({
          // Initial State
          bookings: [],
          filteredBookings: [],
          loading: false,
          error: null,
          isSearchMode: false,
          searchQuery: '',
          refreshing: false,
          hasLoadedOnce: false,

          // Filters from localStorage
          dateFilter: getLocalStorageValue('avr-bookings-date-filter', 'today') as DateFilterType,
          statusFilter: getLocalStorageValue('avr-bookings-status-filter', 'all_status') as StatusFilterType,

          // Modal State
          modals: {
            payment: { isOpen: false, booking: null },
            checkIn: { isOpen: false, booking: null, room: null },
            checkOut: { isOpen: false, booking: null, room: null },
            roomChange: { isOpen: false, booking: null, room: null }
          },

          // Data Actions
          setBookings: (bookings) => set((state) => {
            state.bookings = bookings
            // Apply current filters
            const actions = get()
            actions.applyFilters()
          }),

          loadBookings: async (statusFilter?: StatusFilterType, dateFilter?: DateFilterType) => {
            const state = get()

            // Use provided filters or current state
            const currentStatusFilter = statusFilter || state.statusFilter
            const currentDateFilter = dateFilter || state.dateFilter

            console.log('📊 Store.loadBookings called with filters:', {
              statusFilter: currentStatusFilter,
              dateFilter: currentDateFilter
            })

            set((state) => {
              state.loading = true
              state.error = null
            })

            try {
              // Dynamic import to avoid circular dependencies
              const { bookingsService } = await import('@/services/bookingsService')

              // Load filtered bookings from service
              const filteredBookings = await bookingsService.loadBookings(currentStatusFilter, currentDateFilter)

              set((state) => {
                state.bookings = filteredBookings
                state.filteredBookings = filteredBookings
                state.loading = false
                state.hasLoadedOnce = true
                state.error = null
              })

            } catch (error) {
              console.error('❌ Error in store.loadBookings:', error)
              set((state) => {
                state.loading = false
                state.error = error instanceof Error ? error.message : 'Failed to load bookings'
              })
            }
          },

          refreshBookings: async () => {
            const state = get()
            await state.loadBookings(state.statusFilter, state.dateFilter)
          },

          // UI Actions
          setLoading: (loading) => set((state) => { state.loading = loading }),
          setError: (error) => set((state) => { state.error = error }),
          setSearchMode: (isSearchMode) => set((state) => { state.isSearchMode = isSearchMode }),
          setSearchQuery: (query) => set((state) => { state.searchQuery = query }),
          setRefreshing: (refreshing) => set((state) => { state.refreshing = refreshing }),
          setHasLoadedOnce: (hasLoaded) => set((state) => { state.hasLoadedOnce = hasLoaded }),

          // Filter Actions
          setDateFilter: (filter) => set((state) => {
            state.dateFilter = filter
            setLocalStorageValue('avr-bookings-date-filter', filter)
            // Don't auto-apply filters - let component handle it
          }),

          setStatusFilter: (filter) => set((state) => {
            state.statusFilter = filter
            setLocalStorageValue('avr-bookings-status-filter', filter)
            // Don't auto-apply filters - let component handle it
          }),

          applyFilters: () => set((state) => {
            // Apply filtering logic to bookings
            let filtered = state.bookings

            // Apply status filter
            if (state.statusFilter !== 'all_status') {
              if (state.statusFilter === 'pending_payments') {
                filtered = filtered.filter(booking =>
                  (booking.payment_status === 'pending' || booking.payment_status === 'partial') &&
                  booking.status !== 'cancelled'
                )
              } else {
                filtered = filtered.filter(booking => booking.status === state.statusFilter)
              }
            }

            // Apply date filter (implementation needed)
            // This will filter by check-in dates based on dateFilter value

            state.filteredBookings = filtered
          }),

          // Modal Actions
          openPaymentModal: (booking) => set((state) => {
            state.modals.payment = { isOpen: true, booking }
          }),

          closePaymentModal: () => set((state) => {
            state.modals.payment = { isOpen: false, booking: null }
          }),

          openCheckInModal: (booking, room) => set((state) => {
            state.modals.checkIn = { isOpen: true, booking, room }
          }),

          closeCheckInModal: () => set((state) => {
            state.modals.checkIn = { isOpen: false, booking: null, room: null }
          }),

          openCheckOutModal: (booking, room) => set((state) => {
            state.modals.checkOut = { isOpen: true, booking, room }
          }),

          closeCheckOutModal: () => set((state) => {
            state.modals.checkOut = { isOpen: false, booking: null, room: null }
          }),

          openRoomChangeModal: (booking, room) => set((state) => {
            state.modals.roomChange = { isOpen: true, booking, room }
          }),

          closeRoomChangeModal: () => set((state) => {
            state.modals.roomChange = { isOpen: false, booking: null, room: null }
          }),

          // Search Actions
          searchBookings: async (query) => {
            set((state) => {
              state.isSearchMode = true
              state.searchQuery = query
              state.loading = true
            })

            try {
              // Implement search logic
              const state = get()
              const searchResults = state.bookings.filter((booking) => {
                const searchLower = query.toLowerCase()
                return (
                  booking.reference_number?.toLowerCase().includes(searchLower) ||
                  booking.guest_name?.toLowerCase().includes(searchLower) ||
                  booking.guest_phone?.toLowerCase().includes(searchLower) ||
                  booking.guest_email?.toLowerCase().includes(searchLower) ||
                  booking.room_numbers?.toLowerCase().includes(searchLower) ||
                  booking.status?.toLowerCase().includes(searchLower)
                )
              })

              set((state) => {
                state.filteredBookings = searchResults
                state.loading = false
              })

            } catch (error) {
              set((state) => {
                state.loading = false
                state.error = 'Search failed'
              })
            }
          },

          clearSearch: () => set((state) => {
            state.isSearchMode = false
            state.searchQuery = ''
            // Re-apply normal filters
            const actions = get()
            actions.applyFilters()
          })
        }),
        {
          name: 'bookings-store',
          partialize: (state) => ({
            // Only persist filters in localStorage
            dateFilter: state.dateFilter,
            statusFilter: state.statusFilter
          })
        }
      )
    ),
    {
      name: 'bookings-store'
    }
  )
)

// Individual selector hooks to prevent object recreation issues
export const useBookingsData = () => {
  const bookings = useBookingsStore((state) => state.filteredBookings)
  const loading = useBookingsStore((state) => state.loading)
  const error = useBookingsStore((state) => state.error)
  const hasLoadedOnce = useBookingsStore((state) => state.hasLoadedOnce)

  return { bookings, loading, error, hasLoadedOnce }
}

export const useBookingsFilters = () => {
  const dateFilter = useBookingsStore((state) => state.dateFilter)
  const statusFilter = useBookingsStore((state) => state.statusFilter)
  const isSearchMode = useBookingsStore((state) => state.isSearchMode)
  const searchQuery = useBookingsStore((state) => state.searchQuery)
  const setDateFilter = useBookingsStore((state) => state.setDateFilter)
  const setStatusFilter = useBookingsStore((state) => state.setStatusFilter)

  return { dateFilter, statusFilter, isSearchMode, searchQuery, setDateFilter, setStatusFilter }
}

export const useBookingsModals = () => {
  const modals = useBookingsStore((state) => state.modals)
  const openPaymentModal = useBookingsStore((state) => state.openPaymentModal)
  const closePaymentModal = useBookingsStore((state) => state.closePaymentModal)
  const openCheckInModal = useBookingsStore((state) => state.openCheckInModal)
  const closeCheckInModal = useBookingsStore((state) => state.closeCheckInModal)
  const openCheckOutModal = useBookingsStore((state) => state.openCheckOutModal)
  const closeCheckOutModal = useBookingsStore((state) => state.closeCheckOutModal)
  const openRoomChangeModal = useBookingsStore((state) => state.openRoomChangeModal)
  const closeRoomChangeModal = useBookingsStore((state) => state.closeRoomChangeModal)

  return {
    modals, openPaymentModal, closePaymentModal, openCheckInModal, closeCheckInModal,
    openCheckOutModal, closeCheckOutModal, openRoomChangeModal, closeRoomChangeModal
  }
}

export const useBookingsActions = () => {
  const loadBookings = useBookingsStore((state) => state.loadBookings)
  const refreshBookings = useBookingsStore((state) => state.refreshBookings)
  const searchBookings = useBookingsStore((state) => state.searchBookings)
  const clearSearch = useBookingsStore((state) => state.clearSearch)
  const setSearchMode = useBookingsStore((state) => state.setSearchMode)
  const setSearchQuery = useBookingsStore((state) => state.setSearchQuery)

  return { loadBookings, refreshBookings, searchBookings, clearSearch, setSearchMode, setSearchQuery }
}