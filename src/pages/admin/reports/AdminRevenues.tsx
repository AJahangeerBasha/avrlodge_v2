import React, { useMemo, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, DollarSign, TrendingUp, FileText, Download, Filter, BarChart3, RefreshCw, ChevronLeft, ChevronRight, Wallet, QrCode } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { format, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, subDays, subWeeks, differenceInDays } from 'date-fns'

// Modern hooks using TanStack Query + Zustand
import { usePayments } from '@/hooks/usePayments'
import { useQuery } from '@tanstack/react-query'
import { getAllReservations } from '@/lib/reservations'
import { getAllReservationRooms } from '@/lib/reservationRooms'
import {
  RevenueDateFilterType,
  useDateFilterType,
  useSelectedMonth,
  useCustomDate,
  useCustomStartDate,
  useCustomEndDate,
  usePaymentMethodFilter,
  useIsLoadingStats,
  useIsExporting,
  useRevenueError,
  useRevenueCurrentPage,
  useRevenueItemsPerPage,
  useSetDateFilterType,
  useSetSelectedMonth,
  useSetCustomDate,
  useSetCustomDateRange,
  useSetPaymentMethodFilter,
  useSetLoadingStats,
  useSetExporting,
  useSetError,
  useSetRevenueCurrentPage,
  useSetRevenueItemsPerPage
} from '@/stores/revenueStore'

interface RevenueStats {
  totalRevenue: number
  totalPayments: number
  avgPaymentAmount: number
  cashPayments: number
  digitalPayments: number
  monthlyGrowth: number
}

const AdminRevenues = () => {
  // Modern optimized state management: TanStack Query + Zustand (Fixed infinite loops)
  // Individual Zustand selectors (prevents infinite loops)
  const dateFilterType = useDateFilterType()
  const selectedMonth = useSelectedMonth()
  const customDate = useCustomDate()
  const customStartDate = useCustomStartDate()
  const customEndDate = useCustomEndDate()
  const paymentMethodFilter = usePaymentMethodFilter()
  const currentPage = useRevenueCurrentPage()
  const itemsPerPage = useRevenueItemsPerPage()

  const isLoadingStats = useIsLoadingStats()
  const isExporting = useIsExporting()
  const error = useRevenueError()

  const setDateFilterType = useSetDateFilterType()
  const setSelectedMonth = useSetSelectedMonth()
  const setCustomDate = useSetCustomDate()
  const setCustomDateRange = useSetCustomDateRange()
  const setPaymentMethodFilter = useSetPaymentMethodFilter()
  const setCurrentPage = useSetRevenueCurrentPage()
  const setItemsPerPage = useSetRevenueItemsPerPage()
  const setLoadingStats = useSetLoadingStats()
  const setExporting = useSetExporting()
  const setError = useSetError()

  // TanStack Query for server state
  const { data: allPayments = [], isLoading, error: queryError, refetch: refetchPayments } = usePayments()

  // Get reservations data for payment details
  const { data: reservations = [], refetch: refetchReservations } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => getAllReservations(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Get reservation rooms data for room details
  const { data: reservationRooms = [], refetch: refetchReservationRooms } = useQuery({
    queryKey: ['reservationRooms'],
    queryFn: () => getAllReservationRooms(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Create enhanced payment data with reservation details (memoized)
  const enhancedPayments = useMemo(() => {
    return allPayments.map(payment => {
      const reservation = payment.reservationId
        ? reservations.find(r => r.id === payment.reservationId)
        : null

      // Get room numbers from reservation rooms (filter out soft deleted)
      const rooms = payment.reservationId
        ? reservationRooms.filter(rr => rr.reservationId === payment.reservationId && !rr.deletedAt)
        : []

      // Calculate nights if reservation exists
      const nights = reservation
        ? differenceInDays(new Date(reservation.checkOutDate), new Date(reservation.checkInDate))
        : 0

      // Format stay period
      const stayPeriod = reservation
        ? `${format(new Date(reservation.checkInDate), 'MMM dd')} - ${format(new Date(reservation.checkOutDate), 'MMM dd')}`
        : 'N/A'

      // Format room numbers - show all rooms for this reservation
      const roomNumbers = rooms.length > 0
        ? rooms.map(r => r.roomNumber).join(', ')
        : 'N/A'

      // Format reservation ID (last 8 chars)
      const reservationIdShort = payment.reservationId
        ? payment.reservationId.slice(-8)
        : 'N/A'

      return {
        ...payment,
        // Reservation details
        guestName: reservation?.guestName || 'N/A',
        guestPhone: reservation?.guestPhone || 'N/A',
        stayPeriod,
        nights,
        roomNumbers,
        reservationIdShort,
        // Keep original data
        reservation,
        rooms
      }
    })
  }, [allPayments, reservations, reservationRooms])

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

  // Memoized filtered payments for performance
  const filteredPayments = useMemo(() => {
    if (!enhancedPayments.length) return []

    const dateRange = getDateRange()

    // Filter by date range
    let filtered = enhancedPayments.filter(payment => {
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

    // Filter by payment method
    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter(payment => {
        const method = payment.paymentMethod?.toLowerCase() || ''
        switch (paymentMethodFilter) {
          case 'cash': return method.includes('cash')
          case 'jubair': return method.includes('jubair')
          case 'basha': return method.includes('basha')
          default: return true
        }
      })
    }

    return filtered
  }, [enhancedPayments, getDateRange, paymentMethodFilter])

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredPayments.slice(startIndex, endIndex)
  }, [filteredPayments, currentPage, itemsPerPage])

  // Memoized revenue statistics
  const stats: RevenueStats = useMemo(() => {
    if (!filteredPayments.length) {
      return {
        totalRevenue: 0,
        totalPayments: 0,
        avgPaymentAmount: 0,
        cashPayments: 0,
        digitalPayments: 0,
        monthlyGrowth: 0
      }
    }

    const totalRevenue = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalPayments = filteredPayments.length
    const avgPaymentAmount = totalRevenue / totalPayments

    const cashPayments = filteredPayments.filter(p =>
      p.paymentMethod?.toLowerCase().includes('cash')
    ).length

    const digitalPayments = filteredPayments.filter(p =>
      p.paymentMethod && !p.paymentMethod.toLowerCase().includes('cash')
    ).length

    // Calculate growth (simplified - would need previous period data)
    const monthlyGrowth = 0 // Placeholder for now

    return {
      totalRevenue,
      totalPayments,
      avgPaymentAmount,
      cashPayments,
      digitalPayments,
      monthlyGrowth
    }
  }, [filteredPayments])

  // Payment method statistics
  const paymentMethodStats = useMemo(() => {
    const cash = filteredPayments.filter(p => p.paymentMethod?.toLowerCase().includes('cash')).reduce((sum, p) => sum + p.amount, 0)
    const jubair = filteredPayments.filter(p => p.paymentMethod?.toLowerCase().includes('jubair')).reduce((sum, p) => sum + p.amount, 0)
    const basha = filteredPayments.filter(p => p.paymentMethod?.toLowerCase().includes('basha')).reduce((sum, p) => sum + p.amount, 0)

    return { cash, jubair, basha }
  }, [filteredPayments])

  // Get date range display text
  const getDateRangeText = useCallback(() => {
    const dateRange = getDateRange()
    const startStr = format(dateRange.start, 'MMM dd, yyyy')
    const endStr = format(dateRange.end, 'MMM dd, yyyy')

    if (startStr === endStr) {
      return startStr
    }
    return `${startStr} - ${endStr}`
  }, [getDateRange])

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
        'Receipt Number,Guest Name,Phone,Stay Period,Nights,Rooms,Reservation ID,Amount,Payment Method,Payment Date',
        ...filteredPayments.map(payment =>
          `${payment.receiptNumber || ''},${payment.guestName},${payment.guestPhone},${payment.stayPeriod},${payment.nights},${payment.roomNumbers},${payment.reservationIdShort},${payment.amount},${payment.paymentMethod},${format(new Date(payment.paymentDate), 'yyyy-MM-dd')}`
        )
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `revenue-report-${dateFilterType}-${format(new Date(), 'yyyy-MM-dd')}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setError('Failed to export data')
    } finally {
      setExporting(false)
    }
  }, [filteredPayments, dateFilterType, setExporting, setError])

  // Memoized handlers for date range picker
  const handleStartDateChange = useCallback((date: string) => {
    setCustomDateRange(date, customEndDate)
  }, [setCustomDateRange, customEndDate])

  const handleEndDateChange = useCallback((date: string) => {
    setCustomDateRange(customStartDate, date)
  }, [setCustomDateRange, customStartDate])

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchPayments(),
      refetchReservations(),
      refetchReservationRooms()
    ])
  }, [refetchPayments, refetchReservations, refetchReservationRooms])

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
          <h1 className="text-3xl font-bold text-gray-900">Revenue Reports</h1>
          <p className="text-gray-600 mt-2">Track room rental income and payment analytics</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-gray-300 hover:bg-gray-50"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
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

        {/* Date Range Display */}
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg border border-gray-100 px-3 py-2">
          <span className="font-medium">Date Range:</span>
          <span>{getDateRangeText()}</span>
        </div>
      </motion.div>

      {/* Stats Cards - Row 1 */}
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
              {stats.totalPayments} payment transactions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{paymentMethodStats.cash.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Cash payments</p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jubair QR</CardTitle>
            <QrCode className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">₹{paymentMethodStats.jubair.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Jubair QR payments</p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Basha QR</CardTitle>
            <QrCode className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{paymentMethodStats.basha.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Basha QR payments</p>
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
            <CardTitle className="text-lg font-semibold">
              Payment Records ({filteredPayments.length}) 
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPayments.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Receipt #</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Guest Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Phone</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Stay Period</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Nights</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Rooms | Reservation</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Method</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Payment Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPayments.map((payment, index) => (
                      <motion.tr
                        key={payment.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <td className="py-3 px-4 text-sm font-mono text-gray-900">
                          {payment.receiptNumber || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          {payment.guestName}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          <a href={`tel:${payment.guestPhone}`} className="hover:text-blue-600 transition-colors">
                            {payment.guestPhone}
                          </a>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {payment.stayPeriod}
                        </td>
                        <td className="py-3 px-4 text-sm text-center text-gray-600">
                          {payment.nights > 0 ? `${payment.nights} ${payment.nights === 1 ? 'night' : 'nights'}` : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          <div className="space-y-1">
                            <div className="font-mono text-gray-900">
                              {payment.roomNumbers}
                            </div>
                            <div className="text-xs font-mono text-gray-500">
                              ID: {payment.reservationIdShort}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-green-600">
                          ₹{payment.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.paymentMethod?.toLowerCase().includes('cash')
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {payment.paymentMethod || 'Unknown'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length} payments
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNumber
                        if (totalPages <= 5) {
                          pageNumber = i + 1
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i
                        } else {
                          pageNumber = currentPage - 2 + i
                        }

                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNumber)}
                            className={currentPage === pageNumber ? "bg-black text-white" : ""}
                          >
                            {pageNumber}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <FileText className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-500 text-lg">No payments found</p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your filters to see payment data
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

export default AdminRevenues