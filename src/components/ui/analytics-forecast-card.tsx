import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown, Activity } from 'lucide-react'

interface AnalyticsForecastCardProps {
  title: string
  currentValue: number
  forecastValue: number
  period: string
  confidence: 'high' | 'medium' | 'low'
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

export default function AnalyticsForecastCard({
  title,
  currentValue,
  forecastValue,
  period,
  confidence,
  formatValue = (value: number) => value.toString(),
  icon: Icon,
  className = '',
  delay = 0
}: AnalyticsForecastCardProps) {
  const calculateGrowth = () => {
    if (currentValue === 0) return forecastValue > 0 ? 100 : 0
    return ((forecastValue - currentValue) / currentValue) * 100
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

  const getConfidenceColor = () => {
    switch (confidence) {
      case 'high':
        return 'text-green-600 bg-green-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getGrowthColor = () => {
    if (isStable) return 'text-gray-600'
    return isPositive ? 'text-green-600' : 'text-red-600'
  }

  return (
    <motion.div
      custom={delay}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative overflow-hidden ${className}`}
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
          <div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            <p className="text-xs text-gray-500">{period}</p>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.2 }}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor()}`}
        >
          <span className="capitalize">{confidence}</span>
        </motion.div>
      </div>

      {/* Current Value */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.1 }}
        className="mb-4"
      >
        <p className="text-2xl font-bold text-gray-900">
          {formatValue(currentValue)}
        </p>
        <p className="text-sm text-gray-500">Current</p>
      </motion.div>

      {/* Forecast Value */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.2 }}
        className="pt-4 border-t border-gray-100"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-xl font-semibold text-gray-700">
            {formatValue(forecastValue)}
          </p>
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getGrowthColor()}`}>
              {isPositive ? '+' : ''}{growth.toFixed(1)}%
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-500">Forecast</p>
      </motion.div>

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