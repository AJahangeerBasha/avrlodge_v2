import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  DollarSign,
  Calendar,
  Users,
  Settings,
  Filter,
  TrendingUp
} from 'lucide-react'
import { getAllSpecialCharges, deleteSpecialCharge, getSpecialChargesStats } from '../../lib/specialCharges'
import { SpecialCharge, SpecialChargeStats } from '../../lib/types/specialCharges'
import { getRateTypeConfig, getRateTypeOptions, formatRateDisplay } from '../../lib/utils/rateType'
import { useAuth } from '../../contexts/AuthContext'

export const AdminSpecialCharges: React.FC = () => {
  const [charges, setCharges] = useState<SpecialCharge[]>([])
  const [stats, setStats] = useState<SpecialChargeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [rateTypeFilter, setRateTypeFilter] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()

  useEffect(() => {
    loadCharges()
    loadStats()
  }, [])

  const loadCharges = async () => {
    try {
      setLoading(true)
      setError(null)
      const chargesData = await getAllSpecialCharges({ isActive: true })
      setCharges(chargesData)
    } catch (err) {
      console.error('Error loading special charges:', err)
      setError('Failed to load special charges')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const chargeStats = await getSpecialChargesStats()
      setStats(chargeStats)
    } catch (err) {
      console.error('Error loading special charges stats:', err)
    }
  }

  const handleDeleteCharge = async (id: string) => {
    if (!currentUser) return
    
    if (confirm('Are you sure you want to delete this special charge?')) {
      try {
        await deleteSpecialCharge(id, currentUser.uid)
        await loadCharges()
        await loadStats()
      } catch (err) {
        console.error('Error deleting special charge:', err)
        alert('Failed to delete special charge')
      }
    }
  }

  const filteredCharges = charges.filter(charge => {
    const matchesSearch = 
      charge.chargeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charge.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRateType = rateTypeFilter === '' || charge.rateType === rateTypeFilter
    
    return matchesSearch && matchesRateType
  })

  const rateTypeOptions = getRateTypeOptions()
  const getRateTypeIcon = (rateType: string) => {
    switch (rateType) {
      case 'per_day': return <Calendar className="h-4 w-4" />
      case 'per_person': return <Users className="h-4 w-4" />
      case 'fixed': return <DollarSign className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button onClick={loadCharges} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Special Charges Management</h2>
          <p className="text-gray-600 mt-2">
            Manage additional charges for services and amenities.
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Special Charge</span>
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Charges</p>
                  <p className="text-xl font-bold text-gray-900">{stats.activeCharges}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Per Day Charges</p>
                  <p className="text-xl font-bold text-gray-900">{stats.perDayCharges}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Per Person Charges</p>
                  <p className="text-xl font-bold text-gray-900">{stats.perPersonCharges}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg. Rate</p>
                  <p className="text-xl font-bold text-gray-900">₹{stats.averageRate.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by charge name or description..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={rateTypeFilter}
                onChange={(e) => setRateTypeFilter(e.target.value)}
              >
                <option value="">All Rate Types</option>
                {rateTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Charges List */}
      <div className="space-y-4">
        {filteredCharges.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No special charges found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || rateTypeFilter ? 'No charges match your search criteria.' : 'Get started by adding your first special charge.'}
              </p>
              {!searchTerm && !rateTypeFilter && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Special Charge
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredCharges.map((charge) => {
            const rateTypeConfig = getRateTypeConfig(charge.rateType)
            return (
              <Card key={charge.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{charge.chargeName}</h3>
                        <Badge className={rateTypeConfig.color}>
                          <div className="flex items-center space-x-1">
                            {getRateTypeIcon(charge.rateType)}
                            <span>{rateTypeConfig.label}</span>
                          </div>
                        </Badge>
                      </div>
                      
                      {charge.description && (
                        <p className="text-gray-600 mb-4">{charge.description}</p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Rate</p>
                          <p className="text-lg font-bold text-green-600">
                            {formatRateDisplay(charge.defaultRate, charge.rateType)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Rate Type</p>
                          <p className="text-sm text-gray-600">{rateTypeConfig.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 lg:ml-6">
                      <Button size="sm" variant="outline" className="flex items-center space-x-2">
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Button>
                      <Button size="sm" variant="outline" className="flex items-center space-x-2">
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteCharge(charge.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}