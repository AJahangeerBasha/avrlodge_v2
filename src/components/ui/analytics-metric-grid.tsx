import React from 'react'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnalyticsMetricGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
}

export default function AnalyticsMetricGrid({
  children,
  columns = 3,
  gap = 'md',
  className = ''
}: AnalyticsMetricGridProps) {
  const getGridCols = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1'
      case 2:
        return 'grid-cols-1 md:grid-cols-2'
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }
  }

  const getGap = () => {
    switch (gap) {
      case 'sm':
        return 'gap-4'
      case 'md':
        return 'gap-6'
      case 'lg':
        return 'gap-8'
      default:
        return 'gap-6'
    }
  }

  return (
    <motion.div
      variants={gridVariants}
      initial="hidden"
      animate="visible"
      className={`grid ${getGridCols()} ${getGap()} ${className}`}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
} 