import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface AnalyticsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
  variant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
  children?: ReactNode
}

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  hover: {
    y: -4,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

export default function AnalyticsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className = '',
  children
}: AnalyticsCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50 hover:bg-green-100'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
      case 'danger':
        return 'border-red-200 bg-red-50 hover:bg-red-100'
      default:
        return 'border-gray-200 bg-white hover:bg-gray-50'
    }
  }

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'danger':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`relative overflow-hidden rounded-xl border shadow-sm transition-all duration-200 ${getVariantStyles()} ${className}`}
    >
      <motion.div
        variants={cardVariants}
        className="p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <motion.div
                whileHover={{ rotate: 5 }}
                className={`p-2 rounded-lg bg-gray-100 ${getIconColor()}`}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                trend.isPositive 
                  ? 'text-green-600 bg-green-100' 
                  : 'text-red-600 bg-red-100'
              }`}
            >
              <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
              <span className="text-gray-500">{trend.label}</span>
            </motion.div>
          )}
        </div>

        {/* Value */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </motion.div>

        {/* Children content */}
        {children && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {children}
          </motion.div>
        )}

        {/* Background decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.03 }}
          transition={{ delay: 0.5 }}
          className="absolute top-0 right-0 w-32 h-32 bg-gray-900 rounded-full -translate-y-16 translate-x-16"
        />
      </motion.div>
    </motion.div>
  )
} 