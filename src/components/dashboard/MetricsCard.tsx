import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  className?: string
  iconColor?: string
  valueColor?: string
  isLoading?: boolean
  onClick?: () => void
}

export function MetricsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  iconColor = 'text-gray-600 dark:text-gray-400',
  valueColor = 'text-gray-900 dark:text-white',
  isLoading = false,
  onClick
}: MetricsCardProps) {
  const TrendIcon = trend?.isPositive ? TrendingUp : trend?.isPositive === false ? TrendingDown : Minus

  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col',
        onClick && 'cursor-pointer hover:border-gray-300 dark:hover:border-gray-600',
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        {/* Header with icon and title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Icon className={cn('w-5 h-5', iconColor)} />
          </div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title}
          </h3>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ) : (
            <>
              {/* Value */}
              <div className={cn('text-2xl font-bold mb-2', valueColor)}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
              
              {/* Subtitle - fixed height area */}
              <div className="h-5 mb-3">
                {subtitle && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {subtitle}
                  </div>
                )}
              </div>
              
              {/* Trend - fixed height area at bottom */}
              <div className="h-6 mt-auto">
                {trend && (
                  <div className="flex items-center gap-1">
                    <TrendIcon 
                      className={cn(
                        'w-4 h-4',
                        trend.isPositive 
                          ? 'text-green-600 dark:text-green-400' 
                          : trend.isPositive === false 
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400'
                      )} 
                    />
                    <span 
                      className={cn(
                        'text-sm font-medium',
                        trend.isPositive 
                          ? 'text-green-600 dark:text-green-400' 
                          : trend.isPositive === false 
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400'
                      )}
                    >
                      {Math.abs(trend.value)}%
                    </span>
                    {trend.label && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {trend.label}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Specialized card for room statistics
interface RoomMetricsCardProps extends Omit<MetricsCardProps, 'value'> {
  total: number
  occupied?: number
  showOccupancyBar?: boolean
}

export function RoomMetricsCard({
  total,
  occupied = 0,
  showOccupancyBar = false,
  ...props
}: RoomMetricsCardProps) {
  const occupancyPercentage = total > 0 ? (occupied / total) * 100 : 0

  return (
    <MetricsCard
      {...props}
      value={total}
      subtitle={occupied > 0 ? `${occupied} occupied` : undefined}
      trend={showOccupancyBar ? {
        value: Math.round(occupancyPercentage),
        isPositive: occupancyPercentage > 75,
        label: 'occupancy'
      } : props.trend}
    />
  )
}

// Specialized card for revenue metrics
interface RevenueMetricsCardProps extends Omit<MetricsCardProps, 'value'> {
  amount: number
  currency?: string
  compactFormat?: boolean
}

export function RevenueMetricsCard({
  amount,
  currency = '₹',
  compactFormat = false,
  ...props
}: RevenueMetricsCardProps) {
  const formatAmount = (amt: number) => {
    if (compactFormat && amt >= 100000) {
      return `${currency}${(amt / 100000).toFixed(1)}L`
    } else if (compactFormat && amt >= 1000) {
      return `${currency}${(amt / 1000).toFixed(1)}K`
    } else {
      return `${currency}${amt.toLocaleString()}`
    }
  }

  return (
    <MetricsCard
      {...props}
      value={formatAmount(amount)}
      valueColor="text-green-600 dark:text-green-400"
    />
  )
}