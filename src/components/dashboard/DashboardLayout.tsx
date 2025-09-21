import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { DashboardHeader } from './DashboardHeader'
import { MetricsGrid } from './MetricsGrid'
import { DashboardFilters } from './DashboardFilters'

interface DashboardLayoutProps {
  title: string
  subtitle: string
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  subtitle
}) => {
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const {
    metrics,
    isLoading,
    lastRefreshTime,
    error,
    isSubscribed,
    loadInitialData,
    startRealtimeListeners,
    stopRealtimeListeners,
  } = useDashboardStore()

  // Initialize dashboard data and real-time listeners
  useEffect(() => {
    if (!currentUser) return

    const initializeDashboard = async () => {
      try {
        // Load initial data
        await loadInitialData()

        // Start real-time listeners
        await startRealtimeListeners()

        console.log('📊 Dashboard initialized with real-time updates')
      } catch (error) {
        console.error('Error initializing dashboard:', error)
        toast({
          title: "Initialization Error",
          description: "Failed to initialize dashboard. Please refresh the page.",
          variant: "destructive",
        })
      }
    }

    initializeDashboard()

    // Cleanup listeners on unmount or user change
    return () => {
      stopRealtimeListeners()
    }
  }, [currentUser, loadInitialData, startRealtimeListeners, stopRealtimeListeners, toast])

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast({
        title: "Dashboard Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  // Refresh handler
  const handleRefresh = async () => {
    if (!currentUser) return

    try {
      // Stop existing listeners
      stopRealtimeListeners()

      // Reload initial data
      await loadInitialData()

      // Restart listeners
      await startRealtimeListeners()

      toast({
        title: "Dashboard Refreshed",
        description: "Latest data has been loaded successfully.",
      })
    } catch (error) {
      console.error('Error refreshing dashboard:', error)
      toast({
        title: "Refresh Error",
        description: "Failed to refresh dashboard data. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading && !metrics.totalRooms) {
    return (
      <motion.div
        className="space-y-8 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="space-y-8 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <DashboardHeader
          title={title}
          subtitle={subtitle}
          isLoading={isLoading}
          isSubscribed={isSubscribed}
          lastRefreshTime={lastRefreshTime}
          onRefresh={handleRefresh}
        />
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <DashboardFilters />
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <MetricsGrid
          metrics={metrics}
          isLoading={isLoading}
        />
      </motion.div>

      {/* Real-time Status */}
      {isSubscribed && (
        <motion.div
          className="flex items-center justify-center py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Real-time updates active</span>
            {lastRefreshTime && (
              <span className="text-gray-500">
                • Last updated: {new Date(lastRefreshTime).toLocaleTimeString()}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}