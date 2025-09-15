export interface Agent {
  id: string
  name: string
  phoneNumber: string
  whatsAppNumber?: string
  agentType: 'individual' | 'company'
  email?: string
  state: string
  district: string
  companyName?: string
  profileImageUrl?: string
  addressProof?: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export interface CreateAgentData {
  name: string
  phoneNumber: string
  whatsAppNumber?: string
  agentType: 'individual' | 'company'
  email?: string
  state: string
  district: string
  companyName?: string
  profileImageUrl?: string
  addressProof?: string
  status?: 'active' | 'inactive' | 'suspended'
}

export interface UpdateAgentData {
  name?: string
  phoneNumber?: string
  whatsAppNumber?: string
  agentType?: 'individual' | 'company'
  email?: string
  state?: string
  district?: string
  companyName?: string
  profileImageUrl?: string
  addressProof?: string
  status?: 'active' | 'inactive' | 'suspended'
}

export interface AgentFilters {
  agentType?: 'individual' | 'company'
  status?: 'active' | 'inactive' | 'suspended'
  state?: string
  district?: string
  searchTerm?: string
}

export interface AgentStats {
  totalAgents: number
  activeAgents: number
  individualAgents: number
  companyAgents: number
  suspendedAgents: number
  inactiveAgents: number
}