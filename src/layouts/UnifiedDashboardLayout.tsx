import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ROLES } from '@/lib/types/auth'
import { DashboardHeader } from '@/components/shared/layout/DashboardHeader'

interface UnifiedDashboardLayoutProps {
  role: 'admin' | 'manager'
}

export function UnifiedDashboardLayout({ role }: UnifiedDashboardLayoutProps) {
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

  // Role-based access control
  if (role === 'admin') {
    // Only admins can access admin panel
    if (userRole !== ROLES.ADMIN) {
      if (userRole === ROLES.MANAGER) {
        return <Navigate to="/manager" replace />
      } else {
        return <Navigate to="/" replace />
      }
    }
  } else if (role === 'manager') {
    // Both managers and admins can access manager panel
    if (userRole !== ROLES.MANAGER && userRole !== ROLES.ADMIN) {
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

  const handleAdminPanelClick = () => {
    window.location.href = '/admin'
  }

  const basePath = role === 'admin' ? '/admin' : '/manager'

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader
        role={role}
        basePath={basePath}
        userRole={userRole}
        userName={currentUser.displayName}
        userEmail={currentUser.email}
        onLogout={handleLogout}
        onAdminPanelClick={role === 'manager' && userRole === ROLES.ADMIN ? handleAdminPanelClick : undefined}
      />

      {/* Main Content */}
      <main className="min-h-[calc(100vh-73px)]">
        <Outlet />
      </main>
    </div>
  )
}