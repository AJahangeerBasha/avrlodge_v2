import { useState } from 'react'
import { Outlet, Navigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ROLES } from '../lib/types/auth'
import { Button } from '../components/ui/button'
import { LogOut, Calendar, Users, BarChart3, BookOpen, Settings, Menu, X } from 'lucide-react'

export function ManagerLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { currentUser, userRole, logout, loading } = useAuth()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!currentUser) {
    return <Navigate to="/auth/login" replace />
  }

  // Redirect if not manager or admin (admins can access manager panel)
  if (userRole !== ROLES.MANAGER && userRole !== ROLES.ADMIN) {
    return <Navigate to="/" replace />
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const navigationItems = [
    { to: "/manager", icon: BarChart3, label: "Dashboard" },
    { to: "/manager/calendar", icon: Calendar, label: "Calendar" },
    { to: "/manager/reservation", icon: BookOpen, label: "Reservations" },
    { to: "/manager/bookings", icon: Users, label: "Bookings" }
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-lg md:text-xl font-semibold text-gray-900">AVR Lodge Manager</h1>
              {userRole === ROLES.ADMIN && (
                <p className="text-xs md:text-sm text-gray-500">Admin accessing as Manager</p>
              )}
            </div>
          </div>
          
          {/* Desktop User Info and Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {userRole === ROLES.ADMIN && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/admin'}
                className="flex items-center space-x-2"
              >
                <span>Admin Panel</span>
              </Button>
            )}
            <span className="text-sm text-gray-600">
              Welcome, {currentUser.displayName || currentUser.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
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

      {/* Desktop Navigation */}
      <div className="hidden md:block bg-black text-white">
        <div className="px-4 py-3">
          <nav className="flex flex-wrap gap-2">
            {navigationItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
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
              {userRole === ROLES.ADMIN && (
                <div className="text-xs text-gray-400">Admin accessing as Manager</div>
              )}
            </div>
            
            {/* Admin Panel Link for Mobile */}
            {userRole === ROLES.ADMIN && (
              <div className="pb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    window.location.href = '/admin'
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-start space-x-3 px-3 py-3 text-white hover:text-white hover:bg-gray-800"
                >
                  <Settings className="h-5 w-5" />
                  <span className="text-base">Go to Admin Panel</span>
                </Button>
              </div>
            )}
            
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