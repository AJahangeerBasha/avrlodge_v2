import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Users, Bed, CheckCircle, AlertCircle, Clock, MapPin, Edit, Trash2, Eye, XCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useRooms, useRoomsUI, useRoomsCRUD } from '@/hooks/useRooms'
import { getStatusConfig } from '@/lib/utils/roomStatus'
import type { Room, RoomStatus } from '@/lib/types/rooms'

// Helper function to get status icon
const getStatusIcon = (status: RoomStatus) => {
  switch (status) {
    case 'available':
      return <CheckCircle className="h-4 w-4 mr-1" />
    case 'occupied':
      return <XCircle className="h-4 w-4 mr-1" />
    case 'maintenance':
      return <AlertTriangle className="h-4 w-4 mr-1" />
    case 'reserved':
      return <Clock className="h-4 w-4 mr-1" />
    default:
      return <CheckCircle className="h-4 w-4 mr-1" />
  }
}

const AdminRooms = () => {
  const { currentUser } = useAuth()

  // Use store hooks
  const { rooms, roomTypes, stats, loading } = useRooms()
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
  } = useRoomsUI()
  const {
    createRoom,
    updateRoom,
    deleteRoom,
    updateRoomStatus,
    selectedRoom
  } = useRoomsCRUD()

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    // Validate required fields
    if (!formData.roomNumber.trim()) {
      alert('Room number is required')
      return
    }
    if (!formData.roomTypeId) {
      alert('Room type is required')
      return
    }

    try {
      await createRoom(formData, currentUser.uid)
      closeCreateModal()
    } catch (error) {
      console.error('Error creating room:', error)
      alert('Failed to create room. Please try again.')
    }
  }

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !selectedRoom) return

    // Validate required fields
    if (!formData.roomNumber.trim()) {
      alert('Room number is required')
      return
    }
    if (!formData.roomTypeId) {
      alert('Room type is required')
      return
    }

    try {
      await updateRoom(selectedRoom.id, { ...formData, updatedBy: currentUser.uid, updatedAt: new Date().toISOString() }, currentUser.uid)
      closeEditModal()
    } catch (error) {
      console.error('Error updating room:', error)
      alert('Failed to update room. Please try again.')
    }
  }

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return
    if (!currentUser) return

    try {
      await deleteRoom(roomId, currentUser.uid)
    } catch (error) {
      console.error('Error deleting room:', error)
    }
  }

  const handleStatusUpdate = async (roomId: string, newStatus: RoomStatus) => {
    if (!currentUser) return

    try {
      await updateRoomStatus(roomId, newStatus, currentUser.uid)
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  // Filter rooms based on search and status
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = !filters.searchTerm ||
      room.roomNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      room.roomType?.name.toLowerCase().includes(filters.searchTerm.toLowerCase())

    const matchesStatus = !filters.status || room.status === filters.status

    return matchesSearch && matchesStatus
  })

  return (
    <motion.div
      className="space-y-8 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rooms Management</h1>
          <p className="text-gray-600 mt-2">Manage room inventory, status, and assignments</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Bed className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalRooms}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-green-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.availableRooms}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-red-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.occupiedRooms}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-yellow-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.maintenanceRooms}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-blue-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reserved</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.reservedRooms}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-purple-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
            <MapPin className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.occupancyRate.toFixed(1)}%</div>
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
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search rooms..."
              value={filters.searchTerm || ''}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              className="pl-10 bg-white/95 backdrop-blur-sm border-black/20"
            />
          </div>

          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => updateFilters({ status: value === 'all' ? undefined : value as RoomStatus })}
          >
            <SelectTrigger className="w-full sm:w-48 bg-white/95 backdrop-blur-sm border-black/20">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          className="bg-black hover:bg-gray-800 text-white transition-colors"
          onClick={openCreateModal}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>

        <Dialog open={isCreateModalOpen} onOpenChange={closeCreateModal}>
          <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border border-black/20">
            <DialogHeader>
              <DialogTitle className="text-black">Add New Room</DialogTitle>
              <DialogDescription>Create a new room for booking management.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roomNumber">Room Number *</Label>
                  <Input
                    id="roomNumber"
                    type="text"
                    value={formData.roomNumber}
                    onChange={(e) => updateFormData({ roomNumber: e.target.value })}
                    required
                    className="bg-white/95 backdrop-blur-sm border-black/20"
                  />
                </div>
                <div>
                  <Label htmlFor="roomType">Room Type *</Label>
                  <Select
                    value={formData.roomTypeId}
                    onValueChange={(value) => updateFormData({ roomTypeId: value })}
                  >
                    <SelectTrigger className="bg-white/95 backdrop-blur-sm border-black/20">
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map((roomType) => (
                        <SelectItem key={roomType.id} value={roomType.id}>
                          {roomType.name} (₹{roomType.pricePerNight}/night)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="floorNumber">Floor Number</Label>
                  <Input
                    id="floorNumber"
                    type="number"
                    value={formData.floorNumber || ''}
                    onChange={(e) => updateFormData({ floorNumber: e.target.value ? parseInt(e.target.value) : null })}
                    className="bg-white/95 backdrop-blur-sm border-black/20"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => updateFormData({ status: value as RoomStatus })}
                  >
                    <SelectTrigger className="bg-white/95 backdrop-blur-sm border-black/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeCreateModal}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-black hover:bg-gray-800 text-white">
                  Create Room
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Rooms List */}
      <motion.div
        className="grid gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first room.</p>
            <Button
              onClick={openCreateModal}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add First Room
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {filteredRooms.map((room, index) => {
              const statusConfig = getStatusConfig(room.status)
              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Bed className="h-5 w-5 text-gray-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Room {room.roomNumber}</h3>
                          <p className="text-sm text-gray-600">
                            {room.roomType?.name} • Floor {room.floorNumber || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge
                        variant="outline"
                        className={statusConfig.color}
                      >
                        {getStatusIcon(room.status)}
                        {statusConfig.label}
                      </Badge>

                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(room)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteRoom(room.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <Select
                          value={room.status}
                          onValueChange={(value) => handleStatusUpdate(room.id, value as RoomStatus)}
                        >
                          <SelectTrigger className="h-8 w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="occupied">Occupied</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="reserved">Reserved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {room.roomType && (
                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Max: {room.roomType.maxGuests} guests</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-600">₹{room.roomType.pricePerNight}/night</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-600">ID: {room.id.slice(-4)}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={closeEditModal}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border border-black/20">
          <DialogHeader>
            <DialogTitle className="text-black">Edit Room</DialogTitle>
            <DialogDescription>Update room information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateRoom} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-roomNumber">Room Number *</Label>
                <Input
                  id="edit-roomNumber"
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => updateFormData({ roomNumber: e.target.value })}
                  required
                  className="bg-white/95 backdrop-blur-sm border-black/20"
                />
              </div>
              <div>
                <Label htmlFor="edit-roomType">Room Type *</Label>
                <Select
                  value={formData.roomTypeId}
                  onValueChange={(value) => updateFormData({ roomTypeId: value })}
                >
                  <SelectTrigger className="bg-white/95 backdrop-blur-sm border-black/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((roomType) => (
                      <SelectItem key={roomType.id} value={roomType.id}>
                        {roomType.name} (₹{roomType.pricePerNight}/night)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-floorNumber">Floor Number</Label>
                <Input
                  id="edit-floorNumber"
                  type="number"
                  value={formData.floorNumber || ''}
                  onChange={(e) => updateFormData({ floorNumber: e.target.value ? parseInt(e.target.value) : null })}
                  className="bg-white/95 backdrop-blur-sm border-black/20"
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateFormData({ status: value as RoomStatus })}
                >
                  <SelectTrigger className="bg-white/95 backdrop-blur-sm border-black/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button type="submit" className="bg-black hover:bg-gray-800 text-white">
                Update Room
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export default AdminRooms