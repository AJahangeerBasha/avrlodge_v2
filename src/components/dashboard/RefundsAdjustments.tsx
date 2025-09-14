import { motion } from 'framer-motion'
import { 
  RefreshCcw, 
  Percent, 
  TrendingDown,
  AlertTriangle,
  Calculator,
  CreditCard,
  Clock,
  XCircle
} from 'lucide-react'
import { RevenueMetricsCard } from './MetricsCard'

interface RefundsAdjustmentsData {
  refunds: {
    cancellations: number
    earlyCheckouts: number
    total: number
  }
  adjustments: {
    totalDiscount: number
    percentageDiscounts: number
    fixedDiscounts: number
  }
  reasons: {
    cancellations: { count: number; amount: number }
    earlyCheckouts: { count: number; amount: number }
    discounts: { count: number; amount: number }
  }
}

interface RefundsAdjustmentsProps {
  data: RefundsAdjustmentsData
  totalRevenue: number
  isLoading?: boolean
}

export function RefundsAdjustments({ data, totalRevenue, isLoading = false }: RefundsAdjustmentsProps) {
  const totalRefundsAndAdjustments = data.refunds.total + data.adjustments.totalDiscount
  const impactPercentage = totalRevenue > 0 ? (totalRefundsAndAdjustments / totalRevenue) * 100 : 0

  const refundCards = [
    {
      title: 'Cancellation Refunds',
      amount: data.refunds.cancellations,
      subtitle: `${data.reasons.cancellations.count} cancellations`,
      icon: XCircle,
      iconColor: 'text-red-600 dark:text-red-400',
      trend: {
        value: Math.round(data.refunds.total > 0 ? (data.refunds.cancellations / data.refunds.total) * 100 : 0),
        isPositive: false,
        label: 'of total refunds'
      }
    },
    {
      title: 'Early Checkout Refunds',
      amount: data.refunds.earlyCheckouts,
      subtitle: `${data.reasons.earlyCheckouts.count} early checkouts`,
      icon: Clock,
      iconColor: 'text-orange-600 dark:text-orange-400',
      trend: {
        value: Math.round(data.refunds.total > 0 ? (data.refunds.earlyCheckouts / data.refunds.total) * 100 : 0),
        isPositive: false,
        label: 'of total refunds'
      }
    },
    {
      title: 'Total Refunds',
      amount: data.refunds.total,
      subtitle: 'All refund sources',
      icon: RefreshCcw,
      iconColor: 'text-red-600 dark:text-red-400',
      valueColor: 'text-red-600 dark:text-red-400',
      trend: {
        value: Math.round(impactPercentage / 2), // Roughly half of total impact
        isPositive: false,
        label: 'revenue impact'
      }
    }
  ]

  const adjustmentCards = [
    {
      title: 'Percentage Discounts',
      amount: data.adjustments.percentageDiscounts,
      subtitle: '% based discounts',
      icon: Percent,
      iconColor: 'text-blue-600 dark:text-blue-400',
      trend: {
        value: Math.round(data.adjustments.totalDiscount > 0 ? (data.adjustments.percentageDiscounts / data.adjustments.totalDiscount) * 100 : 0),
        isPositive: false,
        label: 'of total discounts'
      }
    },
    {
      title: 'Fixed Discounts',
      amount: data.adjustments.fixedDiscounts,
      subtitle: 'Fixed amount discounts',
      icon: Calculator,
      iconColor: 'text-purple-600 dark:text-purple-400',
      trend: {
        value: Math.round(data.adjustments.totalDiscount > 0 ? (data.adjustments.fixedDiscounts / data.adjustments.totalDiscount) * 100 : 0),
        isPositive: false,
        label: 'of total discounts'
      }
    },
    {
      title: 'Total Adjustments',
      amount: data.adjustments.totalDiscount,
      subtitle: 'All discount types',
      icon: TrendingDown,
      iconColor: 'text-orange-600 dark:text-orange-400',
      valueColor: 'text-orange-600 dark:text-orange-400',
      trend: {
        value: Math.round(impactPercentage / 2), // Roughly half of total impact
        isPositive: false,
        label: 'revenue impact'
      }
    }
  ]

  const summaryCard = {
    title: 'Total Impact',
    amount: totalRefundsAndAdjustments,
    subtitle: 'Refunds + Adjustments',
    icon: AlertTriangle,
    iconColor: 'text-red-600 dark:text-red-400',
    valueColor: 'text-red-600 dark:text-red-400',
    trend: {
      value: Math.round(impactPercentage),
      isPositive: false,
      label: 'of total revenue'
    }
  }

  return (
    <div className="space-y-6">
      {/* Total Impact */}
      <div>
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
        >
          Refunds & Adjustments Impact
        </motion.h3>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <RevenueMetricsCard
            title={summaryCard.title}
            amount={summaryCard.amount}
            subtitle={summaryCard.subtitle}
            icon={summaryCard.icon}
            iconColor={summaryCard.iconColor}
            valueColor={summaryCard.valueColor}
            trend={summaryCard.trend}
            isLoading={isLoading}
            compactFormat
          />
        </motion.div>
      </div>

      {/* Refunds Breakdown */}
      <div>
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
        >
          Refunds Breakdown
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {refundCards.map((card, index) => (
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

      {/* Adjustments Breakdown */}
      <div>
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
        >
          Adjustments Breakdown
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {adjustmentCards.map((card, index) => (
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

      {/* Summary Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
      >
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Impact Analysis
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Refund Statistics */}
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {data.reasons.cancellations.count + data.reasons.earlyCheckouts.count}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Refund Cases</div>
            <div className="text-xs text-gray-500 mt-1">
              ₹{data.refunds.total.toLocaleString()} refunded
            </div>
          </div>
          
          {/* Discount Statistics */}
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {data.reasons.discounts.count}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Discount Applications</div>
            <div className="text-xs text-gray-500 mt-1">
              ₹{data.adjustments.totalDiscount.toLocaleString()} discounted
            </div>
          </div>
          
          {/* Revenue Impact */}
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {impactPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Revenue Impact</div>
            <div className="text-xs text-gray-500 mt-1">
              ₹{totalRefundsAndAdjustments.toLocaleString()} total loss
            </div>
          </div>
          
          {/* Average Impact */}
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              ₹{Math.round(totalRefundsAndAdjustments / Math.max(1, data.reasons.cancellations.count + data.reasons.earlyCheckouts.count + data.reasons.discounts.count)).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Impact/Case</div>
            <div className="text-xs text-gray-500 mt-1">
              Per refund/adjustment
            </div>
          </div>
        </div>
        
        {/* Warning if impact is high */}
        {impactPercentage > 15 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
          >
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                High Impact Alert: Refunds and adjustments are affecting {impactPercentage.toFixed(1)}% of revenue
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}