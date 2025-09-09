import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Calendar, BarChart3, Settings, Users, CreditCard, UserPlus } from 'lucide-react'

interface RoleNavigationProps {
  role: 'admin' | 'manager'
}

export default function RoleNavigation({ role }: RoleNavigationProps) {
  const location = useLocation()
  const pathname = location.pathname
  const [isOpen, setIsOpen] = useState(false)

  const adminNavItems = [
    {
      name: 'Calendar',
      href: '/admin/calendar',
      icon: Calendar,
      description: 'View all reservations'
    },
    {
      name: 'Room Calendar',
      href: '/calendar',
      icon: Calendar,
      description: 'Room capacity & occupancy view'
    },
    {
      name: 'Reservation',
      href: '/admin/reservation',
      icon: UserPlus,
      description: 'Create new reservations'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      description: 'Financial reports & metrics'
    },
    // {
    //   name: 'Users',
    //   href: '/admin/users',
    //   icon: Users,
    //   description: 'Manage user accounts'
    // },
    // {
    //   name: 'Settings',
    //   href: '/admin/settings',
    //   icon: Settings,
    //   description: 'System configuration'
    // }
  ]

  const managerNavItems = [
    {
      name: 'Calendar',
      href: '/manager/calendar',
      icon: Calendar,
      description: 'Current reservations'
    },
    {
      name: 'Room Calendar',
      href: '/calendar',
      icon: Calendar,
      description: 'Room capacity & occupancy view'
    },
    {
      name: 'Payments',
      href: '/manager/payments',
      icon: CreditCard,
      description: 'Process payments'
    },
    {
      name: 'Guests',
      href: '/manager/guests',
      icon: Users,
      description: 'Guest management'
    }
  ]

  const navItems = role === 'admin' ? adminNavItems : managerNavItems

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Role indicator */}
          <div className="flex items-center">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              role === 'admin' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {role === 'admin' ? 'Admin' : 'Manager'}
            </span>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center">
                      <item.icon className="w-5 h-5 mr-3" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 