import React, { useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Calendar, DollarSign, TrendingUp, FileText, Download, Filter, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { format, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, subDays, subWeeks } from 'date-fns'

// Modern hooks using TanStack Query + Zustand
import { useExpenseEntries } from '@/hooks/useExpenses'
import {
  ExpenseReportDateFilterType,
  useExpenseReportDateFilterType,
  useExpenseReportSelectedMonth,
  useExpenseReportCustomDate,
  useExpenseReportCustomStartDate,
  useExpenseReportCustomEndDate,
  useExpenseReportPaymentModeFilter,
  useExpenseReportStatusFilter,
  useExpenseReportIsLoadingStats,
  useExpenseReportIsExporting,
  useExpenseReportError,
  useExpenseReportSetDateFilterType,
  useExpenseReportSetSelectedMonth,
  useExpenseReportSetCustomDate,
  useExpenseReportSetCustomDateRange,
  useExpenseReportSetPaymentModeFilter,
  useExpenseReportSetStatusFilter,
  useExpenseReportSetLoadingStats,
  useExpenseReportSetExporting,
  useExpenseReportSetError
} from '@/stores/expenseReportStore'

interface ExpenseStats {
  totalExpenses: number
  totalCount: number
  avgExpenseAmount: number
  topCategory: string
  paidExpenses: number
  pendingExpenses: number
}

const AdminExpenses = () => {
  // Modern optimized state management: TanStack Query + Zustand (Fixed infinite loops)
  // Individual Zustand selectors (prevents infinite loops)
  const dateFilterType = useExpenseReportDateFilterType()
  const selectedMonth = useExpenseReportSelectedMonth()
  const customDate = useExpenseReportCustomDate()
  const customStartDate = useExpenseReportCustomStartDate()
  const customEndDate = useExpenseReportCustomEndDate()
  const paymentModeFilter = useExpenseReportPaymentModeFilter()
  const statusFilter = useExpenseReportStatusFilter()

  const isLoadingStats = useExpenseReportIsLoadingStats()
  const isExporting = useExpenseReportIsExporting()
  const error = useExpenseReportError()

  const setDateFilterType = useExpenseReportSetDateFilterType()
  const setSelectedMonth = useExpenseReportSetSelectedMonth()
  const setCustomDate = useExpenseReportSetCustomDate()
  const setCustomDateRange = useExpenseReportSetCustomDateRange()
  const setPaymentModeFilter = useExpenseReportSetPaymentModeFilter()
  const setStatusFilter = useExpenseReportSetStatusFilter()
  const setLoadingStats = useExpenseReportSetLoadingStats()
  const setExporting = useExpenseReportSetExporting()
  const setError = useExpenseReportSetError()

  // TanStack Query for server state
  const { data: allExpenses = [], isLoading, error: queryError } = useExpenseEntries()

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

  // Memoized filtered expenses for performance
  const filteredExpenses = useMemo(() => {
    if (!allExpenses.length) return []

    const dateRange = getDateRange()

    // Filter by date range
    let filtered = allExpenses.filter(expense => {
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

    // Filter by payment mode
    if (paymentModeFilter !== 'all') {
      filtered = filtered.filter(expense => {
        const mode = expense.paymentMode?.toLowerCase() || ''
        switch (paymentModeFilter) {
          case 'cash': return mode.includes('cash')
          case 'bank': return mode.includes('bank')
          case 'upi': return mode.includes('upi')
          case 'card': return mode.includes('card')
          default: return true
        }
      })
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(expense => {
        const expenseStatus = expense.status?.toLowerCase() || ''
        return expenseStatus === statusFilter.toLowerCase()
      })
    }

    return filtered
  }, [allExpenses, getDateRange, paymentModeFilter, statusFilter])

  // Memoized expense statistics
  const stats: ExpenseStats = useMemo(() => {
    if (!filteredExpenses.length) {
      return {
        totalExpenses: 0,
        totalCount: 0,
        avgExpenseAmount: 0,
        topCategory: 'N/A',
        paidExpenses: 0,
        pendingExpenses: 0
      }
    }

    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalCount = filteredExpenses.length
    const avgExpenseAmount = totalExpenses / totalCount

    // Find top category by total amount
    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      const cat = expense.categoryName || 'Unknown'
      acc[cat] = (acc[cat] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)

    const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'

    const paidExpenses = filteredExpenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0)
    const pendingExpenses = filteredExpenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + e.amount, 0)

    return {
      totalExpenses,
      totalCount,
      avgExpenseAmount,
      topCategory,
      paidExpenses,
      pendingExpenses
    }
  }, [filteredExpenses])

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
        'Expense ID,Date,Category,SubCategory,Description,Amount,Payment Mode,Vendor,Status,Receipt Number',
        ...filteredExpenses.map(expense =>
          `${expense.expenseId || ''},${format(new Date(expense.date), 'yyyy-MM-dd')},${expense.categoryName},${expense.subCategoryName},${expense.description},${expense.amount},${expense.paymentMode},${expense.vendor || ''},${expense.status},${expense.receiptNumber || ''}`
        )
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `expense-report-${dateFilterType}-${format(new Date(), 'yyyy-MM-dd')}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setError('Failed to export data')
    } finally {
      setExporting(false)
    }
  }, [filteredExpenses, dateFilterType, setExporting, setError])

  // Memoized handlers for date range picker
  const handleStartDateChange = useCallback((date: string) => {
    setCustomDateRange(date, customEndDate)
  }, [setCustomDateRange, customEndDate])

  const handleEndDateChange = useCallback((date: string) => {
    setCustomDateRange(customStartDate, date)
  }, [setCustomDateRange, customStartDate])

  // Loading state
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
          <h1 className="text-3xl font-bold text-gray-900">Expense Reports</h1>
          <p className="text-gray-600 mt-2">Track expense analytics and spending patterns</p>
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-black hover:bg-gray-800 text-white"
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export CSV'}
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

        {/* Payment Mode and Status Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <Select value={paymentModeFilter} onValueChange={setPaymentModeFilter}>
              <SelectTrigger className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                <SelectItem value="all">All Payment Modes</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{stats.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-gray-600">
              {stats.totalCount} expense entries
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Expense</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">₹{stats.avgExpenseAmount.toFixed(0)}</div>
            <p className="text-xs text-gray-600">Per transaction</p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.topCategory}</div>
            <p className="text-xs text-gray-600">Highest spending</p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₹{stats.paidExpenses.toLocaleString()} / ₹{stats.pendingExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">Paid : Pending</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Expenses Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Expense Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredExpenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Expense ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">SubCategory</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Payment Mode</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((expense, index) => (
                      <motion.tr
                        key={expense.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <td className="py-3 px-4 text-sm font-mono text-gray-900">
                          {expense.expenseId || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {format(new Date(expense.date), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          {expense.categoryName}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {expense.subCategoryName}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                          {expense.description}
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-red-600">
                          ₹{expense.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            expense.paymentMode?.toLowerCase().includes('cash')
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {expense.paymentMode || 'Unknown'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            expense.status === 'Paid'
                              ? 'bg-green-100 text-green-800'
                              : expense.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {expense.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <FileText className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-500 text-lg">No expenses found</p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your filters to see expense data
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Error Display */}
      {(error || queryError) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <p className="text-red-600">
            {error || (queryError as Error)?.message || 'An error occurred'}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default AdminExpenses
