import { motion } from 'framer-motion'
import { Info, CheckCircle, XCircle, Minus } from 'lucide-react'

interface CalendarLegendProps {
  className?: string
}

export default function CalendarLegend({ className = '' }: CalendarLegendProps) {
  const legendItems = [
    {
      icon: CheckCircle,
      color: 'bg-green-100 border-green-300 text-green-700',
      label: 'Available Room Capacity',
      description: 'Room is available for booking'
    },
    {
      icon: XCircle,
      color: 'bg-red-100 border-red-300 text-red-700',
      label: 'Occupied Room Capacity',
      description: 'Room is currently occupied'
    },
    {
      icon: Minus,
      color: 'bg-gray-200 border-gray-300 text-gray-500',
      label: 'No Data Available',
      description: 'Room data not available'
    }
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gray-900 rounded-lg">
          <Info className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Calendar Legend</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {legendItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 ${item.color}`}>
              <item.icon className="w-4 h-4" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{item.label}</div>
              <div className="text-sm text-gray-600">{item.description}</div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gray-900 rounded-lg mt-1">
            <Info className="w-4 h-4 text-white" />
          </div>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Note:</strong> Numbers in cells represent room capacity ({'{RC}'}) for that room on that date.</p>
            <p>Hover over cells to see detailed room information including type and tariff.</p>
            <p>Click on cells to view more details (if available).</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
} 