import { useEffect } from 'react'
import { useRoomsStore } from '@/stores/roomsStore'

// Main data hook
export const useRooms = () => {
  const {
    rooms,
    roomTypes,
    stats,
    loading,
    error,
    getRooms,
    getRoomTypes,
    loadStats,
    subscribeToRooms,
    unsubscribeFromRooms
  } = useRoomsStore()

  useEffect(() => {
    // Load initial data
    getRooms()
    getRoomTypes()
    loadStats()

    // Subscribe to real-time updates
    subscribeToRooms()

    // Cleanup subscription
    return () => {
      unsubscribeFromRooms()
    }
  }, [])

  return {
    rooms,
    roomTypes,
    stats,
    loading,
    error
  }
}

// CRUD operations hook
export const useRoomsCRUD = () => {
  const {
    selectedRoom,
    createRoom,
    updateRoom,
    deleteRoom,
    getRoom,
    updateRoomStatus,
    refreshRooms
  } = useRoomsStore()

  return {
    selectedRoom,
    createRoom,
    updateRoom,
    deleteRoom,
    getRoom,
    updateRoomStatus,
    refreshRooms
  }
}

// UI state management hook
export const useRoomsUI = () => {
  const {
    // UI State
    isCreateModalOpen,
    isEditModalOpen,
    isViewModalOpen,
    formData,
    filters,
    loading,
    error,

    // Modal Actions
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openViewModal,
    closeViewModal,

    // Form Actions
    setFormData,
    updateFormData,
    resetFormData,

    // Filter Actions
    setFilters,
    updateFilters,
    clearFilters,
    searchRooms,
    filterRooms
  } = useRoomsStore()

  return {
    // UI State
    isCreateModalOpen,
    isEditModalOpen,
    isViewModalOpen,
    formData,
    filters,
    loading,
    error,

    // Modal Actions
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openViewModal,
    closeViewModal,

    // Form Actions
    setFormData,
    updateFormData,
    resetFormData,

    // Filter Actions
    setFilters,
    updateFilters,
    clearFilters,
    searchRooms,
    filterRooms
  }
}

// Data-only hook (for components that only need data)
export const useRoomsData = () => {
  const {
    rooms,
    roomTypes,
    stats,
    selectedRoom,
    loading,
    error
  } = useRoomsStore()

  return {
    rooms,
    roomTypes,
    stats,
    selectedRoom,
    loading,
    error
  }
}