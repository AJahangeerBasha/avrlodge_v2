import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Users, Building2, UserCheck, UserX, AlertTriangle, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useAgents, useAgentsUI, useAgentsCRUD } from '@/hooks/useAgents'
import { StateDistrictDropdown } from '@/components/agents/StateDistrictDropdown'

const AdminAgents = () => {
  const { currentUser } = useAuth()

  // Use store hooks
  const { agents, stats, loading } = useAgents()
  const {
    isCreateModalOpen,
    isEditModalOpen,
    formData,
    filters,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    updateFormData,
    resetFormData,
    updateFilters
  } = useAgentsUI()
  const {
    createAgent,
    updateAgent,
    deleteAgent,
    updateAgentStatus,
    selectedAgent
  } = useAgentsCRUD()

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    // Validate required fields
    if (!formData.name.trim()) {
      alert('Name is required')
      return
    }
    if (!formData.phoneNumber.trim()) {
      alert('Phone number is required')
      return
    }
    if (!formData.state.trim()) {
      alert('State is required')
      return
    }
    if (!formData.district.trim()) {
      alert('District is required')
      return
    }

    try {
      await createAgent(formData, currentUser.uid)
      closeCreateModal()
    } catch (error) {
      console.error('Error creating agent:', error)
      alert('Failed to create agent. Please try again.')
    }
  }

  const handleUpdateAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !selectedAgent) return

    // Validate required fields
    if (!formData.name.trim()) {
      alert('Name is required')
      return
    }
    if (!formData.phoneNumber.trim()) {
      alert('Phone number is required')
      return
    }
    if (!formData.state.trim()) {
      alert('State is required')
      return
    }
    if (!formData.district.trim()) {
      alert('District is required')
      return
    }

    try {
      await updateAgent(selectedAgent.id, formData, currentUser.uid)
      closeEditModal()
    } catch (error) {
      console.error('Error updating agent:', error)
      alert('Failed to update agent. Please try again.')
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return

    try {
      await deleteAgent(agentId)
    } catch (error) {
      console.error('Error deleting agent:', error)
    }
  }

  const handleStatusUpdate = async (agentId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    if (!currentUser) return

    try {
      await updateAgentStatus(agentId, newStatus, currentUser.uid)
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAgentTypeIcon = (type: string) => {
    return type === 'company' ? <Building2 className="h-4 w-4" /> : <Users className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agents...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-black mb-2">Agents Management</h1>
        <p className="text-gray-600">Manage travel agents and booking partners</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="bg-white/95 backdrop-blur-sm border border-black/10 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{stats.totalAgents}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-black/10 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeAgents}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-black/10 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Individual</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.individualAgents}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-black/10 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Company</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.companyAgents}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-black/10 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Inactive</CardTitle>
            <UserX className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactiveAgents}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-black/10 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Suspended</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.suspendedAgents}</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Controls */}
      <motion.div
        className="mb-8 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search agents..."
              value={filters.searchTerm || ''}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              className="pl-10 w-full sm:w-80 bg-white/95 backdrop-blur-sm border-black/20"
            />
          </div>

          <Select
            value={filters.agentType || 'all'}
            onValueChange={(value) => updateFilters({ agentType: value === 'all' ? undefined : value as 'individual' | 'company' })}
          >
            <SelectTrigger className="w-full sm:w-40 bg-white/95 backdrop-blur-sm border-black/20">
              <SelectValue placeholder="Agent Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="company">Company</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => updateFilters({ status: value === 'all' ? undefined : value as 'active' | 'inactive' | 'suspended' })}
          >
            <SelectTrigger className="w-full sm:w-32 bg-white/95 backdrop-blur-sm border-black/20">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          className="bg-black hover:bg-gray-800 text-white transition-colors"
          onClick={openCreateModal}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Agent
        </Button>

        <Dialog open={isCreateModalOpen} onOpenChange={closeCreateModal}>
          <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border border-black/20">
            <DialogHeader>
              <DialogTitle className="text-black">Add New Agent</DialogTitle>
              <DialogDescription>Create a new agent profile for booking management.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    required
                    className="bg-white/95 backdrop-blur-sm border-black/20"
                  />
                </div>
                <div>
                  <Label htmlFor="agentType">Agent Type *</Label>
                  <Select
                    value={formData.agentType}
                    onValueChange={(value) => updateFormData({ agentType: value as 'individual' | 'company' })}
                  >
                    <SelectTrigger className="bg-white/95 backdrop-blur-sm border-black/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
                    required
                    className="bg-white/95 backdrop-blur-sm border-black/20"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsAppNumber">WhatsApp Number</Label>
                  <Input
                    id="whatsAppNumber"
                    type="tel"
                    value={formData.whatsAppNumber}
                    onChange={(e) => updateFormData({ whatsAppNumber: e.target.value })}
                    className="bg-white/95 backdrop-blur-sm border-black/20"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => updateFormData({ email: e.target.value })}
                  className="bg-white/95 backdrop-blur-sm border-black/20"
                />
              </div>

              <StateDistrictDropdown
                selectedState={formData.state}
                selectedDistrict={formData.district}
                onStateChange={(state) => updateFormData({ state })}
                onDistrictChange={(district) => updateFormData({ district })}
              />

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateFormData({ status: value as 'active' | 'inactive' | 'suspended' })}
                >
                  <SelectTrigger className="bg-white/95 backdrop-blur-sm border-black/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.agentType === 'company' && (
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => updateFormData({ companyName: e.target.value })}
                    className="bg-white/95 backdrop-blur-sm border-black/20"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeCreateModal}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-black hover:bg-gray-800 text-white">
                  Create Agent
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Agents List */}
      <motion.div
        className="grid gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
          >
            <Card className="bg-white/95 backdrop-blur-sm border border-black/10 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {agent.profileImageUrl ? (
                        <img
                          src={agent.profileImageUrl}
                          alt={agent.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-black/10"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          {getAgentTypeIcon(agent.agentType)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-black text-lg">{agent.name}</h3>
                        <Badge className={`text-xs ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getAgentTypeIcon(agent.agentType)}
                          <span className="ml-1">{agent.agentType}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Phone:</span>
                          <span>{agent.phoneNumber}</span>
                        </div>
                        {agent.email && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Email:</span>
                            <span>{agent.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="font-medium">State:</span>
                          <span>{agent.state}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">District:</span>
                          <span>{agent.district}</span>
                        </div>
                        {agent.companyName && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Company:</span>
                            <span>{agent.companyName}</span>
                          </div>
                        )}
                      </div>

                      {agent.whatsAppNumber && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">WhatsApp:</span>
                          <span className="ml-1">{agent.whatsAppNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Select
                      value={agent.status}
                      onValueChange={(value) => handleStatusUpdate(agent.id, value as 'active' | 'inactive' | 'suspended')}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs bg-white/95 backdrop-blur-sm border-black/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(agent)}
                      className="border-black/20 hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAgent(agent.id)}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {agents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-12"
          >
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first agent.</p>
            <Button
              onClick={openCreateModal}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add First Agent
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={closeEditModal}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border border-black/20">
          <DialogHeader>
            <DialogTitle className="text-black">Edit Agent</DialogTitle>
            <DialogDescription>Update agent information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateAgent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  required
                  className="bg-white/95 backdrop-blur-sm border-black/20"
                />
              </div>
              <div>
                <Label htmlFor="edit-agentType">Agent Type *</Label>
                <Select
                  value={formData.agentType}
                  onValueChange={(value) => updateFormData({ agentType: value as 'individual' | 'company' })}
                >
                  <SelectTrigger className="bg-white/95 backdrop-blur-sm border-black/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phoneNumber">Phone Number *</Label>
                <Input
                  id="edit-phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
                  required
                  className="bg-white/95 backdrop-blur-sm border-black/20"
                />
              </div>
              <div>
                <Label htmlFor="edit-whatsAppNumber">WhatsApp Number</Label>
                <Input
                  id="edit-whatsAppNumber"
                  type="tel"
                  value={formData.whatsAppNumber}
                  onChange={(e) => updateFormData({ whatsAppNumber: e.target.value })}
                  className="bg-white/95 backdrop-blur-sm border-black/20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateFormData({ email: e.target.value })}
                className="bg-white/95 backdrop-blur-sm border-black/20"
              />
            </div>

            <StateDistrictDropdown
              selectedState={formData.state}
              selectedDistrict={formData.district}
              onStateChange={(state) => updateFormData({ state })}
              onDistrictChange={(district) => updateFormData({ district })}
            />

            <div>
              <Label htmlFor="edit-status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => updateFormData({ status: value as 'active' | 'inactive' | 'suspended' })}
              >
                <SelectTrigger className="bg-white/95 backdrop-blur-sm border-black/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.agentType === 'company' && (
              <div>
                <Label htmlFor="edit-companyName">Company Name</Label>
                <Input
                  id="edit-companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateFormData({ companyName: e.target.value })}
                  className="bg-white/95 backdrop-blur-sm border-black/20"
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button type="submit" className="bg-black hover:bg-gray-800 text-white">
                Update Agent
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export { AdminAgents }
export default AdminAgents