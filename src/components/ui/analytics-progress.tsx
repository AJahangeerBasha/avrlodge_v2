import { motion } from 'framer-motion'

interface AnalyticsProgressProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  variant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

const progressVariants = {
  hidden: { width: 0 },
  visible: (width: number) => ({
    width: `${width}%`,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  })
}

export default function AnalyticsProgress({
  value,
  max = 100,
  label,
  showPercentage = true,
  variant = 'default',
  className = ''
}: AnalyticsProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'danger':
        return 'bg-red-500'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-2 ${className}`}
    >
      {/* Label and percentage */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
          )}
        </div>
      )}

      {/* Progress bar container */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          custom={percentage}
          variants={progressVariants}
          initial="hidden"
          animate="visible"
          className={`h-full rounded-full ${getVariantStyles()}`}
        />
      </div>
    </motion.div>
  )
} 