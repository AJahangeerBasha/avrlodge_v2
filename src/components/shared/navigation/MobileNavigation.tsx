import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { NavigationLink } from './NavigationLink'
import { getNavigationItemsForRole } from './NavigationConfig'

interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
  role: 'admin' | 'manager'
  basePath: string
  userRole: string
  onLogout: () => void
  onAdminPanelClick?: () => void
}

export function MobileNavigation({
  isOpen,
  onClose,
  role,
  basePath,
  userRole,
  onLogout,
  onAdminPanelClick
}: MobileNavigationProps) {
  const navigationItems = getNavigationItemsForRole(role, basePath)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={onClose}
          />

          {/* Mobile Menu */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 md:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {role === 'admin' ? 'Admin Panel' : 'Manager Panel'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto p-4">
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <NavigationLink
                      key={item.id}
                      to={item.to}
                      icon={item.icon}
                      label={item.label}
                      variant="mobile"
                    />
                  ))}
                </nav>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-200 p-4 space-y-2">
                {userRole === 'admin' && role === 'manager' && onAdminPanelClick && (
                  <button
                    onClick={onAdminPanelClick}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors text-left"
                  >
                    <span>Switch to Admin Panel</span>
                  </button>
                )}
                <button
                  onClick={onLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors text-left"
                >
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}