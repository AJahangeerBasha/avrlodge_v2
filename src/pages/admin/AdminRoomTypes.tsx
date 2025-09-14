import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '../../components/ui/card'
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
  Home, 
  DollarSign,
  Bed
} from 'lucide-react'
import { getAllRoomTypes, deleteRoomType } from '@/lib/roomTypes'
import { RoomType } from '@/lib/types/roomTypes'
import { useAuth } from '@/contexts/AuthContext'

export const AdminRoomTypes: React.FC = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()

  useEffect(() => {
    loadRoomTypes()
  }, [])

  const loadRoomTypes = async () => {
    try {
      setLoading(true)
      setError(null)
      const types = await getAllRoomTypes()
      setRoomTypes(types)
    } catch (err) {
      console.error('Error loading room types:', err)
      setError('Failed to load room types')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRoomType = async (id: string) => {
    if (!currentUser) return
    
    if (confirm('Are you sure you want to delete this room type?')) {
      try {
        await deleteRoomType(id, currentUser.uid)
        await loadRoomTypes() // Reload the list
      } catch (err) {
        console.error('Error deleting room type:', err)
        alert('Failed to delete room type')
      }
    }
  }

  const filteredRoomTypes = roomTypes.filter(roomType =>
    roomType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    roomType.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalRooms = roomTypes.reduce((sum, type) => sum + type.numberOfRooms, 0)
  const totalCapacity = roomTypes.reduce((sum, type) => sum + (type.numberOfRooms * type.maxGuests), 0)
  const averagePrice = roomTypes.length > 0 
    ? roomTypes.reduce((sum, type) => sum + type.pricePerNight, 0) / roomTypes.length 
    : 0

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
              <Button onClick={loadRoomTypes} className="mt-4 bg-black hover:bg-gray-800 text-white">
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
          <h2 className="text-3xl font-serif font-bold text-black">Room Types Management</h2>
          <p className="text-gray-600 mt-2">
            Manage accommodation types, pricing, and availability.
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-white transition-all duration-300">
            <Plus className="h-4 w-4" />
            <span>Add Room Type</span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
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
                  <Home className="h-5 w-5 text-black" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Room Types</p>
                  <p className="text-xl font-bold text-black">{roomTypes.length}</p>
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
                  <Bed className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Rooms</p>
                  <p className="text-xl font-bold text-black">{totalRooms}</p>
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
                  <p className="text-sm text-gray-600">Total Capacity</p>
                  <p className="text-xl font-bold text-black">{totalCapacity}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <DollarSign className="h-5 w-5 text-black" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg. Price</p>
                  <p className="text-xl font-bold text-black">₹{averagePrice.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search room types by name or description..."
                className="pl-10 border-gray-300 focus:border-black focus:ring-black bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Room Types List */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {filteredRoomTypes.length === 0 ? (
          <Card className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">No room types found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No room types match your search criteria.' : 'Get started by adding your first room type.'}
              </p>
              {!searchTerm && (
                <Button className="bg-black hover:bg-gray-800 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Room Type
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredRoomTypes.map((roomType, index) => (
            <motion.div
              key={roomType.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              <Card className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-black">{roomType.name}</h3>
                        <Badge variant={roomType.isActive ? 'default' : 'secondary'} className={roomType.isActive ? 'bg-black text-white' : ''}>
                          {roomType.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      {roomType.description && (
                        <p className="text-gray-600 mb-4">{roomType.description}</p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Price per Night</p>
                          <p className="text-lg font-bold text-black">₹{roomType.pricePerNight}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Max Guests</p>
                          <p className="text-lg font-semibold text-black">{roomType.maxGuests}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Number of Rooms</p>
                          <p className="text-lg font-semibold text-black">{roomType.numberOfRooms}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Total Capacity</p>
                          <p className="text-lg font-semibold text-black">{roomType.numberOfRooms * roomType.maxGuests}</p>
                        </div>
                      </div>

                      {roomType.amenities && roomType.amenities.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Amenities</p>
                          <div className="flex flex-wrap gap-2">
                            {roomType.amenities.map((amenity, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full border border-gray-200"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 lg:ml-6">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button size="sm" variant="outline" className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50">
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button size="sm" variant="outline" className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50">
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={() => handleDeleteRoomType(roomType.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}