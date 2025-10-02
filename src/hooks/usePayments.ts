import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPayments, createPayment, updatePayment, deletePayment } from '@/lib/payments'
import { Payment, CreatePaymentData, UpdatePaymentData, PaymentFilters } from '@/lib/types/payments'
import { useAuth } from '@/contexts/AuthContext'

// Query Keys
export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (filters?: PaymentFilters) => [...paymentKeys.lists(), filters] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
  byReservation: (reservationId: string) => [...paymentKeys.all, 'reservation', reservationId] as const,
}

// Fetch all payments with optional filters
export const usePayments = (filters?: PaymentFilters) => {
  return useQuery({
    queryKey: paymentKeys.list(filters),
    queryFn: () => getPayments(filters),
    enabled: true, // Always enabled for payments
  })
}

// Fetch payments by reservation ID
export const usePaymentsByReservation = (reservationId: string) => {
  return useQuery({
    queryKey: paymentKeys.byReservation(reservationId),
    queryFn: () => getPayments({ reservationId, isActive: true }),
    enabled: !!reservationId, // Only run if reservationId exists
  })
}

// Create payment mutation
export const useCreatePayment = () => {
  const queryClient = useQueryClient()
  const { currentUser } = useAuth()

  return useMutation({
    mutationFn: (data: CreatePaymentData) => {
      if (!currentUser?.uid) throw new Error('User not authenticated')
      return createPayment(data, currentUser.uid)
    },
    onSuccess: (newPayment) => {
      // Invalidate and refetch payments
      queryClient.invalidateQueries({ queryKey: paymentKeys.all })

      // If payment is for a specific reservation, invalidate that query too
      if (newPayment.reservationId) {
        queryClient.invalidateQueries({
          queryKey: paymentKeys.byReservation(newPayment.reservationId)
        })
      }
    },
  })
}

// Update payment mutation
export const useUpdatePayment = () => {
  const queryClient = useQueryClient()
  const { currentUser } = useAuth()

  return useMutation({
    mutationFn: ({ paymentId, data }: { paymentId: string; data: UpdatePaymentData }) => {
      if (!currentUser?.uid) throw new Error('User not authenticated')
      return updatePayment(paymentId, data, currentUser.uid)
    },
    onSuccess: (updatedPayment) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: paymentKeys.all })
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(updatedPayment.id) })

      if (updatedPayment.reservationId) {
        queryClient.invalidateQueries({
          queryKey: paymentKeys.byReservation(updatedPayment.reservationId)
        })
      }
    },
  })
}

// Delete payment mutation
export const useDeletePayment = () => {
  const queryClient = useQueryClient()
  const { currentUser } = useAuth()

  return useMutation({
    mutationFn: (paymentId: string) => {
      if (!currentUser?.uid) throw new Error('User not authenticated')
      return deletePayment(paymentId, currentUser.uid)
    },
    onSuccess: () => {
      // Invalidate all payments queries
      queryClient.invalidateQueries({ queryKey: paymentKeys.all })
    },
  })
}

// Optimistic updates helper for real-time UI
export const useOptimisticPaymentUpdate = () => {
  const queryClient = useQueryClient()

  const updatePaymentOptimistically = (paymentId: string, updates: Partial<Payment>) => {
    // Update specific payment in cache
    queryClient.setQueryData<Payment[]>(
      paymentKeys.lists(),
      (oldData) => {
        if (!oldData) return oldData
        return oldData.map(payment =>
          payment.id === paymentId
            ? { ...payment, ...updates }
            : payment
        )
      }
    )
  }

  return { updatePaymentOptimistically }
}