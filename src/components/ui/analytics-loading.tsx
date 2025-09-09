import { motion } from 'framer-motion'

interface AnalyticsLoadingProps {
  message?: string
  className?: string
}

const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

const pulseVariants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export default function AnalyticsLoading({ 
  message = "Loading analytics data...", 
  className = '' 
}: AnalyticsLoadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col items-center justify-center py-12 ${className}`}
    >
      {/* Spinner */}
      <motion.div
        variants={spinnerVariants}
        animate="animate"
        className="relative w-12 h-12 mb-4"
      >
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <motion.div
          className="absolute inset-0 border-4 border-gray-600 rounded-full border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>

      {/* Loading message */}
      <motion.p
        variants={pulseVariants}
        animate="animate"
        className="text-sm text-gray-600 font-medium"
      >
        {message}
      </motion.p>

      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex space-x-1 mt-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
} 