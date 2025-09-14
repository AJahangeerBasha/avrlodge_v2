import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  Users, 
  Bed, 
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  Filter
} from 'lucide-react'
import { getRoomsWithType, deleteRoom, updateRoomStatus, getRoomStats } from '../../lib/rooms'
import { Room, RoomStats } from '../../lib/types/rooms'
import { getStatusConfig, getStatusOptions } from '../../lib/utils/roomStatus'
import { useAuth } from '../../contexts/AuthContext'

export const AdminRooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [stats, setStats] = useState<RoomStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()

  useEffect(() => {
    loadRooms()
    loadStats()
  }, [])

  const loadRooms = async () => {
    try {
      setLoading(true)
      setError(null)
      const roomsData = await getRoomsWithType({ isActive: true })
      setRooms(roomsData)
    } catch (err) {
      console.error('Error loading rooms:', err)
      setError('Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const roomStats = await getRoomStats()
      setStats(roomStats)
    } catch (err) {
      console.error('Error loading room stats:', err)
    }
  }

  const handleDeleteRoom = async (id: string) => {
    if (!currentUser) return
    
    if (confirm('Are you sure you want to delete this room?')) {
      try {
        await deleteRoom(id, currentUser.uid)
        await loadRooms()
        await loadStats()
      } catch (err) {
        console.error('Error deleting room:', err)
        alert('Failed to delete room')
      }
    }
  }

  const handleStatusChange = async (roomId: string, newStatus: string) => {
    if (!currentUser) return
    
    try {
      await updateRoomStatus(roomId, newStatus as any, currentUser.uid)
      await loadRooms()
      await loadStats()
    } catch (err) {
      console.error('Error updating room status:', err)
      alert('Failed to update room status')
    }
  }

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomType?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === '' || room.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const statusOptions = getStatusOptions()
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />
      case 'occupied': return <Users className="h-4 w-4" />
      case 'maintenance': return <Settings className="h-4 w-4" />
      case 'reserved': return <Clock className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 bg-white min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 bg-white min-h-screen">
        <Card className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button onClick={loadRooms} className="mt-4 bg-black hover:bg-gray-800 text-white">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-white min-h-screen">
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h2 className="text-3xl font-serif font-bold text-black">Rooms Management</h2>
          <p className="text-gray-600 mt-2">
            Manage individual rooms, status, and assignments.
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-white transition-all duration-300">
            <Plus className="h-4 w-4" />
            <span>Add Room</span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Statistics Cards */}
      {stats && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-5 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <Bed className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Rooms</p>
                    <p className="text-xl font-bold text-black">{stats.totalRooms}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="text-xl font-bold text-black">{stats.availableRooms}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <Users className="h-5 w-5 text-gray-800" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Occupied</p>
                    <p className="text-xl font-bold text-black">{stats.occupiedRooms}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Settings className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Maintenance</p>
                  <p className="text-xl font-bold text-gray-900">{stats.maintenanceRooms}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Occupancy</p>
                  <p className="text-xl font-bold text-gray-900">{stats.occupancyRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by room number or room type..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                {statusOptions.map(option => (
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

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter ? 'No rooms match your search criteria.' : 'Get started by adding your first room.'}
                </p>
                {!searchTerm && !statusFilter && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Room
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredRooms.map((room) => {
            const statusConfig = getStatusConfig(room.status)
            return (
              <Card key={room.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Room {room.roomNumber}</h3>
                      {room.floorNumber && (
                        <p className="text-sm text-gray-500">Floor {room.floorNumber}</p>
                      )}
                    </div>
                    <Badge className={statusConfig.color}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(room.status)}
                        <span>{statusConfig.label}</span>
                      </div>
                    </Badge>
                  </div>

                  {room.roomType && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700">{room.roomType.name}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>₹{room.roomType.pricePerNight}/night</span>
                        <span>{room.roomType.maxGuests} guests</span>
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Status</p>
                    <select
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                      value={room.status}
                      onChange={(e) => handleStatusChange(room.id, e.target.value)}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteRoom(room.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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