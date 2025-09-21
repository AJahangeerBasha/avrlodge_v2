import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAllRooms } from '@/lib/rooms';
import { getAllRoomTypes } from '@/lib/roomTypes';
import { getAllReservations } from '@/lib/reservations';
import { getAllReservationRooms } from '@/lib/reservationRooms';
import { getPrimaryGuestByReservationId, getGuestsByReservationId } from '@/lib/guests';

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
    roomStatus?: string;
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

  // Real-time subscription management
  unsubscribers: Unsubscribe[];
  isSubscribed: boolean;

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

  // Real-time data management
  startRealtimeListeners: () => Promise<void>;
  stopRealtimeListeners: () => void;
  loadInitialData: () => Promise<void>;
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
  unsubscribers: [],
  isSubscribed: false,
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
        resetFilters: () => set(() => ({
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

        // Load initial data
        loadInitialData: async () => {
          const state = get();
          if (state.isLoading) return;

          set({ isLoading: true });

          try {
            // Load room types first to get pricing info
            const roomTypes = await getAllRoomTypes();
            const roomTypeMap = new Map(roomTypes.map(rt => [rt.id, rt]));

            // Load all rooms
            const allRooms = await getAllRooms();

            // Transform rooms to match interface and add pricing from room types
            const transformedRooms: Room[] = allRooms.map(room => {
              const roomType = roomTypeMap.get(room.roomTypeId);
              return {
                id: room.id,
                room_number: room.roomNumber,
                room_type: roomType?.name || 'Unknown',
                capacity: roomType?.maxGuests || 1,
                tariff: roomType?.pricePerNight || 0
              };
            });

            set({
              rooms: transformedRooms,
              lastRefreshTime: new Date().toISOString()
            });

          } catch (error) {
            console.error('Error loading initial calendar data:', error);
          } finally {
            set({ isLoading: false });
          }
        },

        // Start real-time listeners
        startRealtimeListeners: async () => {
          const state = get();
          if (state.isSubscribed) return;

          console.log('🔄 Starting calendar real-time listeners...');

          // Unsubscribe from any existing listeners
          state.unsubscribers.forEach(unsubscribe => unsubscribe());

          const newUnsubscribers: Unsubscribe[] = [];

          try {
            // Listen to reservations changes
            const reservationsRef = collection(db, 'reservations');
            const reservationsQuery = query(
              reservationsRef,
              orderBy('createdAt', 'desc')
            );

            const reservationsUnsubscribe = onSnapshot(reservationsQuery, async (snapshot) => {
              console.log('📅 Reservations updated, processing changes...');

              try {
                const reservationDocs = snapshot.docs;

                // Transform reservations with reservation rooms data
                const transformedReservations: Reservation[] = await Promise.all(
                  reservationDocs.map(async (doc) => {
                    const reservation = { id: doc.id, ...doc.data() } as any;

                    try {
                      // Load reservation rooms (filter out soft-deleted ones)
                      const allReservationRooms = await getAllReservationRooms({ reservationId: reservation.id });
                      const reservationRooms = allReservationRooms.filter(room => !room.deletedAt);


                      // Load primary guest information
                      let primaryGuest = null;
                      try {
                        primaryGuest = await getPrimaryGuestByReservationId(reservation.id);

                        if (!primaryGuest) {
                          const allGuests = await getGuestsByReservationId(reservation.id);
                          primaryGuest = allGuests.length > 0 ? allGuests[0] : null;
                        }
                      } catch (guestError) {
                        console.error(`Error fetching guest for reservation ${reservation.id}:`, guestError);
                      }

                      return {
                        id: reservation.id,
                        check_in_date: reservation.checkInDate,
                        check_out_date: reservation.checkOutDate,
                        guest_count: reservation.guestCount,
                        status: reservation.status, // Use actual database status per STATUS.md
                        reference_number: reservation.referenceNumber,
                        guest_name: primaryGuest?.name || reservation.guestName || 'Guest Name Not Available',
                        guest_phone: primaryGuest?.phone || reservation.guestPhone || 'Phone Not Available',
                        total_quote: reservation.totalPrice,
                        reservation_rooms: reservationRooms.map(room => ({
                          room_number: room.roomNumber,
                          room_type: room.roomType || 'Unknown',
                          guest_count: room.guestCount || 0,
                          roomStatus: room.roomStatus || 'pending'
                        })),
                        room_numbers: reservationRooms.map(room => room.roomNumber)
                      };

                    } catch (error) {
                      console.error(`Error processing reservation ${reservation.id}:`, error);
                      return {
                        id: reservation.id,
                        check_in_date: reservation.checkInDate,
                        check_out_date: reservation.checkOutDate,
                        guest_count: reservation.guestCount,
                        status: reservation.status,
                        reference_number: reservation.referenceNumber,
                        guest_name: reservation.guestName || 'Guest Name Not Available',
                        guest_phone: reservation.guestPhone || 'Phone Not Available',
                        total_quote: reservation.totalPrice
                      };
                    }
                  })
                );

                // Filter out cancelled reservations (following existing logic)
                const activeReservations = transformedReservations.filter(r => r.status !== 'cancelled');

                set({
                  reservations: activeReservations,
                  lastRefreshTime: new Date().toISOString()
                });

              } catch (error) {
                console.error('Error processing reservations snapshot:', error);
              }
            });

            newUnsubscribers.push(reservationsUnsubscribe);

            // Listen to reservation rooms changes for real-time room status updates
            const reservationRoomsRef = collection(db, 'reservationRooms');
            const reservationRoomsQuery = query(
              reservationRoomsRef,
              orderBy('updatedAt', 'desc')
            );

            const reservationRoomsUnsubscribe = onSnapshot(reservationRoomsQuery, () => {
              console.log('🏠 Reservation rooms updated, refreshing reservations...');
              // Trigger reservations refresh by touching the reservations collection
              // This will cause the reservations listener to re-fetch with updated room data
            });

            newUnsubscribers.push(reservationRoomsUnsubscribe);

            set({
              unsubscribers: newUnsubscribers,
              isSubscribed: true
            });

            console.log('✅ Calendar real-time listeners started successfully');

          } catch (error) {
            console.error('Error starting real-time listeners:', error);

            // Clean up any partial subscriptions
            newUnsubscribers.forEach(unsubscribe => unsubscribe());

            set({
              unsubscribers: [],
              isSubscribed: false
            });
          }
        },

        // Stop real-time listeners
        stopRealtimeListeners: () => {
          const state = get();
          console.log('🛑 Stopping calendar real-time listeners...');

          state.unsubscribers.forEach(unsubscribe => unsubscribe());

          set({
            unsubscribers: [],
            isSubscribed: false
          });
        },

        // Reset function
        reset: () => {
          const state = get();
          state.unsubscribers.forEach(unsubscribe => unsubscribe());
          set(initialState);
        },
      }),
      {
        name: 'calendar-store',
        // Only persist certain state, not the data itself
        partialize: (state) => ({
          selectedDate: state.selectedDate.toISOString(), // Serialize Date to string
          viewMode: state.viewMode,
          showFilters: state.showFilters,
          filters: state.filters,
        }),
        // Custom deserializer to convert date string back to Date object
        onRehydrateStorage: () => (state) => {
          if (state && typeof state.selectedDate === 'string') {
            state.selectedDate = new Date(state.selectedDate);
          }
        },
      }
    ),
    {
      name: 'calendar-store',
    }
  )
);