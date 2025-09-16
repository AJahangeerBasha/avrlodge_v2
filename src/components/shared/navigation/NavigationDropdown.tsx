import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, LucideIcon } from 'lucide-react'
import { NavigationLink } from './NavigationLink'
import { NavigationItem } from './NavigationConfig'

interface NavigationDropdownProps {
  icon: LucideIcon
  label: string
  submenu: NavigationItem[]
  variant?: 'header' | 'mobile'
}

export function NavigationDropdown({
  icon: Icon,
  label,
  submenu,
  variant = 'header'
}: NavigationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const baseClasses = "flex items-center transition-colors"

  const variantClasses = {
    header: `space-x-2 px-4 py-2 rounded-lg ${
      isOpen
        ? 'bg-black text-white'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`,
    mobile: `space-x-3 px-4 py-3 rounded-lg ${
      isOpen
        ? 'bg-black text-white'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${baseClasses} ${variantClasses[variant]}`}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 min-w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          >
            {submenu.map((item) => (
              <div
                key={item.id}
                className="px-2"
                onClick={() => setIsOpen(false)} // Close dropdown when item is clicked
              >
                <NavigationLink
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  variant="header"
                  className="text-sm w-full justify-start hover:bg-gray-50 rounded-md"
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}