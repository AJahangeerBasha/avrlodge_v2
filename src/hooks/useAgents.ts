import { useEffect } from 'react'
import { useAgentsStore } from '@/stores/agentsStore'
import type { AgentFilters } from '@/lib/types/agents'

/**
 * Custom hook for managing agents with automatic subscription
 */
export const useAgents = (filters?: AgentFilters) => {
  const store = useAgentsStore()

  useEffect(() => {
    // Subscribe to agents when component mounts or filters change
    store.subscribeToAgents(filters)

    // Cleanup subscription when component unmounts
    return () => {
      store.unsubscribeFromAgents()
    }
  }, [filters])

  return store
}

/**
 * Custom hook for agents CRUD operations (without automatic subscription)
 */
export const useAgentsCRUD = () => {
  const {
    // Data
    agents,
    stats,
    selectedAgent,
    loading,
    error,

    // Actions
    createAgent,
    updateAgent,
    deleteAgent,
    getAgent,
    getAgents,
    refreshAgents,
    loadStats,
    updateAgentStatus,

    // Utility
    resetStore
  } = useAgentsStore()

  return {
    // Data
    agents,
    stats,
    selectedAgent,
    loading,
    error,

    // Actions
    createAgent,
    updateAgent,
    deleteAgent,
    getAgent,
    getAgents,
    refreshAgents,
    loadStats,
    updateAgentStatus,

    // Utility
    resetStore
  }
}

/**
 * Custom hook for agents UI state management
 */
export const useAgentsUI = () => {
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
    searchAgents,
    filterAgents,

    // UI Actions
    setLoading,
    setError
  } = useAgentsStore()

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
    searchAgents,
    filterAgents,

    // UI Actions
    setLoading,
    setError
  }
}

/**
 * Simplified hook for read-only agents data
 */
export const useAgentsData = () => {
  const { agents, stats, loading, error } = useAgentsStore()

  return {
    agents,
    stats,
    loading,
    error
  }
}