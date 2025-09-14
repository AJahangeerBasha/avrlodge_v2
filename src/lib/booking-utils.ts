// Re-export from utils to maintain single source of truth
export { calculateNights, getStatusColor, getPaymentStatusColor, formatCurrency, formatDate } from './utils'

export const getPaymentStatusText = (status: string, remainingBalance: number): string => {
  if (remainingBalance <= 0) return 'Fully Paid'
  if (status === 'paid') return 'Paid'
  if (status === 'partial') return 'Partially Paid'
  return 'Pending'
}