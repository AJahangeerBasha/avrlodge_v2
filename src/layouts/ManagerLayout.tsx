import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ROLES } from '../lib/types/auth'
import { Button } from '../components/ui/button'
import { LogOut, Calendar, Users, BarChart3 } from 'lucide-react'

export function ManagerLayout() {
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">AVR Lodge Manager Panel</h1>
            {userRole === ROLES.ADMIN && (
              <p className="text-sm text-gray-500">Admin accessing as Manager</p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {userRole === ROLES.ADMIN && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/admin'}
                className="flex items-center space-x-2"
              >
                <span>Go to Admin Panel</span>
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
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-green-600 text-white">
        <div className="px-4 py-3">
          <nav className="flex space-x-6">
            <a
              href="/manager"
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </a>
            <a
              href="/manager/bookings"
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span>Bookings</span>
            </a>
            <a
              href="/manager/guests"
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Guest Management</span>
            </a>
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