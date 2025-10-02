import React, { useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Calendar, TrendingUp, TrendingDown, DollarSign, Download, BarChart3, PieChart, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { format, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, subDays, subWeeks } from 'date-fns'

// Modern hooks using TanStack Query + Zustand
import { usePayments } from '@/hooks/usePayments'
import { useExpenseEntries } from '@/hooks/useExpenses'
import {
  FinancialDateFilterType,
  useFinancialDateFilterType,
  useFinancialSelectedMonth,
  useFinancialCustomDate,
  useFinancialCustomStartDate,
  useFinancialCustomEndDate,
  useFinancialIsLoadingStats,
  useFinancialIsExporting,
  useFinancialError,
  useFinancialSetDateFilterType,
  useFinancialSetSelectedMonth,
  useFinancialSetCustomDate,
  useFinancialSetCustomDateRange,
  useFinancialSetLoadingStats,
  useFinancialSetExporting,
  useFinancialSetError
} from '@/stores/financialStore'

interface FinancialSummary {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  expenseRatio: number
  monthlyGrowth: number
  expensesByCategory: Record<string, number>
}

const AdminFinancials = () => {
  // Modern optimized state management: TanStack Query + Zustand (Fixed infinite loops)
  // Individual Zustand selectors (prevents infinite loops)
  const dateFilterType = useFinancialDateFilterType()
  const selectedMonth = useFinancialSelectedMonth()
  const customDate = useFinancialCustomDate()
  const customStartDate = useFinancialCustomStartDate()
  const customEndDate = useFinancialCustomEndDate()

  const isLoadingStats = useFinancialIsLoadingStats()
  const isExporting = useFinancialIsExporting()
  const error = useFinancialError()

  const setDateFilterType = useFinancialSetDateFilterType()
  const setSelectedMonth = useFinancialSetSelectedMonth()
  const setCustomDate = useFinancialSetCustomDate()
  const setCustomDateRange = useFinancialSetCustomDateRange()
  const setLoadingStats = useFinancialSetLoadingStats()
  const setExporting = useFinancialSetExporting()
  const setError = useFinancialSetError()

  // TanStack Query for server state
  const { data: allPayments = [], isLoading: isLoadingPayments, error: paymentsError } = usePayments()
  const { data: allExpenses = [], isLoading: isLoadingExpenses, error: expensesError } = useExpenseEntries()

  // Date range calculation based on filter type (memoized)
  const getDateRange = useCallback(() => {
    const now = new Date()

    switch (dateFilterType) {
      case 'today':
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        }
      case 'yesterday':
        const yesterday = subDays(now, 1)
        return {
          start: startOfDay(yesterday),
          end: endOfDay(yesterday)
        }
      case 'this_week':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 })
        }
      case 'last_week':
        const lastWeek = subWeeks(now, 1)
        return {
          start: startOfWeek(lastWeek, { weekStartsOn: 1 }),
          end: endOfWeek(lastWeek, { weekStartsOn: 1 })
        }
      case 'this_month':
        return {
          start: startOfMonth(new Date(selectedMonth)),
          end: endOfMonth(new Date(selectedMonth))
        }
      case 'last_month':
        const lastMonth = subMonths(now, 1)
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth)
        }
      case 'custom_date':
        const customDateObj = new Date(customDate)
        return {
          start: startOfDay(customDateObj),
          end: endOfDay(customDateObj)
        }
      case 'custom_range':
        return {
          start: startOfDay(new Date(customStartDate)),
          end: endOfDay(new Date(customEndDate))
        }
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        }
    }
  }, [dateFilterType, selectedMonth, customDate, customStartDate, customEndDate])

  // Get previous period for growth calculation
  const getPreviousPeriodRange = useCallback(() => {
    const currentRange = getDateRange()
    const diffInMs = currentRange.end.getTime() - currentRange.start.getTime()

    return {
      start: new Date(currentRange.start.getTime() - diffInMs),
      end: new Date(currentRange.end.getTime() - diffInMs)
    }
  }, [getDateRange])

  // Memoized filtered payments for performance
  const filteredPayments = useMemo(() => {
    if (!allPayments.length) return []

    const dateRange = getDateRange()

    return allPayments.filter(payment => {
      try {
        const paymentDate = new Date(payment.paymentDate)
        return !isNaN(paymentDate.getTime()) &&
               paymentDate >= dateRange.start &&
               paymentDate <= dateRange.end &&
               payment.paymentStatus === 'completed' &&
               !payment.deletedAt
      } catch (e) {
        return false
      }
    })
  }, [allPayments, getDateRange])

  // Memoized filtered expenses for performance
  const filteredExpenses = useMemo(() => {
    if (!allExpenses.length) return []

    const dateRange = getDateRange()

    return allExpenses.filter(expense => {
      try {
        const expenseDate = new Date(expense.date)
        return !isNaN(expenseDate.getTime()) &&
               expenseDate >= dateRange.start &&
               expenseDate <= dateRange.end &&
               !expense.deletedAt
      } catch (e) {
        return false
      }
    })
  }, [allExpenses, getDateRange])

  // Previous period data for growth calculation
  const previousPeriodRevenue = useMemo(() => {
    if (!allPayments.length) return 0

    const prevRange = getPreviousPeriodRange()

    const prevPayments = allPayments.filter(payment => {
      try {
        const paymentDate = new Date(payment.paymentDate)
        return !isNaN(paymentDate.getTime()) &&
               paymentDate >= prevRange.start &&
               paymentDate <= prevRange.end &&
               payment.paymentStatus === 'completed' &&
               !payment.deletedAt
      } catch (e) {
        return false
      }
    })

    return prevPayments.reduce((sum, payment) => sum + payment.amount, 0)
  }, [allPayments, getPreviousPeriodRange])

  // Memoized financial summary
  const financialSummary: FinancialSummary = useMemo(() => {
    const totalRevenue = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const netProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
    const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0
    const monthlyGrowth = previousPeriodRevenue > 0
      ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
      : 0

    // Group expenses by category
    const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
      const category = expense.categoryName || 'Uncategorized'
      acc[category] = (acc[category] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      expenseRatio,
      monthlyGrowth,
      expensesByCategory
    }
  }, [filteredPayments, filteredExpenses, previousPeriodRevenue])

  // Get period label for comparison (memoized)
  const getPeriodLabel = useCallback(() => {
    switch (dateFilterType) {
      case 'today': return 'yesterday'
      case 'yesterday': return 'previous day'
      case 'this_week': return 'last week'
      case 'last_week': return 'previous week'
      case 'this_month': return 'last month'
      case 'last_month': return 'previous month'
      case 'custom_date': return 'previous day'
      case 'custom_range': return 'previous period'
      default: return 'last period'
    }
  }, [dateFilterType])

  // Export functionality (memoized)
  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      const csvContent = [
        'Financial Report',
        `Period: ${dateFilterType}`,
        `Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`,
        '',
        'SUMMARY',
        `Total Revenue,₹${financialSummary.totalRevenue.toLocaleString()}`,
        `Total Expenses,₹${financialSummary.totalExpenses.toLocaleString()}`,
        `Net Profit,₹${financialSummary.netProfit.toLocaleString()}`,
        `Profit Margin,${financialSummary.profitMargin.toFixed(2)}%`,
        `Expense Ratio,${financialSummary.expenseRatio.toFixed(2)}%`,
        `Growth vs ${getPeriodLabel()},${financialSummary.monthlyGrowth.toFixed(2)}%`,
        '',
        'EXPENSES BY CATEGORY',
        ...Object.entries(financialSummary.expensesByCategory).map(([category, amount]) =>
          `${category},₹${amount.toLocaleString()}`
        ),
        '',
        'REVENUE DETAILS',
        `Number of Payments,${filteredPayments.length}`,
        `Average Payment,₹${filteredPayments.length > 0 ? (financialSummary.totalRevenue / filteredPayments.length).toFixed(0) : 0}`,
        '',
        'EXPENSE DETAILS',
        `Number of Expenses,${filteredExpenses.length}`,
        `Average Expense,₹${filteredExpenses.length > 0 ? (financialSummary.totalExpenses / filteredExpenses.length).toFixed(0) : 0}`
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `financial-report-${dateFilterType}-${format(new Date(), 'yyyy-MM-dd')}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setError('Failed to export data')
    } finally {
      setExporting(false)
    }
  }, [financialSummary, dateFilterType, filteredPayments, filteredExpenses, getPeriodLabel, setExporting, setError])

  // Memoized handlers for date range picker
  const handleStartDateChange = useCallback((date: string) => {
    setCustomDateRange(date, customEndDate)
  }, [setCustomDateRange, customEndDate])

  const handleEndDateChange = useCallback((date: string) => {
    setCustomDateRange(customStartDate, date)
  }, [setCustomDateRange, customStartDate])

  // Loading state
  const isLoading = isLoadingPayments || isLoadingExpenses

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-8 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-2">Comprehensive profit & loss analysis and financial insights</p>
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-black hover:bg-gray-800 text-white"
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export Report'}
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-col gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Date Filter Type */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <Select
              value={dateFilterType}
              onValueChange={setDateFilterType}
            >
              <SelectTrigger className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="last_week">Last Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="custom_date">Custom Date</SelectItem>
                <SelectItem value="custom_range">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional filters based on selection */}
          {dateFilterType === 'this_month' && (
            <div className="flex items-center gap-2">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = subMonths(new Date(), i)
                    const value = format(date, 'yyyy-MM')
                    const label = format(date, 'MMMM yyyy')
                    return (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {dateFilterType === 'custom_date' && (
            <div className="flex items-center gap-2">
              <DatePicker
                selectedDate={customDate}
                onDateChange={setCustomDate}
                placeholder="Select date"
                minDate={format(subMonths(new Date(), 24), 'yyyy-MM-dd')}
                className="w-48"
              />
            </div>
          )}

          {dateFilterType === 'custom_range' && (
            <div className="flex items-center gap-2">
              <DateRangePicker
                startDate={customStartDate}
                endDate={customEndDate}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                minDate={format(subMonths(new Date(), 24), 'yyyy-MM-dd')}
                className="w-80"
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Key Financial Metrics */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{financialSummary.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-600">
              {financialSummary.monthlyGrowth >= 0 ? '+' : ''}{financialSummary.monthlyGrowth.toFixed(1)}% from {getPeriodLabel()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{financialSummary.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-gray-600">{filteredExpenses.length} transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className={`h-4 w-4 ${financialSummary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financialSummary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{financialSummary.netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">
              {financialSummary.profitMargin.toFixed(1)}% profit margin
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expense Ratio</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{financialSummary.expenseRatio.toFixed(1)}%</div>
            <p className="text-xs text-gray-600">Of total revenue</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profit & Loss Summary */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {/* P&L Statement */}
        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Profit & Loss Statement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-green-700">Total Revenue</span>
                  <span className="font-bold text-green-600">₹{financialSummary.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">{filteredPayments.length} payments</span>
                  <span className="text-xs text-gray-500">
                    Avg: ₹{filteredPayments.length > 0 ? (financialSummary.totalRevenue / filteredPayments.length).toFixed(0) : 0}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Operating Expenses by Category</h4>
                {Object.entries(financialSummary.expensesByCategory).length > 0 ? (
                  Object.entries(financialSummary.expensesByCategory)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, amount]) => (
                      <div key={category} className="flex justify-between text-sm">
                        <span className="text-gray-600">{category}</span>
                        <span className="text-red-600">₹{amount.toLocaleString()}</span>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No expenses recorded</p>
                )}
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-red-700">Total Expenses</span>
                    <span className="font-bold text-red-600">₹{financialSummary.totalExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">{filteredExpenses.length} expenses</span>
                    <span className="text-xs text-gray-500">
                      Avg: ₹{filteredExpenses.length > 0 ? (financialSummary.totalExpenses / filteredExpenses.length).toFixed(0) : 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-gray-300 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Net Profit</span>
                  <span className={`font-bold text-xl ${financialSummary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{financialSummary.netProfit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-600">Profit Margin</span>
                  <span className="text-sm font-medium">{financialSummary.profitMargin.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown Chart */}
        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(financialSummary.expensesByCategory).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(financialSummary.expensesByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => {
                    const percentage = (amount / financialSummary.totalExpenses) * 100
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{category}</span>
                          <div className="text-right">
                            <div className="text-sm font-bold">₹{amount.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No expense data available</p>
                <p className="text-gray-400 text-xs mt-1">Add expenses to see breakdown</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Financial Ratios */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200">
          <CardHeader>
            <CardTitle>Key Financial Ratios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${financialSummary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {financialSummary.profitMargin.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-gray-700">Net Profit Margin</div>
                <div className="text-xs text-gray-500 mt-1">Net Profit ÷ Revenue</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{financialSummary.expenseRatio.toFixed(1)}%</div>
                <div className="text-sm font-medium text-gray-700">Expense Ratio</div>
                <div className="text-xs text-gray-500 mt-1">Total Expenses ÷ Revenue</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${financialSummary.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {financialSummary.monthlyGrowth >= 0 ? '+' : ''}{financialSummary.monthlyGrowth.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-gray-700">Period Growth</div>
                <div className="text-xs text-gray-500 mt-1">vs {getPeriodLabel()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Error Display */}
      {(error || paymentsError || expensesError) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <p className="text-red-600">
            {error || (paymentsError as Error)?.message || (expensesError as Error)?.message || 'An error occurred'}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default AdminFinancials
