// Expense Management Types

export interface ExpenseItem {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  deletedAt?: string | null
  deletedBy?: string | null
}

export interface ExpenseSubCategory {
  id: string
  name: string
  description?: string
  categoryId: string
  items?: ExpenseItem[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  deletedAt?: string | null
  deletedBy?: string | null
}

export interface ExpenseCategory {
  id: string
  name: string
  description?: string
  subCategories?: ExpenseSubCategory[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  deletedAt?: string | null
  deletedBy?: string | null
}

export interface CreateExpenseCategoryData {
  name: string
  description?: string
}

export interface UpdateExpenseCategoryData {
  name?: string
  description?: string
  isActive?: boolean
}

export interface CreateExpenseSubCategoryData {
  name: string
  description?: string
  categoryId: string
}

export interface UpdateExpenseSubCategoryData {
  name?: string
  description?: string
  categoryId?: string
  isActive?: boolean
}

export interface CreateExpenseItemData {
  name: string
  description?: string
  subCategoryId: string
}

export interface UpdateExpenseItemData {
  name?: string
  description?: string
  subCategoryId?: string
  isActive?: boolean
}

export interface ExpenseCategoryFilters {
  isActive?: boolean
  searchTerm?: string
  createdBy?: string
}

export interface ExpenseSubCategoryFilters {
  isActive?: boolean
  categoryId?: string
  searchTerm?: string
  createdBy?: string
}

export interface ExpenseItemFilters {
  isActive?: boolean
  subCategoryId?: string
  categoryId?: string
  searchTerm?: string
  createdBy?: string
}

export interface ExpenseCategoryStats {
  totalCategories: number
  activeCategories: number
  totalSubCategories: number
  activeSubCategories: number
  totalItems: number
  activeItems: number
}

// For populating related data
export interface ExpenseCategoryWithDetails extends ExpenseCategory {
  subCategories: ExpenseSubCategoryWithDetails[]
  subCategoryCount: number
  itemCount: number
}

export interface ExpenseSubCategoryWithDetails extends ExpenseSubCategory {
  category?: ExpenseCategory
  items: ExpenseItem[]
  itemCount: number
}

export interface ExpenseItemWithDetails extends ExpenseItem {
  subCategory?: ExpenseSubCategory
  category?: ExpenseCategory
}

// Import/Export structures
export interface ImportExpenseData {
  categories: Array<{
    category: string
    subCategories: Array<{
      name: string
      items?: string[]
    }>
  }>
}

// Expense Entry/Transaction (actual expense records)
export interface ExpenseEntry {
  id: string
  expenseId: string // Auto-generated: EXP-MMYYYY-XXXXX
  date: string // ISO date string
  categoryId: string
  categoryName: string
  subCategoryId: string
  subCategoryName: string
  description: string
  amount: number
  currency: 'INR'
  paymentMode: 'Cash' | 'Bank Transfer' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Cheque'
  vendor?: string
  status: 'Paid' | 'Pending' | 'Cancelled'
  receiptNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  deletedAt?: string | null
  deletedBy?: string | null
}

export interface CreateExpenseEntryData {
  date: string
  categoryId: string
  subCategoryId: string
  description: string
  amount: number
  paymentMode: 'Cash' | 'Bank Transfer' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Cheque'
  vendor?: string
  status: 'Paid' | 'Pending' | 'Cancelled'
  receiptNumber?: string
  notes?: string
}

export interface UpdateExpenseEntryData {
  date?: string
  categoryId?: string
  subCategoryId?: string
  description?: string
  amount?: number
  paymentMode?: 'Cash' | 'Bank Transfer' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Cheque'
  vendor?: string
  status?: 'Paid' | 'Pending' | 'Cancelled'
  receiptNumber?: string
  notes?: string
}

export interface ExpenseEntryFilters {
  categoryId?: string
  subCategoryId?: string
  status?: 'Paid' | 'Pending' | 'Cancelled'
  paymentMode?: string
  startDate?: string
  endDate?: string
  searchTerm?: string
  createdBy?: string
}

export interface ExpenseTreeNode {
  id: string
  type: 'category' | 'subcategory' | 'item'
  name: string
  description?: string
  isActive: boolean
  children?: ExpenseTreeNode[]
  parent?: string
  level: number
}

// Validation interfaces
export interface ExpenseValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface ExpenseNameValidation {
  categoryName?: string
  subCategoryName?: string
  itemName?: string
  isValid: boolean
  errorMessage?: string
}

// Bulk operations
export interface BulkExpenseOperation {
  type: 'create' | 'update' | 'delete'
  targetType: 'category' | 'subcategory' | 'item'
  items: Array<{
    id?: string
    data: any
  }>
}

export interface BulkExpenseResult {
  success: number
  failed: number
  errors: Array<{
    item: any
    error: string
  }>
}

// Search and filtering
export interface ExpenseSearchResult {
  categories: ExpenseCategory[]
  subCategories: ExpenseSubCategory[]
  items: ExpenseItem[]
  totalResults: number
}

export interface ExpenseHierarchy {
  category: ExpenseCategory
  subCategories: Array<{
    subCategory: ExpenseSubCategory
    items: ExpenseItem[]
  }>
}

// Analytics and reporting
export interface ExpenseAnalytics {
  categoriesOverTime: Array<{
    date: string
    count: number
  }>
  topCategories: Array<{
    category: ExpenseCategory
    subCategoryCount: number
    itemCount: number
  }>
  recentActivity: Array<{
    type: 'created' | 'updated' | 'deleted'
    targetType: 'category' | 'subcategory' | 'item'
    targetName: string
    performedBy: string
    performedAt: string
  }>
}

// Audit trail
export interface ExpenseAuditLog {
  id: string
  targetType: 'category' | 'subcategory' | 'item'
  targetId: string
  action: 'created' | 'updated' | 'deleted' | 'restored'
  changes?: Record<string, { from: any; to: any }>
  performedBy: string
  performedAt: string
  details?: Record<string, any>
}

// Default expense categories from JSON
export const DEFAULT_EXPENSE_CATEGORIES = [
  'Utilities',
  'Purchases & Consumables',
  'Salaries & Wages',
  'Maintenance & Repairs',
  'Marketing & Promotion',
  'Bank & Finance',
  'Licenses & Legal',
  'Insurance',
  'Miscellaneous Expenses'
] as const

export type DefaultExpenseCategory = typeof DEFAULT_EXPENSE_CATEGORIES[number]