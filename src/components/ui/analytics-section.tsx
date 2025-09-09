import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface AnalyticsSectionProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  children: ReactNode
  className?: string
  delay?: number
}

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1
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

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      delay: 0.2
    }
  }
}

export default function AnalyticsSection({
  title,
  subtitle,
  icon: Icon,
  children,
  className = '',
  delay = 0
}: AnalyticsSectionProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-8 ${className}`}
    >
      {/* Enhanced Section Header */}
      <motion.div
        variants={headerVariants}
        className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100"
      >
        {Icon && (
          <motion.div
            whileHover={{ rotate: 5, scale: 1.05 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 shadow-sm"
          >
            <Icon className="w-7 h-7" />
          </motion.div>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-base text-gray-600 mt-2 font-medium">{subtitle}</p>
          )}
        </div>
        <div className="h-12 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
      </motion.div>

      {/* Section Content */}
      <motion.div
        variants={contentVariants}
        className="space-y-6"
      >
        {children}
      </motion.div>
    </motion.div>
  )
} 