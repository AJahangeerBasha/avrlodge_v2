import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { shallow } from 'zustand/shallow'

// Date filter types for revenue reports
export type RevenueDateFilterType =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'custom_date'
  | 'custom_range'

export type PaymentMethodFilter = 'all' | 'cash' | 'jubair' | 'basha'

interface RevenueFilters {
  dateFilterType: RevenueDateFilterType
  selectedMonth: string
  customDate: string
  customStartDate: string
  customEndDate: string
  paymentMethodFilter: PaymentMethodFilter
}

interface RevenueUIState {
  // Loading states
  isLoadingStats: boolean
  isExporting: boolean

  // Filter states
  filters: RevenueFilters

  // Pagination states
  currentPage: number
  itemsPerPage: number

  // Error states
  error: string | null
}

interface RevenueActions {
  // Filter actions
  setDateFilterType: (type: RevenueDateFilterType) => void
  setSelectedMonth: (month: string) => void
  setCustomDate: (date: string) => void
  setCustomDateRange: (startDate: string, endDate: string) => void
  setPaymentMethodFilter: (method: PaymentMethodFilter) => void

  // Pagination actions
  setCurrentPage: (page: number) => void
  setItemsPerPage: (items: number) => void

  // UI state actions
  setLoadingStats: (loading: boolean) => void
  setExporting: (exporting: boolean) => void
  setError: (error: string | null) => void

  // Reset actions
  resetFilters: () => void
  resetUIState: () => void
}

type RevenueStore = RevenueUIState & RevenueActions

const initialFilters: RevenueFilters = {
  dateFilterType: 'this_month',
  selectedMonth: new Date().toISOString().slice(0, 7), // YYYY-MM format
  customDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD format
  customStartDate: new Date().toISOString().slice(0, 10),
  customEndDate: new Date().toISOString().slice(0, 10),
  paymentMethodFilter: 'all',
}

const initialUIState: RevenueUIState = {
  isLoadingStats: false,
  isExporting: false,
  filters: initialFilters,
  currentPage: 1,
  itemsPerPage: 10,
  error: null,
}

export const useRevenueStore = create<RevenueStore>()(
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

        setPaymentMethodFilter: (method) =>
          set((state) => {
            state.filters.paymentMethodFilter = method
            state.currentPage = 1 // Reset to page 1 when filter changes
          }),

        // Pagination actions
        setCurrentPage: (page) =>
          set((state) => {
            state.currentPage = page
          }),

        setItemsPerPage: (items) =>
          set((state) => {
            state.itemsPerPage = items
            state.currentPage = 1 // Reset to page 1 when changing items per page
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
        name: 'revenue-store',
        // Only persist filters, not loading states
        partialize: (state) => ({
          filters: state.filters,
        }),
      }
    ),
    {
      name: 'revenue-store',
    }
  )
)

// Individual selectors for better performance (prevent unnecessary re-renders)
export const useDateFilterType = () => useRevenueStore((state) => state.filters.dateFilterType)
export const useSelectedMonth = () => useRevenueStore((state) => state.filters.selectedMonth)
export const useCustomDate = () => useRevenueStore((state) => state.filters.customDate)
export const useCustomStartDate = () => useRevenueStore((state) => state.filters.customStartDate)
export const useCustomEndDate = () => useRevenueStore((state) => state.filters.customEndDate)
export const usePaymentMethodFilter = () => useRevenueStore((state) => state.filters.paymentMethodFilter)

export const useIsLoadingStats = () => useRevenueStore((state) => state.isLoadingStats)
export const useIsExporting = () => useRevenueStore((state) => state.isExporting)
export const useRevenueError = () => useRevenueStore((state) => state.error)
export const useRevenueCurrentPage = () => useRevenueStore((state) => state.currentPage)
export const useRevenueItemsPerPage = () => useRevenueStore((state) => state.itemsPerPage)

// Action selectors
export const useSetDateFilterType = () => useRevenueStore((state) => state.setDateFilterType)
export const useSetSelectedMonth = () => useRevenueStore((state) => state.setSelectedMonth)
export const useSetCustomDate = () => useRevenueStore((state) => state.setCustomDate)
export const useSetCustomDateRange = () => useRevenueStore((state) => state.setCustomDateRange)
export const useSetPaymentMethodFilter = () => useRevenueStore((state) => state.setPaymentMethodFilter)
export const useSetRevenueCurrentPage = () => useRevenueStore((state) => state.setCurrentPage)
export const useSetRevenueItemsPerPage = () => useRevenueStore((state) => state.setItemsPerPage)
export const useSetLoadingStats = () => useRevenueStore((state) => state.setLoadingStats)
export const useSetExporting = () => useRevenueStore((state) => state.setExporting)
export const useSetError = () => useRevenueStore((state) => state.setError)
export const useResetFilters = () => useRevenueStore((state) => state.resetFilters)
export const useResetUIState = () => useRevenueStore((state) => state.resetUIState)