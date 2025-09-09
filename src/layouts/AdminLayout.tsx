import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ROLES } from '../lib/types/auth'
import { Button } from '../components/ui/button'
import { LogOut, Users, Settings, BarChart3 } from 'lucide-react'

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
          <nav className="flex space-x-6">
            <a
              href="/admin"
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </a>
            <a
              href="/admin/users"
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>User Management</span>
            </a>
            <a
              href="/admin/settings"
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
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