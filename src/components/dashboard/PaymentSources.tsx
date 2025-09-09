import { motion } from 'framer-motion'
import { 
  Banknote, 
  Smartphone, 
  QrCode,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  PieChart
} from 'lucide-react'
import { RevenueMetricsCard } from './MetricsCard'

interface PaymentSourceData {
  cash: number
  jubairQR: number
  bashaQR: number
}

interface PaymentSourcesProps {
  data: PaymentSourceData
  isLoading?: boolean
}

export function PaymentSources({ data, isLoading = false }: PaymentSourcesProps) {
  const totalCashFlow = data.cash + data.jubairQR + data.bashaQR

  const paymentMethods = [
    {
      title: 'Cash Payments',
      amount: data.cash,
      icon: Banknote,
      iconColor: 'text-green-600 dark:text-green-400',
      percentage: totalCashFlow > 0 ? (data.cash / totalCashFlow) * 100 : 0,
      trend: {
        value: Math.round(totalCashFlow > 0 ? (data.cash / totalCashFlow) * 100 : 0),
        isPositive: data.cash > 0,
        label: 'of total payments'
      }
    },
    {
      title: 'Jubair QR',
      amount: data.jubairQR,
      icon: QrCode,
      iconColor: 'text-blue-600 dark:text-blue-400',
      percentage: totalCashFlow > 0 ? (data.jubairQR / totalCashFlow) * 100 : 0,
      trend: {
        value: Math.round(totalCashFlow > 0 ? (data.jubairQR / totalCashFlow) * 100 : 0),
        isPositive: data.jubairQR > 0,
        label: 'of total payments'
      }
    },
    {
      title: 'Basha QR',
      amount: data.bashaQR,
      icon: Smartphone,
      iconColor: 'text-purple-600 dark:text-purple-400',
      percentage: totalCashFlow > 0 ? (data.bashaQR / totalCashFlow) * 100 : 0,
      trend: {
        value: Math.round(totalCashFlow > 0 ? (data.bashaQR / totalCashFlow) * 100 : 0),
        isPositive: data.bashaQR > 0,
        label: 'of total payments'
      }
    }
  ]

  const totalCashFlowCard = {
    title: 'Total Cash Flow',
    amount: totalCashFlow,
    subtitle: 'All payment sources combined',
    icon: Wallet,
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    valueColor: 'text-indigo-600 dark:text-indigo-400'
  }

  // Payment method distribution for visual indicators
  const paymentDistribution = paymentMethods.map(method => ({
    name: method.title.replace(' Payments', '').replace(' QR', ''),
    value: method.percentage,
    color: method.iconColor.split('-')[1] // Extract color name
  }))

  return (
    <div className="space-y-6">
      {/* Total Cash Flow */}
      <div>
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
        >
          Payment Collection Overview
        </motion.h3>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <RevenueMetricsCard
            title={totalCashFlowCard.title}
            amount={totalCashFlowCard.amount}
            subtitle={totalCashFlowCard.subtitle}
            icon={totalCashFlowCard.icon}
            iconColor={totalCashFlowCard.iconColor}
            valueColor={totalCashFlowCard.valueColor}
            isLoading={isLoading}
            compactFormat
            trend={{
              value: paymentMethods.length,
              isPositive: totalCashFlow > 0,
              label: 'payment methods'
            }}
          />
        </motion.div>
      </div>

      {/* Payment Methods Breakdown */}
      <div>
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
        >
          Payment Sources Breakdown
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentMethods.map((method, index) => (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="relative"
            >
              <RevenueMetricsCard
                title={method.title}
                amount={method.amount}
                subtitle={`${method.percentage.toFixed(1)}% of total`}
                icon={method.icon}
                iconColor={method.iconColor}
                trend={method.trend}
                isLoading={isLoading}
                compactFormat
              />
              
              {/* Percentage indicator bar */}
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${method.percentage}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                  className={`h-2 rounded-full ${
                    method.iconColor.includes('green') ? 'bg-green-500' :
                    method.iconColor.includes('blue') ? 'bg-blue-500' :
                    method.iconColor.includes('purple') ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Payment Distribution Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Payment Distribution
          </h4>
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <TrendingUp className="w-4 h-4" />
            Total: ₹{totalCashFlow.toLocaleString()}
          </div>
        </div>

        {/* Distribution Bars */}
        <div className="space-y-3">
          {paymentMethods.map((method, index) => (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center gap-2 w-24">
                <div className={`w-3 h-3 rounded-full ${
                  method.iconColor.includes('green') ? 'bg-green-500' :
                  method.iconColor.includes('blue') ? 'bg-blue-500' :
                  method.iconColor.includes('purple') ? 'bg-purple-500' :
                  'bg-gray-500'
                }`} />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {method.title.replace(' Payments', '').replace(' QR', '')}
                </span>
              </div>
              
              <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${method.percentage}%` }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                  className={`h-2 rounded-full ${
                    method.iconColor.includes('green') ? 'bg-green-500' :
                    method.iconColor.includes('blue') ? 'bg-blue-500' :
                    method.iconColor.includes('purple') ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`}
                />
              </div>
              
              <div className="w-16 text-right">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {method.percentage.toFixed(1)}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                ₹{data.cash.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Cash</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                ₹{(data.jubairQR + data.bashaQR).toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Digital</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-900 dark:text-white">
                <ArrowUpRight className="w-3 h-3 text-green-500" />
                {totalCashFlow > 0 ? (((data.jubairQR + data.bashaQR) / totalCashFlow) * 100).toFixed(0) : 0}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Digital Adoption</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}