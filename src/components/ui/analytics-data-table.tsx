import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface Column {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  width?: string
}

interface AnalyticsDataTableProps {
  title: string
  subtitle?: string
  columns: Column[]
  data: any[]
  className?: string
  delay?: number
  emptyMessage?: string
}

const tableVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.05
    }
  }
}

const rowVariants = {
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

export default function AnalyticsDataTable({
  title,
  subtitle,
  columns,
  data,
  className = '',
  delay = 0,
  emptyMessage = 'No data available'
}: AnalyticsDataTableProps) {
  const getAlignment = (align?: string) => {
    switch (align) {
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      default:
        return 'text-left'
    }
  }

  return (
    <motion.div
      variants={tableVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}
    >
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {!data || data.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.3 }}
            className="px-6 py-12 text-center"
          >
            <p className="text-gray-500">{emptyMessage}</p>
          </motion.div>
        ) : (
          <table className="w-full">
            {/* Table Head */}
            <thead className="bg-gray-50">
              <motion.tr
                variants={rowVariants}
                className="border-b border-gray-200"
              >
                {columns.map((column, index) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-sm font-medium text-gray-700 ${getAlignment(column.align)}`}
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </th>
                ))}
              </motion.tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-200">
              {data.map((row, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  variants={rowVariants}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  className="transition-colors duration-200"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 text-sm text-gray-900 ${getAlignment(column.align)}`}
                    >
                      {row[column.key]}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  )
} 