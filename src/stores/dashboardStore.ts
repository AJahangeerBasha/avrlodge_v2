import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getAllRooms } from '@/lib/rooms'
import { getAllReservations } from '@/lib/reservations'
import { getAllReservationRooms } from '@/lib/reservationRooms'

export type DateFilterType =
  | 'today'
  | 'yesterday'
  | 'tomorrow'
  | 'this_week'
  | 'this_month'
  | 'all_time'
  | string // For specific month keys like '012025'

export interface DateFilter {
  type: DateFilterType
  label: string
  startDate?: string
  endDate?: string
}

export interface DashboardFilters {
  dateFilter: DateFilterType
  customStartDate?: string
  customEndDate?: string
}

export interface DashboardMetrics {
  // Room Status Metrics
  totalRooms: number
  reservedRoomsNoPayment: number // status: reservation
  bookedRoomsWithPayment: number // status: booking
  availableRooms: number // Total - (Reserved + Booked + CheckedIn)

  // Check-in Status Metrics
  checkedInRooms: number // status: checked_in
  checkInDue: number // reservation/booking with checkInDate = today
  checkOutDue: number // checked_in with checkOutDate = today

  // Guest Metrics
  currentGuests: number // sum of guestCount for checked_in reservations
  expectedGuests: number // sum of guestCount for reservation + booking

  // Cancellation Metrics
  totalCancellations: number // status: cancelled
}

export interface DashboardState {
  // Data
  metrics: DashboardMetrics
  reservations: any[]
  rooms: any[]
  reservationRooms: any[]

  // Filters
  filters: DashboardFilters
  showFilters: boolean

  // UI State
  isLoading: boolean
  lastRefreshTime: string
  error: string | null

  // Real-time subscription management
  unsubscribers: Unsubscribe[]
  isSubscribed: boolean

  // Actions
  setMetrics: (metrics: DashboardMetrics) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setLastRefreshTime: (time: string) => void

  // Filter Actions
  setDateFilter: (filter: DateFilterType) => void
  setShowFilters: (show: boolean) => void
  resetFilters: () => void

  // Filter Utilities
  getDateRange: (filter: DateFilterType) => { startDate: string; endDate: string }
  getUpcomingMonths: () => Array<{ key: string; label: string }>
  getAvailableDateFilters: () => DateFilter[]

  // Data management
  startRealtimeListeners: () => Promise<void>
  stopRealtimeListeners: () => void
  loadInitialData: () => Promise<void>
  calculateMetrics: () => void
  reset: () => void
}

// Initial metrics
const initialMetrics: DashboardMetrics = {
  totalRooms: 0,
  reservedRoomsNoPayment: 0,
  bookedRoomsWithPayment: 0,
  availableRooms: 0,
  checkedInRooms: 0,
  checkInDue: 0,
  checkOutDue: 0,
  currentGuests: 0,
  expectedGuests: 0,
  totalCancellations: 0
}

// Initial state
const initialState = {
  metrics: initialMetrics,
  reservations: [],
  rooms: [],
  reservationRooms: [],
  filters: {
    dateFilter: 'today' as DateFilterType
  },
  showFilters: true,
  isLoading: false,
  lastRefreshTime: '',
  error: null,
  unsubscribers: [],
  isSubscribed: false
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

      // Basic setters
      setMetrics: (metrics) => set({ metrics }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setLastRefreshTime: (time) => set({ lastRefreshTime: time }),

      // Filter actions
      setDateFilter: (filter) => {
        set((state) => ({
          filters: { ...state.filters, dateFilter: filter }
        }))
        // Recalculate metrics after filter change
        setTimeout(() => get().calculateMetrics(), 0)
      },
      setShowFilters: (show) => set({ showFilters: show }),
      resetFilters: () => {
        set((state) => ({
          filters: { dateFilter: 'today' as DateFilterType }
        }))
        // Recalculate metrics after filter reset
        setTimeout(() => get().calculateMetrics(), 0)
      },

      // Filter utilities
      getDateRange: (filter) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        switch (filter) {
          case 'today': {
            const todayStr = today.toISOString().split('T')[0]
            return { startDate: todayStr, endDate: todayStr }
          }
          case 'yesterday': {
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = yesterday.toISOString().split('T')[0]
            return { startDate: yesterdayStr, endDate: yesterdayStr }
          }
          case 'tomorrow': {
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)
            const tomorrowStr = tomorrow.toISOString().split('T')[0]
            return { startDate: tomorrowStr, endDate: tomorrowStr }
          }
          case 'this_week': {
            const dayOfWeek = today.getDay()
            const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
            const startOfWeek = new Date(today)
            startOfWeek.setDate(today.getDate() - daysFromMonday)
            const endOfWeek = new Date(startOfWeek)
            endOfWeek.setDate(startOfWeek.getDate() + 6)
            return {
              startDate: startOfWeek.toISOString().split('T')[0],
              endDate: endOfWeek.toISOString().split('T')[0]
            }
          }
          case 'this_month': {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
            return {
              startDate: startOfMonth.toISOString().split('T')[0],
              endDate: endOfMonth.toISOString().split('T')[0]
            }
          }
          case 'all_time':
            return { startDate: '', endDate: '' }
          default: {
            // Handle specific month format like '012025'
            if (filter.length === 6) {
              const month = parseInt(filter.substring(0, 2))
              const year = parseInt(filter.substring(2))
              const startOfMonth = new Date(year, month - 1, 1)
              const endOfMonth = new Date(year, month, 0)
              return {
                startDate: startOfMonth.toISOString().split('T')[0],
                endDate: endOfMonth.toISOString().split('T')[0]
              }
            }
            return { startDate: '', endDate: '' }
          }
        }
      },

      getUpcomingMonths: () => {
        const months = []
        const now = new Date()

        for (let i = -2; i <= 6; i++) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() + i)
          const month = monthDate.getMonth() + 1
          const year = monthDate.getFullYear()
          const key = `${month.toString().padStart(2, '0')}${year}`
          const label = monthDate.toLocaleDateString('en-IN', {
            month: 'long',
            year: 'numeric'
          })
          months.push({ key, label })
        }

        return months
      },

      getAvailableDateFilters: () => [
        { type: 'today', label: 'Today' },
        { type: 'yesterday', label: 'Yesterday' },
        { type: 'tomorrow', label: 'Tomorrow' },
        { type: 'this_week', label: 'This Week' },
        { type: 'this_month', label: 'This Month' },
        { type: 'all_time', label: 'All Time' }
      ],

      // Calculate metrics from current data
      calculateMetrics: () => {
        const state = get()
        const { reservations, rooms, filters } = state

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayString = today.toISOString().split('T')[0]

        // Apply date filter to reservations
        let filteredReservations = reservations.filter(r => !r.deletedAt)

        if (filters.dateFilter !== 'all_time') {
          const dateRange = get().getDateRange(filters.dateFilter)
          if (dateRange.startDate && dateRange.endDate) {
            filteredReservations = filteredReservations.filter(r => {
              const checkInDate = r.checkInDate
              const checkOutDate = r.checkOutDate

              // Check if reservation overlaps with the date range
              return (
                (checkInDate >= dateRange.startDate && checkInDate <= dateRange.endDate) ||
                (checkOutDate >= dateRange.startDate && checkOutDate <= dateRange.endDate) ||
                (checkInDate <= dateRange.startDate && checkOutDate >= dateRange.endDate)
              )
            })
          }
        }

        // Filter active reservations (not cancelled or checked_out)
        const activeReservations = filteredReservations

        // Room Status Metrics
        const reservedRoomsNoPayment = activeReservations.filter(r => r.status === 'reservation').length
        const bookedRoomsWithPayment = activeReservations.filter(r => r.status === 'booking').length
        const checkedInRooms = activeReservations.filter(r => r.status === 'checked_in').length
        const totalCancellations = filteredReservations.filter(r => r.status === 'cancelled').length

        // Available rooms = Total - (Reserved + Booked + CheckedIn)
        const totalRooms = rooms.filter(r => !r.deletedAt && r.isActive).length
        const occupiedRooms = reservedRoomsNoPayment + bookedRoomsWithPayment + checkedInRooms
        const availableRooms = Math.max(0, totalRooms - occupiedRooms)

        // Check-in/Check-out Due (today's date)
        const checkInDue = activeReservations.filter(r =>
          ['reservation', 'booking'].includes(r.status) &&
          r.checkInDate === todayString
        ).length

        const checkOutDue = activeReservations.filter(r =>
          r.status === 'checked_in' &&
          r.checkOutDate === todayString
        ).length

        // Guest Metrics
        const currentGuests = activeReservations
          .filter(r => r.status === 'checked_in')
          .reduce((sum, r) => sum + (r.guestCount || 0), 0)

        const expectedGuests = activeReservations
          .filter(r => ['reservation', 'booking'].includes(r.status))
          .reduce((sum, r) => sum + (r.guestCount || 0), 0)

        const metrics: DashboardMetrics = {
          totalRooms,
          reservedRoomsNoPayment,
          bookedRoomsWithPayment,
          availableRooms,
          checkedInRooms,
          checkInDue,
          checkOutDue,
          currentGuests,
          expectedGuests,
          totalCancellations
        }

        set({
          metrics,
          lastRefreshTime: new Date().toISOString()
        })
      },

      // Load initial data
      loadInitialData: async () => {
        const state = get()
        if (state.isLoading) return

        set({ isLoading: true, error: null })

        try {
          // Load all data in parallel
          const [allRooms, allReservations] = await Promise.all([
            getAllRooms(),
            getAllReservations()
          ])

          set({
            rooms: allRooms,
            reservations: allReservations,
            isLoading: false
          })

          // Calculate metrics after data is loaded
          get().calculateMetrics()

        } catch (error) {
          console.error('Error loading dashboard data:', error)
          set({
            error: 'Failed to load dashboard data',
            isLoading: false
          })
        }
      },

      // Start real-time listeners
      startRealtimeListeners: async () => {
        const state = get()
        if (state.isSubscribed) return

        console.log('🔄 Starting dashboard real-time listeners...')

        // Unsubscribe from any existing listeners
        state.unsubscribers.forEach(unsubscribe => unsubscribe())

        const newUnsubscribers: Unsubscribe[] = []

        try {
          // Listen to reservations changes
          const reservationsRef = collection(db, 'reservations')
          const reservationsQuery = query(
            reservationsRef,
            orderBy('createdAt', 'desc')
          )

          const reservationsUnsubscribe = onSnapshot(reservationsQuery, (snapshot) => {
            console.log('📊 Dashboard: Reservations updated')
            const reservationDocs = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))

            set({ reservations: reservationDocs })
            get().calculateMetrics()
          })

          newUnsubscribers.push(reservationsUnsubscribe)

          // Listen to rooms changes
          const roomsRef = collection(db, 'rooms')
          const roomsQuery = query(roomsRef, orderBy('updatedAt', 'desc'))

          const roomsUnsubscribe = onSnapshot(roomsQuery, (snapshot) => {
            console.log('🏠 Dashboard: Rooms updated')
            const roomDocs = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))

            set({ rooms: roomDocs })
            get().calculateMetrics()
          })

          newUnsubscribers.push(roomsUnsubscribe)

          set({
            unsubscribers: newUnsubscribers,
            isSubscribed: true
          })

          console.log('✅ Dashboard real-time listeners started successfully')

        } catch (error) {
          console.error('Error starting dashboard listeners:', error)

          // Clean up any partial subscriptions
          newUnsubscribers.forEach(unsubscribe => unsubscribe())

          set({
            unsubscribers: [],
            isSubscribed: false,
            error: 'Failed to start real-time updates'
          })
        }
      },

      // Stop real-time listeners
      stopRealtimeListeners: () => {
        const state = get()
        console.log('🛑 Stopping dashboard real-time listeners...')

        state.unsubscribers.forEach(unsubscribe => unsubscribe())

        set({
          unsubscribers: [],
          isSubscribed: false
        })
      },

      // Reset function
      reset: () => {
        const state = get()
        state.unsubscribers.forEach(unsubscribe => unsubscribe())
        set(initialState)
      },
      }),
      {
        name: 'dashboard-store',
        // Only persist filters and UI state, not data
        partialize: (state) => ({
          filters: state.filters,
          showFilters: state.showFilters,
        }),
      }
    ),
    {
      name: 'dashboard-store',
    }
  )
)