import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// Expense management store types
export type ExpenseViewMode = 'grid' | 'list' | 'tree'
export type ExpenseFilterMode = 'all' | 'active' | 'inactive'
export type ExpenseSortField = 'name' | 'createdAt' | 'updatedAt'
export type ExpenseSortOrder = 'asc' | 'desc'

interface ExpenseFilters {
  searchTerm: string
  filterMode: ExpenseFilterMode
  selectedCategoryId: string | null
  sortField: ExpenseSortField
  sortOrder: ExpenseSortOrder
}

interface ExpenseUIState {
  // View states
  viewMode: ExpenseViewMode
  showInactive: boolean

  // Modal states
  isCreateCategoryModalOpen: boolean
  isEditCategoryModalOpen: boolean
  isCreateSubCategoryModalOpen: boolean
  isEditSubCategoryModalOpen: boolean
  isImportModalOpen: boolean
  isDeleteConfirmModalOpen: boolean

  // Loading states
  isLoading: boolean
  isSaving: boolean
  isDeleting: boolean
  isImporting: boolean

  // Filter states
  filters: ExpenseFilters

  // Selected items
  selectedCategoryId: string | null
  selectedSubCategoryId: string | null
  selectedItemId: string | null

  // Edit targets
  editingCategoryId: string | null
  editingSubCategoryId: string | null
  editingItemId: string | null

  // Delete targets
  deletingCategoryId: string | null
  deletingSubCategoryId: string | null
  deletingItemId: string | null

  // Error states
  error: string | null
  validationErrors: Record<string, string>

  // Bulk operations
  selectedCategoryIds: string[]
  selectedSubCategoryIds: string[]
  selectedItemIds: string[]
  bulkOperationMode: boolean
}

interface ExpenseActions {
  // View actions
  setViewMode: (mode: ExpenseViewMode) => void
  setShowInactive: (show: boolean) => void

  // Modal actions
  openCreateCategoryModal: () => void
  closeCreateCategoryModal: () => void
  openEditCategoryModal: (categoryId: string) => void
  closeEditCategoryModal: () => void
  openCreateSubCategoryModal: (categoryId?: string) => void
  closeCreateSubCategoryModal: () => void
  openEditSubCategoryModal: (subCategoryId: string) => void
  closeEditSubCategoryModal: () => void
  openImportModal: () => void
  closeImportModal: () => void
  openDeleteConfirmModal: (type: 'category' | 'subcategory' | 'item', id: string) => void
  closeDeleteConfirmModal: () => void

  // Loading actions
  setLoading: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  setDeleting: (deleting: boolean) => void
  setImporting: (importing: boolean) => void

  // Filter actions
  setSearchTerm: (term: string) => void
  setFilterMode: (mode: ExpenseFilterMode) => void
  setSelectedCategoryId: (categoryId: string | null) => void
  setSortField: (field: ExpenseSortField) => void
  setSortOrder: (order: ExpenseSortOrder) => void

  // Selection actions
  selectCategory: (categoryId: string | null) => void
  selectSubCategory: (subCategoryId: string | null) => void
  selectItem: (itemId: string | null) => void

  // Error actions
  setError: (error: string | null) => void
  setValidationError: (field: string, error: string) => void
  clearValidationErrors: () => void

  // Bulk selection actions
  toggleCategorySelection: (categoryId: string) => void
  toggleSubCategorySelection: (subCategoryId: string) => void
  toggleItemSelection: (itemId: string) => void
  selectAllCategories: (categoryIds: string[]) => void
  selectAllSubCategories: (subCategoryIds: string[]) => void
  selectAllItems: (itemIds: string[]) => void
  clearAllSelections: () => void
  setBulkOperationMode: (enabled: boolean) => void

  // Reset actions
  resetFilters: () => void
  resetUIState: () => void
  resetAllState: () => void
}

type ExpenseStore = ExpenseUIState & ExpenseActions

const initialFilters: ExpenseFilters = {
  searchTerm: '',
  filterMode: 'active',
  selectedCategoryId: null,
  sortField: 'name',
  sortOrder: 'asc'
}

const initialUIState: ExpenseUIState = {
  // View states
  viewMode: 'grid',
  showInactive: false,

  // Modal states
  isCreateCategoryModalOpen: false,
  isEditCategoryModalOpen: false,
  isCreateSubCategoryModalOpen: false,
  isEditSubCategoryModalOpen: false,
  isImportModalOpen: false,
  isDeleteConfirmModalOpen: false,

  // Loading states
  isLoading: false,
  isSaving: false,
  isDeleting: false,
  isImporting: false,

  // Filter states
  filters: initialFilters,

  // Selected items
  selectedCategoryId: null,
  selectedSubCategoryId: null,
  selectedItemId: null,

  // Edit targets
  editingCategoryId: null,
  editingSubCategoryId: null,
  editingItemId: null,

  // Delete targets
  deletingCategoryId: null,
  deletingSubCategoryId: null,
  deletingItemId: null,

  // Error states
  error: null,
  validationErrors: {},

  // Bulk operations
  selectedCategoryIds: [],
  selectedSubCategoryIds: [],
  selectedItemIds: [],
  bulkOperationMode: false
}

export const useExpenseStore = create<ExpenseStore>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialUIState,

        // View actions
        setViewMode: (mode) =>
          set((state) => {
            state.viewMode = mode
          }),

        setShowInactive: (show) =>
          set((state) => {
            state.showInactive = show
          }),

        // Modal actions
        openCreateCategoryModal: () =>
          set((state) => {
            state.isCreateCategoryModalOpen = true
            state.selectedCategoryId = null
          }),

        closeCreateCategoryModal: () =>
          set((state) => {
            state.isCreateCategoryModalOpen = false
          }),

        openEditCategoryModal: (categoryId) =>
          set((state) => {
            state.isEditCategoryModalOpen = true
            state.editingCategoryId = categoryId
          }),

        closeEditCategoryModal: () =>
          set((state) => {
            state.isEditCategoryModalOpen = false
            state.editingCategoryId = null
          }),

        openCreateSubCategoryModal: (categoryId) =>
          set((state) => {
            state.isCreateSubCategoryModalOpen = true
            if (categoryId) {
              state.selectedCategoryId = categoryId
            }
          }),

        closeCreateSubCategoryModal: () =>
          set((state) => {
            state.isCreateSubCategoryModalOpen = false
          }),

        openEditSubCategoryModal: (subCategoryId) =>
          set((state) => {
            state.isEditSubCategoryModalOpen = true
            state.editingSubCategoryId = subCategoryId
          }),

        closeEditSubCategoryModal: () =>
          set((state) => {
            state.isEditSubCategoryModalOpen = false
            state.editingSubCategoryId = null
          }),

        openImportModal: () =>
          set((state) => {
            state.isImportModalOpen = true
          }),

        closeImportModal: () =>
          set((state) => {
            state.isImportModalOpen = false
          }),

        openDeleteConfirmModal: (type, id) =>
          set((state) => {
            state.isDeleteConfirmModalOpen = true
            if (type === 'category') {
              state.deletingCategoryId = id
            } else if (type === 'subcategory') {
              state.deletingSubCategoryId = id
            } else if (type === 'item') {
              state.deletingItemId = id
            }
          }),

        closeDeleteConfirmModal: () =>
          set((state) => {
            state.isDeleteConfirmModalOpen = false
            state.deletingCategoryId = null
            state.deletingSubCategoryId = null
            state.deletingItemId = null
          }),

        // Loading actions
        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading
          }),

        setSaving: (saving) =>
          set((state) => {
            state.isSaving = saving
          }),

        setDeleting: (deleting) =>
          set((state) => {
            state.isDeleting = deleting
          }),

        setImporting: (importing) =>
          set((state) => {
            state.isImporting = importing
          }),

        // Filter actions
        setSearchTerm: (term) =>
          set((state) => {
            state.filters.searchTerm = term
          }),

        setFilterMode: (mode) =>
          set((state) => {
            state.filters.filterMode = mode
          }),

        setSelectedCategoryId: (categoryId) =>
          set((state) => {
            state.filters.selectedCategoryId = categoryId
          }),

        setSortField: (field) =>
          set((state) => {
            state.filters.sortField = field
          }),

        setSortOrder: (order) =>
          set((state) => {
            state.filters.sortOrder = order
          }),

        // Selection actions
        selectCategory: (categoryId) =>
          set((state) => {
            state.selectedCategoryId = categoryId
            state.selectedSubCategoryId = null
            state.selectedItemId = null
          }),

        selectSubCategory: (subCategoryId) =>
          set((state) => {
            state.selectedSubCategoryId = subCategoryId
            state.selectedItemId = null
          }),

        selectItem: (itemId) =>
          set((state) => {
            state.selectedItemId = itemId
          }),

        // Error actions
        setError: (error) =>
          set((state) => {
            state.error = error
          }),

        setValidationError: (field, error) =>
          set((state) => {
            state.validationErrors[field] = error
          }),

        clearValidationErrors: () =>
          set((state) => {
            state.validationErrors = {}
          }),

        // Bulk selection actions
        toggleCategorySelection: (categoryId) =>
          set((state) => {
            const index = state.selectedCategoryIds.indexOf(categoryId)
            if (index > -1) {
              state.selectedCategoryIds.splice(index, 1)
            } else {
              state.selectedCategoryIds.push(categoryId)
            }
          }),

        toggleSubCategorySelection: (subCategoryId) =>
          set((state) => {
            const index = state.selectedSubCategoryIds.indexOf(subCategoryId)
            if (index > -1) {
              state.selectedSubCategoryIds.splice(index, 1)
            } else {
              state.selectedSubCategoryIds.push(subCategoryId)
            }
          }),

        toggleItemSelection: (itemId) =>
          set((state) => {
            const index = state.selectedItemIds.indexOf(itemId)
            if (index > -1) {
              state.selectedItemIds.splice(index, 1)
            } else {
              state.selectedItemIds.push(itemId)
            }
          }),

        selectAllCategories: (categoryIds) =>
          set((state) => {
            state.selectedCategoryIds = [...categoryIds]
          }),

        selectAllSubCategories: (subCategoryIds) =>
          set((state) => {
            state.selectedSubCategoryIds = [...subCategoryIds]
          }),

        selectAllItems: (itemIds) =>
          set((state) => {
            state.selectedItemIds = [...itemIds]
          }),

        clearAllSelections: () =>
          set((state) => {
            state.selectedCategoryIds = []
            state.selectedSubCategoryIds = []
            state.selectedItemIds = []
          }),

        setBulkOperationMode: (enabled) =>
          set((state) => {
            state.bulkOperationMode = enabled
            if (!enabled) {
              state.selectedCategoryIds = []
              state.selectedSubCategoryIds = []
              state.selectedItemIds = []
            }
          }),

        // Reset actions
        resetFilters: () =>
          set((state) => {
            state.filters = { ...initialFilters }
          }),

        resetUIState: () =>
          set((state) => {
            Object.assign(state, {
              ...initialUIState,
              filters: state.filters // Keep current filters
            })
          }),

        resetAllState: () =>
          set((state) => {
            Object.assign(state, initialUIState)
          })
      })),
      {
        name: 'expense-store',
        // Only persist view preferences and filters
        partialize: (state) => ({
          viewMode: state.viewMode,
          showInactive: state.showInactive,
          filters: state.filters
        }),
      }
    ),
    {
      name: 'expense-store',
    }
  )
)

// Individual selectors for better performance (prevent unnecessary re-renders)
export const useExpenseViewMode = () => useExpenseStore((state) => state.viewMode)
export const useExpenseShowInactive = () => useExpenseStore((state) => state.showInactive)
export const useExpenseSearchTerm = () => useExpenseStore((state) => state.filters.searchTerm)
export const useExpenseFilterMode = () => useExpenseStore((state) => state.filters.filterMode)
export const useExpenseSelectedCategoryId = () => useExpenseStore((state) => state.filters.selectedCategoryId)
export const useExpenseSortField = () => useExpenseStore((state) => state.filters.sortField)
export const useExpenseSortOrder = () => useExpenseStore((state) => state.filters.sortOrder)

export const useExpenseIsCreateCategoryModalOpen = () => useExpenseStore((state) => state.isCreateCategoryModalOpen)
export const useExpenseIsEditCategoryModalOpen = () => useExpenseStore((state) => state.isEditCategoryModalOpen)
export const useExpenseIsCreateSubCategoryModalOpen = () => useExpenseStore((state) => state.isCreateSubCategoryModalOpen)
export const useExpenseIsEditSubCategoryModalOpen = () => useExpenseStore((state) => state.isEditSubCategoryModalOpen)
export const useExpenseIsImportModalOpen = () => useExpenseStore((state) => state.isImportModalOpen)
export const useExpenseIsDeleteConfirmModalOpen = () => useExpenseStore((state) => state.isDeleteConfirmModalOpen)

export const useExpenseIsLoading = () => useExpenseStore((state) => state.isLoading)
export const useExpenseIsSaving = () => useExpenseStore((state) => state.isSaving)
export const useExpenseIsDeleting = () => useExpenseStore((state) => state.isDeleting)
export const useExpenseIsImporting = () => useExpenseStore((state) => state.isImporting)

export const useExpenseCurrentSelectedCategoryId = () => useExpenseStore((state) => state.selectedCategoryId)
export const useExpenseSelectedSubCategoryId = () => useExpenseStore((state) => state.selectedSubCategoryId)
export const useExpenseSelectedItemId = () => useExpenseStore((state) => state.selectedItemId)

export const useExpenseEditingCategoryId = () => useExpenseStore((state) => state.editingCategoryId)
export const useExpenseEditingSubCategoryId = () => useExpenseStore((state) => state.editingSubCategoryId)
export const useExpenseEditingItemId = () => useExpenseStore((state) => state.editingItemId)

export const useExpenseDeletingCategoryId = () => useExpenseStore((state) => state.deletingCategoryId)
export const useExpenseDeletingSubCategoryId = () => useExpenseStore((state) => state.deletingSubCategoryId)
export const useExpenseDeletingItemId = () => useExpenseStore((state) => state.deletingItemId)

export const useExpenseError = () => useExpenseStore((state) => state.error)
export const useExpenseValidationErrors = () => useExpenseStore((state) => state.validationErrors)

export const useExpenseBulkOperationMode = () => useExpenseStore((state) => state.bulkOperationMode)
export const useExpenseSelectedCategoryIds = () => useExpenseStore((state) => state.selectedCategoryIds)
export const useExpenseSelectedSubCategoryIds = () => useExpenseStore((state) => state.selectedSubCategoryIds)
export const useExpenseSelectedItemIds = () => useExpenseStore((state) => state.selectedItemIds)

// Individual action selectors to prevent infinite loops
export const useExpenseSetViewMode = () => useExpenseStore((state) => state.setViewMode)
export const useExpenseSetShowInactive = () => useExpenseStore((state) => state.setShowInactive)
export const useExpenseOpenCreateCategoryModal = () => useExpenseStore((state) => state.openCreateCategoryModal)
export const useExpenseCloseCreateCategoryModal = () => useExpenseStore((state) => state.closeCreateCategoryModal)
export const useExpenseOpenEditCategoryModal = () => useExpenseStore((state) => state.openEditCategoryModal)
export const useExpenseCloseEditCategoryModal = () => useExpenseStore((state) => state.closeEditCategoryModal)
export const useExpenseOpenCreateSubCategoryModal = () => useExpenseStore((state) => state.openCreateSubCategoryModal)
export const useExpenseCloseCreateSubCategoryModal = () => useExpenseStore((state) => state.closeCreateSubCategoryModal)
export const useExpenseOpenEditSubCategoryModal = () => useExpenseStore((state) => state.openEditSubCategoryModal)
export const useExpenseCloseEditSubCategoryModal = () => useExpenseStore((state) => state.closeEditSubCategoryModal)
export const useExpenseOpenImportModal = () => useExpenseStore((state) => state.openImportModal)
export const useExpenseCloseImportModal = () => useExpenseStore((state) => state.closeImportModal)
export const useExpenseOpenDeleteConfirmModal = () => useExpenseStore((state) => state.openDeleteConfirmModal)
export const useExpenseCloseDeleteConfirmModal = () => useExpenseStore((state) => state.closeDeleteConfirmModal)
export const useExpenseSetLoading = () => useExpenseStore((state) => state.setLoading)
export const useExpenseSetSaving = () => useExpenseStore((state) => state.setSaving)
export const useExpenseSetDeleting = () => useExpenseStore((state) => state.setDeleting)
export const useExpenseSetImporting = () => useExpenseStore((state) => state.setImporting)
export const useExpenseSetSearchTerm = () => useExpenseStore((state) => state.setSearchTerm)
export const useExpenseSetFilterMode = () => useExpenseStore((state) => state.setFilterMode)
export const useExpenseSetSelectedCategoryId = () => useExpenseStore((state) => state.setSelectedCategoryId)
export const useExpenseSetSortField = () => useExpenseStore((state) => state.setSortField)
export const useExpenseSetSortOrder = () => useExpenseStore((state) => state.setSortOrder)
export const useExpenseSelectCategory = () => useExpenseStore((state) => state.selectCategory)
export const useExpenseSelectSubCategory = () => useExpenseStore((state) => state.selectSubCategory)
export const useExpenseSelectItem = () => useExpenseStore((state) => state.selectItem)
export const useExpenseSetError = () => useExpenseStore((state) => state.setError)
export const useExpenseSetValidationError = () => useExpenseStore((state) => state.setValidationError)
export const useExpenseClearValidationErrors = () => useExpenseStore((state) => state.clearValidationErrors)
export const useExpenseToggleCategorySelection = () => useExpenseStore((state) => state.toggleCategorySelection)
export const useExpenseToggleSubCategorySelection = () => useExpenseStore((state) => state.toggleSubCategorySelection)
export const useExpenseToggleItemSelection = () => useExpenseStore((state) => state.toggleItemSelection)
export const useExpenseSelectAllCategories = () => useExpenseStore((state) => state.selectAllCategories)
export const useExpenseSelectAllSubCategories = () => useExpenseStore((state) => state.selectAllSubCategories)
export const useExpenseSelectAllItems = () => useExpenseStore((state) => state.selectAllItems)
export const useExpenseClearAllSelections = () => useExpenseStore((state) => state.clearAllSelections)
export const useExpenseSetBulkOperationMode = () => useExpenseStore((state) => state.setBulkOperationMode)
export const useExpenseResetFilters = () => useExpenseStore((state) => state.resetFilters)
export const useExpenseResetUIState = () => useExpenseStore((state) => state.resetUIState)
export const useExpenseResetAllState = () => useExpenseStore((state) => state.resetAllState)