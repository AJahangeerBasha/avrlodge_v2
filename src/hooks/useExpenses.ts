import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAllExpenseCategories,
  getAllExpenseSubCategories,
  getAllExpenseItems,
  getExpenseCategoryById,
  getExpenseSubCategoryById,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  createExpenseSubCategory,
  updateExpenseSubCategory,
  deleteExpenseSubCategory,
  getExpenseCategoryStats,
  getExpenseCategoriesWithDetails,
  importExpenseDataFromJSON
} from '@/lib/expenses'
import {
  ExpenseCategory,
  ExpenseSubCategory,
  ExpenseItem,
  CreateExpenseCategoryData,
  UpdateExpenseCategoryData,
  CreateExpenseSubCategoryData,
  UpdateExpenseSubCategoryData,
  ExpenseCategoryFilters,
  ExpenseSubCategoryFilters,
  ExpenseItemFilters,
  ImportExpenseData
} from '@/lib/types/expenses'
import { useAuth } from '@/contexts/AuthContext'

// Query Keys
export const expenseKeys = {
  all: ['expenses'] as const,
  categories: () => [...expenseKeys.all, 'categories'] as const,
  category: (id: string) => [...expenseKeys.categories(), id] as const,
  categoriesWithDetails: () => [...expenseKeys.categories(), 'with-details'] as const,
  subCategories: () => [...expenseKeys.all, 'subcategories'] as const,
  subCategory: (id: string) => [...expenseKeys.subCategories(), id] as const,
  subCategoriesByCategory: (categoryId: string) => [...expenseKeys.subCategories(), 'category', categoryId] as const,
  items: () => [...expenseKeys.all, 'items'] as const,
  item: (id: string) => [...expenseKeys.items(), id] as const,
  stats: () => [...expenseKeys.all, 'stats'] as const,
}

// EXPENSE CATEGORIES HOOKS

export const useExpenseCategories = (filters?: ExpenseCategoryFilters) => {
  return useQuery({
    queryKey: [...expenseKeys.categories(), filters],
    queryFn: () => getAllExpenseCategories(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useExpenseCategory = (id: string) => {
  return useQuery({
    queryKey: expenseKeys.category(id),
    queryFn: () => getExpenseCategoryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useExpenseCategoriesWithDetails = () => {
  return useQuery({
    queryKey: expenseKeys.categoriesWithDetails(),
    queryFn: () => getExpenseCategoriesWithDetails(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateExpenseCategory = () => {
  const queryClient = useQueryClient()
  const { currentUser } = useAuth()

  return useMutation({
    mutationFn: (data: CreateExpenseCategoryData) => {
      if (!currentUser?.uid) throw new Error('User not authenticated')
      return createExpenseCategory(data, currentUser.uid)
    },
    onSuccess: () => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: expenseKeys.categories() })
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() })
    },
  })
}

export const useUpdateExpenseCategory = () => {
  const queryClient = useQueryClient()
  const { currentUser } = useAuth()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseCategoryData }) => {
      if (!currentUser?.uid) throw new Error('User not authenticated')
      return updateExpenseCategory(id, data, currentUser.uid)
    },
    onSuccess: (updatedCategory) => {
      // Update specific category in cache
      queryClient.setQueryData(
        expenseKeys.category(updatedCategory.id),
        updatedCategory
      )
      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: expenseKeys.categories() })
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() })
    },
  })
}

export const useDeleteExpenseCategory = () => {
  const queryClient = useQueryClient()
  const { currentUser } = useAuth()

  return useMutation({
    mutationFn: (id: string) => {
      if (!currentUser?.uid) throw new Error('User not authenticated')
      return deleteExpenseCategory(id, currentUser.uid)
    },
    onSuccess: () => {
      // Invalidate all categories queries
      queryClient.invalidateQueries({ queryKey: expenseKeys.categories() })
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() })
    },
  })
}

// EXPENSE SUBCATEGORIES HOOKS

export const useExpenseSubCategories = (filters?: ExpenseSubCategoryFilters) => {
  return useQuery({
    queryKey: [...expenseKeys.subCategories(), filters],
    queryFn: () => getAllExpenseSubCategories(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export const useExpenseSubCategory = (id: string) => {
  return useQuery({
    queryKey: expenseKeys.subCategory(id),
    queryFn: () => getExpenseSubCategoryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateExpenseSubCategory = () => {
  const queryClient = useQueryClient()
  const { currentUser } = useAuth()

  return useMutation({
    mutationFn: (data: CreateExpenseSubCategoryData) => {
      if (!currentUser?.uid) throw new Error('User not authenticated')
      return createExpenseSubCategory(data, currentUser.uid)
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: expenseKeys.subCategories() })
      queryClient.invalidateQueries({ queryKey: expenseKeys.categories() })
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() })
    },
  })
}

export const useUpdateExpenseSubCategory = () => {
  const queryClient = useQueryClient()
  const { currentUser } = useAuth()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseSubCategoryData }) => {
      if (!currentUser?.uid) throw new Error('User not authenticated')
      return updateExpenseSubCategory(id, data, currentUser.uid)
    },
    onSuccess: (updatedSubCategory) => {
      // Update specific subcategory in cache
      queryClient.setQueryData(
        expenseKeys.subCategory(updatedSubCategory.id),
        updatedSubCategory
      )
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: expenseKeys.subCategories() })
      queryClient.invalidateQueries({ queryKey: expenseKeys.categories() })
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() })
    },
  })
}

export const useDeleteExpenseSubCategory = () => {
  const queryClient = useQueryClient()
  const { currentUser } = useAuth()

  return useMutation({
    mutationFn: (id: string) => {
      if (!currentUser?.uid) throw new Error('User not authenticated')
      return deleteExpenseSubCategory(id, currentUser.uid)
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: expenseKeys.subCategories() })
      queryClient.invalidateQueries({ queryKey: expenseKeys.categories() })
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() })
    },
  })
}

// EXPENSE ITEMS HOOKS

export const useExpenseItems = (filters?: ExpenseItemFilters) => {
  return useQuery({
    queryKey: [...expenseKeys.items(), filters],
    queryFn: () => getAllExpenseItems(filters),
    staleTime: 5 * 60 * 1000,
  })
}

// STATISTICS HOOKS

export const useExpenseStats = () => {
  return useQuery({
    queryKey: expenseKeys.stats(),
    queryFn: () => getExpenseCategoryStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes for stats
  })
}

// IMPORT HOOKS

export const useImportExpenseData = () => {
  const queryClient = useQueryClient()
  const { currentUser } = useAuth()

  return useMutation({
    mutationFn: (data: ImportExpenseData) => {
      if (!currentUser?.uid) throw new Error('User not authenticated')
      return importExpenseDataFromJSON(data, currentUser.uid)
    },
    onSuccess: () => {
      // Invalidate all expense queries
      queryClient.invalidateQueries({ queryKey: expenseKeys.all })
    },
  })
}

// OPTIMISTIC UPDATES HELPERS

export const useOptimisticExpenseUpdates = () => {
  const queryClient = useQueryClient()

  const updateCategoryOptimistically = (categoryId: string, updates: Partial<ExpenseCategory>) => {
    queryClient.setQueryData<ExpenseCategory[]>(
      expenseKeys.categories(),
      (oldData) => {
        if (!oldData) return oldData
        return oldData.map(category =>
          category.id === categoryId
            ? { ...category, ...updates }
            : category
        )
      }
    )
  }

  const updateSubCategoryOptimistically = (subCategoryId: string, updates: Partial<ExpenseSubCategory>) => {
    queryClient.setQueryData<ExpenseSubCategory[]>(
      expenseKeys.subCategories(),
      (oldData) => {
        if (!oldData) return oldData
        return oldData.map(subCategory =>
          subCategory.id === subCategoryId
            ? { ...subCategory, ...updates }
            : subCategory
        )
      }
    )
  }

  return {
    updateCategoryOptimistically,
    updateSubCategoryOptimistically
  }
}

// ==================== EXPENSE ENTRIES HOOKS ====================

import {
  ExpenseEntry,
  CreateExpenseEntryData,
  UpdateExpenseEntryData,
  ExpenseEntryFilters
} from '@/lib/types/expenses'
import {
  getAllExpenseEntries,
  getExpenseEntryById,
  createExpenseEntry,
  updateExpenseEntry,
  deleteExpenseEntry
} from '@/lib/expenses'

// Query keys for expense entries
const expenseEntryKeys = {
  all: ['expenseEntries'] as const,
  lists: () => [...expenseEntryKeys.all, 'list'] as const,
  list: (filters?: ExpenseEntryFilters) => [...expenseEntryKeys.lists(), filters] as const,
  details: () => [...expenseEntryKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseEntryKeys.details(), id] as const
}

// Get all expense entries
export const useExpenseEntries = (filters?: ExpenseEntryFilters) => {
  return useQuery({
    queryKey: expenseEntryKeys.list(filters),
    queryFn: () => getAllExpenseEntries(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Get single expense entry
export const useExpenseEntry = (id: string) => {
  return useQuery({
    queryKey: expenseEntryKeys.detail(id),
    queryFn: () => getExpenseEntryById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  })
}

// Create expense entry
export const useCreateExpenseEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ data, userId }: { data: CreateExpenseEntryData; userId: string }) => {
      return createExpenseEntry(data, userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseEntryKeys.lists() })
    }
  })
}

// Update expense entry
export const useUpdateExpenseEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data, userId }: { id: string; data: UpdateExpenseEntryData; userId: string }) => {
      return updateExpenseEntry(id, data, userId)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: expenseEntryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: expenseEntryKeys.detail(variables.id) })
    }
  })
}

// Delete expense entry
export const useDeleteExpenseEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => {
      return deleteExpenseEntry(id, userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseEntryKeys.lists() })
    }
  })
}