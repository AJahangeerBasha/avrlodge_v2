import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, DollarSign, TrendingUp, FileText, Download, Filter, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { getPayments } from '@/lib/payments'
import { Payment } from '@/lib/types/payments'
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns'

interface RevenueStats {
  totalRevenue: number
  totalPayments: number
  avgPaymentAmount: number
  cashPayments: number
  digitalPayments: number
  monthlyGrowth: number
}

const AdminRevenues = () => {
  const { currentUser } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    totalPayments: 0,
    avgPaymentAmount: 0,
    cashPayments: 0,
    digitalPayments: 0,
    monthlyGrowth: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState('2024-09') // Set to September 2024 for debugging
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all')

  // Load payments data
  const loadPayments = async () => {
    try {
      setLoading(true)

      // Use the proper payments API to get all payments
      const allPayments = await getPayments()

      console.log('📊 DEBUG: Payments from API:', allPayments.length)

      console.log('📊 DEBUG: Total documents from Firebase:', allPayments.length)
      console.log('📊 DEBUG: First few payment records:', allPayments.slice(0, 3))

      // Check what payment statuses we have
      const statuses = [...new Set(allPayments.map(p => p.paymentStatus).filter(Boolean))]
      console.log('📊 DEBUG: Available payment statuses:', statuses)

      // Check date formats
      const dateFormats = allPayments.slice(0, 5).map(p => ({
        id: p.id,
        paymentDate: p.paymentDate,
        dateType: typeof p.paymentDate,
        isValidDate: p.paymentDate ? !isNaN(new Date(p.paymentDate).getTime()) : false
      }))
      console.log('📊 DEBUG: Date formats:', dateFormats)

      // Filter for completed payments and sort by date (newest first)
      const completedPayments = allPayments
        .filter(payment => {
          // Check payment status - 'completed' is the valid status in our system
          const isCompleted = payment.paymentStatus === 'completed'
          console.log(`📊 Payment ${payment.id}: status="${payment.paymentStatus}" -> isCompleted=${isCompleted}`)
          return isCompleted
        })
        .filter(payment => {
          // Check if payment is not soft-deleted
          const isActive = !payment.deletedAt
          const hasRequiredFields = payment.paymentDate && payment.amount
          if (!hasRequiredFields) {
            console.log(`📊 Payment ${payment.id}: Missing required fields - paymentDate=${payment.paymentDate}, amount=${payment.amount}`)
          }
          if (!isActive) {
            console.log(`📊 Payment ${payment.id}: Soft deleted at ${payment.deletedAt}`)
          }
          return isActive && hasRequiredFields
        })
        .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())

      console.log('📊 DEBUG: Completed payments after filtering:', completedPayments.length)
      console.log('📊 DEBUG: Sample completed payment:', completedPayments[0])

      // Make payments data globally accessible for debugging
      ;(window as any).debugPaymentsData = {
        allPayments,
        completedPayments,
        statuses,
        selectedMonth: '2024-09'
      }

      setPayments(completedPayments)
      calculateStats(completedPayments)
    } catch (error) {
      console.error('Error loading payments:', error)
      // Set empty data on error
      setPayments([])
      setStats({
        totalRevenue: 0,
        totalPayments: 0,
        avgPaymentAmount: 0,
        cashPayments: 0,
        digitalPayments: 0,
        monthlyGrowth: 0
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculate revenue statistics
  const calculateStats = (paymentsData: Payment[]) => {
    const currentMonthStart = startOfMonth(new Date(selectedMonth))
    const currentMonthEnd = endOfMonth(new Date(selectedMonth))
    const previousMonthStart = startOfMonth(subMonths(new Date(selectedMonth), 1))
    const previousMonthEnd = endOfMonth(subMonths(new Date(selectedMonth), 1))

    // Filter payments for current month with better date handling
    console.log('📅 DEBUG: Date filtering for month:', selectedMonth)
    console.log('📅 DEBUG: Current month start:', currentMonthStart)
    console.log('📅 DEBUG: Current month end:', currentMonthEnd)

    const currentMonthPayments = paymentsData.filter(payment => {
      try {
        // Handle both ISO string and timestamp formats
        const paymentDate = payment.paymentDate instanceof Date
          ? payment.paymentDate
          : new Date(payment.paymentDate)

        const isValidDate = !isNaN(paymentDate.getTime())
        const isInRange = paymentDate >= currentMonthStart && paymentDate <= currentMonthEnd

        // Debug each payment
        if (isValidDate) {
          console.log(`📅 Payment ${payment.id}: ${paymentDate.toISOString()} - In range: ${isInRange}`)
        }

        return isValidDate && isInRange
      } catch (e) {
        console.warn('Invalid payment date:', payment.paymentDate)
        return false
      }
    })

    console.log('📅 DEBUG: Filtered payments for current month:', currentMonthPayments.length)
    console.log('📅 DEBUG: Current month payments:', currentMonthPayments)

    // Filter payments for previous month
    const previousMonthPayments = paymentsData.filter(payment => {
      try {
        const paymentDate = payment.paymentDate instanceof Date
          ? payment.paymentDate
          : new Date(payment.paymentDate)

        return !isNaN(paymentDate.getTime()) &&
               paymentDate >= previousMonthStart &&
               paymentDate <= previousMonthEnd
      } catch (e) {
        return false
      }
    })

    const totalRevenue = currentMonthPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const previousRevenue = previousMonthPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)

    // Count payment methods more accurately
    const cashPayments = currentMonthPayments.filter(p =>
      p.paymentMethod?.toLowerCase().includes('cash')
    ).length

    const digitalPayments = currentMonthPayments.filter(p =>
      p.paymentMethod && !p.paymentMethod.toLowerCase().includes('cash')
    ).length

    const monthlyGrowth = previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : totalRevenue > 0 ? 100 : 0 // If no previous data but current data exists, show 100% growth

    console.log('Revenue stats calculated:', {
      currentMonth: format(currentMonthStart, 'MMM yyyy'),
      totalRevenue,
      totalPayments: currentMonthPayments.length,
      cashPayments,
      digitalPayments,
      monthlyGrowth: monthlyGrowth.toFixed(1) + '%'
    })

    setStats({
      totalRevenue,
      totalPayments: currentMonthPayments.length,
      avgPaymentAmount: currentMonthPayments.length > 0 ? totalRevenue / currentMonthPayments.length : 0,
      cashPayments,
      digitalPayments,
      monthlyGrowth
    })

    setFilteredPayments(currentMonthPayments)
  }

  // Filter payments by payment method
  const filterPayments = () => {
    const currentMonthStart = startOfMonth(new Date(selectedMonth))
    const currentMonthEnd = endOfMonth(new Date(selectedMonth))

    // Filter payments for the selected month
    let filtered = payments.filter(payment => {
      try {
        const paymentDate = payment.paymentDate instanceof Date
          ? payment.paymentDate
          : new Date(payment.paymentDate)

        return !isNaN(paymentDate.getTime()) &&
               paymentDate >= currentMonthStart &&
               paymentDate <= currentMonthEnd
      } catch (e) {
        return false
      }
    })

    // Apply payment method filter
    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter(payment => {
        if (!payment.paymentMethod) return false

        const method = payment.paymentMethod.toLowerCase()
        const filter = paymentMethodFilter.toLowerCase()

        if (filter === 'qr') {
          return method.includes('jubair') || method.includes('basha') || method.includes('qr')
        }

        return method.includes(filter)
      })
    }

    console.log('Filtered payments:', filtered.length, 'for', format(currentMonthStart, 'MMM yyyy'))
    setFilteredPayments(filtered)
  }

  useEffect(() => {
    if (currentUser) {
      loadPayments()
    }
  }, [currentUser])

  useEffect(() => {
    calculateStats(payments)
  }, [selectedMonth, payments])

  useEffect(() => {
    filterPayments()
  }, [paymentMethodFilter, selectedMonth, payments])

  const exportData = () => {
    const csvContent = [
      'Receipt Number,Payment Date,Amount,Payment Method,Payment Type,Reservation ID',
      ...filteredPayments.map(payment => {
        try {
          const date = payment.paymentDate instanceof Date
            ? payment.paymentDate
            : new Date(payment.paymentDate)
          const formattedDate = format(date, 'yyyy-MM-dd')
          return `${payment.receiptNumber || 'N/A'},${formattedDate},₹${payment.amount || 0},${payment.paymentMethod || 'N/A'},${payment.paymentType || 'Standard'},${payment.reservationId || 'N/A'}`
        } catch (e) {
          return `${payment.receiptNumber || 'N/A'},Invalid Date,₹${payment.amount || 0},${payment.paymentMethod || 'N/A'},${payment.paymentType || 'Standard'},${payment.reservationId || 'N/A'}`
        }
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenue-report-${selectedMonth}.csv`
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
          <h1 className="text-3xl font-bold text-gray-900">Revenue Reports</h1>
          <p className="text-gray-600 mt-2">Track room rental income and payment analytics</p>
        </div>
        <Button onClick={exportData} className="bg-black hover:bg-gray-800 text-white">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
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
          <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
            <SelectTrigger className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
              <SelectItem value="all">All Payment Methods</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="jubair">Jubair QR</SelectItem>
              <SelectItem value="basha">Basha QR</SelectItem>
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-600">
              {stats.monthlyGrowth >= 0 ? '+' : ''}{stats.monthlyGrowth.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalPayments}</div>
            <p className="text-xs text-gray-600">Payment transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">₹{stats.avgPaymentAmount.toFixed(0)}</div>
            <p className="text-xs text-gray-600">Per transaction</p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Mix</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              <div className="flex justify-between">
                <span>Cash: {stats.cashPayments}</span>
                <span>Digital: {stats.digitalPayments}</span>
              </div>
            </div>
            <p className="text-xs text-gray-600">Payment methods</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                <p className="text-gray-600 mb-4">
                  No payment records found for {format(new Date(selectedMonth), 'MMMM yyyy')}.
                </p>
                <p className="text-sm text-gray-500">
                  {paymentMethodFilter !== 'all' ? 'Try changing the payment method filter or ' : ''}
                  Select a different month to view payment data.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receipt #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.receiptNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {(() => {
                            try {
                              const date = payment.paymentDate instanceof Date
                                ? payment.paymentDate
                                : new Date(payment.paymentDate)
                              return format(date, 'MMM dd, yyyy')
                            } catch (e) {
                              return 'Invalid Date'
                            }
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          ₹{payment.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {payment.paymentMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {payment.paymentType || 'Standard'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default AdminRevenues