import React, { useMemo, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, FileText, TrendingUp, Download, Filter, BarChart3, RefreshCw, Users, DollarSign, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { format, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, subDays, subWeeks, differenceInDays } from 'date-fns'

// Modern hooks using TanStack Query + Zustand
import { useQuery } from '@tanstack/react-query'
import { getAllReservations } from '@/lib/reservations'
import { getAllReservationRooms } from '@/lib/reservationRooms'
import { usePayments } from '@/hooks/usePayments'
import {
  BookingsReportDateFilterType,
  useBookingsReportDateFilterType,
  useBookingsReportSelectedMonth,
  useBookingsReportCustomDate,
  useBookingsReportCustomStartDate,
  useBookingsReportCustomEndDate,
  useBookingsReportStatusFilter,
  useBookingsReportPaymentStatusFilter,
  useBookingsReportCurrentPage,
  useBookingsReportItemsPerPage,
  useBookingsReportIsLoadingStats,
  useBookingsReportIsExporting,
  useBookingsReportError,
  useBookingsReportSetDateFilterType,
  useBookingsReportSetSelectedMonth,
  useBookingsReportSetCustomDate,
  useBookingsReportSetCustomDateRange,
  useBookingsReportSetStatusFilter,
  useBookingsReportSetPaymentStatusFilter,
  useBookingsReportSetCurrentPage,
  useBookingsReportSetItemsPerPage,
  useBookingsReportSetLoadingStats,
  useBookingsReportSetExporting,
  useBookingsReportSetError
} from '@/stores/bookingsReportStore'

interface BookingStats {
  totalBookings: number
  activeBookings: number
  completedBookings: number
  cancelledBookings: number
  totalRevenue: number
  avgBookingValue: number
  totalNights: number
  avgStayDuration: number
}

const AdminBookings = () => {
  // Local state for expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Modern optimized state management: TanStack Query + Zustand
  const dateFilterType = useBookingsReportDateFilterType()
  const selectedMonth = useBookingsReportSelectedMonth()
  const customDate = useBookingsReportCustomDate()
  const customStartDate = useBookingsReportCustomStartDate()
  const customEndDate = useBookingsReportCustomEndDate()
  const statusFilter = useBookingsReportStatusFilter()
  const paymentStatusFilter = useBookingsReportPaymentStatusFilter()
  const currentPage = useBookingsReportCurrentPage()
  const itemsPerPage = useBookingsReportItemsPerPage()

  const isLoadingStats = useBookingsReportIsLoadingStats()
  const isExporting = useBookingsReportIsExporting()
  const error = useBookingsReportError()

  const setDateFilterType = useBookingsReportSetDateFilterType()
  const setSelectedMonth = useBookingsReportSetSelectedMonth()
  const setCustomDate = useBookingsReportSetCustomDate()
  const setCustomDateRange = useBookingsReportSetCustomDateRange()
  const setStatusFilter = useBookingsReportSetStatusFilter()
  const setPaymentStatusFilter = useBookingsReportSetPaymentStatusFilter()
  const setCurrentPage = useBookingsReportSetCurrentPage()
  const setItemsPerPage = useBookingsReportSetItemsPerPage()
  const setLoadingStats = useBookingsReportSetLoadingStats()
  const setExporting = useBookingsReportSetExporting()
  const setError = useBookingsReportSetError()

  // TanStack Query for server state
  const { data: allReservations = [], isLoading, error: queryError, refetch: refetchReservations } = useQuery({
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

  // Get all payments
  const { data: allPayments = [], refetch: refetchPayments } = usePayments()

  // Create enhanced booking data with room details (memoized)
  const enhancedBookings = useMemo(() => {
    return allReservations.map(reservation => {
      // Get room numbers from reservation rooms (filter out soft deleted)
      const rooms = reservationRooms.filter(rr => rr.reservationId === reservation.id && !rr.deletedAt)

      // Calculate nights
      const nights = differenceInDays(new Date(reservation.checkOutDate), new Date(reservation.checkInDate))

      // Format stay period
      const stayPeriod = `${format(new Date(reservation.checkInDate), 'MMM dd')} - ${format(new Date(reservation.checkOutDate), 'MMM dd')}`

      // Format room numbers - show all rooms for this reservation
      const roomNumbers = rooms.length > 0
        ? rooms.map(r => r.roomNumber).join(', ')
        : 'N/A'

      // Get payments for this reservation
      const payments = allPayments.filter(p => p.reservationId === reservation.id && !p.deletedAt)
      const totalPaid = payments
        .filter(p => p.paymentStatus === 'completed')
        .reduce((sum, p) => sum + p.amount, 0)

      return {
        ...reservation,
        nights,
        stayPeriod,
        roomNumbers,
        rooms,
        payments,
        totalPaid,
        paymentCount: payments.length
      }
    })
  }, [allReservations, reservationRooms, allPayments])

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

  // Memoized filtered bookings for performance
  const filteredBookings = useMemo(() => {
    if (!enhancedBookings.length) return []

    const dateRange = getDateRange()

    // Filter by date range (check-in date)
    let filtered = enhancedBookings.filter(booking => {
      try {
        const checkInDate = new Date(booking.checkInDate)
        return !isNaN(checkInDate.getTime()) &&
               checkInDate >= dateRange.start &&
               checkInDate <= dateRange.end &&
               !booking.deletedAt
      } catch (e) {
        return false
      }
    })

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    // Filter by payment status
    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.paymentStatus === paymentStatusFilter)
    }

    return filtered
  }, [enhancedBookings, getDateRange, statusFilter, paymentStatusFilter])

  // Memoized booking statistics
  const stats: BookingStats = useMemo(() => {
    if (!filteredBookings.length) {
      return {
        totalBookings: 0,
        activeBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0,
        avgBookingValue: 0,
        totalNights: 0,
        avgStayDuration: 0
      }
    }

    const totalBookings = filteredBookings.length
    const activeBookings = filteredBookings.filter(b =>
      b.status === 'booking' || b.status === 'checked_in' || b.status === 'reservation'
    ).length
    const completedBookings = filteredBookings.filter(b => b.status === 'checked_out').length
    const cancelledBookings = filteredBookings.filter(b => b.status === 'cancelled').length

    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0)
    const avgBookingValue = totalRevenue / totalBookings

    const totalNights = filteredBookings.reduce((sum, booking) => sum + booking.nights, 0)
    const avgStayDuration = totalNights / totalBookings

    return {
      totalBookings,
      activeBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      avgBookingValue,
      totalNights,
      avgStayDuration
    }
  }, [filteredBookings])

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredBookings.slice(startIndex, endIndex)
  }, [filteredBookings, currentPage, itemsPerPage])

  // Payment status statistics
  const paymentStatusStats = useMemo(() => {
    const pending = filteredBookings.filter(b => b.paymentStatus === 'pending').reduce((sum, b) => sum + b.totalPrice, 0)
    const partial = filteredBookings.filter(b => b.paymentStatus === 'partial').reduce((sum, b) => sum + b.totalPrice, 0)
    const paid = filteredBookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalPrice, 0)

    return { pending, partial, paid }
  }, [filteredBookings])

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
        'Reference Number,Guest Name,Phone,Email,Check-In,Check-Out,Nights,Rooms,Guest Count,Status,Payment Status,Total Price,Advance Payment,Balance Payment',
        ...filteredBookings.map(booking =>
          `${booking.referenceNumber || ''},${booking.guestName || ''},${booking.guestPhone || ''},${booking.guestEmail || ''},${format(new Date(booking.checkInDate), 'yyyy-MM-dd')},${format(new Date(booking.checkOutDate), 'yyyy-MM-dd')},${booking.nights},${booking.roomNumbers},${booking.guestCount},${booking.status},${booking.paymentStatus},${booking.totalPrice},${booking.advancePayment},${booking.balancePayment}`
        )
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bookings-report-${dateFilterType}-${format(new Date(), 'yyyy-MM-dd')}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setError('Failed to export data')
    } finally {
      setExporting(false)
    }
  }, [filteredBookings, dateFilterType, setExporting, setError])

  // Memoized handlers for date range picker
  const handleStartDateChange = useCallback((date: string) => {
    setCustomDateRange(date, customEndDate)
  }, [setCustomDateRange, customEndDate])

  const handleEndDateChange = useCallback((date: string) => {
    setCustomDateRange(customStartDate, date)
  }, [setCustomDateRange, customStartDate])

  // Toggle row expansion
  const toggleRowExpansion = useCallback((reservationId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(reservationId)) {
        newSet.delete(reservationId)
      } else {
        newSet.add(reservationId)
      }
      return newSet
    })
  }, [])

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchReservations(),
      refetchReservationRooms(),
      refetchPayments()
    ])
  }, [refetchReservations, refetchReservationRooms, refetchPayments])

  // Status badge color helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reservation': return 'bg-yellow-100 text-yellow-800'
      case 'booking': return 'bg-blue-100 text-blue-800'
      case 'checked_in': return 'bg-green-100 text-green-800'
      case 'checked_out': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Bookings Reports</h1>
          <p className="text-gray-600 mt-2">Track booking analytics and reservation patterns</p>
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

        {/* Status Filter */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="reservation">Reservation</SelectItem>
                <SelectItem value="booking">Booking</SelectItem>
                <SelectItem value="checked_in">Checked In</SelectItem>
                <SelectItem value="checked_out">Checked Out</SelectItem>
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-600">From {stats.totalBookings} bookings</p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{paymentStatusStats.pending.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Pending payments</p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partial</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">₹{paymentStatusStats.partial.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Partial payments</p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{paymentStatusStats.paid.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Paid in full</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bookings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Booking Records ({filteredBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBookings.length > 0 ? (
              <>
                <div className="overflow-x-auto">
  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="w-10"></th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Reference #</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Guest Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Phone</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Check-In</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Check-Out</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Nights</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Rooms</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Total / Paid</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Payments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedBookings.map((booking, index) => {
                        const isExpanded = expandedRows.has(booking.id)
                        return (
                          <React.Fragment key={booking.id}>
                            {/* Main Row */}
                            <motion.tr
                              className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05, duration: 0.3 }}
                              onClick={() => toggleRowExpansion(booking.id)}
                            >
                              <td className="py-3 px-4 text-center">
                                {booking.paymentCount > 0 && (
                                  isExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-gray-600" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-gray-600" />
                                  )
                                )}
                              </td>
                              <td className="py-3 px-4 text-sm font-mono text-gray-900">
                                {booking.referenceNumber || 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                {booking.guestName || 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                <a href={`tel:${booking.guestPhone}`} className="hover:text-blue-600 transition-colors">
                                  {booking.guestPhone || 'N/A'}
                                </a>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {format(new Date(booking.checkInDate), 'MMM dd, yyyy')}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}
                              </td>
                              <td className="py-3 px-4 text-sm text-center text-gray-600">
                                {booking.nights}
                              </td>
                              <td className="py-3 px-4 text-sm font-mono text-gray-900">
                                {booking.roomNumbers}
                              </td>
                              <td className="py-3 px-4 text-sm">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-gray-900">₹{(booking.totalPrice || 0).toLocaleString()}</span>
                                  <span className="text-xs text-green-600">₹{(booking.totalPaid || 0).toLocaleString()} paid</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                  {booking.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                    {booking.paymentStatus || 'pending'}
                                  </span>
                                  {(booking.paymentCount || 0) > 0 && (
                                    <span className="text-xs text-gray-500">({booking.paymentCount})</span>
                                  )}
                                </div>
                              </td>
                            </motion.tr>

                            {/* Expanded Payment Details Row */}
                            {isExpanded && booking.payments && booking.payments.length > 0 && (
                              <tr className="bg-gray-50">
                                <td colSpan={11} className="py-4 px-8">
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                      Payment History ({booking.payments.length})
                                    </h4>
                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                      <table className="w-full">
                                        <thead className="bg-gray-100">
                                          <tr>
                                            <th className="text-left py-2 px-4 text-xs font-medium text-gray-700">Receipt #</th>
                                            <th className="text-left py-2 px-4 text-xs font-medium text-gray-700">Date</th>
                                            <th className="text-left py-2 px-4 text-xs font-medium text-gray-700">Amount</th>
                                            <th className="text-left py-2 px-4 text-xs font-medium text-gray-700">Type</th>
                                            <th className="text-left py-2 px-4 text-xs font-medium text-gray-700">Method</th>
                                            <th className="text-left py-2 px-4 text-xs font-medium text-gray-700">Status</th>
                                            <th className="text-left py-2 px-4 text-xs font-medium text-gray-700">Notes</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {booking.payments.map((payment, pIndex) => {
                                            // Safe date parsing
                                            let paymentDateStr = '-'
                                            try {
                                              if (payment.paymentDate) {
                                                paymentDateStr = format(new Date(payment.paymentDate), 'MMM dd, yyyy')
                                              }
                                            } catch (e) {
                                              paymentDateStr = 'Invalid date'
                                            }

                                            return (
                                              <tr key={payment.id} className={pIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="py-2 px-4 text-xs font-mono text-gray-900">
                                                  {payment.receiptNumber || '-'}
                                                </td>
                                                <td className="py-2 px-4 text-xs text-gray-600">
                                                  {paymentDateStr}
                                                </td>
                                                <td className="py-2 px-4 text-xs font-semibold text-green-600">
                                                  ₹{(payment.amount || 0).toLocaleString()}
                                                </td>
                                                <td className="py-2 px-4 text-xs text-gray-600 capitalize">
                                                  {payment.paymentType ? payment.paymentType.replace(/_/g, ' ') : '-'}
                                                </td>
                                                <td className="py-2 px-4 text-xs text-gray-600 capitalize">
                                                  {payment.paymentMethod || '-'}
                                                </td>
                                                <td className="py-2 px-4 text-xs">
                                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    payment.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                                    payment.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    payment.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                                                    payment.paymentStatus === 'refunded' ? 'bg-purple-100 text-purple-800' :
                                                    payment.paymentStatus === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-gray-100 text-gray-800'
                                                  }`}>
                                                    {payment.paymentStatus || 'unknown'}
                                                  </span>
                                                </td>
                                                <td className="py-2 px-4 text-xs text-gray-600 max-w-xs truncate">
                                                  {payment.notes || '-'}
                                                </td>
                                              </tr>
                                            )
                                          })}
                                        </tbody>
                                        <tfoot className="bg-gray-100 border-t border-gray-200">
                                          <tr>
                                            <td colSpan={2} className="py-2 px-4 text-xs font-semibold text-gray-900">
                                              Total Paid:
                                            </td>
                                            <td className="py-2 px-4 text-xs font-bold text-green-600">
                                              ₹{(booking.totalPaid || 0).toLocaleString()}
                                            </td>
                                            <td colSpan={4} className="py-2 px-4 text-xs text-gray-600">
                                              Balance: ₹{((booking.totalPrice || 0) - (booking.totalPaid || 0)).toLocaleString()}
                                            </td>
                                          </tr>
                                        </tfoot>
                                      </table>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
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
                <p className="text-gray-500 text-lg">No bookings found</p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your filters to see booking data
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

export default AdminBookings
