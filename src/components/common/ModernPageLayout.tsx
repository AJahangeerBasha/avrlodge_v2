import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface ModernPageLayoutProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  children: ReactNode
  headerContent?: ReactNode
  actions?: ReactNode
  className?: string
  containerClassName?: string
}

export default function ModernPageLayout({
  title,
  subtitle,
  icon: Icon,
  children,
  headerContent,
  actions,
  className = '',
  containerClassName = 'max-w-7xl'
}: ModernPageLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border-b border-gray-200 shadow-sm"
      >
        <div className={`${containerClassName} mx-auto px-4 sm:px-6 lg:px-8 py-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="p-2 bg-gray-900 rounded-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                )}
              </div>
            </div>
            
            {actions && (
              <div className="flex items-center gap-3">
                {actions}
              </div>
            )}
          </div>
          
          {headerContent && (
            <div className="mt-4">
              {headerContent}
            </div>
          )}
        </div>
      </motion.div>

      {/* Page Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className={`${containerClassName} mx-auto px-4 sm:px-6 lg:px-8 py-6`}
      >
        <div className="space-y-6">
          {children}
        </div>
      </motion.main>
    </div>
  )
}