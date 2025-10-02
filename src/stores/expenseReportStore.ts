import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// Date filter types for expense reports
export type ExpenseReportDateFilterType =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'custom_date'
  | 'custom_range'

export type ExpenseReportPaymentModeFilter = 'all' | 'cash' | 'bank' | 'upi' | 'card'
export type ExpenseReportStatusFilter = 'all' | 'paid' | 'pending' | 'cancelled'

interface ExpenseReportFilters {
  dateFilterType: ExpenseReportDateFilterType
  selectedMonth: string
  customDate: string
  customStartDate: string
  customEndDate: string
  paymentModeFilter: ExpenseReportPaymentModeFilter
  statusFilter: ExpenseReportStatusFilter
}

interface ExpenseReportUIState {
  // Loading states
  isLoadingStats: boolean
  isExporting: boolean

  // Filter states
  filters: ExpenseReportFilters

  // Error states
  error: string | null
}

interface ExpenseReportActions {
  // Filter actions
  setDateFilterType: (type: ExpenseReportDateFilterType) => void
  setSelectedMonth: (month: string) => void
  setCustomDate: (date: string) => void
  setCustomDateRange: (startDate: string, endDate: string) => void
  setPaymentModeFilter: (mode: ExpenseReportPaymentModeFilter) => void
  setStatusFilter: (status: ExpenseReportStatusFilter) => void

  // UI state actions
  setLoadingStats: (loading: boolean) => void
  setExporting: (exporting: boolean) => void
  setError: (error: string | null) => void

  // Reset actions
  resetFilters: () => void
  resetUIState: () => void
}

type ExpenseReportStore = ExpenseReportUIState & ExpenseReportActions

const initialFilters: ExpenseReportFilters = {
  dateFilterType: 'this_month',
  selectedMonth: new Date().toISOString().slice(0, 7), // YYYY-MM format
  customDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD format
  customStartDate: new Date().toISOString().slice(0, 10),
  customEndDate: new Date().toISOString().slice(0, 10),
  paymentModeFilter: 'all',
  statusFilter: 'all',
}

const initialUIState: ExpenseReportUIState = {
  isLoadingStats: false,
  isExporting: false,
  filters: initialFilters,
  error: null,
}

export const useExpenseReportStore = create<ExpenseReportStore>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialUIState,

        // Filter actions
        setDateFilterType: (type) =>
          set((state) => {
            state.filters.dateFilterType = type
          }),

        setSelectedMonth: (month) =>
          set((state) => {
            state.filters.selectedMonth = month
          }),

        setCustomDate: (date) =>
          set((state) => {
            state.filters.customDate = date
          }),

        setCustomDateRange: (startDate, endDate) =>
          set((state) => {
            state.filters.customStartDate = startDate
            state.filters.customEndDate = endDate
          }),

        setPaymentModeFilter: (mode) =>
          set((state) => {
            state.filters.paymentModeFilter = mode
          }),

        setStatusFilter: (status) =>
          set((state) => {
            state.filters.statusFilter = status
          }),

        // UI state actions
        setLoadingStats: (loading) =>
          set((state) => {
            state.isLoadingStats = loading
          }),

        setExporting: (exporting) =>
          set((state) => {
            state.isExporting = exporting
          }),

        setError: (error) =>
          set((state) => {
            state.error = error
          }),

        // Reset actions
        resetFilters: () =>
          set((state) => {
            state.filters = { ...initialFilters }
          }),

        resetUIState: () =>
          set((state) => {
            state.isLoadingStats = false
            state.isExporting = false
            state.error = null
          }),
      })),
      {
        name: 'expense-report-store',
        // Only persist filters, not loading states
        partialize: (state) => ({
          filters: state.filters,
        }),
      }
    ),
    {
      name: 'expense-report-store',
    }
  )
)

// Individual selectors for better performance (prevent unnecessary re-renders)
export const useExpenseReportDateFilterType = () => useExpenseReportStore((state) => state.filters.dateFilterType)
export const useExpenseReportSelectedMonth = () => useExpenseReportStore((state) => state.filters.selectedMonth)
export const useExpenseReportCustomDate = () => useExpenseReportStore((state) => state.filters.customDate)
export const useExpenseReportCustomStartDate = () => useExpenseReportStore((state) => state.filters.customStartDate)
export const useExpenseReportCustomEndDate = () => useExpenseReportStore((state) => state.filters.customEndDate)
export const useExpenseReportPaymentModeFilter = () => useExpenseReportStore((state) => state.filters.paymentModeFilter)
export const useExpenseReportStatusFilter = () => useExpenseReportStore((state) => state.filters.statusFilter)

export const useExpenseReportIsLoadingStats = () => useExpenseReportStore((state) => state.isLoadingStats)
export const useExpenseReportIsExporting = () => useExpenseReportStore((state) => state.isExporting)
export const useExpenseReportError = () => useExpenseReportStore((state) => state.error)

// Action selectors
export const useExpenseReportSetDateFilterType = () => useExpenseReportStore((state) => state.setDateFilterType)
export const useExpenseReportSetSelectedMonth = () => useExpenseReportStore((state) => state.setSelectedMonth)
export const useExpenseReportSetCustomDate = () => useExpenseReportStore((state) => state.setCustomDate)
export const useExpenseReportSetCustomDateRange = () => useExpenseReportStore((state) => state.setCustomDateRange)
export const useExpenseReportSetPaymentModeFilter = () => useExpenseReportStore((state) => state.setPaymentModeFilter)
export const useExpenseReportSetStatusFilter = () => useExpenseReportStore((state) => state.setStatusFilter)
export const useExpenseReportSetLoadingStats = () => useExpenseReportStore((state) => state.setLoadingStats)
export const useExpenseReportSetExporting = () => useExpenseReportStore((state) => state.setExporting)
export const useExpenseReportSetError = () => useExpenseReportStore((state) => state.setError)
export const useExpenseReportResetFilters = () => useExpenseReportStore((state) => state.resetFilters)
export const useExpenseReportResetUIState = () => useExpenseReportStore((state) => state.resetUIState)
