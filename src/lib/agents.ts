import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'
import type { Agent, CreateAgentData, UpdateAgentData, AgentFilters, AgentStats } from './types/agents'

const COLLECTION_NAME = 'agents'

export const createAgent = async (data: CreateAgentData, userId: string): Promise<string> => {
  try {
    const agentData = {
      ...data,
      status: data.status || 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
      updatedBy: userId
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), agentData)
    return docRef.id
  } catch (error) {
    console.error('Error creating agent:', error)
    throw new Error('Failed to create agent')
  }
}

export const updateAgent = async (agentId: string, data: UpdateAgentData, userId: string): Promise<void> => {
  try {
    const agentRef = doc(db, COLLECTION_NAME, agentId)
    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    }

    await updateDoc(agentRef, updateData)
  } catch (error) {
    console.error('Error updating agent:', error)
    throw new Error('Failed to update agent')
  }
}

export const deleteAgent = async (agentId: string): Promise<void> => {
  try {
    const agentRef = doc(db, COLLECTION_NAME, agentId)
    await deleteDoc(agentRef)
  } catch (error) {
    console.error('Error deleting agent:', error)
    throw new Error('Failed to delete agent')
  }
}

export const getAgent = async (agentId: string): Promise<Agent | null> => {
  try {
    const agentRef = doc(db, COLLECTION_NAME, agentId)
    const agentDoc = await getDoc(agentRef)

    if (agentDoc.exists()) {
      const data = agentDoc.data()
      return {
        id: agentDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      } as Agent
    }

    return null
  } catch (error) {
    console.error('Error getting agent:', error)
    throw new Error('Failed to get agent')
  }
}

export const getAgents = async (filters?: AgentFilters): Promise<Agent[]> => {
  try {
    // Simple query without orderBy to avoid composite index requirement
    let q = query(collection(db, COLLECTION_NAME))

    // Only add single where clauses that don't require composite indexes
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status))
    } else if (filters?.agentType) {
      q = query(q, where('agentType', '==', filters.agentType))
    } else if (filters?.state) {
      q = query(q, where('state', '==', filters.state))
    } else if (filters?.district) {
      q = query(q, where('district', '==', filters.district))
    }

    const querySnapshot = await getDocs(q)
    let agents = querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      } as Agent
    })

    // Client-side filtering for all other filters
    if (filters) {
      if (filters.agentType && !filters.status) {
        agents = agents.filter(agent => agent.agentType === filters.agentType)
      }
      if (filters.state && !filters.status) {
        agents = agents.filter(agent => agent.state === filters.state)
      }
      if (filters.district && !filters.status) {
        agents = agents.filter(agent => agent.district === filters.district)
      }
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase()
        agents = agents.filter(agent =>
          agent.name.toLowerCase().includes(searchTerm) ||
          (agent.email && agent.email.toLowerCase().includes(searchTerm)) ||
          agent.phoneNumber.includes(searchTerm) ||
          agent.state.toLowerCase().includes(searchTerm) ||
          agent.district.toLowerCase().includes(searchTerm) ||
          (agent.companyName && agent.companyName.toLowerCase().includes(searchTerm))
        )
      }
    }

    // Client-side sorting by creation date (newest first)
    agents.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })

    return agents
  } catch (error) {
    console.error('Error getting agents:', error)
    throw new Error('Failed to get agents')
  }
}

export const subscribeToAgents = (
  callback: (agents: Agent[]) => void,
  filters?: AgentFilters
): Unsubscribe => {
  try {
    // Simple query without orderBy to avoid composite index requirement
    let q = query(collection(db, COLLECTION_NAME))

    // Only add single where clauses that don't require composite indexes
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status))
    } else if (filters?.agentType) {
      q = query(q, where('agentType', '==', filters.agentType))
    } else if (filters?.state) {
      q = query(q, where('state', '==', filters.state))
    } else if (filters?.district) {
      q = query(q, where('district', '==', filters.district))
    }

    return onSnapshot(q, (querySnapshot) => {
      let agents = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
        } as Agent
      })

      // Client-side filtering for all other filters
      if (filters) {
        if (filters.agentType && !filters.status) {
          agents = agents.filter(agent => agent.agentType === filters.agentType)
        }
        if (filters.state && !filters.status) {
          agents = agents.filter(agent => agent.state === filters.state)
        }
        if (filters.district && !filters.status) {
          agents = agents.filter(agent => agent.district === filters.district)
        }
        if (filters.searchTerm) {
          const searchTerm = filters.searchTerm.toLowerCase()
          agents = agents.filter(agent =>
            agent.name.toLowerCase().includes(searchTerm) ||
            (agent.email && agent.email.toLowerCase().includes(searchTerm)) ||
            agent.phoneNumber.includes(searchTerm) ||
            agent.state.toLowerCase().includes(searchTerm) ||
            agent.district.toLowerCase().includes(searchTerm) ||
            (agent.companyName && agent.companyName.toLowerCase().includes(searchTerm))
          )
        }
      }

      // Client-side sorting by creation date (newest first)
      agents.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
      })

      callback(agents)
    })
  } catch (error) {
    console.error('Error subscribing to agents:', error)
    throw new Error('Failed to subscribe to agents')
  }
}

export const getAgentStats = async (): Promise<AgentStats> => {
  try {
    const agents = await getAgents()

    const stats: AgentStats = {
      totalAgents: agents.length,
      activeAgents: agents.filter(agent => agent.status === 'active').length,
      individualAgents: agents.filter(agent => agent.agentType === 'individual').length,
      companyAgents: agents.filter(agent => agent.agentType === 'company').length,
      suspendedAgents: agents.filter(agent => agent.status === 'suspended').length,
      inactiveAgents: agents.filter(agent => agent.status === 'inactive').length
    }

    return stats
  } catch (error) {
    console.error('Error getting agent stats:', error)
    throw new Error('Failed to get agent stats')
  }
}

export const updateAgentStatus = async (agentId: string, status: 'active' | 'inactive' | 'suspended', userId: string): Promise<void> => {
  try {
    await updateAgent(agentId, { status }, userId)
  } catch (error) {
    console.error('Error updating agent status:', error)
    throw new Error('Failed to update agent status')
  }
}