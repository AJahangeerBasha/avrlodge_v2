import { motion } from 'framer-motion'
import { BarChart3, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
  title: string
  subtitle: string
  isLoading?: boolean
  isSubscribed?: boolean
  lastRefreshTime?: string
  onRefresh?: () => void
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  isLoading = false,
  isSubscribed = false,
  lastRefreshTime,
  onRefresh
}) => {
  return (
    <motion.div
      className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-gray-900" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-2">{subtitle}</p>
        </div>
      </div>

      {onRefresh && (
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onRefresh}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              title={`${isSubscribed ? 'Real-time updates active' : 'Click to enable real-time updates'}${lastRefreshTime ? ` • Last updated: ${new Date(lastRefreshTime).toLocaleTimeString()}` : ''}`}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}