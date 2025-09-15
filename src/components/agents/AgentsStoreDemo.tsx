import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAgentsData, useAgentsCRUD, useAgentsUI } from '@/hooks/useAgents'
import { Users, Activity, Database, Settings } from 'lucide-react'

/**
 * Demo component to showcase the agents store functionality
 * This demonstrates how easy it is to access and manage agents state
 */
export const AgentsStoreDemo = () => {
  // Access read-only data
  const { agents, stats, loading } = useAgentsData()

  // Access CRUD operations
  const { refreshAgents, loadStats } = useAgentsCRUD()

  // Access UI state management
  const { openCreateModal, filters, updateFilters } = useAgentsUI()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-black mb-2">Agents Store Demo</h2>
        <p className="text-gray-600">Showcasing centralized state management with Zustand</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/95 backdrop-blur-sm border border-black/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{stats.totalAgents}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-black/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeAgents}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-black/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Database className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.companyAgents}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-black/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Status</CardTitle>
            <Settings className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <Badge className={loading ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
              {loading ? "Loading" : "Ready"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Store Actions */}
      <Card className="bg-white/95 backdrop-blur-sm border border-black/10">
        <CardHeader>
          <CardTitle className="text-black">Store Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={refreshAgents}
              variant="outline"
              size="sm"
              className="border-black/20"
            >
              Refresh Agents
            </Button>
            <Button
              onClick={loadStats}
              variant="outline"
              size="sm"
              className="border-black/20"
            >
              Reload Stats
            </Button>
            <Button
              onClick={openCreateModal}
              variant="outline"
              size="sm"
              className="border-black/20"
            >
              Open Create Modal
            </Button>
            <Button
              onClick={() => updateFilters({ agentType: 'company' })}
              variant="outline"
              size="sm"
              className="border-black/20"
            >
              Filter Companies
            </Button>
            <Button
              onClick={() => updateFilters({})}
              variant="outline"
              size="sm"
              className="border-black/20"
            >
              Clear Filters
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>Current Filters:</strong> {JSON.stringify(filters, null, 2) || 'None'}</p>
            <p><strong>Agents in Store:</strong> {agents.length}</p>
            <p><strong>Loading State:</strong> {loading ? 'True' : 'False'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Agents */}
      <Card className="bg-white/95 backdrop-blur-sm border border-black/10">
        <CardHeader>
          <CardTitle className="text-black">Recent Agents (Store Data)</CardTitle>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No agents found</p>
          ) : (
            <div className="space-y-2">
              {agents.slice(0, 3).map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-black">{agent.name}</p>
                    <p className="text-sm text-gray-600">{agent.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{agent.agentType}</Badge>
                    <Badge className={
                      agent.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }>
                      {agent.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {agents.length > 3 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  And {agents.length - 3} more agents...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default AgentsStoreDemo