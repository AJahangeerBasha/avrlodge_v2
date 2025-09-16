// Navigation configuration for both admin and manager roles
import { LucideIcon, BarChart3, Calendar, BookOpen, Users, Home, Bed, DollarSign, Settings, UserCheck } from 'lucide-react'

export interface NavigationItem {
  id: string
  to: string
  icon: LucideIcon
  label: string
  roles: ('admin' | 'manager')[]
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    to: '/dashboard',
    icon: BarChart3,
    label: 'Dashboard',
    roles: ['admin', 'manager']
  },
  {
    id: 'calendar',
    to: '/calendar',
    icon: Calendar,
    label: 'Calendar',
    roles: ['admin', 'manager']
  },
  {
    id: 'reservation',
    to: '/reservation',
    icon: BookOpen,
    label: 'Reservations',
    roles: ['admin', 'manager']
  },
  {
    id: 'bookings',
    to: '/bookings',
    icon: Users,
    label: 'Bookings',
    roles: ['admin', 'manager']
  },
  {
    id: 'room-types',
    to: '/room-types',
    icon: Home,
    label: 'Room Types',
    roles: ['admin'] // Admin only
  },
  {
    id: 'rooms',
    to: '/rooms',
    icon: Bed,
    label: 'Rooms',
    roles: ['admin'] // Admin only
  },
  {
    id: 'special-charges',
    to: '/special-charges',
    icon: DollarSign,
    label: 'Special Charges',
    roles: ['admin'] // Admin only
  },
  {
    id: 'agents',
    to: '/agents',
    icon: UserCheck,
    label: 'Agents',
    roles: ['admin'] // Admin only
  },
  {
    id: 'settings',
    to: '/settings',
    icon: Settings,
    label: 'Settings',
    roles: ['admin'] // Admin only
  }
]

// Get navigation items for specific role
export const getNavigationItemsForRole = (role: 'admin' | 'manager', basePath: string = ''): NavigationItem[] => {
  return NAVIGATION_ITEMS
    .filter(item => item.roles.includes(role))
    .map(item => ({
      ...item,
      to: `${basePath}${item.to}`
    }))
}

// Get primary navigation items (for header)
export const getPrimaryNavigationItems = (role: 'admin' | 'manager', basePath: string = ''): NavigationItem[] => {
  const primaryIds = ['calendar', 'reservation', 'bookings']
  return getNavigationItemsForRole(role, basePath).filter(item => primaryIds.includes(item.id))
}