import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import {
  ExpenseCategory,
  ExpenseSubCategory,
  ExpenseItem,
  CreateExpenseCategoryData,
  UpdateExpenseCategoryData,
  CreateExpenseSubCategoryData,
  UpdateExpenseSubCategoryData,
  CreateExpenseItemData,
  UpdateExpenseItemData,
  ExpenseCategoryFilters,
  ExpenseSubCategoryFilters,
  ExpenseItemFilters,
  ExpenseCategoryStats,
  ExpenseCategoryWithDetails,
  ExpenseSubCategoryWithDetails,
  ExpenseItemWithDetails,
  ImportExpenseData,
  ExpenseEntry,
  CreateExpenseEntryData,
  UpdateExpenseEntryData,
  ExpenseEntryFilters
} from './types/expenses'

const EXPENSE_CATEGORIES_COLLECTION = 'expenseCategories'
const EXPENSE_SUBCATEGORIES_COLLECTION = 'expenseSubCategories'
const EXPENSE_ITEMS_COLLECTION = 'expenseItems'
const EXPENSE_ENTRIES_COLLECTION = 'expenses'
const EXPENSE_COUNTERS_COLLECTION = 'counters'

// Utility function to convert Firestore timestamp
const convertTimestamp = (timestamp: any): string => {
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000).toISOString()
  }
  return timestamp || new Date().toISOString()
}

// Convert Firestore data to ExpenseCategory
const convertFirestoreToExpenseCategory = (doc: any): ExpenseCategory => {
  const data = doc.data()
  return {
    id: doc.id,
    name: data.name,
    description: data.description || undefined,
    isActive: data.isActive ?? true,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    deletedAt: data.deletedAt ? convertTimestamp(data.deletedAt) : null,
    deletedBy: data.deletedBy || null
  }
}

// Convert Firestore data to ExpenseSubCategory
const convertFirestoreToExpenseSubCategory = (doc: any): ExpenseSubCategory => {
  const data = doc.data()
  return {
    id: doc.id,
    name: data.name,
    description: data.description || undefined,
    categoryId: data.categoryId,
    isActive: data.isActive ?? true,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    deletedAt: data.deletedAt ? convertTimestamp(data.deletedAt) : null,
    deletedBy: data.deletedBy || null
  }
}

// Convert Firestore data to ExpenseItem
const convertFirestoreToExpenseItem = (doc: any): ExpenseItem => {
  const data = doc.data()
  return {
    id: doc.id,
    name: data.name,
    description: data.description || undefined,
    isActive: data.isActive ?? true,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    deletedAt: data.deletedAt ? convertTimestamp(data.deletedAt) : null,
    deletedBy: data.deletedBy || null
  }
}

// EXPENSE CATEGORIES CRUD

export const getAllExpenseCategories = async (filters?: ExpenseCategoryFilters): Promise<ExpenseCategory[]> => {
  try {
    const categoriesRef = collection(db, EXPENSE_CATEGORIES_COLLECTION)
    let q = query(categoriesRef, orderBy('name', 'asc'))

    // Apply filters
    if (filters?.isActive !== undefined) {
      q = query(q, where('isActive', '==', filters.isActive))
    }

    const snapshot = await getDocs(q)
    let categories = snapshot.docs.map(convertFirestoreToExpenseCategory)

    // Client-side filtering for soft delete and search
    categories = categories.filter(category => !category.deletedAt)

    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase()
      categories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm) ||
        category.description?.toLowerCase().includes(searchTerm)
      )
    }

    return categories
  } catch (error) {
    console.error('Error fetching expense categories:', error)
    throw error
  }
}

export const getExpenseCategoryById = async (id: string): Promise<ExpenseCategory | null> => {
  try {
    const docRef = doc(db, EXPENSE_CATEGORIES_COLLECTION, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const category = convertFirestoreToExpenseCategory(docSnap)
      return category.deletedAt ? null : category
    }

    return null
  } catch (error) {
    console.error('Error fetching expense category:', error)
    throw error
  }
}

export const createExpenseCategory = async (
  data: CreateExpenseCategoryData,
  userId: string
): Promise<ExpenseCategory> => {
  try {
    const categoriesRef = collection(db, EXPENSE_CATEGORIES_COLLECTION)
    const now = serverTimestamp()

    const categoryData = {
      name: data.name,
      description: data.description || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
      deletedAt: null,
      deletedBy: null
    }

    const docRef = await addDoc(categoriesRef, categoryData)
    const newCategory = await getExpenseCategoryById(docRef.id)

    if (!newCategory) {
      throw new Error('Failed to create expense category')
    }

    return newCategory
  } catch (error) {
    console.error('Error creating expense category:', error)
    throw error
  }
}

export const updateExpenseCategory = async (
  id: string,
  data: UpdateExpenseCategoryData,
  userId: string
): Promise<ExpenseCategory> => {
  try {
    const docRef = doc(db, EXPENSE_CATEGORIES_COLLECTION, id)
    const updateData: any = {
      updatedAt: serverTimestamp(),
      updatedBy: userId
    }

    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    await updateDoc(docRef, updateData)
    const updatedCategory = await getExpenseCategoryById(id)

    if (!updatedCategory) {
      throw new Error('Failed to update expense category')
    }

    return updatedCategory
  } catch (error) {
    console.error('Error updating expense category:', error)
    throw error
  }
}

export const deleteExpenseCategory = async (id: string, userId: string): Promise<void> => {
  try {
    const docRef = doc(db, EXPENSE_CATEGORIES_COLLECTION, id)
    await updateDoc(docRef, {
      deletedAt: serverTimestamp(),
      deletedBy: userId,
      isActive: false,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })
  } catch (error) {
    console.error('Error deleting expense category:', error)
    throw error
  }
}

// EXPENSE SUBCATEGORIES CRUD

export const getAllExpenseSubCategories = async (filters?: ExpenseSubCategoryFilters): Promise<ExpenseSubCategory[]> => {
  try {
    const subCategoriesRef = collection(db, EXPENSE_SUBCATEGORIES_COLLECTION)
    let q = query(subCategoriesRef, orderBy('name', 'asc'))

    // Apply filters
    if (filters?.isActive !== undefined) {
      q = query(q, where('isActive', '==', filters.isActive))
    }

    if (filters?.categoryId) {
      q = query(q, where('categoryId', '==', filters.categoryId))
    }

    const snapshot = await getDocs(q)
    let subCategories = snapshot.docs.map(convertFirestoreToExpenseSubCategory)

    // Client-side filtering for soft delete and search
    subCategories = subCategories.filter(subCategory => !subCategory.deletedAt)

    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase()
      subCategories = subCategories.filter(subCategory =>
        subCategory.name.toLowerCase().includes(searchTerm) ||
        subCategory.description?.toLowerCase().includes(searchTerm)
      )
    }

    return subCategories
  } catch (error) {
    console.error('Error fetching expense subcategories:', error)
    throw error
  }
}

export const createExpenseSubCategory = async (
  data: CreateExpenseSubCategoryData,
  userId: string
): Promise<ExpenseSubCategory> => {
  try {
    const subCategoriesRef = collection(db, EXPENSE_SUBCATEGORIES_COLLECTION)
    const now = serverTimestamp()

    const subCategoryData = {
      name: data.name,
      description: data.description || null,
      categoryId: data.categoryId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
      deletedAt: null,
      deletedBy: null
    }

    const docRef = await addDoc(subCategoriesRef, subCategoryData)
    const newSubCategory = await getExpenseSubCategoryById(docRef.id)

    if (!newSubCategory) {
      throw new Error('Failed to create expense subcategory')
    }

    return newSubCategory
  } catch (error) {
    console.error('Error creating expense subcategory:', error)
    throw error
  }
}

export const getExpenseSubCategoryById = async (id: string): Promise<ExpenseSubCategory | null> => {
  try {
    const docRef = doc(db, EXPENSE_SUBCATEGORIES_COLLECTION, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const subCategory = convertFirestoreToExpenseSubCategory(docSnap)
      return subCategory.deletedAt ? null : subCategory
    }

    return null
  } catch (error) {
    console.error('Error fetching expense subcategory:', error)
    throw error
  }
}

export const updateExpenseSubCategory = async (
  id: string,
  data: UpdateExpenseSubCategoryData,
  userId: string
): Promise<ExpenseSubCategory> => {
  try {
    const docRef = doc(db, EXPENSE_SUBCATEGORIES_COLLECTION, id)
    const updateData: any = {
      updatedAt: serverTimestamp(),
      updatedBy: userId
    }

    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    await updateDoc(docRef, updateData)
    const updatedSubCategory = await getExpenseSubCategoryById(id)

    if (!updatedSubCategory) {
      throw new Error('Failed to update expense subcategory')
    }

    return updatedSubCategory
  } catch (error) {
    console.error('Error updating expense subcategory:', error)
    throw error
  }
}

export const deleteExpenseSubCategory = async (id: string, userId: string): Promise<void> => {
  try {
    const docRef = doc(db, EXPENSE_SUBCATEGORIES_COLLECTION, id)
    await updateDoc(docRef, {
      deletedAt: serverTimestamp(),
      deletedBy: userId,
      isActive: false,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })
  } catch (error) {
    console.error('Error deleting expense subcategory:', error)
    throw error
  }
}

// EXPENSE ITEMS CRUD

export const getAllExpenseItems = async (filters?: ExpenseItemFilters): Promise<ExpenseItem[]> => {
  try {
    const itemsRef = collection(db, EXPENSE_ITEMS_COLLECTION)
    let q = query(itemsRef, orderBy('name', 'asc'))

    // Apply filters
    if (filters?.isActive !== undefined) {
      q = query(q, where('isActive', '==', filters.isActive))
    }

    const snapshot = await getDocs(q)
    let items = snapshot.docs.map(convertFirestoreToExpenseItem)

    // Client-side filtering for soft delete and search
    items = items.filter(item => !item.deletedAt)

    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase()
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm)
      )
    }

    return items
  } catch (error) {
    console.error('Error fetching expense items:', error)
    throw error
  }
}

// STATISTICS AND ANALYTICS

export const getExpenseCategoryStats = async (): Promise<ExpenseCategoryStats> => {
  try {
    const [categories, subCategories, items] = await Promise.all([
      getAllExpenseCategories(),
      getAllExpenseSubCategories(),
      getAllExpenseItems()
    ])

    return {
      totalCategories: categories.length,
      activeCategories: categories.filter(c => c.isActive).length,
      totalSubCategories: subCategories.length,
      activeSubCategories: subCategories.filter(sc => sc.isActive).length,
      totalItems: items.length,
      activeItems: items.filter(i => i.isActive).length
    }
  } catch (error) {
    console.error('Error fetching expense stats:', error)
    throw error
  }
}

// BULK IMPORT FROM JSON

export const importExpenseDataFromJSON = async (
  importData: ImportExpenseData,
  userId: string
): Promise<{ success: number; errors: string[] }> => {
  try {
    const batch = writeBatch(db)
    let success = 0
    const errors: string[] = []

    for (const categoryData of importData.categories) {
      try {
        // Create category
        const categoryRef = doc(collection(db, EXPENSE_CATEGORIES_COLLECTION))
        const now = serverTimestamp()

        batch.set(categoryRef, {
          name: categoryData.category,
          description: null,
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: userId,
          updatedBy: userId,
          deletedAt: null,
          deletedBy: null
        })

        // Create subcategories
        for (const subCategoryData of categoryData.subCategories) {
          const subCategoryRef = doc(collection(db, EXPENSE_SUBCATEGORIES_COLLECTION))

          batch.set(subCategoryRef, {
            name: subCategoryData.name,
            description: null,
            categoryId: categoryRef.id,
            isActive: true,
            createdAt: now,
            updatedAt: now,
            createdBy: userId,
            updatedBy: userId,
            deletedAt: null,
            deletedBy: null
          })

          // Create items if they exist
          if (subCategoryData.items) {
            for (const itemName of subCategoryData.items) {
              const itemRef = doc(collection(db, EXPENSE_ITEMS_COLLECTION))

              batch.set(itemRef, {
                name: itemName,
                description: null,
                subCategoryId: subCategoryRef.id,
                isActive: true,
                createdAt: now,
                updatedAt: now,
                createdBy: userId,
                updatedBy: userId,
                deletedAt: null,
                deletedBy: null
              })
            }
          }
        }

        success++
      } catch (error) {
        errors.push(`Error importing category "${categoryData.category}": ${error}`)
      }
    }

    await batch.commit()
    return { success, errors }
  } catch (error) {
    console.error('Error importing expense data:', error)
    throw error
  }
}

// GET CATEGORIES WITH DETAILS

export const getExpenseCategoriesWithDetails = async (): Promise<ExpenseCategoryWithDetails[]> => {
  try {
    const [categories, subCategories, items] = await Promise.all([
      getAllExpenseCategories(),
      getAllExpenseSubCategories(),
      getAllExpenseItems()
    ])

    return categories.map(category => {
      const categorySubCategories = subCategories.filter(sc => sc.categoryId === category.id)
      const categoryItems = items.filter(item =>
        categorySubCategories.some(sc => sc.id === (item as any).subCategoryId)
      )

      const subCategoriesWithDetails: ExpenseSubCategoryWithDetails[] = categorySubCategories.map(sc => {
        const subCategoryItems = items.filter(item => (item as any).subCategoryId === sc.id)
        return {
          ...sc,
          category,
          items: subCategoryItems,
          itemCount: subCategoryItems.length
        }
      })

      return {
        ...category,
        subCategories: subCategoriesWithDetails,
        subCategoryCount: categorySubCategories.length,
        itemCount: categoryItems.length
      }
    })
  } catch (error) {
    console.error('Error fetching categories with details:', error)
    throw error
  }
}

// ==================== EXPENSE ENTRIES ====================

// Helper function to convert Firestore document to ExpenseEntry
const convertFirestoreToExpenseEntry = (doc: any): ExpenseEntry => {
  const data = doc.data()
  return {
    id: doc.id,
    expenseId: data.expenseId,
    date: convertTimestamp(data.date),
    categoryId: data.categoryId,
    categoryName: data.categoryName,
    subCategoryId: data.subCategoryId,
    subCategoryName: data.subCategoryName,
    description: data.description,
    amount: data.amount,
    currency: data.currency || 'INR',
    paymentMode: data.paymentMode,
    vendor: data.vendor || null,
    status: data.status,
    receiptNumber: data.receiptNumber || null,
    notes: data.notes || null,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    deletedAt: data.deletedAt ? convertTimestamp(data.deletedAt) : null,
    deletedBy: data.deletedBy || null
  }
}

// Generate expense ID: EXP-MMYYYY-XXXXX
const generateExpenseId = async (): Promise<string> => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const prefix = `EXP-${month}${year}`

  const counterDocRef = doc(db, EXPENSE_COUNTERS_COLLECTION, `expense-${month}${year}`)
  const counterDoc = await getDoc(counterDocRef)

  let counter = 1
  if (counterDoc.exists()) {
    counter = (counterDoc.data().count || 0) + 1
    await updateDoc(counterDocRef, { count: counter })
  } else {
    await addDoc(collection(db, EXPENSE_COUNTERS_COLLECTION), {
      id: `expense-${month}${year}`,
      count: counter
    })
  }

  return `${prefix}-${String(counter).padStart(5, '0')}`
}

// Get all expense entries
export const getAllExpenseEntries = async (filters?: ExpenseEntryFilters): Promise<ExpenseEntry[]> => {
  try {
    let q = query(collection(db, EXPENSE_ENTRIES_COLLECTION), orderBy('date', 'desc'))

    if (filters?.categoryId) {
      q = query(q, where('categoryId', '==', filters.categoryId))
    }

    if (filters?.subCategoryId) {
      q = query(q, where('subCategoryId', '==', filters.subCategoryId))
    }

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status))
    }

    if (filters?.paymentMode) {
      q = query(q, where('paymentMode', '==', filters.paymentMode))
    }

    const snapshot = await getDocs(q)
    let entries = snapshot.docs.map(convertFirestoreToExpenseEntry)

    // Client-side filtering for soft delete, dates, and search
    entries = entries.filter(entry => !entry.deletedAt)

    if (filters?.startDate) {
      entries = entries.filter(entry => entry.date >= filters.startDate!)
    }

    if (filters?.endDate) {
      entries = entries.filter(entry => entry.date <= filters.endDate!)
    }

    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase()
      entries = entries.filter(entry =>
        entry.description.toLowerCase().includes(searchTerm) ||
        entry.expenseId.toLowerCase().includes(searchTerm) ||
        entry.vendor?.toLowerCase().includes(searchTerm) ||
        entry.categoryName.toLowerCase().includes(searchTerm) ||
        entry.subCategoryName.toLowerCase().includes(searchTerm)
      )
    }

    return entries
  } catch (error) {
    console.error('Error fetching expense entries:', error)
    throw error
  }
}

// Get expense entry by ID
export const getExpenseEntryById = async (id: string): Promise<ExpenseEntry | null> => {
  try {
    const docRef = doc(db, EXPENSE_ENTRIES_COLLECTION, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const entry = convertFirestoreToExpenseEntry(docSnap)
      return entry.deletedAt ? null : entry
    }

    return null
  } catch (error) {
    console.error('Error fetching expense entry:', error)
    throw error
  }
}

// Create expense entry
export const createExpenseEntry = async (
  data: CreateExpenseEntryData,
  userId: string
): Promise<ExpenseEntry> => {
  try {
    const expenseId = await generateExpenseId()
    const entriesRef = collection(db, EXPENSE_ENTRIES_COLLECTION)
    const now = serverTimestamp()

    const entryData = {
      expenseId,
      date: data.date,
      categoryId: data.categoryId,
      categoryName: data.categoryId, // Using categoryId as name since it's the same from JSON
      subCategoryId: data.subCategoryId,
      subCategoryName: data.subCategoryId, // Using subCategoryId as name since it's the same from JSON
      description: data.description,
      amount: data.amount,
      currency: 'INR' as const,
      paymentMode: data.paymentMode,
      vendor: data.vendor || null,
      status: data.status,
      receiptNumber: data.receiptNumber || null,
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
      deletedAt: null,
      deletedBy: null
    }

    const docRef = await addDoc(entriesRef, entryData)
    const newEntry = await getExpenseEntryById(docRef.id)

    if (!newEntry) {
      throw new Error('Failed to create expense entry')
    }

    return newEntry
  } catch (error) {
    console.error('Error creating expense entry:', error)
    throw error
  }
}

// Update expense entry
export const updateExpenseEntry = async (
  id: string,
  data: UpdateExpenseEntryData,
  userId: string
): Promise<ExpenseEntry> => {
  try {
    const docRef = doc(db, EXPENSE_ENTRIES_COLLECTION, id)
    const updateData: any = {
      updatedAt: serverTimestamp(),
      updatedBy: userId
    }

    if (data.date !== undefined) updateData.date = data.date
    if (data.description !== undefined) updateData.description = data.description
    if (data.amount !== undefined) updateData.amount = data.amount
    if (data.paymentMode !== undefined) updateData.paymentMode = data.paymentMode
    if (data.vendor !== undefined) updateData.vendor = data.vendor
    if (data.status !== undefined) updateData.status = data.status
    if (data.receiptNumber !== undefined) updateData.receiptNumber = data.receiptNumber
    if (data.notes !== undefined) updateData.notes = data.notes

    // Update category and subcategory if changed
    if (data.categoryId !== undefined) {
      updateData.categoryId = data.categoryId
      updateData.categoryName = data.categoryId
    }

    if (data.subCategoryId !== undefined) {
      updateData.subCategoryId = data.subCategoryId
      updateData.subCategoryName = data.subCategoryId
    }

    await updateDoc(docRef, updateData)
    const updatedEntry = await getExpenseEntryById(id)

    if (!updatedEntry) {
      throw new Error('Failed to update expense entry')
    }

    return updatedEntry
  } catch (error) {
    console.error('Error updating expense entry:', error)
    throw error
  }
}

// Delete expense entry (soft delete)
export const deleteExpenseEntry = async (id: string, userId: string): Promise<void> => {
  try {
    const docRef = doc(db, EXPENSE_ENTRIES_COLLECTION, id)
    await updateDoc(docRef, {
      deletedAt: serverTimestamp(),
      deletedBy: userId,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })
  } catch (error) {
    console.error('Error deleting expense entry:', error)
    throw error
  }
}