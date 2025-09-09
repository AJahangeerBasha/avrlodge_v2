import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Home, 
  Plus, 
  Building2, 
  TrendingUp, 
  TrendingDown,
  Calculator,
  DollarSign,
  Edit3,
  Save,
  X
} from 'lucide-react'
import { RevenueMetricsCard } from './MetricsCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface RevenueData {
  rooms: {
    total: number
    advancePayment: number
  }
  additionalServices: number
  rent: number
  refunds: number
  discounts: number
  salary: number
  expenses: number
  bills: number
}

interface RevenueSummaryProps {
  data: RevenueData
  onRentUpdate?: (newAmount: number) => void
  isLoading?: boolean
}

export function RevenueSummary({ data, onRentUpdate, isLoading = false }: RevenueSummaryProps) {
  const [isEditingRent, setIsEditingRent] = useState(false)
  const [rentValue, setRentValue] = useState(data.rent.toString())

  // Revenue Calculations
  const roomsRevenue = data.rooms.total + data.rooms.advancePayment
  const grossRevenue = roomsRevenue + data.additionalServices + data.rent
  const totalDeductions = data.refunds + data.discounts + data.salary + data.expenses + data.bills
  const netRevenue = grossRevenue - totalDeductions

  const handleRentSave = () => {
    const newRent = parseFloat(rentValue) || 0
    onRentUpdate?.(newRent)
    setIsEditingRent(false)
  }

  const handleRentCancel = () => {
    setRentValue(data.rent.toString())
    setIsEditingRent(false)
  }

  const revenueCards = [
    {
      title: 'Rooms Revenue',
      amount: roomsRevenue,
      subtitle: `₹${data.rooms.advancePayment.toLocaleString()} advance included`,
      icon: Home,
      iconColor: 'text-blue-600 dark:text-blue-400',
      valueColor: 'text-green-600 dark:text-green-400',
      trend: {
        value: Math.round((roomsRevenue / grossRevenue) * 100),
        isPositive: true,
        label: 'of gross revenue'
      }
    },
    {
      title: 'Additional Services',
      amount: data.additionalServices,
      subtitle: 'Extra charges & services',
      icon: Plus,
      iconColor: 'text-purple-600 dark:text-purple-400',
      valueColor: 'text-green-600 dark:text-green-400',
      trend: {
        value: Math.round((data.additionalServices / grossRevenue) * 100),
        isPositive: data.additionalServices > 0,
        label: 'of gross revenue'
      }
    },
    {
      title: 'Rent Revenue',
      amount: data.rent,
      subtitle: 'Manual rent entry',
      icon: Building2,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      valueColor: 'text-green-600 dark:text-green-400',
      isEditable: true,
      trend: data.rent > 0 ? {
        value: Math.round((data.rent / grossRevenue) * 100),
        isPositive: true,
        label: 'of gross revenue'
      } : undefined
    }
  ]

  const summaryCards = [
    {
      title: 'Gross Revenue',
      amount: grossRevenue,
      subtitle: 'Rooms + Services + Rent',
      icon: TrendingUp,
      iconColor: 'text-green-600 dark:text-green-400',
      valueColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Total Deductions',
      amount: totalDeductions,
      subtitle: 'Refunds + Discounts + Expenses',
      icon: TrendingDown,
      iconColor: 'text-red-600 dark:text-red-400',
      valueColor: 'text-red-600 dark:text-red-400',
      trend: {
        value: Math.round((totalDeductions / grossRevenue) * 100),
        isPositive: false,
        label: 'of gross revenue'
      }
    },
    {
      title: 'Net Revenue',
      amount: netRevenue,
      subtitle: 'Gross - Deductions',
      icon: Calculator,
      iconColor: netRevenue > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      valueColor: netRevenue > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      trend: {
        value: Math.round((netRevenue / grossRevenue) * 100),
        isPositive: netRevenue > 0,
        label: 'net margin'
      }
    }
  ]

  const deductionBreakdown = [
    { label: 'Refunds', amount: data.refunds, color: 'text-red-500' },
    { label: 'Discounts', amount: data.discounts, color: 'text-orange-500' },
    { label: 'Salary', amount: data.salary, color: 'text-blue-500' },
    { label: 'Expenses', amount: data.expenses, color: 'text-purple-500' },
    { label: 'Bills', amount: data.bills, color: 'text-indigo-500' }
  ]

  return (
    <div className="space-y-6">
      {/* Revenue Sources */}
      <div>
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
        >
          Revenue Sources
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {revenueCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {card.isEditable && card.title === 'Rent Revenue' ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <card.icon className={card.iconColor + ' w-5 h-5'} />
                      </div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {card.title}
                      </h4>
                    </div>
                    {!isEditingRent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingRent(true)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  
                  {isEditingRent ? (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="rent-amount" className="text-xs text-gray-600 dark:text-gray-400">
                          Rent Amount
                        </Label>
                        <Input
                          id="rent-amount"
                          type="number"
                          value={rentValue}
                          onChange={(e) => setRentValue(e.target.value)}
                          placeholder="Enter rent amount"
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleRentSave}>
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleRentCancel}>
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                        ₹{card.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {card.subtitle}
                      </div>
                    </>
                  )}
                </div>
              ) : (
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
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Revenue Summary */}
      <div>
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
        >
          Revenue Summary
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summaryCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
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

      {/* Deduction Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
      >
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Deduction Breakdown
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {deductionBreakdown.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.05 }}
              className="text-center"
            >
              <div className={`text-lg font-bold ${item.color}`}>
                ₹{item.amount.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Revenue Efficiency
            </span>
            <div className="flex items-center gap-2">
              {netRevenue > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`font-medium ${netRevenue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {((netRevenue / grossRevenue) * 100).toFixed(1)}% Net Margin
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}