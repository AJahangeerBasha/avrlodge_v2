import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  Room,
  CreateRoomData,
  UpdateRoomData,
  RoomFilters,
  RoomStats,
  RoomStatus
} from '@/lib/types/rooms'
import type { RoomType } from '@/lib/types/roomTypes'
import {
  createRoom as createRoomApi,
  updateRoom as updateRoomApi,
  deleteRoom as deleteRoomApi,
  getRoomById as getRoomApi,
  getRoomsWithType as getRoomsApi,
  subscribeToRooms,
  getRoomStats as getRoomStatsApi,
  updateRoomStatus as updateRoomStatusApi
} from '@/lib/rooms'
import {
  getAllRoomTypes as getRoomTypesApi
} from '@/lib/roomTypes'

interface RoomState {
  // Data state
  rooms: Room[]
  roomTypes: RoomType[]
  stats: RoomStats
  selectedRoom: Room | null

  // UI state
  loading: boolean
  error: string | null
  filters: RoomFilters

  // Modal state
  isCreateModalOpen: boolean
  isEditModalOpen: boolean
  isViewModalOpen: boolean

  // Form state
  formData: CreateRoomData

  // Subscription
  unsubscribe: (() => void) | null
}

interface RoomActions {
  // Data actions
  setRooms: (rooms: Room[]) => void
  setRoomTypes: (roomTypes: RoomType[]) => void
  setStats: (stats: RoomStats) => void
  setSelectedRoom: (room: Room | null) => void
  addRoom: (room: Room) => void
  updateRoomInStore: (roomId: string, updatedRoom: Partial<Room>) => void
  removeRoom: (roomId: string) => void

  // API actions
  createRoom: (data: CreateRoomData, userId: string) => Promise<void>
  updateRoom: (roomId: string, data: UpdateRoomData, userId: string) => Promise<void>
  deleteRoom: (roomId: string, userId: string) => Promise<void>
  getRoom: (roomId: string) => Promise<Room | null>
  getRooms: (filters?: RoomFilters) => Promise<void>
  getRoomTypes: () => Promise<void>
  refreshRooms: () => Promise<void>
  loadStats: () => Promise<void>
  updateRoomStatus: (roomId: string, status: RoomStatus, userId: string) => Promise<void>

  // Subscription actions
  subscribeToRooms: (filters?: RoomFilters) => void
  unsubscribeFromRooms: () => void

  // UI actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: RoomFilters) => void
  updateFilters: (partialFilters: Partial<RoomFilters>) => void
  clearFilters: () => void

  // Modal actions
  openCreateModal: () => void
  closeCreateModal: () => void
  openEditModal: (room: Room) => void
  closeEditModal: () => void
  openViewModal: (room: Room) => void
  closeViewModal: () => void

  // Form actions
  setFormData: (data: CreateRoomData) => void
  updateFormData: (partialData: Partial<CreateRoomData>) => void
  resetFormData: () => void

  // Utility actions
  searchRooms: (searchTerm: string) => void
  filterRooms: (filters: RoomFilters) => void
  resetStore: () => void
}

const initialFormData: CreateRoomData = {
  roomNumber: '',
  roomTypeId: '',
  floorNumber: null,
  isActive: true,
  status: 'available'
}

const initialStats: RoomStats = {
  totalRooms: 0,
  availableRooms: 0,
  occupiedRooms: 0,
  maintenanceRooms: 0,
  reservedRooms: 0,
  occupancyRate: 0
}

export const useRoomsStore = create<RoomState & RoomActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      rooms: [],
      roomTypes: [],
      stats: initialStats,
      selectedRoom: null,
      loading: false,
      error: null,
      filters: {},
      isCreateModalOpen: false,
      isEditModalOpen: false,
      isViewModalOpen: false,
      formData: initialFormData,
      unsubscribe: null,

      // Data actions
      setRooms: (rooms) => set({ rooms }, false, 'setRooms'),

      setRoomTypes: (roomTypes) => set({ roomTypes }, false, 'setRoomTypes'),

      setStats: (stats) => set({ stats }, false, 'setStats'),

      setSelectedRoom: (room) => set({ selectedRoom: room }, false, 'setSelectedRoom'),

      addRoom: (room) => set(
        (state) => ({ rooms: [room, ...state.rooms] }),
        false,
        'addRoom'
      ),

      updateRoomInStore: (roomId, updatedRoom) => set(
        (state) => ({
          rooms: state.rooms.map(room =>
            room.id === roomId ? { ...room, ...updatedRoom } : room
          )
        }),
        false,
        'updateRoomInStore'
      ),

      removeRoom: (roomId) => set(
        (state) => ({ rooms: state.rooms.filter(room => room.id !== roomId) }),
        false,
        'removeRoom'
      ),

      // API actions
      createRoom: async (data, userId) => {
        try {
          set({ loading: true, error: null }, false, 'createRoom:start')
          const roomId = await createRoomApi(data, userId)

          // Refresh rooms to get the new room with server data
          await get().refreshRooms()
          await get().loadStats()

          set({ loading: false }, false, 'createRoom:success')
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to create room'
          }, false, 'createRoom:error')
          throw error
        }
      },

      updateRoom: async (roomId, data, userId) => {
        try {
          set({ loading: true, error: null }, false, 'updateRoom:start')
          const updateData = {
            ...data,
            updatedBy: userId,
            updatedAt: new Date().toISOString()
          }
          await updateRoomApi(roomId, updateData)

          // Update the room in the store
          get().updateRoomInStore(roomId, { ...data, updatedAt: new Date().toISOString() })
          await get().loadStats()

          set({ loading: false }, false, 'updateRoom:success')
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to update room'
          }, false, 'updateRoom:error')
          throw error
        }
      },

      deleteRoom: async (roomId, userId) => {
        try {
          set({ loading: true, error: null }, false, 'deleteRoom:start')
          await deleteRoomApi(roomId, userId)

          get().removeRoom(roomId)
          await get().loadStats()

          set({ loading: false }, false, 'deleteRoom:success')
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to delete room'
          }, false, 'deleteRoom:error')
          throw error
        }
      },

      getRoom: async (roomId) => {
        try {
          set({ loading: true, error: null }, false, 'getRoom:start')
          const room = await getRoomApi(roomId)
          set({ loading: false }, false, 'getRoom:success')
          return room
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to get room'
          }, false, 'getRoom:error')
          throw error
        }
      },

      getRooms: async (filters) => {
        try {
          set({ loading: true, error: null }, false, 'getRooms:start')
          const rooms = await getRoomsApi(filters || { isActive: true })
          set({ rooms, loading: false }, false, 'getRooms:success')
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to get rooms'
          }, false, 'getRooms:error')
          throw error
        }
      },

      getRoomTypes: async () => {
        try {
          const roomTypes = await getRoomTypesApi()
          set({ roomTypes }, false, 'getRoomTypes:success')
        } catch (error) {
          console.error('Failed to load room types:', error)
        }
      },

      refreshRooms: async () => {
        const { filters } = get()
        await get().getRooms(filters)
      },

      loadStats: async () => {
        try {
          const stats = await getRoomStatsApi()
          set({ stats }, false, 'loadStats:success')
        } catch (error) {
          console.error('Failed to load room stats:', error)
        }
      },

      updateRoomStatus: async (roomId, status, userId) => {
        try {
          set({ loading: true, error: null }, false, 'updateRoomStatus:start')
          await updateRoomStatusApi(roomId, status, userId)

          get().updateRoomInStore(roomId, { status, updatedAt: new Date().toISOString() })
          await get().loadStats()

          set({ loading: false }, false, 'updateRoomStatus:success')
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to update room status'
          }, false, 'updateRoomStatus:error')
          throw error
        }
      },

      // Subscription actions
      subscribeToRooms: (filters) => {
        // Unsubscribe from any existing subscription
        const currentUnsubscribe = get().unsubscribe
        if (currentUnsubscribe) {
          currentUnsubscribe()
        }

        const unsubscribe = subscribeToRooms(
          (rooms) => {
            set({ rooms, loading: false }, false, 'subscribeToRooms:update')
            get().loadStats()
          },
          filters || { isActive: true }
        )

        set({ unsubscribe, filters: filters || {} }, false, 'subscribeToRooms:start')
      },

      unsubscribeFromRooms: () => {
        const { unsubscribe } = get()
        if (unsubscribe) {
          unsubscribe()
          set({ unsubscribe: null }, false, 'unsubscribeFromRooms')
        }
      },

      // UI actions
      setLoading: (loading) => set({ loading }, false, 'setLoading'),

      setError: (error) => set({ error }, false, 'setError'),

      setFilters: (filters) => set({ filters }, false, 'setFilters'),

      updateFilters: (partialFilters) => set(
        (state) => ({ filters: { ...state.filters, ...partialFilters } }),
        false,
        'updateFilters'
      ),

      clearFilters: () => set({ filters: {} }, false, 'clearFilters'),

      // Modal actions
      openCreateModal: () => set({
        isCreateModalOpen: true,
        formData: initialFormData
      }, false, 'openCreateModal'),

      closeCreateModal: () => set({
        isCreateModalOpen: false,
        formData: initialFormData
      }, false, 'closeCreateModal'),

      openEditModal: (room) => set({
        isEditModalOpen: true,
        selectedRoom: room,
        formData: {
          roomNumber: room.roomNumber,
          roomTypeId: room.roomTypeId,
          floorNumber: room.floorNumber,
          isActive: room.isActive,
          status: room.status
        }
      }, false, 'openEditModal'),

      closeEditModal: () => set({
        isEditModalOpen: false,
        selectedRoom: null,
        formData: initialFormData
      }, false, 'closeEditModal'),

      openViewModal: (room) => set({
        isViewModalOpen: true,
        selectedRoom: room
      }, false, 'openViewModal'),

      closeViewModal: () => set({
        isViewModalOpen: false,
        selectedRoom: null
      }, false, 'closeViewModal'),

      // Form actions
      setFormData: (data) => set({ formData: data }, false, 'setFormData'),

      updateFormData: (partialData) => set(
        (state) => ({ formData: { ...state.formData, ...partialData } }),
        false,
        'updateFormData'
      ),

      resetFormData: () => set({ formData: initialFormData }, false, 'resetFormData'),

      // Utility actions
      searchRooms: (searchTerm) => {
        // For rooms, we'll implement search on room number and room type name
        get().updateFilters({ searchTerm })
        get().subscribeToRooms(get().filters)
      },

      filterRooms: (filters) => {
        get().setFilters(filters)
        get().subscribeToRooms(filters)
      },

      resetStore: () => set({
        rooms: [],
        roomTypes: [],
        stats: initialStats,
        selectedRoom: null,
        loading: false,
        error: null,
        filters: {},
        isCreateModalOpen: false,
        isEditModalOpen: false,
        isViewModalOpen: false,
        formData: initialFormData
      }, false, 'resetStore')
    }),
    {
      name: 'rooms-store',
      partialize: (state: RoomState & RoomActions) => ({
        // Only persist filters and form data
        filters: state.filters,
        formData: state.formData
      })
    }
  )
)