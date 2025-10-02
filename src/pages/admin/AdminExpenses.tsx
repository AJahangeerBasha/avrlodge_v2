import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { useExpenseEntries, useDeleteExpenseEntry } from '@/hooks/useExpenses'
import { ExpenseEntry } from '@/lib/types/expenses'
import { ExpenseEntryModal } from '@/components/expenses/ExpenseEntryModal'
import { useAuth } from '@/contexts/AuthContext'

const AdminExpenses = () => {
  const { currentUser } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Pending' | 'Cancelled'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Fetch expense entries
  const { data: entries = [], isLoading, refetch } = useExpenseEntries({
    status: statusFilter === 'all' ? undefined : statusFilter,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    searchTerm: searchTerm || undefined
  })

  const deleteExpense = useDeleteExpenseEntry()

  // Calculate statistics
  const stats = useMemo(() => {
    const total = entries.reduce((sum, entry) => sum + entry.amount, 0)
    const paid = entries.filter(e => e.status === 'Paid').reduce((sum, entry) => sum + entry.amount, 0)
    const pending = entries.filter(e => e.status === 'Pending').reduce((sum, entry) => sum + entry.amount, 0)
    const totalCount = entries.length
    const paidCount = entries.filter(e => e.status === 'Paid').length
    const pendingCount = entries.filter(e => e.status === 'Pending').length

    return { total, paid, pending, totalCount, paidCount, pendingCount }
  }, [entries])

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = new Set(entries.map(e => e.categoryName))
    return Array.from(uniqueCategories)
  }, [entries])

  // Filtered entries
  const filteredEntries = useMemo(() => {
    let filtered = entries

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(e => e.categoryName === categoryFilter)
    }

    return filtered
  }, [entries, categoryFilter])

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage)
  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredEntries.slice(startIndex, endIndex)
  }, [filteredEntries, currentPage, itemsPerPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, categoryFilter])

  const handleDelete = async (id: string) => {
    if (!currentUser?.uid) {
      alert('Please log in to delete expenses')
      return
    }

    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense.mutateAsync({ id, userId: currentUser.uid })
      } catch (error) {
        console.error('Error deleting expense:', error)
      }
    }
  }

  const handleEdit = (id: string) => {
    setEditingEntryId(id)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingEntryId(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingEntryId(null)
  }

  const handleExportCSV = () => {
    const headers = ['Expense ID', 'Date', 'Category', 'SubCategory', 'Description', 'Amount', 'Payment Mode', 'Vendor', 'Status', 'Receipt Number']
    const csvData = filteredEntries.map(entry => [
      entry.expenseId,
      format(new Date(entry.date), 'yyyy-MM-dd'),
      entry.categoryName,
      entry.subCategoryName,
      entry.description,
      entry.amount,
      entry.paymentMode,
      entry.vendor || '',
      entry.status,
      entry.receiptNumber || ''
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expenses-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Expense Management</h1>
          <p className="text-gray-500 mt-1">Track and manage all expenses</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-gray-300 hover:bg-gray-50"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button className="bg-black hover:bg-gray-800 text-white" onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Add Expense</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold mt-1">₹{stats.total.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.totalCount} entries</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">₹{stats.paid.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.paidCount} entries</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold mt-1 text-yellow-600">₹{stats.pending.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.pendingCount} entries</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Payment Methods</p>
                  <p className="text-2xl font-bold mt-1">{new Set(entries.map(e => e.paymentMode)).size}</p>
                  <p className="text-xs text-gray-500 mt-1">Different modes</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Entries ({filteredEntries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading expenses...</div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No expenses found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Expense ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>SubCategory</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Mode</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.expenseId}</TableCell>
                        <TableCell>{format(new Date(entry.date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>{entry.categoryName}</TableCell>
                        <TableCell>{entry.subCategoryName}</TableCell>
                        <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                        <TableCell className="font-semibold">₹{entry.amount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{entry.paymentMode}</TableCell>
                        <TableCell>{entry.vendor || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(entry.status)}>
                            {entry.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(entry.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(entry.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredEntries.length)} of {filteredEntries.length} entries
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page ? "bg-black text-white" : ""}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Expense Entry Modal */}
      <ExpenseEntryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingEntryId={editingEntryId}
      />
    </div>
  )
}

export default AdminExpenses
