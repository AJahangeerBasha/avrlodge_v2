import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  Agent,
  CreateAgentData,
  UpdateAgentData,
  AgentFilters,
  AgentStats
} from '@/lib/types/agents'
import {
  createAgent as createAgentApi,
  updateAgent as updateAgentApi,
  deleteAgent as deleteAgentApi,
  getAgent as getAgentApi,
  getAgents as getAgentsApi,
  subscribeToAgents,
  getAgentStats as getAgentStatsApi,
  updateAgentStatus as updateAgentStatusApi
} from '@/lib/agents'

interface AgentState {
  // Data state
  agents: Agent[]
  stats: AgentStats
  selectedAgent: Agent | null

  // UI state
  loading: boolean
  error: string | null
  filters: AgentFilters

  // Modal state
  isCreateModalOpen: boolean
  isEditModalOpen: boolean
  isViewModalOpen: boolean

  // Form state
  formData: CreateAgentData

  // Subscription
  unsubscribe: (() => void) | null
}

interface AgentActions {
  // Data actions
  setAgents: (agents: Agent[]) => void
  setStats: (stats: AgentStats) => void
  setSelectedAgent: (agent: Agent | null) => void
  addAgent: (agent: Agent) => void
  updateAgentInStore: (agentId: string, updatedAgent: Partial<Agent>) => void
  removeAgent: (agentId: string) => void

  // API actions
  createAgent: (data: CreateAgentData, userId: string) => Promise<void>
  updateAgent: (agentId: string, data: UpdateAgentData, userId: string) => Promise<void>
  deleteAgent: (agentId: string) => Promise<void>
  getAgent: (agentId: string) => Promise<Agent | null>
  getAgents: (filters?: AgentFilters) => Promise<void>
  refreshAgents: () => Promise<void>
  loadStats: () => Promise<void>
  updateAgentStatus: (agentId: string, status: 'active' | 'inactive' | 'suspended', userId: string) => Promise<void>

  // Subscription actions
  subscribeToAgents: (filters?: AgentFilters) => void
  unsubscribeFromAgents: () => void

  // UI actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: AgentFilters) => void
  updateFilters: (partialFilters: Partial<AgentFilters>) => void
  clearFilters: () => void

  // Modal actions
  openCreateModal: () => void
  closeCreateModal: () => void
  openEditModal: (agent: Agent) => void
  closeEditModal: () => void
  openViewModal: (agent: Agent) => void
  closeViewModal: () => void

  // Form actions
  setFormData: (data: CreateAgentData) => void
  updateFormData: (partialData: Partial<CreateAgentData>) => void
  resetFormData: () => void

  // Utility actions
  searchAgents: (searchTerm: string) => void
  filterAgents: (filters: AgentFilters) => void
  resetStore: () => void
}

const initialFormData: CreateAgentData = {
  name: '',
  phoneNumber: '',
  whatsAppNumber: '',
  agentType: 'individual',
  email: '',
  state: '',
  district: '',
  companyName: '',
  profileImageUrl: '',
  addressProof: '',
  status: 'active'
}

const initialStats: AgentStats = {
  totalAgents: 0,
  activeAgents: 0,
  individualAgents: 0,
  companyAgents: 0,
  suspendedAgents: 0,
  inactiveAgents: 0
}

export const useAgentsStore = create<AgentState & AgentActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      agents: [],
      stats: initialStats,
      selectedAgent: null,
      loading: false,
      error: null,
      filters: {},
      isCreateModalOpen: false,
      isEditModalOpen: false,
      isViewModalOpen: false,
      formData: initialFormData,
      unsubscribe: null,

      // Data actions
      setAgents: (agents) => set({ agents }, false, 'setAgents'),

      setStats: (stats) => set({ stats }, false, 'setStats'),

      setSelectedAgent: (agent) => set({ selectedAgent: agent }, false, 'setSelectedAgent'),

      addAgent: (agent) => set(
        (state) => ({ agents: [agent, ...state.agents] }),
        false,
        'addAgent'
      ),

      updateAgentInStore: (agentId, updatedAgent) => set(
        (state) => ({
          agents: state.agents.map(agent =>
            agent.id === agentId ? { ...agent, ...updatedAgent } : agent
          )
        }),
        false,
        'updateAgentInStore'
      ),

      removeAgent: (agentId) => set(
        (state) => ({ agents: state.agents.filter(agent => agent.id !== agentId) }),
        false,
        'removeAgent'
      ),

      // API actions
      createAgent: async (data, userId) => {
        try {
          set({ loading: true, error: null }, false, 'createAgent:start')
          const agentId = await createAgentApi(data, userId)

          // Refresh agents to get the new agent with server data
          await get().refreshAgents()
          await get().loadStats()

          set({ loading: false }, false, 'createAgent:success')
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to create agent'
          }, false, 'createAgent:error')
          throw error
        }
      },

      updateAgent: async (agentId, data, userId) => {
        try {
          set({ loading: true, error: null }, false, 'updateAgent:start')
          await updateAgentApi(agentId, data, userId)

          // Update the agent in the store
          get().updateAgentInStore(agentId, { ...data, updatedAt: new Date().toISOString() })
          await get().loadStats()

          set({ loading: false }, false, 'updateAgent:success')
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to update agent'
          }, false, 'updateAgent:error')
          throw error
        }
      },

      deleteAgent: async (agentId) => {
        try {
          set({ loading: true, error: null }, false, 'deleteAgent:start')
          await deleteAgentApi(agentId)

          get().removeAgent(agentId)
          await get().loadStats()

          set({ loading: false }, false, 'deleteAgent:success')
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to delete agent'
          }, false, 'deleteAgent:error')
          throw error
        }
      },

      getAgent: async (agentId) => {
        try {
          set({ loading: true, error: null }, false, 'getAgent:start')
          const agent = await getAgentApi(agentId)
          set({ loading: false }, false, 'getAgent:success')
          return agent
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to get agent'
          }, false, 'getAgent:error')
          throw error
        }
      },

      getAgents: async (filters) => {
        try {
          set({ loading: true, error: null }, false, 'getAgents:start')
          const agents = await getAgentsApi(filters)
          set({ agents, loading: false }, false, 'getAgents:success')
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to get agents'
          }, false, 'getAgents:error')
          throw error
        }
      },

      refreshAgents: async () => {
        const { filters } = get()
        await get().getAgents(filters)
      },

      loadStats: async () => {
        try {
          const stats = await getAgentStatsApi()
          set({ stats }, false, 'loadStats:success')
        } catch (error) {
          console.error('Failed to load agent stats:', error)
        }
      },

      updateAgentStatus: async (agentId, status, userId) => {
        try {
          set({ loading: true, error: null }, false, 'updateAgentStatus:start')
          await updateAgentStatusApi(agentId, status, userId)

          get().updateAgentInStore(agentId, { status, updatedAt: new Date().toISOString() })
          await get().loadStats()

          set({ loading: false }, false, 'updateAgentStatus:success')
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to update agent status'
          }, false, 'updateAgentStatus:error')
          throw error
        }
      },

      // Subscription actions
      subscribeToAgents: (filters) => {
        // Unsubscribe from any existing subscription
        const currentUnsubscribe = get().unsubscribe
        if (currentUnsubscribe) {
          currentUnsubscribe()
        }

        const unsubscribe = subscribeToAgents(
          (agents) => {
            set({ agents, loading: false }, false, 'subscribeToAgents:update')
            get().loadStats()
          },
          filters
        )

        set({ unsubscribe, filters: filters || {} }, false, 'subscribeToAgents:start')
      },

      unsubscribeFromAgents: () => {
        const { unsubscribe } = get()
        if (unsubscribe) {
          unsubscribe()
          set({ unsubscribe: null }, false, 'unsubscribeFromAgents')
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

      openEditModal: (agent) => set({
        isEditModalOpen: true,
        selectedAgent: agent,
        formData: {
          name: agent.name,
          phoneNumber: agent.phoneNumber,
          whatsAppNumber: agent.whatsAppNumber || '',
          agentType: agent.agentType,
          email: agent.email || '',
          state: agent.state,
          district: agent.district,
          companyName: agent.companyName || '',
          profileImageUrl: agent.profileImageUrl || '',
          addressProof: agent.addressProof || '',
          status: agent.status
        }
      }, false, 'openEditModal'),

      closeEditModal: () => set({
        isEditModalOpen: false,
        selectedAgent: null,
        formData: initialFormData
      }, false, 'closeEditModal'),

      openViewModal: (agent) => set({
        isViewModalOpen: true,
        selectedAgent: agent
      }, false, 'openViewModal'),

      closeViewModal: () => set({
        isViewModalOpen: false,
        selectedAgent: null
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
      searchAgents: (searchTerm) => {
        get().updateFilters({ searchTerm })
        get().subscribeToAgents(get().filters)
      },

      filterAgents: (filters) => {
        get().setFilters(filters)
        get().subscribeToAgents(filters)
      },

      resetStore: () => set({
        agents: [],
        stats: initialStats,
        selectedAgent: null,
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
      name: 'agents-store',
      partialize: (state: any) => ({
        // Only persist filters and form data
        filters: state.filters,
        formData: state.formData
      })
    }
  )
)