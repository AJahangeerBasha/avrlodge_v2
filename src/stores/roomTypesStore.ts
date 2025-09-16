import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  RoomType,
  CreateRoomTypeData,
  UpdateRoomTypeData
} from '@/lib/types/roomTypes'
import {
  createRoomType as createRoomTypeApi,
  updateRoomType as updateRoomTypeApi,
  deleteRoomType as deleteRoomTypeApi,
  getRoomTypeById as getRoomTypeApi,
  getAllRoomTypes as getRoomTypesApi,
  getAvailableRoomTypes as getAvailableRoomTypesApi,
  subscribeToRoomTypes
} from '@/lib/roomTypes'

export interface RoomTypeFilters {
  isActive?: boolean
  searchTerm?: string
  minPrice?: number
  maxPrice?: number
  minGuests?: number
  maxGuests?: number
}

export interface RoomTypeStats {
  totalTypes: number
  activeTypes: number
  inactiveTypes: number
  totalRooms: number
  averagePrice: number
  totalCapacity: number
}

interface RoomTypeState {
  // Data state
  roomTypes: RoomType[]
  selectedRoomType: RoomType | null
  stats: RoomTypeStats

  // UI state
  loading: boolean
  error: string | null
  filters: RoomTypeFilters

  // Modal state
  isCreateModalOpen: boolean
  isEditModalOpen: boolean
  isViewModalOpen: boolean

  // Form state
  formData: CreateRoomTypeData

  // Subscription
  unsubscribe: (() => void) | null
}

interface RoomTypeActions {
  // Data actions
  setRoomTypes: (roomTypes: RoomType[]) => void
  setSelectedRoomType: (roomType: RoomType | null) => void
  setStats: (stats: RoomTypeStats) => void
  addRoomType: (roomType: RoomType) => void
  updateRoomTypeInStore: (roomTypeId: string, updatedRoomType: Partial<RoomType>) => void
  removeRoomType: (roomTypeId: string) => void

  // API actions
  createRoomType: (data: CreateRoomTypeData, userId: string) => Promise<void>
  updateRoomType: (roomTypeId: string, data: UpdateRoomTypeData, userId: string) => Promise<void>
  deleteRoomType: (roomTypeId: string, userId: string) => Promise<void>
  getRoomType: (roomTypeId: string) => Promise<RoomType | null>
  getRoomTypes: (filters?: RoomTypeFilters) => Promise<void>
  refreshRoomTypes: () => Promise<void>
  loadStats: () => Promise<void>

  // Subscription actions
  subscribeToRoomTypes: (filters?: RoomTypeFilters) => void
  unsubscribeFromRoomTypes: () => void

  // UI actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: RoomTypeFilters) => void
  updateFilters: (partialFilters: Partial<RoomTypeFilters>) => void
  clearFilters: () => void

  // Modal actions
  openCreateModal: () => void
  closeCreateModal: () => void
  openEditModal: (roomType: RoomType) => void
  closeEditModal: () => void
  openViewModal: (roomType: RoomType) => void
  closeViewModal: () => void

  // Form actions
  setFormData: (data: CreateRoomTypeData) => void
  updateFormData: (partialData: Partial<CreateRoomTypeData>) => void
  resetFormData: () => void

  // Utility actions
  searchRoomTypes: (searchTerm: string) => void
  filterRoomTypes: (filters: RoomTypeFilters) => void
  resetStore: () => void
}

const initialFormData: CreateRoomTypeData = {
  name: '',
  pricePerNight: 0,
  maxGuests: 1,
  numberOfRooms: 1,
  description: '',
  amenities: [],
  isActive: true
}

const initialStats: RoomTypeStats = {
  totalTypes: 0,
  activeTypes: 0,
  inactiveTypes: 0,
  totalRooms: 0,
  averagePrice: 0,
  totalCapacity: 0
}

export const useRoomTypesStore = create<RoomTypeState & RoomTypeActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      roomTypes: [],
      selectedRoomType: null,
      stats: initialStats,
      loading: false,
      error: null,
      filters: {},
      isCreateModalOpen: false,
      isEditModalOpen: false,
      isViewModalOpen: false,
      formData: initialFormData,
      unsubscribe: null,

      // Data actions
      setRoomTypes: (roomTypes) => set({ roomTypes }, false, 'setRoomTypes'),

      setSelectedRoomType: (roomType) => set({ selectedRoomType: roomType }, false, 'setSelectedRoomType'),

      setStats: (stats) => set({ stats }, false, 'setStats'),

      addRoomType: (roomType) => set(
        (state) => ({ roomTypes: [roomType, ...state.roomTypes] }),
        false,
        'addRoomType'
      ),

      updateRoomTypeInStore: (roomTypeId, updatedRoomType) => set(
        (state) => ({
          roomTypes: state.roomTypes.map(roomType =>
            roomType.id === roomTypeId ? { ...roomType, ...updatedRoomType } : roomType
          )
        }),
        false,
        'updateRoomTypeInStore'
      ),

      removeRoomType: (roomTypeId) => set(
        (state) => ({ roomTypes: state.roomTypes.filter(roomType => roomType.id !== roomTypeId) }),
        false,
        'removeRoomType'
      ),

      // API actions
      createRoomType: async (data, userId) => {
        try {
          set({ loading: true, error: null }, false, 'createRoomType:start')
          const roomTypeId = await createRoomTypeApi(data, userId)

          // Refresh room types to get the new room type with server data
          await get().refreshRoomTypes()
          await get().loadStats()

          set({ loading: false }, false, 'createRoomType:success')
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to create room type'
          }, false, 'createRoomType:error')
          throw error
        }
      },

      updateRoomType: async (roomTypeId, data, userId) => {
        try {
          set({ loading: true, error: null }, false, 'updateRoomType:start')
          const updateData = {
            ...data,
            updatedBy: userId,
            updatedAt: new Date().toISOString()
          }
          await updateRoomTypeApi(roomTypeId, updateData)

          // Update the room type in the store
          get().updateRoomTypeInStore(roomTypeId, { ...data, updatedAt: new Date().toISOString() })
          await get().loadStats()

          set({ loading: false }, false, 'updateRoomType:success')
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to update room type'
          }, false, 'updateRoomType:error')
          throw error
        }
      },

      deleteRoomType: async (roomTypeId, userId) => {
        try {
          set({ loading: true, error: null }, false, 'deleteRoomType:start')
          await deleteRoomTypeApi(roomTypeId, userId)

          get().removeRoomType(roomTypeId)
          await get().loadStats()

          set({ loading: false }, false, 'deleteRoomType:success')
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to delete room type'
          }, false, 'deleteRoomType:error')
          throw error
        }
      },

      getRoomType: async (roomTypeId) => {
        try {
          set({ loading: true, error: null }, false, 'getRoomType:start')
          const roomType = await getRoomTypeApi(roomTypeId)
          set({ loading: false }, false, 'getRoomType:success')
          return roomType
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to get room type'
          }, false, 'getRoomType:error')
          throw error
        }
      },

      getRoomTypes: async (filters) => {
        try {
          set({ loading: true, error: null }, false, 'getRoomTypes:start')
          const roomTypes = await getRoomTypesApi()

          // Apply client-side filters
          let filteredRoomTypes = roomTypes

          if (filters?.isActive !== undefined) {
            filteredRoomTypes = filteredRoomTypes.filter(rt => rt.isActive === filters.isActive)
          }

          if (filters?.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase()
            filteredRoomTypes = filteredRoomTypes.filter(rt =>
              rt.name.toLowerCase().includes(searchLower) ||
              rt.description?.toLowerCase().includes(searchLower)
            )
          }

          if (filters?.minPrice !== undefined) {
            filteredRoomTypes = filteredRoomTypes.filter(rt => rt.pricePerNight >= filters.minPrice!)
          }

          if (filters?.maxPrice !== undefined) {
            filteredRoomTypes = filteredRoomTypes.filter(rt => rt.pricePerNight <= filters.maxPrice!)
          }

          if (filters?.minGuests !== undefined) {
            filteredRoomTypes = filteredRoomTypes.filter(rt => rt.maxGuests >= filters.minGuests!)
          }

          if (filters?.maxGuests !== undefined) {
            filteredRoomTypes = filteredRoomTypes.filter(rt => rt.maxGuests <= filters.maxGuests!)
          }

          set({ roomTypes: filteredRoomTypes, loading: false }, false, 'getRoomTypes:success')
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to get room types'
          }, false, 'getRoomTypes:error')
          throw error
        }
      },

      refreshRoomTypes: async () => {
        const { filters } = get()
        await get().getRoomTypes(filters)
      },

      loadStats: async () => {
        try {
          const roomTypes = await getRoomTypesApi()

          const stats = roomTypes.reduce((acc, roomType) => {
            acc.totalTypes++
            if (roomType.isActive) {
              acc.activeTypes++
            } else {
              acc.inactiveTypes++
            }
            acc.totalRooms += roomType.numberOfRooms
            acc.totalCapacity += roomType.maxGuests * roomType.numberOfRooms
            return acc
          }, {
            totalTypes: 0,
            activeTypes: 0,
            inactiveTypes: 0,
            totalRooms: 0,
            averagePrice: 0,
            totalCapacity: 0
          })

          // Calculate average price
          if (stats.totalTypes > 0) {
            stats.averagePrice = roomTypes.reduce((sum, rt) => sum + rt.pricePerNight, 0) / stats.totalTypes
          }

          set({ stats }, false, 'loadStats:success')
        } catch (error) {
          console.error('Failed to load room type stats:', error)
        }
      },

      // Subscription actions
      subscribeToRoomTypes: (filters) => {
        // Unsubscribe from any existing subscription
        const currentUnsubscribe = get().unsubscribe
        if (currentUnsubscribe) {
          currentUnsubscribe()
        }

        const unsubscribe = subscribeToRoomTypes(
          (roomTypes) => {
            set({ roomTypes, loading: false }, false, 'subscribeToRoomTypes:update')
            get().loadStats()
          },
          filters || { isActive: true }
        )

        set({ unsubscribe, filters: filters || {} }, false, 'subscribeToRoomTypes:start')
      },

      unsubscribeFromRoomTypes: () => {
        const { unsubscribe } = get()
        if (unsubscribe) {
          unsubscribe()
          set({ unsubscribe: null }, false, 'unsubscribeFromRoomTypes')
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

      openEditModal: (roomType) => set({
        isEditModalOpen: true,
        selectedRoomType: roomType,
        formData: {
          name: roomType.name,
          pricePerNight: roomType.pricePerNight,
          maxGuests: roomType.maxGuests,
          numberOfRooms: roomType.numberOfRooms,
          description: roomType.description || '',
          amenities: roomType.amenities,
          isActive: roomType.isActive
        }
      }, false, 'openEditModal'),

      closeEditModal: () => set({
        isEditModalOpen: false,
        selectedRoomType: null,
        formData: initialFormData
      }, false, 'closeEditModal'),

      openViewModal: (roomType) => set({
        isViewModalOpen: true,
        selectedRoomType: roomType
      }, false, 'openViewModal'),

      closeViewModal: () => set({
        isViewModalOpen: false,
        selectedRoomType: null
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
      searchRoomTypes: (searchTerm) => {
        get().updateFilters({ searchTerm })
        get().subscribeToRoomTypes(get().filters)
      },

      filterRoomTypes: (filters) => {
        get().setFilters(filters)
        get().subscribeToRoomTypes(filters)
      },

      resetStore: () => set({
        roomTypes: [],
        selectedRoomType: null,
        stats: initialStats,
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
      name: 'room-types-store',
      partialize: (state: RoomTypeState & RoomTypeActions) => ({
        // Only persist filters and form data
        filters: state.filters,
        formData: state.formData
      })
    }
  )
)