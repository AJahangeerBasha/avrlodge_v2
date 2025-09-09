import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface PageLoaderProps {
  message?: string
  fullScreen?: boolean
}

export function PageLoader({ message = "Loading...", fullScreen = true }: PageLoaderProps) {
  const containerClass = fullScreen 
    ? "min-h-screen flex items-center justify-center bg-gray-50"
    : "min-h-[400px] flex items-center justify-center"

  return (
    <div className={containerClass}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-3"
      >
        <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
        <span className="text-gray-600 font-medium">{message}</span>
      </motion.div>
    </div>
  )
}

export function ComponentLoader({ message = "Loading component..." }: { message?: string }) {
  return <PageLoader message={message} fullScreen={false} />
}

export function RouteLoader({ message = "Loading page..." }: { message?: string }) {
  return <PageLoader message={message} fullScreen={true} />
}