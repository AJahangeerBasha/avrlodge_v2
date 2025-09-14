import { motion } from 'framer-motion'
import { 
  Target, 
  TrendingUp, 
  TrendingDown,
  Users,
  Calculator,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Minus
} from 'lucide-react'
import { RevenueMetricsCard } from './MetricsCard'

interface FinanceDetailsData {
  expected: {
    totalRevenue: number // Total Rooms × Tariff
    checkedInGuestsRevenue: number // Checked-In Guests × Standard Rate
  }
  actual: {
    totalRevenue: number // Actual Revenue Collected
    checkedInGuestsRevenue: number // Actual Revenue after discounts
  }
  netRevenue: number // Total Revenue – Refunds – Discounts
  roomsData: {
    totalRooms: number
    standardTariff: number
    checkedInGuests: number
    standardRate: number
  }
}

interface FinanceDetailsProps {
  data: FinanceDetailsData
  isLoading?: boolean
}

export function FinanceDetails({ data, isLoading = false }: FinanceDetailsProps) {
  // Calculate variances
  const totalRevenueVariance = data.actual.totalRevenue - data.expected.totalRevenue
  const totalRevenueVariancePercent = data.expected.totalRevenue > 0 
    ? (totalRevenueVariance / data.expected.totalRevenue) * 100 
    : 0

  const guestsRevenueVariance = data.actual.checkedInGuestsRevenue - data.expected.checkedInGuestsRevenue
  const guestsRevenueVariancePercent = data.expected.checkedInGuestsRevenue > 0
    ? (guestsRevenueVariance / data.expected.checkedInGuestsRevenue) * 100
    : 0

  // Calculate efficiency metrics
  const revenueEfficiency = data.expected.totalRevenue > 0 
    ? (data.actual.totalRevenue / data.expected.totalRevenue) * 100 
    : 0
  const guestEfficiency = data.expected.checkedInGuestsRevenue > 0 
    ? (data.actual.checkedInGuestsRevenue / data.expected.checkedInGuestsRevenue) * 100 
    : 0

  const expectedVsActualCards = [
    {
      title: 'Expected Total Revenue',
      amount: data.expected.totalRevenue,
      subtitle: `${data.roomsData.totalRooms} rooms × ₹${data.roomsData.standardTariff}`,
      icon: Target,
      iconColor: 'text-blue-600 dark:text-blue-400',
      trend: {
        value: Math.round(revenueEfficiency),
        isPositive: revenueEfficiency >= 95,
        label: 'efficiency achieved'
      }
    },
    {
      title: 'Actual Total Revenue',
      amount: data.actual.totalRevenue,
      subtitle: 'Revenue collected',
      icon: DollarSign,
      iconColor: totalRevenueVariance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      valueColor: totalRevenueVariance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      trend: {
        value: Math.abs(Math.round(totalRevenueVariancePercent)),
        isPositive: totalRevenueVariance >= 0,
        label: totalRevenueVariance >= 0 ? 'above expected' : 'below expected'
      }
    },
    {
      title: 'Revenue Variance',
      amount: Math.abs(totalRevenueVariance),
      subtitle: totalRevenueVariance >= 0 ? 'Surplus' : 'Shortfall',
      icon: totalRevenueVariance >= 0 ? TrendingUp : TrendingDown,
      iconColor: totalRevenueVariance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      valueColor: totalRevenueVariance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
    }
  ]

  const guestRevenueCards = [
    {
      title: 'Expected Guest Revenue',
      amount: data.expected.checkedInGuestsRevenue,
      subtitle: `${data.roomsData.checkedInGuests} guests × ₹${data.roomsData.standardRate}`,
      icon: Users,
      iconColor: 'text-purple-600 dark:text-purple-400',
      trend: {
        value: Math.round(guestEfficiency),
        isPositive: guestEfficiency >= 90,
        label: 'guest efficiency'
      }
    },
    {
      title: 'Actual Guest Revenue',
      amount: data.actual.checkedInGuestsRevenue,
      subtitle: 'After discounts applied',
      icon: Calculator,
      iconColor: guestsRevenueVariance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400',
      valueColor: guestsRevenueVariance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400',
      trend: {
        value: Math.abs(Math.round(guestsRevenueVariancePercent)),
        isPositive: guestsRevenueVariance >= 0,
        label: 'vs expected'
      }
    },
    {
      title: 'Guest Revenue Variance',
      amount: Math.abs(guestsRevenueVariance),
      subtitle: guestsRevenueVariance >= 0 ? 'Above standard' : 'Discount impact',
      icon: guestsRevenueVariance >= 0 ? CheckCircle : AlertCircle,
      iconColor: guestsRevenueVariance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400',
      valueColor: guestsRevenueVariance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
    }
  ]

  const netRevenueCard = {
    title: 'Net Revenue',
    amount: data.netRevenue,
    subtitle: 'Total - Refunds - Discounts',
    icon: Calculator,
    iconColor: data.netRevenue > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
    valueColor: data.netRevenue > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
    trend: {
      value: Math.round(data.actual.totalRevenue > 0 ? (data.netRevenue / data.actual.totalRevenue) * 100 : 0),
      isPositive: data.netRevenue > 0,
      label: 'net margin'
    }
  }

  return (
    <div className="space-y-6">
      {/* Net Revenue Overview */}
      <div>
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
        >
          Net Revenue Overview
        </motion.h3>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <RevenueMetricsCard
            title={netRevenueCard.title}
            amount={netRevenueCard.amount}
            subtitle={netRevenueCard.subtitle}
            icon={netRevenueCard.icon}
            iconColor={netRevenueCard.iconColor}
            valueColor={netRevenueCard.valueColor}
            trend={netRevenueCard.trend}
            isLoading={isLoading}
            compactFormat
          />
        </motion.div>
      </div>

      {/* Expected vs Actual Revenue */}
      <div>
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
        >
          Expected vs Actual Revenue
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {expectedVsActualCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <RevenueMetricsCard
                title={card.title}
                amount={card.amount}
                subtitle={card.subtitle}
                icon={card.icon}
                iconColor={card.iconColor}
                valueColor={card.valueColor}
                trend={card.trend}
                isLoading={isLoading}
                compactFormat
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Guest Revenue Analysis */}
      <div>
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
        >
          Guest Revenue Analysis
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guestRevenueCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <RevenueMetricsCard
                title={card.title}
                amount={card.amount}
                subtitle={card.subtitle}
                icon={card.icon}
                iconColor={card.iconColor}
                valueColor={card.valueColor}
                trend={card.trend}
                isLoading={isLoading}
                compactFormat
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Financial Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
      >
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Financial Performance Summary
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue Efficiency */}
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className={`text-2xl font-bold ${revenueEfficiency >= 95 ? 'text-green-600' : revenueEfficiency >= 85 ? 'text-yellow-600' : 'text-red-600'} dark:${revenueEfficiency >= 95 ? 'text-green-400' : revenueEfficiency >= 85 ? 'text-yellow-400' : 'text-red-400'}`}>
              {revenueEfficiency.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Revenue Efficiency</div>
            <div className="text-xs text-gray-500 mt-1">
              Actual vs Expected
            </div>
          </div>
          
          {/* Guest Efficiency */}
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className={`text-2xl font-bold ${guestEfficiency >= 90 ? 'text-green-600' : guestEfficiency >= 80 ? 'text-yellow-600' : 'text-red-600'} dark:${guestEfficiency >= 90 ? 'text-green-400' : guestEfficiency >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
              {guestEfficiency.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Guest Efficiency</div>
            <div className="text-xs text-gray-500 mt-1">
              Guest revenue realization
            </div>
          </div>
          
          {/* Net Margin */}
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className={`text-2xl font-bold ${data.netRevenue > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {data.actual.totalRevenue > 0 ? ((data.netRevenue / data.actual.totalRevenue) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Net Margin</div>
            <div className="text-xs text-gray-500 mt-1">
              After all deductions
            </div>
          </div>
          
          {/* Revenue Per Guest */}
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ₹{data.roomsData.checkedInGuests > 0 ? Math.round(data.actual.checkedInGuestsRevenue / data.roomsData.checkedInGuests).toLocaleString() : 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Revenue/Guest</div>
            <div className="text-xs text-gray-500 mt-1">
              After discounts
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {revenueEfficiency >= 95 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : revenueEfficiency >= 85 ? (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Revenue Target: {revenueEfficiency >= 95 ? 'Achieved' : revenueEfficiency >= 85 ? 'Close' : 'Missed'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {data.netRevenue > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Profitability: {data.netRevenue > 0 ? 'Positive' : 'Negative'}
                </span>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Financial data as of current period
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}