import { motion } from 'framer-motion'
import { X, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateFilterType, useDashboardStore } from '@/stores/dashboardStore'

interface DashboardFiltersProps {
  // No props needed since we're always showing filters
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = () => {
  const {
    filters,
    setDateFilter,
    resetFilters,
    getAvailableDateFilters,
    getUpcomingMonths
  } = useDashboardStore()

  const dateFilters = getAvailableDateFilters()
  const upcomingMonths = getUpcomingMonths()

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value as DateFilterType)
  }

  const handleResetFilters = () => {
    resetFilters()
  }

  const isMonthFilter = upcomingMonths.some(month => month.key === filters.dateFilter)
  const currentDateFilterLabel = dateFilters.find(f => f.type === filters.dateFilter)?.label ||
    upcomingMonths.find(m => m.key === filters.dateFilter)?.label ||
    'All Time'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filter by Date Range
            </CardTitle>
            {filters.dateFilter !== 'today' && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleResetFilters}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="h-4 w-4 mr-1" />
                  Reset to Today
                </Button>
              </motion.div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Date Filters */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Quick Filters</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {dateFilters.map((filter) => (
                <motion.div
                  key={filter.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => handleDateFilterChange(filter.type)}
                    variant={filters.dateFilter === filter.type ? "default" : "outline"}
                    size="sm"
                    className={`w-full text-xs ${
                      filters.dateFilter === filter.type
                        ? 'bg-black text-white hover:bg-gray-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {filter.label}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Month Selector */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Select Specific Month</h3>
            <div className="max-w-xs">
              <Select
                value={isMonthFilter ? filters.dateFilter : ''}
                onValueChange={handleDateFilterChange}
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50">
                  <SelectValue placeholder="Select month..." className="text-gray-900" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                  {upcomingMonths.map((month) => (
                    <SelectItem
                      key={month.key}
                      value={month.key}
                      className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer"
                    >
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <p className="text-sm text-blue-800">
              <strong>Active Filter:</strong> {currentDateFilterLabel}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Showing metrics for reservations within this date range
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}