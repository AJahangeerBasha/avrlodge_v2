import { Outlet, Navigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ROLES } from '../lib/types/auth'
import { Button } from '../components/ui/button'
import { LogOut, Users, Settings, BarChart3, Calendar, BookOpen, Home, Bed } from 'lucide-react'

export function AdminLayout() {
  const { currentUser, userRole, logout, loading } = useAuth()

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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">AVR Lodge Admin Panel</h1>
          <div className="flex items-center space-x-4">
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
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-blue-600 text-white">
        <div className="px-4 py-3">
          <nav className="flex flex-wrap gap-2">
            <Link
              to="/admin"
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/admin/calendar"
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </Link>
            <Link
              to="/admin/reservation"
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>Reservations</span>
            </Link>
            <Link
              to="/admin/bookings"
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Bookings</span>
            </Link>
            <Link
              to="/admin/room-types"
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Room Types</span>
            </Link>
            <Link
              to="/admin/rooms"
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Bed className="h-4 w-4" />
              <span>Rooms</span>
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Outlet />
      </div>
    </div>
  )
}