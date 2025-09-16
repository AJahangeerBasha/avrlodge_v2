import { NavigationLink } from './NavigationLink'
import { getNavigationItemsForRole } from './NavigationConfig'

interface SidebarNavigationProps {
  role: 'admin' | 'manager'
  basePath: string
  className?: string
}

export function SidebarNavigation({ role, basePath, className = '' }: SidebarNavigationProps) {
  const navigationItems = getNavigationItemsForRole(role, basePath)

  return (
    <nav className={`space-y-1 ${className}`}>
      {navigationItems.map((item) => (
        <NavigationLink
          key={item.id}
          to={item.to}
          icon={item.icon}
          label={item.label}
          variant="sidebar"
        />
      ))}
    </nav>
  )
}