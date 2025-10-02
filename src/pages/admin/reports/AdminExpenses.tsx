import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, TrendingDown, FileText, Download, Filter, AlertCircle, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, subMonths } from 'date-fns'

const AdminExpenses = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [expenseCategory, setExpenseCategory] = useState('all')

  // Placeholder data - replace with actual expense tracking system
  const placeholderExpenses = [
    {
      id: '1',
      category: 'Maintenance',
      description: 'Room AC repair - Room 101',
      amount: 5500,
      date: '2024-01-15',
      vendor: 'AC Services Ltd'
    },
    {
      id: '2',
      category: 'Utilities',
      description: 'Electricity bill - January',
      amount: 12000,
      date: '2024-01-10',
      vendor: 'State Electricity Board'
    },
    {
      id: '3',
      category: 'Supplies',
      description: 'Housekeeping supplies',
      amount: 3200,
      date: '2024-01-08',
      vendor: 'Cleaning Supplies Co'
    },
    {
      id: '4',
      category: 'Maintenance',
      description: 'Plumbing work - Common area',
      amount: 2800,
      date: '2024-01-05',
      vendor: 'Quick Fix Plumbers'
    }
  ]

  const totalExpenses = placeholderExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const avgExpense = placeholderExpenses.length > 0 ? totalExpenses / placeholderExpenses.length : 0

  const expensesByCategory = placeholderExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)

  const exportData = () => {
    const csvContent = [
      'Date,Category,Description,Amount,Vendor',
      ...placeholderExpenses.map(expense =>
        `${expense.date},${expense.category},${expense.description},₹${expense.amount},${expense.vendor}`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expense-report-${selectedMonth}.csv`
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
          <h1 className="text-3xl font-bold text-gray-900">Expense Reports</h1>
          <p className="text-gray-600 mt-2">Track operational costs and spending analytics</p>
        </div>
        <Button onClick={exportData} className="bg-black hover:bg-gray-800 text-white">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </motion.div>

      {/* Notice Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Expense Tracking System Coming Soon
                </p>
                <p className="text-xs text-yellow-700">
                  Full expense management integration is under development. Currently showing placeholder data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
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
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <Select value={expenseCategory} onValueChange={setExpenseCategory}>
            <SelectTrigger className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="supplies">Supplies</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
            </SelectContent>
          </Select>
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
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-gray-600">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{placeholderExpenses.length}</div>
            <p className="text-xs text-gray-600">Expense records</p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">₹{avgExpense.toFixed(0)}</div>
            <p className="text-xs text-gray-600">Per transaction</p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <Filter className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-orange-600">
              {Object.entries(expensesByCategory).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
            </div>
            <p className="text-xs text-gray-600">Highest spending</p>
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
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {placeholderExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                        ₹{expense.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {expense.vendor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200">
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <span className="text-lg font-bold text-red-600">₹{amount.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(amount / totalExpenses) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {((amount / totalExpenses) * 100).toFixed(1)}% of total
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default AdminExpenses