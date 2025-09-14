import React, { createContext, useContext, useReducer, ReactNode } from 'react'

// Booking interface
interface Booking {
  id: string
  reference_number: string
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in_date: string
  check_out_date: string
  total_quote: number
  total_paid: number
  remaining_balance: number
  status: 'reservation' | 'booking' | 'checked_in' | 'checked_out' | 'cancelled'
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded'
  guest_count: number
  room_details: Array<{
    id: string
    room_number: string
    room_type: string
    guest_count: number
    room_status: 'pending' | 'checked_in' | 'checked_out'
    check_in_datetime?: string | null
    check_out_datetime?: string | null
  }>
}

// State interface
interface BookingsState {
  bookings: Booking[]
  loading: boolean
  error: string | null
  filters: {
    status?: string
    dateRange?: { start: string; end: string }
    searchTerm?: string
  }
  selectedBooking: Booking | null
  checkInModal: {
    isOpen: boolean
    booking: Booking | null
    room: any | null
  }
  checkOutModal: {
    isOpen: boolean
    booking: Booking | null
    room: any | null
  }
  paymentModal: {
    isOpen: boolean
    booking: Booking | null
  }
  roomChangeModal: {
    isOpen: boolean
    booking: Booking | null
    room: any | null
  }
  refreshCallback?: () => void
}

// Action types
type BookingsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BOOKINGS'; payload: Booking[] }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'UPDATE_BOOKING'; payload: { id: string; updates: Partial<Booking> } }
  | { type: 'REMOVE_BOOKING'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<BookingsState['filters']> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_SELECTED_BOOKING'; payload: Booking | null }
  | { type: 'OPEN_CHECK_IN_MODAL'; payload: { booking: Booking; room: any } }
  | { type: 'CLOSE_CHECK_IN_MODAL' }
  | { type: 'OPEN_CHECK_OUT_MODAL'; payload: { booking: Booking; room: any } }
  | { type: 'CLOSE_CHECK_OUT_MODAL' }
  | { type: 'OPEN_PAYMENT_MODAL'; payload: Booking }
  | { type: 'CLOSE_PAYMENT_MODAL' }
  | { type: 'OPEN_ROOM_CHANGE_MODAL'; payload: { booking: Booking; room: any } }
  | { type: 'CLOSE_ROOM_CHANGE_MODAL' }
  | { type: 'REFRESH_BOOKINGS' }
  | { type: 'SET_REFRESH_CALLBACK'; payload: () => void }

// Initial state
const initialState: BookingsState = {
  bookings: [],
  loading: false,
  error: null,
  filters: {},
  selectedBooking: null,
  checkInModal: {
    isOpen: false,
    booking: null,
    room: null
  },
  checkOutModal: {
    isOpen: false,
    booking: null,
    room: null
  },
  paymentModal: {
    isOpen: false,
    booking: null
  },
  roomChangeModal: {
    isOpen: false,
    booking: null,
    room: null
  }
}

// Reducer
function bookingsReducer(state: BookingsState, action: BookingsAction): BookingsState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      }

    case 'SET_BOOKINGS':
      return {
        ...state,
        bookings: action.payload,
        loading: false,
        error: null
      }

    case 'ADD_BOOKING':
      return {
        ...state,
        bookings: [action.payload, ...state.bookings]
      }

    case 'UPDATE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(booking =>
          booking.id === action.payload.id
            ? { ...booking, ...action.payload.updates }
            : booking
        )
      }

    case 'REMOVE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.filter(booking => booking.id !== action.payload)
      }

    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      }

    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {}
      }

    case 'SET_SELECTED_BOOKING':
      return {
        ...state,
        selectedBooking: action.payload
      }

    case 'OPEN_CHECK_IN_MODAL':
      return {
        ...state,
        checkInModal: {
          isOpen: true,
          booking: action.payload.booking,
          room: action.payload.room
        }
      }

    case 'CLOSE_CHECK_IN_MODAL':
      return {
        ...state,
        checkInModal: {
          isOpen: false,
          booking: null,
          room: null
        }
      }

    case 'OPEN_CHECK_OUT_MODAL':
      return {
        ...state,
        checkOutModal: {
          isOpen: true,
          booking: action.payload.booking,
          room: action.payload.room
        }
      }

    case 'CLOSE_CHECK_OUT_MODAL':
      return {
        ...state,
        checkOutModal: {
          isOpen: false,
          booking: null,
          room: null
        }
      }

    case 'OPEN_PAYMENT_MODAL':
      return {
        ...state,
        paymentModal: {
          isOpen: true,
          booking: action.payload
        }
      }

    case 'CLOSE_PAYMENT_MODAL':
      return {
        ...state,
        paymentModal: {
          isOpen: false,
          booking: null
        }
      }

    case 'OPEN_ROOM_CHANGE_MODAL':
      return {
        ...state,
        roomChangeModal: {
          isOpen: true,
          booking: action.payload.booking,
          room: action.payload.room
        }
      }

    case 'CLOSE_ROOM_CHANGE_MODAL':
      return {
        ...state,
        roomChangeModal: {
          isOpen: false,
          booking: null,
          room: null
        }
      }

    case 'REFRESH_BOOKINGS':
      // Call the refresh callback if it exists
      if (state.refreshCallback) {
        state.refreshCallback()
      }
      return {
        ...state,
        loading: true,
        error: null
      }

    case 'SET_REFRESH_CALLBACK':
      return {
        ...state,
        refreshCallback: action.payload
      }

    default:
      return state
  }
}

// Context
const BookingsContext = createContext<{
  state: BookingsState
  dispatch: React.Dispatch<BookingsAction>
} | null>(null)

// Provider component
interface BookingsProviderProps {
  children: ReactNode
}

export function BookingsProvider({ children }: BookingsProviderProps) {
  const [state, dispatch] = useReducer(bookingsReducer, initialState)

  return (
    <BookingsContext.Provider value={{ state, dispatch }}>
      {children}
    </BookingsContext.Provider>
  )
}

// Custom hook
export function useBookings() {
  const context = useContext(BookingsContext)

  if (!context) {
    throw new Error('useBookings must be used within a BookingsProvider')
  }

  const { state, dispatch } = context

  // Action creators
  const actions = {
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),

    setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),

    setBookings: (bookings: Booking[]) => dispatch({ type: 'SET_BOOKINGS', payload: bookings }),

    addBooking: (booking: Booking) => dispatch({ type: 'ADD_BOOKING', payload: booking }),

    updateBooking: (id: string, updates: Partial<Booking>) =>
      dispatch({ type: 'UPDATE_BOOKING', payload: { id, updates } }),

    removeBooking: (id: string) => dispatch({ type: 'REMOVE_BOOKING', payload: id }),

    setFilters: (filters: Partial<BookingsState['filters']>) =>
      dispatch({ type: 'SET_FILTERS', payload: filters }),

    clearFilters: () => dispatch({ type: 'CLEAR_FILTERS' }),

    setSelectedBooking: (booking: Booking | null) =>
      dispatch({ type: 'SET_SELECTED_BOOKING', payload: booking }),

    openCheckInModal: (booking: Booking, room: any) =>
      dispatch({ type: 'OPEN_CHECK_IN_MODAL', payload: { booking, room } }),

    closeCheckInModal: () => dispatch({ type: 'CLOSE_CHECK_IN_MODAL' }),

    openCheckOutModal: (booking: Booking, room: any) =>
      dispatch({ type: 'OPEN_CHECK_OUT_MODAL', payload: { booking, room } }),

    closeCheckOutModal: () => dispatch({ type: 'CLOSE_CHECK_OUT_MODAL' }),

    openPaymentModal: (booking: Booking) =>
      dispatch({ type: 'OPEN_PAYMENT_MODAL', payload: booking }),

    closePaymentModal: () => dispatch({ type: 'CLOSE_PAYMENT_MODAL' }),

    openRoomChangeModal: (booking: Booking, room: any) =>
      dispatch({ type: 'OPEN_ROOM_CHANGE_MODAL', payload: { booking, room } }),

    closeRoomChangeModal: () => dispatch({ type: 'CLOSE_ROOM_CHANGE_MODAL' }),

    refreshBookings: () => dispatch({ type: 'REFRESH_BOOKINGS' }),

    setRefreshCallback: (callback: () => void) =>
      dispatch({ type: 'SET_REFRESH_CALLBACK', payload: callback })
  }

  // Computed values
  const filteredBookings = state.bookings.filter(booking => {
    if (state.filters.status && booking.status !== state.filters.status) {
      return false
    }

    if (state.filters.searchTerm) {
      const searchTerm = state.filters.searchTerm.toLowerCase()
      if (
        !booking.guest_name.toLowerCase().includes(searchTerm) &&
        !booking.reference_number.toLowerCase().includes(searchTerm) &&
        !booking.guest_email.toLowerCase().includes(searchTerm) &&
        !booking.guest_phone.includes(searchTerm)
      ) {
        return false
      }
    }

    if (state.filters.dateRange) {
      const checkInDate = new Date(booking.check_in_date)
      const filterStart = new Date(state.filters.dateRange.start)
      const filterEnd = new Date(state.filters.dateRange.end)

      if (checkInDate < filterStart || checkInDate > filterEnd) {
        return false
      }
    }

    return true
  })

  return {
    ...state,
    filteredBookings,
    actions
  }
}

// Types export
export type { Booking, BookingsState, BookingsAction }