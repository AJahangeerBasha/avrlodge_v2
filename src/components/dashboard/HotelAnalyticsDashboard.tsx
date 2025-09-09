import { useState } from 'react'
import { motion } from 'framer-motion'
import { DateRange } from 'react-day-picker'
import { 
  BarChart3, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Users,
  Building,
  RefreshCcw
} from 'lucide-react'

// Import our dashboard components
import { DashboardFilters, FilterType } from './DashboardFilters'
import { RoomStatsCards } from './RoomStatsCards'
import { RevenueSummary } from './RevenueSummary'
import { PaymentSources } from './PaymentSources'
import { RefundsAdjustments } from './RefundsAdjustments'
import { FinanceDetails } from './FinanceDetails'
import { DashboardCharts } from './DashboardCharts'

// Sample data generation functions
import { generateSampleData, type DashboardData } from './sampleData'

interface HotelAnalyticsDashboardProps {
  // Optional: Allow passing real data from parent
  initialData?: DashboardData
  // Optional: Handle filter changes from parent
  onFilterChange?: (filter: FilterType, dateRange?: DateRange) => Promise<void>
}

export function HotelAnalyticsDashboard({ initialData, onFilterChange }: HotelAnalyticsDashboardProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('today')
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  // Use provided data or generate sample data
  const dashboardData = initialData || generateSampleData(selectedFilter, customDateRange)

  const handleFilterChange = async (filter: FilterType, dateRange?: DateRange) => {
    setIsLoading(true)
    setSelectedFilter(filter)
    DashboardFilters
    if (filter === 'custom') {
      setCustomDateRange(dateRange)
    }
    
    // If parent provides a filter change handler, use it
    if (onFilterChange) {
      await onFilterChange(filter, dateRange)
    } else {
      // Simulate data loading for demo mode
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setIsLoading(false)
  }

  const handleRentUpdate = (newAmount: number) => {
    // In a real app, this would update the backend
    console.log('Updating rent amount to:', newAmount)
  }

  const getFilterTypeForComponents = (): 'present' | 'future' | 'past' | 'custom' => {
    switch (selectedFilter) {
      case 'today':
        return 'present'
      case 'current_week':
      case 'next_week':
      case 'current_month':
      case 'next_month':
        return 'future'
      case 'yesterday':
      case 'last_week':
      case 'last_month':
        return 'past'
      case 'custom':
        return 'custom'
      default:
        return 'present'
    }
  }

  const quickStats = [
    {
      title: 'Total Revenue',
      value: `₹${(dashboardData.revenue.rooms.total + dashboardData.revenue.additionalServices + dashboardData.revenue.rent).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+12.5%'
    },
    {
      title: 'Occupancy Rate',
      value: `${dashboardData.roomStats.occupancy.present.confirmed.toFixed(1)}%`,
      icon: Building,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+8.3%'
    },
    {
      title: 'Active Guests',
      value: dashboardData.roomStats.totalGuestsInHouse.toString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+15.2%'
    },
    {
      title: 'Bookings',
      value: dashboardData.roomStats.bookedRooms.reservation.toString(),
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+6.7%'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                Analytics Dashboard
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Comprehensive insights
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {quickStats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${stat.bgColor} rounded-lg mb-2`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{stat.title}</div>
                  <div className="text-xs text-green-600 dark:text-green-400">{stat.change}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <DashboardFilters
          selectedFilter={selectedFilter}
          onFilterChange={handleFilterChange}
          customDateRange={customDateRange}
        />

        {/* Dashboard Sections */}
        <div className="space-y-8">
          {/* Rooms & Occupancy */}
          <section>
            <RoomStatsCards
              data={dashboardData.roomStats}
              filterType={getFilterTypeForComponents()}
              isLoading={isLoading}
            />
          </section>

          {/* Revenue Summary */}
          <section>
            <RevenueSummary
              data={dashboardData.revenue}
              onRentUpdate={handleRentUpdate}
              isLoading={isLoading}
            />
          </section>

          {/* Payment Sources */}
          <section>
            <PaymentSources
              data={dashboardData.paymentSources}
              isLoading={isLoading}
            />
          </section>

          {/* Refunds & Adjustments */}
          <section>
            <RefundsAdjustments
              data={dashboardData.refundsAdjustments}
              totalRevenue={dashboardData.revenue.rooms.total + dashboardData.revenue.additionalServices + dashboardData.revenue.rent}
              isLoading={isLoading}
            />
          </section>

          {/* Finance Details */}
          <section>
            <FinanceDetails
              data={dashboardData.financeDetails}
              isLoading={isLoading}
            />
          </section>

          {/* Charts & Visuals */}
          <section>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
            >
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Analytics & Trends
            </motion.h2>
            <DashboardCharts
              occupancyTrend={dashboardData.charts.occupancyTrend}
              revenueTrend={dashboardData.charts.revenueTrend}
              paymentMethods={dashboardData.charts.paymentMethods}
              occupancyBreakdown={dashboardData.charts.occupancyBreakdown}
              refundsData={dashboardData.charts.refundsData}
              isLoading={isLoading}
            />
          </section>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-20 dark:bg-opacity-40 z-50 flex items-center justify-center"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center gap-3 shadow-xl">
              <RefreshCcw className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-gray-900 dark:text-white font-medium">
                Updating dashboard...
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}