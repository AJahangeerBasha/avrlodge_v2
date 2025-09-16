import { useEffect } from 'react'
import { useRoomTypesStore } from '@/stores/roomTypesStore'

// Main data hook
export const useRoomTypes = () => {
  const {
    roomTypes,
    stats,
    loading,
    error,
    getRoomTypes,
    loadStats,
    subscribeToRoomTypes,
    unsubscribeFromRoomTypes
  } = useRoomTypesStore()

  useEffect(() => {
    // Load initial data
    getRoomTypes()
    loadStats()

    // Subscribe to real-time updates
    subscribeToRoomTypes()

    // Cleanup subscription
    return () => {
      unsubscribeFromRoomTypes()
    }
  }, [])

  return {
    roomTypes,
    stats,
    loading,
    error
  }
}

// CRUD operations hook
export const useRoomTypesCRUD = () => {
  const {
    selectedRoomType,
    createRoomType,
    updateRoomType,
    deleteRoomType,
    getRoomType,
    refreshRoomTypes
  } = useRoomTypesStore()

  return {
    selectedRoomType,
    createRoomType,
    updateRoomType,
    deleteRoomType,
    getRoomType,
    refreshRoomTypes
  }
}

// UI state management hook
export const useRoomTypesUI = () => {
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
    searchRoomTypes,
    filterRoomTypes
  } = useRoomTypesStore()

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
    searchRoomTypes,
    filterRoomTypes
  }
}

// Data-only hook (for components that only need data)
export const useRoomTypesData = () => {
  const {
    roomTypes,
    stats,
    selectedRoomType,
    loading,
    error
  } = useRoomTypesStore()

  return {
    roomTypes,
    stats,
    selectedRoomType,
    loading,
    error
  }
}