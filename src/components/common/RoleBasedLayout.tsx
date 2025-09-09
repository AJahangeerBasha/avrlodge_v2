import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/providers/auth-provider'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { 
  Shield, 
  Calendar, 
  UserPlus, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Home,
  CreditCard,
  FileText,
  UserCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/auth/protected-route'

interface RoleBasedLayoutProps {
  children: React.ReactNode
  role: 'admin' | 'manager'
}

const getNavItems = (role: 'admin' | 'manager') => {
  const baseItems = [
    {
      name: 'Calendar',
      href: `/${role}/calendar`,
      icon: Calendar,
      description: 'Room capacity & occupancy view'
    },
    {
      name: 'Reservation',
      href: `/${role}/reservation`,
      icon: UserPlus,
      description: 'Create new reservations'
    },
    {
      name: 'Bookings',
      href: `/${role}/bookings`,
      icon: FileText,
      description: 'Manage all bookings'
    }
  ]

  // Only include Analytics for admin role
  if (role === 'admin') {
    baseItems.push({
      name: 'Analytics',
      href: `/${role}/analytics`,
      icon: BarChart3,
      description: 'Financial reports & metrics'
    })
  }

  return baseItems
}

const getRoleDisplayInfo = (role: 'admin' | 'manager') => ({
  admin: {
    title: 'Admin',
    subtitle: 'AVR Lodge',
    icon: Shield,
    requiredRole: 'admin' as const
  },
  manager: {
    title: 'Manager',
    subtitle: 'AVR Lodge',
    icon: UserCheck,
    requiredRole: 'manager' as const
  }
})[role]

export default function RoleBasedLayout({ children, role }: RoleBasedLayoutProps) {
  const { user, profile, signOut } = useAuth()
  const { toast } = useToast()
  const location = useLocation()
  const pathname = location.pathname
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = getNavItems(role)
  const roleInfo = getRoleDisplayInfo(role)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      })
    } catch (error) {
      toast({
        title: "Sign Out Error",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <ProtectedRoute requiredRole={roleInfo.requiredRole}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo and Brand */}
              <Link to={`/${role}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="p-2 bg-gray-900 rounded-lg">
                  <roleInfo.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{roleInfo.title}</h1>
                  <p className="text-sm text-gray-600">{roleInfo.subtitle}</p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>

              {/* User Menu and Mobile Menu Button */}
              <div className="flex items-center gap-4">
                {/* User Info */}
                <div className="hidden md:flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {profile?.full_name || user?.email}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {profile?.role || roleInfo.title}
                    </p>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-200"
            >
              <div className="px-4 py-6 space-y-4">
                {/* Mobile Navigation Items */}
                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>

                {/* Mobile User Info and Sign Out */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {profile?.full_name || user?.email}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {profile?.role || roleInfo.title}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}