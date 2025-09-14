import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BookingEmptyStateProps {
  onClearSearch: () => void
}

export default function BookingEmptyState({ onClearSearch }: BookingEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
        <p className="text-gray-600 mb-4">
          No bookings match your search criteria. Try searching with different keywords.
        </p>
        <Button
          onClick={onClearSearch}
          variant="outline"
          className="mx-auto"
        >
          Clear Search
        </Button>
      </div>
    </motion.div>
  )
}
