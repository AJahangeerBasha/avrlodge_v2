import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface AnalyticsStatItemProps {
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
  delay?: number
}

const statVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.4,
      ease: "easeOut"
    }
  }),
  hover: {
    y: -4,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
}

export default function AnalyticsStatItem({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className = '',
  delay = 0
}: AnalyticsStatItemProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'danger':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-white'
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
      custom={delay}
      variants={statVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`p-4 rounded-lg border ${getVariantStyles()} ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <motion.div
              whileHover={{ rotate: 5, scale: 1.1 }}
              className={`p-1.5 rounded-md bg-gray-100 ${getIconColor()}`}
            >
              <Icon className="w-4 h-4" />
            </motion.div>
          )}
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
        {trend && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.1 }}
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

      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.1 }}
      >
        <p className="text-xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </motion.div>
    </motion.div>
  )
} 