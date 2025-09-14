import { useState } from 'react'
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ROLES } from '../lib/types/auth'
import { Button } from '../components/ui/button'
import { LogOut, Users, Settings, BarChart3, Calendar, BookOpen, Home, Bed, DollarSign, Menu, X } from 'lucide-react'

export function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { currentUser, userRole, logout, loading } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!currentUser) {
    return <Navigate to="/auth/login" replace />
  }

  // Redirect if not admin
  if (userRole !== ROLES.ADMIN) {
    if (userRole === ROLES.MANAGER) {
      return <Navigate to="/manager" replace />
    } else {
      return <Navigate to="/" replace />
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const navigationItems = [
    { to: "/admin", icon: BarChart3, label: "Dashboard" },
    { to: "/admin/calendar", icon: Calendar, label: "Calendar" },
    { to: "/admin/reservation", icon: BookOpen, label: "Reservations" },
    { to: "/admin/bookings", icon: Users, label: "Bookings" },
    { to: "/admin/room-types", icon: Home, label: "Room Types" },
    { to: "/admin/rooms", icon: Bed, label: "Rooms" },
    { to: "/admin/special-charges", icon: DollarSign, label: "Special Charges" },
    { to: "/admin/settings", icon: Settings, label: "Settings" }
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4 flex items-center justify-between">
          {/* Left Side - Logo and Navigation */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">Admin</span>
                <span className="text-xs text-gray-500">AVR Lodge</span>
              </div>
            </div>
            
            {/* Desktop Navigation Buttons */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/admin/calendar"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === '/admin/calendar'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Calendar</span>
              </Link>
              <Link
                to="/admin/reservation"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === '/admin/reservation'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Reservation</span>
              </Link>
              <Link
                to="/admin/bookings"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === '/admin/bookings'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Bookings</span>
              </Link>
              <Link
                to="/admin"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === '/admin'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </Link>
            </nav>
          </div>
          
          {/* Right Side - User Info and Sign Out */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {currentUser.displayName || currentUser.email?.split('@')[0] || 'Admin User'}
              </div>
              <div className="text-xs text-gray-500">Admin</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-black p-2 rounded-md transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black text-white">
          <div className="px-4 py-4 space-y-2">
            {/* User Info */}
            <div className="pb-4 border-b border-gray-700">
              <div className="text-sm text-gray-300 mb-2">
                {currentUser.displayName || currentUser.email}
              </div>
            </div>
            
            {/* Navigation Links */}
            {navigationItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-3 rounded-md hover:bg-gray-800 transition-colors w-full"
              >
                <Icon className="h-5 w-5" />
                <span className="text-base">{label}</span>
              </Link>
            ))}
            
            {/* Mobile Logout */}
            <div className="pt-4 border-t border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center justify-start space-x-3 px-3 py-3 text-white hover:text-white hover:bg-gray-800"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-base">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Outlet />
      </div>
    </div>
  )
}