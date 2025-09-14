import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown, Activity } from 'lucide-react'

interface AnalyticsComparisonCardProps {
  title: string
  currentValue: number
  previousValue: number
  formatValue?: (value: number) => string
  icon?: LucideIcon
  className?: string
  delay?: number
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.5,
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

export default function AnalyticsComparisonCard({
  title,
  currentValue,
  previousValue,
  formatValue = (value: number) => value.toString(),
  icon: Icon,
  className = '',
  delay = 0
}: AnalyticsComparisonCardProps) {
  const calculateGrowth = () => {
    if (previousValue === 0) return currentValue > 0 ? 100 : 0
    return ((currentValue - previousValue) / previousValue) * 100
  }

  const growth = calculateGrowth()
  const isPositive = growth >= 0
  const isStable = growth === 0

  const getTrendIcon = () => {
    if (isStable) return <Activity className="w-4 h-4 text-gray-600" />
    return isPositive ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />
  }

  const getGrowthColor = () => {
    if (isStable) return 'text-gray-600 bg-gray-100'
    return isPositive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
  }

  return (
    <motion.div
      custom={delay}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="p-2 bg-gray-100 rounded-lg text-gray-600"
            >
              <Icon className="w-5 h-5" />
            </motion.div>
          )}
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.2 }}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getGrowthColor()}`}
        >
          {getTrendIcon()}
          <span>{isPositive ? '+' : ''}{growth.toFixed(1)}%</span>
        </motion.div>
      </div>

      {/* Values */}
      <div className="space-y-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.1 }}
        >
          <p className="text-2xl font-bold text-gray-900">
            {formatValue(currentValue)}
          </p>
          <p className="text-sm text-gray-500">Current Period</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.2 }}
          className="pt-2 border-t border-gray-100"
        >
          <p className="text-lg font-semibold text-gray-700">
            {formatValue(previousValue)}
          </p>
          <p className="text-sm text-gray-500">Previous Period</p>
        </motion.div>
      </div>

      {/* Background decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.02 }}
        transition={{ delay: delay + 0.5 }}
        className="absolute top-0 right-0 w-24 h-24 bg-gray-900 rounded-full -translate-y-12 translate-x-12"
      />
    </motion.div>
  )
} 