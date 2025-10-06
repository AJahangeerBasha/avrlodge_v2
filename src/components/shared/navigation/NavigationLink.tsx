import { Link, useLocation } from 'react-router-dom'
import { LucideIcon } from 'lucide-react'

interface NavigationLinkProps {
  to: string
  icon: LucideIcon
  label: string
  isActive?: boolean
  className?: string
  variant?: 'header' | 'sidebar' | 'mobile'
  onClick?: () => void
}

export function NavigationLink({
  to,
  icon: Icon,
  label,
  isActive,
  className = '',
  variant = 'header',
  onClick
}: NavigationLinkProps) {
  const location = useLocation()
  const active = isActive ?? location.pathname === to

  const baseClasses = "flex items-center transition-colors"

  const variantClasses = {
    header: `space-x-2 px-4 py-2 rounded-lg ${
      active
        ? 'bg-black text-white'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`,
    sidebar: `space-x-3 px-4 py-3 rounded-lg text-sm ${
      active
        ? 'bg-black text-white'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`,
    mobile: `space-x-3 px-4 py-3 rounded-lg ${
      active
        ? 'bg-black text-white'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`
  }

  return (
    <Link
      to={to}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  )
}