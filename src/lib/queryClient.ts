import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes for Firebase data

      // Cache time: how long data stays in cache when not used
      gcTime: 10 * 60 * 1000, // 10 minutes

      // Retry failed requests
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (auth/permission issues)
        if (error && typeof error === 'object' && 'code' in error) {
          const firebaseError = error as { code: string }
          if (firebaseError.code?.includes('permission-denied') ||
              firebaseError.code?.includes('unauthenticated')) {
            return false
          }
        }
        return failureCount < 3
      },

      // Refetch on window focus for real-time data
      refetchOnWindowFocus: true,

      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutations on failure
      retry: 1,
    },
  },
})