import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// Date filter types for financial reports
export type FinancialDateFilterType =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'custom_date'
  | 'custom_range'

interface FinancialFilters {
  dateFilterType: FinancialDateFilterType
  selectedMonth: string
  customDate: string
  customStartDate: string
  customEndDate: string
}

interface FinancialUIState {
  // Loading states
  isLoadingStats: boolean
  isExporting: boolean

  // Filter states
  filters: FinancialFilters

  // Pagination states
  currentPage: number
  itemsPerPage: number

  // Error states
  error: string | null
}

interface FinancialActions {
  // Filter actions
  setDateFilterType: (type: FinancialDateFilterType) => void
  setSelectedMonth: (month: string) => void
  setCustomDate: (date: string) => void
  setCustomDateRange: (startDate: string, endDate: string) => void

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

type FinancialStore = FinancialUIState & FinancialActions

const initialFilters: FinancialFilters = {
  dateFilterType: 'this_month',
  selectedMonth: new Date().toISOString().slice(0, 7), // YYYY-MM format
  customDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD format
  customStartDate: new Date().toISOString().slice(0, 10),
  customEndDate: new Date().toISOString().slice(0, 10),
}

const initialUIState: FinancialUIState = {
  isLoadingStats: false,
  isExporting: false,
  filters: initialFilters,
  currentPage: 1,
  itemsPerPage: 10,
  error: null,
}

export const useFinancialStore = create<FinancialStore>()(
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
        name: 'financial-store',
        // Only persist filters, not loading states
        partialize: (state) => ({
          filters: state.filters,
        }),
      }
    ),
    {
      name: 'financial-store',
    }
  )
)

// Individual selectors for better performance (prevent unnecessary re-renders)
export const useFinancialDateFilterType = () => useFinancialStore((state) => state.filters.dateFilterType)
export const useFinancialSelectedMonth = () => useFinancialStore((state) => state.filters.selectedMonth)
export const useFinancialCustomDate = () => useFinancialStore((state) => state.filters.customDate)
export const useFinancialCustomStartDate = () => useFinancialStore((state) => state.filters.customStartDate)
export const useFinancialCustomEndDate = () => useFinancialStore((state) => state.filters.customEndDate)

export const useFinancialIsLoadingStats = () => useFinancialStore((state) => state.isLoadingStats)
export const useFinancialIsExporting = () => useFinancialStore((state) => state.isExporting)
export const useFinancialError = () => useFinancialStore((state) => state.error)
export const useFinancialCurrentPage = () => useFinancialStore((state) => state.currentPage)
export const useFinancialItemsPerPage = () => useFinancialStore((state) => state.itemsPerPage)

// Action selectors
export const useFinancialSetDateFilterType = () => useFinancialStore((state) => state.setDateFilterType)
export const useFinancialSetSelectedMonth = () => useFinancialStore((state) => state.setSelectedMonth)
export const useFinancialSetCustomDate = () => useFinancialStore((state) => state.setCustomDate)
export const useFinancialSetCustomDateRange = () => useFinancialStore((state) => state.setCustomDateRange)
export const useFinancialSetCurrentPage = () => useFinancialStore((state) => state.setCurrentPage)
export const useFinancialSetItemsPerPage = () => useFinancialStore((state) => state.setItemsPerPage)
export const useFinancialSetLoadingStats = () => useFinancialStore((state) => state.setLoadingStats)
export const useFinancialSetExporting = () => useFinancialStore((state) => state.setExporting)
export const useFinancialSetError = () => useFinancialStore((state) => state.setError)
export const useFinancialResetFilters = () => useFinancialStore((state) => state.resetFilters)
export const useFinancialResetUIState = () => useFinancialStore((state) => state.resetUIState)
