import { useState } from 'react'
import { Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeaderNavigation } from '../navigation/HeaderNavigation'
import { MobileNavigation } from '../navigation/MobileNavigation'

interface DashboardHeaderProps {
  role: 'admin' | 'manager'
  basePath: string
  userRole: string
  userName?: string
  userEmail?: string
  onLogout: () => void
  onAdminPanelClick?: () => void
}

export function DashboardHeader({
  role,
  basePath,
  userRole,
  userName,
  userEmail,
  onLogout,
  onAdminPanelClick
}: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
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
                <span className="text-sm font-semibold text-gray-900">
                  {role === 'admin' ? 'Admin' : 'Manager'}
                </span>
                <span className="text-xs text-gray-500">AVR Lodge</span>
                {userRole === 'admin' && role === 'manager' && (
                  <span className="text-xs text-blue-600">Admin as Manager</span>
                )}
              </div>
            </div>

            {/* Desktop Navigation */}
            <HeaderNavigation role={role} basePath={basePath} />
          </div>

          {/* Right Side - User Info and Actions */}
          <div className="flex items-center space-x-4">
            {/* Desktop User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {userRole === 'admin' && role === 'manager' && onAdminPanelClick && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAdminPanelClick}
                  className="flex items-center space-x-2"
                >
                  <span>Admin Panel</span>
                </Button>
              )}

              <div className="text-sm text-gray-600">
                Welcome, {userName || userEmail}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
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
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        role={role}
        basePath={basePath}
        userRole={userRole}
        onLogout={onLogout}
        onAdminPanelClick={onAdminPanelClick}
      />
    </>
  )
}