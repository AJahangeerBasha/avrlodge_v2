import { NavigationLink } from './NavigationLink'
import { NavigationDropdown } from './NavigationDropdown'
import { getPrimaryNavigationItems } from './NavigationConfig'

interface HeaderNavigationProps {
  role: 'admin' | 'manager'
  basePath: string
}

export function HeaderNavigation({ role, basePath }: HeaderNavigationProps) {
  const navigationItems = getPrimaryNavigationItems(role, basePath)

  return (
    <nav className="hidden md:flex items-center space-x-1">
      {navigationItems.map((item) => (
        item.submenu ? (
          <NavigationDropdown
            key={item.id}
            icon={item.icon}
            label={item.label}
            submenu={item.submenu}
            variant="header"
          />
        ) : (
          <NavigationLink
            key={item.id}
            to={item.to}
            icon={item.icon}
            label={item.label}
            variant="header"
          />
        )
      ))}
    </nav>
  )
}