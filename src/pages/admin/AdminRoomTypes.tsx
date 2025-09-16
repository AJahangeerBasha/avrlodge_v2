import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Users, Bed, Home, DollarSign, Edit, Trash2, Eye, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useRoomTypes, useRoomTypesUI, useRoomTypesCRUD } from '@/hooks/useRoomTypes'

const AdminRoomTypes = () => {
  const { currentUser } = useAuth()

  // Use store hooks
  const { roomTypes, stats, loading } = useRoomTypes()
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
    updateFilters
  } = useRoomTypesUI()
  const {
    createRoomType,
    updateRoomType,
    deleteRoomType,
    selectedRoomType
  } = useRoomTypesCRUD()

  const handleCreateRoomType = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    // Validate required fields
    if (!formData.name.trim()) {
      alert('Room type name is required')
      return
    }
    if (formData.pricePerNight <= 0) {
      alert('Price per night must be greater than 0')
      return
    }
    if (formData.maxGuests <= 0) {
      alert('Max guests must be greater than 0')
      return
    }
    if (formData.numberOfRooms <= 0) {
      alert('Number of rooms must be greater than 0')
      return
    }

    try {
      await createRoomType(formData, currentUser.uid)
      closeCreateModal()
    } catch (error) {
      console.error('Error creating room type:', error)
    }
  }

  const handleUpdateRoomType = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !selectedRoomType) return

    try {
      const updateData = {
        ...formData,
        updatedBy: currentUser.uid,
        updatedAt: new Date().toISOString()
      }
      await updateRoomType(selectedRoomType.id, updateData, currentUser.uid)
      closeEditModal()
    } catch (error) {
      console.error('Error updating room type:', error)
    }
  }

  const handleDeleteRoomType = async (roomTypeId: string) => {
    if (!confirm('Are you sure you want to delete this room type?')) return
    if (!currentUser) return

    try {
      await deleteRoomType(roomTypeId, currentUser.uid)
    } catch (error) {
      console.error('Error deleting room type:', error)
    }
  }

  // Filter room types based on search term and filters
  const filteredRoomTypes = roomTypes.filter(roomType => {
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const matchesSearch = roomType.name.toLowerCase().includes(searchLower) ||
                           roomType.description?.toLowerCase().includes(searchLower) ||
                           roomType.amenities.some(amenity => amenity.toLowerCase().includes(searchLower))
      if (!matchesSearch) return false
    }

    if (filters.isActive !== undefined && roomType.isActive !== filters.isActive) {
      return false
    }

    if (filters.minPrice !== undefined && roomType.pricePerNight < filters.minPrice) {
      return false
    }

    if (filters.maxPrice !== undefined && roomType.pricePerNight > filters.maxPrice) {
      return false
    }

    if (filters.minGuests !== undefined && roomType.maxGuests < filters.minGuests) {
      return false
    }

    if (filters.maxGuests !== undefined && roomType.maxGuests > filters.maxGuests) {
      return false
    }

    return true
  })

  const statsCards = [
    {
      title: 'Total Types',
      value: stats.totalTypes,
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Total room types configured'
    },
    {
      title: 'Active Types',
      value: stats.activeTypes,
      icon: Tag,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Currently available room types'
    },
    {
      title: 'Total Rooms',
      value: stats.totalRooms,
      icon: Bed,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'Total rooms across all types'
    },
    {
      title: 'Total Capacity',
      value: stats.totalCapacity,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      description: 'Maximum guest capacity'
    },
    {
      title: 'Average Price',
      value: `₹${Math.round(stats.averagePrice)}`,
      icon: DollarSign,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      description: 'Average price per night'
    },
    {
      title: 'Inactive Types',
      value: stats.inactiveTypes,
      icon: Eye,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      description: 'Disabled room types'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room types...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Room Types Management</h1>
            <p className="text-gray-600">Manage and configure room types for your resort</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={openCreateModal}
              className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Add Room Type
            </Button>
          </motion.div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <Card className={`${stat.bgColor} ${stat.borderColor} border-2 hover:shadow-lg transition-all duration-200`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-black">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-8 shadow-sm"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search room types..."
                  value={filters.searchTerm || ''}
                  onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                  className="pl-10 h-12 border-2 border-gray-200 focus:border-black transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Select
                value={filters.isActive?.toString() || 'all'}
                onValueChange={(value) => {
                  updateFilters({
                    isActive: value === 'all' ? undefined : value === 'true'
                  })
                }}
              >
                <SelectTrigger className="w-32 h-12 border-2 border-gray-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => updateFilters({})}
                className="h-12 px-6 border-2 border-gray-200 hover:border-black transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Room Types List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {filteredRoomTypes.length === 0 ? (
            <Card className="border-2 border-gray-200">
              <CardContent className="p-12">
                <div className="text-center">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No room types found</h3>
                  <p className="text-gray-500 mb-6">
                    {roomTypes.length === 0
                      ? "Get started by creating your first room type."
                      : "No room types match your current filters."}
                  </p>
                  {roomTypes.length === 0 && (
                    <Button
                      onClick={openCreateModal}
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Room Type
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredRoomTypes.map((roomType, index) => (
                <motion.div
                  key={roomType.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ scale: 1.01, y: -2 }}
                >
                  <Card className="border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-xl font-semibold text-black">{roomType.name}</h3>
                            <Badge
                              variant="outline"
                              className={roomType.isActive
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                              }
                            >
                              {roomType.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-gray-600">₹{roomType.pricePerNight}/night</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-gray-600">Max {roomType.maxGuests} guests</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Bed className="h-4 w-4 text-purple-600" />
                              <span className="text-sm text-gray-600">{roomType.numberOfRooms} rooms</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4 text-orange-600" />
                              <span className="text-sm text-gray-600">
                                Capacity: {roomType.maxGuests * roomType.numberOfRooms}
                              </span>
                            </div>
                          </div>

                          {roomType.description && (
                            <p className="text-gray-600 text-sm mb-4">{roomType.description}</p>
                          )}

                          {roomType.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {roomType.amenities.map((amenity, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                                >
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(roomType)}
                              className="h-9 w-9 p-0 border-2 hover:border-blue-300 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteRoomType(roomType.id)}
                              className="h-9 w-9 p-0 border-2 hover:border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={closeCreateModal}>
        <DialogContent className="bg-white/95 backdrop-blur-sm max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-black">Create Room Type</DialogTitle>
            <DialogDescription className="text-gray-600">
              Add a new room type with details and amenities.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRoomType} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-black">Room Type Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  placeholder="e.g. Deluxe Suite"
                  className="border-2 border-gray-200 focus:border-black"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerNight" className="text-sm font-medium text-black">Price per Night (₹) *</Label>
                <Input
                  id="pricePerNight"
                  type="number"
                  min="1"
                  value={formData.pricePerNight}
                  onChange={(e) => updateFormData({ pricePerNight: parseInt(e.target.value) || 0 })}
                  placeholder="1500"
                  className="border-2 border-gray-200 focus:border-black"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxGuests" className="text-sm font-medium text-black">Max Guests *</Label>
                <Input
                  id="maxGuests"
                  type="number"
                  min="1"
                  value={formData.maxGuests}
                  onChange={(e) => updateFormData({ maxGuests: parseInt(e.target.value) || 1 })}
                  placeholder="2"
                  className="border-2 border-gray-200 focus:border-black"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numberOfRooms" className="text-sm font-medium text-black">Number of Rooms *</Label>
                <Input
                  id="numberOfRooms"
                  type="number"
                  min="1"
                  value={formData.numberOfRooms}
                  onChange={(e) => updateFormData({ numberOfRooms: parseInt(e.target.value) || 1 })}
                  placeholder="5"
                  className="border-2 border-gray-200 focus:border-black"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-black">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                placeholder="Comfortable rooms with modern amenities"
                className="border-2 border-gray-200 focus:border-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities" className="text-sm font-medium text-black">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                value={formData.amenities.join(', ')}
                onChange={(e) => updateFormData({
                  amenities: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                })}
                placeholder="WiFi, AC, TV, Mini Fridge"
                className="border-2 border-gray-200 focus:border-black"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => updateFormData({ isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive" className="text-sm font-medium text-black">Active</Label>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeCreateModal}
                className="border-2 border-gray-200 hover:border-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white"
              >
                Create Room Type
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={closeEditModal}>
        <DialogContent className="bg-white/95 backdrop-blur-sm max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-black">Edit Room Type</DialogTitle>
            <DialogDescription className="text-gray-600">
              Update room type information and settings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateRoomType} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium text-black">Room Type Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  placeholder="e.g. Deluxe Suite"
                  className="border-2 border-gray-200 focus:border-black"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-pricePerNight" className="text-sm font-medium text-black">Price per Night (₹) *</Label>
                <Input
                  id="edit-pricePerNight"
                  type="number"
                  min="1"
                  value={formData.pricePerNight}
                  onChange={(e) => updateFormData({ pricePerNight: parseInt(e.target.value) || 0 })}
                  placeholder="1500"
                  className="border-2 border-gray-200 focus:border-black"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxGuests" className="text-sm font-medium text-black">Max Guests *</Label>
                <Input
                  id="edit-maxGuests"
                  type="number"
                  min="1"
                  value={formData.maxGuests}
                  onChange={(e) => updateFormData({ maxGuests: parseInt(e.target.value) || 1 })}
                  placeholder="2"
                  className="border-2 border-gray-200 focus:border-black"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-numberOfRooms" className="text-sm font-medium text-black">Number of Rooms *</Label>
                <Input
                  id="edit-numberOfRooms"
                  type="number"
                  min="1"
                  value={formData.numberOfRooms}
                  onChange={(e) => updateFormData({ numberOfRooms: parseInt(e.target.value) || 1 })}
                  placeholder="5"
                  className="border-2 border-gray-200 focus:border-black"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm font-medium text-black">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                placeholder="Comfortable rooms with modern amenities"
                className="border-2 border-gray-200 focus:border-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-amenities" className="text-sm font-medium text-black">Amenities (comma-separated)</Label>
              <Input
                id="edit-amenities"
                value={formData.amenities.join(', ')}
                onChange={(e) => updateFormData({
                  amenities: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                })}
                placeholder="WiFi, AC, TV, Mini Fridge"
                className="border-2 border-gray-200 focus:border-black"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={formData.isActive}
                onChange={(e) => updateFormData({ isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="edit-isActive" className="text-sm font-medium text-black">Active</Label>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeEditModal}
                className="border-2 border-gray-200 hover:border-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white"
              >
                Update Room Type
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export default AdminRoomTypes
export { AdminRoomTypes }