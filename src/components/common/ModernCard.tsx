import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface ModernCardProps {
  title?: string
  subtitle?: string
  icon?: LucideIcon
  children: ReactNode
  headerContent?: ReactNode
  actions?: ReactNode
  className?: string
  contentClassName?: string
  variant?: 'default' | 'outlined' | 'elevated'
}

export default function ModernCard({
  title,
  subtitle,
  icon: Icon,
  children,
  headerContent,
  actions,
  className = '',
  contentClassName = '',
  variant = 'default'
}: ModernCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'outlined':
        return 'border-2 border-gray-200 bg-white'
      case 'elevated':
        return 'bg-white shadow-lg border border-gray-200'
      default:
        return 'bg-white shadow-sm border border-gray-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg ${getVariantClasses()} ${className}`}
    >
      {(title || subtitle || Icon || headerContent || actions) && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {Icon && (
                <div className="p-1.5 bg-gray-100 rounded-md">
                  <Icon className="w-4 h-4 text-gray-700" />
                </div>
              )}
              <div className="flex-1">
                {title && (
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-600">{subtitle}</p>
                )}
                {headerContent && (
                  <div className="mt-2">{headerContent}</div>
                )}
              </div>
            </div>
            
            {actions && (
              <div className="flex items-center gap-2 ml-4">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={`p-4 ${contentClassName}`}>
        {children}
      </div>
    </motion.div>
  )
}