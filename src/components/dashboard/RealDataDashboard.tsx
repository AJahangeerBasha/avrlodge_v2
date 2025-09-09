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
  RefreshCcw,
  AlertCircle,
  Database
} from 'lucide-react'

import { RealDataProvider } from './RealDataProvider'
import { DashboardFilters, FilterType } from './DashboardFilters'
import { RoomStatsCards } from './RoomStatsCards'
import { RevenueSummary } from './RevenueSummary'
import { PaymentSources } from './PaymentSources'
import { RefundsAdjustments } from './RefundsAdjustments'
import { FinanceDetails } from './FinanceDetails'
import { DashboardCharts } from './DashboardCharts'
import { Button } from '@/components/ui/button'
import ModernPageLayout from '@/components/common/ModernPageLayout'
import ModernCard from '@/components/common/ModernCard'

interface RealDataDashboardProps {
  role?: 'admin' | 'manager'
}

export function RealDataDashboard({ role }: RealDataDashboardProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('today')
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>()

  const handleFilterChange = (filter: FilterType, dateRange?: DateRange) => {
    setSelectedFilter(filter)
    if (filter === 'custom') {
      setCustomDateRange(dateRange)
    }
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

  return (
    <RealDataProvider filter={selectedFilter} dateRange={customDateRange}>
      {({ dashboardData, isLoading, error, refreshData }) => (
        <ModernPageLayout
          title="Analytics Dashboard"
          subtitle="Real-time insights and metrics"
          icon={BarChart3}
          headerContent={
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Quick Stats */}
              {dashboardData && !isLoading && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg mb-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      ₹{((dashboardData.revenue.rooms.total + dashboardData.revenue.additionalServices + dashboardData.revenue.rent) / 1000).toFixed(1)}K
                    </div>
                    <div className="text-xs text-gray-600">Total Revenue</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-50 rounded-lg mb-2">
                      <Building className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {dashboardData.roomStats.occupancy.present.confirmed.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">Occupancy</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-50 rounded-lg mb-2">
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {dashboardData.roomStats.totalGuestsInHouse}
                    </div>
                    <div className="text-xs text-gray-600">Active Guests</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-50 rounded-lg mb-2">
                      <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {dashboardData.roomStats.bookedRooms.reservation}
                    </div>
                    <div className="text-xs text-gray-600">Bookings</div>
                  </div>
                </div>
              )}
              
              {/* Error indicator */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Data Error</span>
                </div>
              )}
            </div>
          }
          actions={
            <DashboardFilters
              selectedFilter={selectedFilter}
              onFilterChange={handleFilterChange}
              customDateRange={customDateRange}
              role={role}
            />
          }
        >
          {/* Loading State */}
          {isLoading && (
            <ModernCard>
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-3 text-gray-600">
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                  <span>Loading dashboard data...</span>
                </div>
              </div>
            </ModernCard>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <ModernCard variant="outlined">
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">Data Loading Error</h3>
                <p className="text-red-700 mb-4">There was an error loading the dashboard data.</p>
                <Button
                  onClick={refreshData}
                  variant="outline"
                  className="text-red-700 border-red-300 hover:bg-red-50"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </ModernCard>
          )}

          {/* Dashboard Content */}
          {dashboardData && !isLoading && (
            <>
              {/* Room Statistics */}
              <RoomStatsCards
                data={dashboardData.roomStats}
                filterType={getFilterTypeForComponents()}
                isLoading={false}
              />

              {/* Revenue Summary */}
              <RevenueSummary
                data={dashboardData.revenue}
                onRentUpdate={(newAmount) => {
                  console.log('Updating rent amount to:', newAmount)
                  // TODO: Update rent in database
                }}
                isLoading={false}
              />

              {/* Charts */}
              <DashboardCharts 
                occupancyTrend={[]}
                revenueTrend={[]}
                paymentMethods={[]}
                occupancyBreakdown={[]}
                refundsData={[]}
                isLoading={false}
              />

              {/* Payment Sources */}
              <PaymentSources
                data={dashboardData.paymentSources}
                isLoading={false}
              />

              {/* Refunds & Adjustments */}
              <RefundsAdjustments
                data={dashboardData.refundsAdjustments}
                totalRevenue={dashboardData.revenue.rooms.total + dashboardData.revenue.additionalServices + dashboardData.revenue.rent}
                isLoading={false}
              />

              {/* Finance Details */}
              <FinanceDetails
                data={dashboardData.financeDetails}
                isLoading={false}
              />
            </>
          )}
        </ModernPageLayout>
      )}
    </RealDataProvider>
  )
}