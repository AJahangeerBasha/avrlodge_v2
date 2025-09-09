import { RoomStatus } from '../types/rooms'

// Room status configurations
export const ROOM_STATUS_CONFIG = {
  available: {
    label: 'Available',
    color: 'bg-green-100 text-green-800',
    iconColor: 'text-green-600',
    description: 'Room is ready for check-in'
  },
  occupied: {
    label: 'Occupied',
    color: 'bg-red-100 text-red-800',
    iconColor: 'text-red-600',
    description: 'Guest is currently staying'
  },
  maintenance: {
    label: 'Maintenance',
    color: 'bg-orange-100 text-orange-800',
    iconColor: 'text-orange-600',
    description: 'Room requires maintenance work'
  },
  reserved: {
    label: 'Reserved',
    color: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600',
    description: 'Room is reserved for future check-in'
  }
} as const

// Get status configuration
export const getStatusConfig = (status: RoomStatus) => {
  return ROOM_STATUS_CONFIG[status] || ROOM_STATUS_CONFIG.available
}

// Get all status options for dropdowns
export const getStatusOptions = () => {
  return Object.entries(ROOM_STATUS_CONFIG).map(([value, config]) => ({
    value: value as RoomStatus,
    label: config.label,
    description: config.description
  }))
}

// Check if room status allows check-in
export const canCheckIn = (status: RoomStatus): boolean => {
  return status === 'available' || status === 'reserved'
}

// Check if room status allows check-out
export const canCheckOut = (status: RoomStatus): boolean => {
  return status === 'occupied'
}

// Check if room status allows maintenance
export const canStartMaintenance = (status: RoomStatus): boolean => {
  return status === 'available'
}

// Check if room status can be changed to available
export const canMakeAvailable = (status: RoomStatus): boolean => {
  return status === 'maintenance' || status === 'reserved'
}

// Get next possible statuses
export const getNextPossibleStatuses = (currentStatus: RoomStatus): RoomStatus[] => {
  switch (currentStatus) {
    case 'available':
      return ['occupied', 'reserved', 'maintenance']
    case 'occupied':
      return ['available', 'maintenance']
    case 'reserved':
      return ['occupied', 'available', 'maintenance']
    case 'maintenance':
      return ['available']
    default:
      return ['available']
  }
}

// Format status for display
export const formatStatus = (status: RoomStatus): string => {
  return getStatusConfig(status).label
}

// Get status priority for sorting (higher priority = more urgent)
export const getStatusPriority = (status: RoomStatus): number => {
  switch (status) {
    case 'maintenance': return 4
    case 'occupied': return 3
    case 'reserved': return 2
    case 'available': return 1
    default: return 0
  }
}