import { motion } from 'framer-motion'

interface CalendarFiltersProps {
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  selectedRoomType: string
  setSelectedRoomType: (type: string) => void
  selectedStatus: string
  setSelectedStatus: (status: string) => void
  roomTypes: { value: string, label: string }[]
  statusTypes: { value: string, label: string }[]
  filteredRoomsCount: number
  totalRoomsCount: number
  filteredReservationsCount: number
  totalReservationsCount: number
}

export default function CalendarFilters({
  showFilters,
  setShowFilters: _setShowFilters,
  selectedRoomType,
  setSelectedRoomType,
  selectedStatus,
  setSelectedStatus,
  roomTypes,
  statusTypes,
  filteredRoomsCount,
  totalRoomsCount,
  filteredReservationsCount,
  totalReservationsCount,
}: CalendarFiltersProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: showFilters ? 'auto' : 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border-b border-gray-200 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-6">
          <div className="flex-1 min-w-0">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Room Type Filter
            </label>
            <select
              value={selectedRoomType}
              onChange={(e) => setSelectedRoomType(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="all">All Room Types</option>
              {roomTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Reservation Status Filter
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              {statusTypes.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          <div className="text-xs sm:text-sm text-gray-600 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l sm:pl-4 md:pl-6">
            <div className="flex sm:flex-col gap-2 sm:gap-0 justify-between sm:justify-start">
              <span>Showing {filteredRoomsCount} of {totalRoomsCount} rooms</span>
              <span>{filteredReservationsCount} of {totalReservationsCount} reservations</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
