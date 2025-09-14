import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Types for the calendar store
export interface Room {
  id: string;
  room_number: string;
  room_type: string;
  capacity: number;
  tariff: number;
}

export interface Reservation {
  id: string;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  status: string;
  room_numbers?: string[];
  reservation_rooms?: Array<{
    room_number: string;
    room_type: string;
    guest_count: number;
  }>;
  reference_number?: string;
  guest_name?: string;
  guest_phone?: string;
  total_quote?: number;
}

export interface CalendarFilters {
  selectedRoomType: string;
  selectedStatus: string;
}

export interface CalendarState {
  // Data
  rooms: Room[];
  reservations: Reservation[];

  // UI State
  selectedDate: Date;
  viewMode: 'day' | 'week' | 'month';
  showFilters: boolean;
  isLoading: boolean;
  lastRefreshTime: string;

  // Filters
  filters: CalendarFilters;

  // Actions
  setRooms: (rooms: Room[]) => void;
  setReservations: (reservations: Reservation[]) => void;
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: 'day' | 'week' | 'month') => void;
  setShowFilters: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setLastRefreshTime: (time: string) => void;

  // Filter Actions
  setSelectedRoomType: (roomType: string) => void;
  setSelectedStatus: (status: string) => void;
  resetFilters: () => void;

  // Computed getters
  getFilteredRooms: () => Room[];
  getFilteredReservations: () => Reservation[];
  getRoomTypes: () => Array<{ value: string; label: string }>;
  getStatusTypes: () => Array<{ value: string; label: string }>;

  // Utility actions
  refreshData: () => Promise<void>;
  reset: () => void;
}

// Initial state
const initialState = {
  rooms: [],
  reservations: [],
  selectedDate: new Date(),
  viewMode: 'month' as const,
  showFilters: false,
  isLoading: false,
  lastRefreshTime: '',
  filters: {
    selectedRoomType: 'all',
    selectedStatus: 'all',
  },
};

export const useCalendarStore = create<CalendarState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Basic setters
        setRooms: (rooms) => set({ rooms }),
        setReservations: (reservations) => set({ reservations }),
        setSelectedDate: (date) => set({ selectedDate: date }),
        setViewMode: (mode) => set({ viewMode: mode }),
        setShowFilters: (show) => set({ showFilters: show }),
        setIsLoading: (loading) => set({ isLoading: loading }),
        setLastRefreshTime: (time) => set({ lastRefreshTime: time }),

        // Filter actions
        setSelectedRoomType: (roomType) => set((state) => ({
          filters: { ...state.filters, selectedRoomType: roomType }
        })),
        setSelectedStatus: (status) => set((state) => ({
          filters: { ...state.filters, selectedStatus: status }
        })),
        resetFilters: () => set((state) => ({
          filters: {
            selectedRoomType: 'all',
            selectedStatus: 'all',
          }
        })),

        // Computed getters
        getFilteredRooms: () => {
          const state = get();
          const { rooms, filters } = state;

          return filters.selectedRoomType === 'all'
            ? rooms
            : rooms.filter(room => room.room_type === filters.selectedRoomType);
        },

        getFilteredReservations: () => {
          const state = get();
          const { reservations, filters } = state;

          return filters.selectedStatus === 'all'
            ? reservations
            : reservations.filter(reservation => reservation.status === filters.selectedStatus);
        },

        getRoomTypes: () => {
          const state = get();
          const uniqueTypes = Array.from(new Set(state.rooms.map(room => room.room_type)));
          return uniqueTypes.map(type => ({ value: type, label: type }));
        },

        getStatusTypes: () => {
          const state = get();
          const uniqueStatuses = Array.from(new Set(state.reservations.map(reservation => reservation.status)));
          return uniqueStatuses.map(status => ({ value: status, label: status }));
        },

        // Refresh function (will be called by component)
        refreshData: async () => {
          // This will be implemented in the component that uses the store
          // The store provides the state management, but the actual data fetching
          // logic remains in the component where it has access to the API functions
          set({ lastRefreshTime: new Date().toISOString() });
        },

        // Reset function
        reset: () => set(initialState),
      }),
      {
        name: 'calendar-store',
        // Only persist certain state, not the data itself
        partialize: (state) => ({
          selectedDate: state.selectedDate,
          viewMode: state.viewMode,
          showFilters: state.showFilters,
          filters: state.filters,
        }),
      }
    ),
    {
      name: 'calendar-store',
    }
  )
);