import { SidebarNavigation } from '../navigation/SidebarNavigation'

interface DashboardSidebarProps {
  role: 'admin' | 'manager'
  basePath: string
  isOpen?: boolean
  className?: string
}

export function DashboardSidebar({
  role,
  basePath,
  isOpen = true,
  className = ''
}: DashboardSidebarProps) {
  if (!isOpen) return null

  return (
    <aside className={`w-64 bg-white shadow-sm border-r border-gray-200 ${className}`}>
      <div className="h-full flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {role === 'admin' ? 'Admin Panel' : 'Manager Panel'}
          </h2>
          <p className="text-sm text-gray-500">Navigation</p>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <SidebarNavigation role={role} basePath={basePath} />
        </div>
      </div>
    </aside>
  )
}