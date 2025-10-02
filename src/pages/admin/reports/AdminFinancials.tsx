import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, TrendingUp, TrendingDown, DollarSign, Download, BarChart3, PieChart, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns'

interface FinancialSummary {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  grossMargin: number
  monthlyGrowth: number
}

const AdminFinancials = () => {
  const { currentUser } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [loading, setLoading] = useState(true)
  const [financialData, setFinancialData] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    grossMargin: 0,
    monthlyGrowth: 0
  })

  // Placeholder expense data (would be replaced with actual expense tracking)
  const placeholderExpenses = {
    'Utilities': 15000,
    'Maintenance': 8500,
    'Supplies': 5200,
    'Staff': 25000,
    'Marketing': 3000,
    'Insurance': 4500,
    'Other': 2800
  }

  // Load revenue data from Firebase
  const loadFinancialData = async () => {
    try {
      setLoading(true)

      // Load revenue data
      const paymentsRef = collection(db, 'payments')
      const currentMonthStart = startOfMonth(new Date(selectedMonth))
      const currentMonthEnd = endOfMonth(new Date(selectedMonth))

      const q = query(
        paymentsRef,
        where('paymentStatus', '==', 'completed'),
        where('paymentDate', '>=', currentMonthStart.toISOString()),
        where('paymentDate', '<=', currentMonthEnd.toISOString()),
        orderBy('paymentDate', 'desc')
      )

      const snapshot = await getDocs(q)
      const payments = snapshot.docs.map(doc => doc.data())

      const totalRevenue = payments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0)

      // Calculate total expenses (placeholder)
      const totalExpenses = Object.values(placeholderExpenses).reduce((sum, expense) => sum + expense, 0)

      // Calculate previous month for growth comparison
      const previousMonthStart = startOfMonth(subMonths(new Date(selectedMonth), 1))
      const previousMonthEnd = endOfMonth(subMonths(new Date(selectedMonth), 1))

      const prevQ = query(
        paymentsRef,
        where('paymentStatus', '==', 'completed'),
        where('paymentDate', '>=', previousMonthStart.toISOString()),
        where('paymentDate', '<=', previousMonthEnd.toISOString())
      )

      const prevSnapshot = await getDocs(prevQ)
      const prevPayments = prevSnapshot.docs.map(doc => doc.data())
      const previousRevenue = prevPayments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0)

      const netProfit = totalRevenue - totalExpenses
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
      const grossMargin = totalRevenue > 0 ? ((totalRevenue - (totalExpenses * 0.6)) / totalRevenue) * 100 : 0 // Assuming 60% COGS
      const monthlyGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0

      setFinancialData({
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        grossMargin,
        monthlyGrowth
      })
    } catch (error) {
      console.error('Error loading financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      loadFinancialData()
    }
  }, [currentUser, selectedMonth])

  const exportData = () => {
    const csvContent = [
      'Financial Report',
      `Period: ${format(new Date(selectedMonth), 'MMMM yyyy')}`,
      '',
      'REVENUE',
      `Total Revenue,₹${financialData.totalRevenue.toLocaleString()}`,
      '',
      'EXPENSES',
      ...Object.entries(placeholderExpenses).map(([category, amount]) =>
        `${category},₹${amount.toLocaleString()}`
      ),
      `Total Expenses,₹${financialData.totalExpenses.toLocaleString()}`,
      '',
      'PROFIT & LOSS',
      `Net Profit,₹${financialData.netProfit.toLocaleString()}`,
      `Profit Margin,${financialData.profitMargin.toFixed(2)}%`,
      `Gross Margin,${financialData.grossMargin.toFixed(2)}%`,
      `Monthly Growth,${financialData.monthlyGrowth.toFixed(2)}%`
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financial-report-${selectedMonth}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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
        <Button onClick={exportData} className="bg-black hover:bg-gray-800 text-white">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </motion.div>

      {/* Notice Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Financial Integration Notice
                </p>
                <p className="text-xs text-blue-700">
                  Revenue data from actual payments. Expense tracking system under development - showing placeholder data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Month Filter */}
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Calendar className="h-4 w-4 text-gray-600" />
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
            <div className="text-2xl font-bold text-green-600">₹{financialData.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-600">
              {financialData.monthlyGrowth >= 0 ? '+' : ''}{financialData.monthlyGrowth.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{financialData.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Operating expenses</p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className={`h-4 w-4 ${financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{financialData.netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">
              {financialData.profitMargin.toFixed(1)}% profit margin
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{financialData.grossMargin.toFixed(1)}%</div>
            <p className="text-xs text-gray-600">Before operating expenses</p>
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
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-700">Total Revenue</span>
                    <span className="font-bold text-green-600">₹{financialData.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Operating Expenses</h4>
                  {Object.entries(placeholderExpenses).map(([category, amount]) => (
                    <div key={category} className="flex justify-between text-sm">
                      <span className="text-gray-600">{category}</span>
                      <span className="text-red-600">₹{amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-red-700">Total Expenses</span>
                      <span className="font-bold text-red-600">₹{financialData.totalExpenses.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t-2 border-gray-300 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Net Profit</span>
                    <span className={`font-bold text-xl ${financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{financialData.netProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">Profit Margin</span>
                    <span className="text-sm font-medium">{financialData.profitMargin.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            )}
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
            <div className="space-y-4">
              {Object.entries(placeholderExpenses).map(([category, amount]) => {
                const percentage = (amount / financialData.totalExpenses) * 100
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
                <div className="text-2xl font-bold text-blue-600">{financialData.profitMargin.toFixed(1)}%</div>
                <div className="text-sm font-medium text-gray-700">Net Profit Margin</div>
                <div className="text-xs text-gray-500 mt-1">Net Profit ÷ Revenue</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{financialData.grossMargin.toFixed(1)}%</div>
                <div className="text-sm font-medium text-gray-700">Gross Margin</div>
                <div className="text-xs text-gray-500 mt-1">Gross Profit ÷ Revenue</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {financialData.totalRevenue > 0 ? (financialData.totalExpenses / financialData.totalRevenue * 100).toFixed(1) : '0.0'}%
                </div>
                <div className="text-sm font-medium text-gray-700">Expense Ratio</div>
                <div className="text-xs text-gray-500 mt-1">Total Expenses ÷ Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default AdminFinancials