// Navigation configuration for both admin and manager roles
import { LucideIcon, BarChart3, Calendar, BookOpen, Users, Home, Bed, DollarSign, Settings, UserCheck, UserCog, FileText, TrendingUp, TrendingDown, PieChart } from 'lucide-react'

export interface NavigationItem {
  id: string
  to: string
  icon: LucideIcon
  label: string
  roles: ('admin' | 'manager' | 'agent')[]
  submenu?: NavigationItem[]
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    to: '/dashboard',
    icon: BarChart3,
    label: 'Dashboard',
    roles: ['admin', 'manager', 'agent']
  },
  {
    id: 'calendar',
    to: '/calendar',
    icon: Calendar,
    label: 'Calendar',
    roles: ['admin', 'manager', 'agent']
  },
  {
    id: 'reservation',
    to: '/reservation',
    icon: BookOpen,
    label: 'Reservations',
    roles: ['admin', 'manager', 'agent']
  },
  {
    id: 'bookings',
    to: '/bookings',
    icon: Users,
    label: 'Bookings',
    roles: ['admin', 'manager', 'agent']
  },
  {
    id: 'reports',
    to: '/reports',
    icon: FileText,
    label: 'Reports',
    roles: ['admin'], // Admin only
    submenu: [
      {
        id: 'revenues',
        to: '/reports/revenues',
        icon: TrendingUp,
        label: 'Revenues',
        roles: ['admin']
      },
      {
        id: 'expenses',
        to: '/reports/expenses',
        icon: TrendingDown,
        label: 'Expenses',
        roles: ['admin']
      },
      {
        id: 'financials',
        to: '/reports/financials',
        icon: PieChart,
        label: 'Financials',
        roles: ['admin']
      }
    ]
  },
  {
    id: 'settings',
    to: '/settings',
    icon: Settings,
    label: 'Settings',
    roles: ['admin'], // Admin only
    submenu: [
      {
        id: 'room-types',
        to: '/room-types',
        icon: Home,
        label: 'Room Types',
        roles: ['admin']
      },
      {
        id: 'rooms',
        to: '/rooms',
        icon: Bed,
        label: 'Rooms',
        roles: ['admin']
      },
      {
        id: 'agents',
        to: '/agents',
        icon: UserCheck,
        label: 'Agents',
        roles: ['admin']
      },
      {
        id: 'users',
        to: '/users',
        icon: UserCog,
        label: 'Users',
        roles: ['admin']
      },
      {
        id: 'special-charges',
        to: '/special-charges',
        icon: DollarSign,
        label: 'Special Charges',
        roles: ['admin']
      }
    ]
  }
]

// Get navigation items for specific role
export const getNavigationItemsForRole = (role: 'admin' | 'manager' | 'agent', basePath: string = ''): NavigationItem[] => {
  return NAVIGATION_ITEMS
    .filter(item => item.roles.includes(role))
    .map(item => ({
      ...item,
      to: `${basePath}${item.to}`,
      submenu: item.submenu?.map(subItem => ({
        ...subItem,
        to: `${basePath}${subItem.to}`
      }))
    }))
}

// Get primary navigation items (for header)
export const getPrimaryNavigationItems = (role: 'admin' | 'manager' | 'agent', basePath: string = ''): NavigationItem[] => {
  const primaryIds = role === 'admin'
    ? ['calendar', 'reservation', 'bookings', 'reports', 'settings']
    : ['calendar', 'reservation', 'bookings']
  return getNavigationItemsForRole(role, basePath).filter(item => primaryIds.includes(item.id))
}