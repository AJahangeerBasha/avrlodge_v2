import { create } from 'zustand'

export type BookingsReportDateFilterType =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'custom_date'
  | 'custom_range'

export type BookingsReportStatusFilter = 'all' | 'reservation' | 'booking' | 'checked_in' | 'checked_out' | 'cancelled'
export type BookingsReportPaymentStatusFilter = 'all' | 'pending' | 'partial' | 'paid'

interface BookingsReportState {
  // Filters
  dateFilterType: BookingsReportDateFilterType
  selectedMonth: string
  customDate: string
  customStartDate: string
  customEndDate: string
  statusFilter: BookingsReportStatusFilter
  paymentStatusFilter: BookingsReportPaymentStatusFilter

  // Pagination
  currentPage: number
  itemsPerPage: number

  // UI State
  isLoadingStats: boolean
  isExporting: boolean
  error: string | null

  // Actions
  setDateFilterType: (type: BookingsReportDateFilterType) => void
  setSelectedMonth: (month: string) => void
  setCustomDate: (date: string) => void
  setCustomDateRange: (startDate: string, endDate: string) => void
  setStatusFilter: (status: BookingsReportStatusFilter) => void
  setPaymentStatusFilter: (status: BookingsReportPaymentStatusFilter) => void
  setCurrentPage: (page: number) => void
  setItemsPerPage: (items: number) => void
  setLoadingStats: (loading: boolean) => void
  setExporting: (exporting: boolean) => void
  setError: (error: string | null) => void
}

const getCurrentYearMonth = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const getToday = () => {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

export const useBookingsReportStore = create<BookingsReportState>((set) => ({
  // Initial state
  dateFilterType: 'this_month',
  selectedMonth: getCurrentYearMonth(),
  customDate: getToday(),
  customStartDate: getToday(),
  customEndDate: getToday(),
  statusFilter: 'all',
  paymentStatusFilter: 'all',
  currentPage: 1,
  itemsPerPage: 10,
  isLoadingStats: false,
  isExporting: false,
  error: null,

  // Actions
  setDateFilterType: (type) => set({ dateFilterType: type, currentPage: 1 }),
  setSelectedMonth: (month) => set({ selectedMonth: month, currentPage: 1 }),
  setCustomDate: (date) => set({ customDate: date, currentPage: 1 }),
  setCustomDateRange: (startDate, endDate) =>
    set({ customStartDate: startDate, customEndDate: endDate, currentPage: 1 }),
  setStatusFilter: (status) => set({ statusFilter: status, currentPage: 1 }),
  setPaymentStatusFilter: (status) => set({ paymentStatusFilter: status, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setItemsPerPage: (items) => set({ itemsPerPage: items, currentPage: 1 }),
  setLoadingStats: (loading) => set({ isLoadingStats: loading }),
  setExporting: (exporting) => set({ isExporting: exporting }),
  setError: (error) => set({ error }),
}))

// Individual selectors for optimal performance
export const useBookingsReportDateFilterType = () => useBookingsReportStore((state) => state.dateFilterType)
export const useBookingsReportSelectedMonth = () => useBookingsReportStore((state) => state.selectedMonth)
export const useBookingsReportCustomDate = () => useBookingsReportStore((state) => state.customDate)
export const useBookingsReportCustomStartDate = () => useBookingsReportStore((state) => state.customStartDate)
export const useBookingsReportCustomEndDate = () => useBookingsReportStore((state) => state.customEndDate)
export const useBookingsReportStatusFilter = () => useBookingsReportStore((state) => state.statusFilter)
export const useBookingsReportPaymentStatusFilter = () => useBookingsReportStore((state) => state.paymentStatusFilter)
export const useBookingsReportCurrentPage = () => useBookingsReportStore((state) => state.currentPage)
export const useBookingsReportItemsPerPage = () => useBookingsReportStore((state) => state.itemsPerPage)
export const useBookingsReportIsLoadingStats = () => useBookingsReportStore((state) => state.isLoadingStats)
export const useBookingsReportIsExporting = () => useBookingsReportStore((state) => state.isExporting)
export const useBookingsReportError = () => useBookingsReportStore((state) => state.error)

// Action selectors
export const useBookingsReportSetDateFilterType = () => useBookingsReportStore((state) => state.setDateFilterType)
export const useBookingsReportSetSelectedMonth = () => useBookingsReportStore((state) => state.setSelectedMonth)
export const useBookingsReportSetCustomDate = () => useBookingsReportStore((state) => state.setCustomDate)
export const useBookingsReportSetCustomDateRange = () => useBookingsReportStore((state) => state.setCustomDateRange)
export const useBookingsReportSetStatusFilter = () => useBookingsReportStore((state) => state.setStatusFilter)
export const useBookingsReportSetPaymentStatusFilter = () => useBookingsReportStore((state) => state.setPaymentStatusFilter)
export const useBookingsReportSetCurrentPage = () => useBookingsReportStore((state) => state.setCurrentPage)
export const useBookingsReportSetItemsPerPage = () => useBookingsReportStore((state) => state.setItemsPerPage)
export const useBookingsReportSetLoadingStats = () => useBookingsReportStore((state) => state.setLoadingStats)
export const useBookingsReportSetExporting = () => useBookingsReportStore((state) => state.setExporting)
export const useBookingsReportSetError = () => useBookingsReportStore((state) => state.setError)
