import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnalyticsChartProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  delay?: number
}

const chartVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

const headerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
}

export default function AnalyticsChart({
  title,
  subtitle,
  children,
  className = '',
  delay = 0
}: AnalyticsChartProps) {
  return (
    <motion.div
      variants={chartVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}
    >
      {/* Chart Header */}
      <motion.div
        variants={headerVariants}
        className="mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </motion.div>

      {/* Chart Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.5 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
} 