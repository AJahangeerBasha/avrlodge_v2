import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface Tab {
  id: string
  label: string
  icon?: LucideIcon
}

interface AnalyticsTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

const tabVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: "easeOut"
    }
  }),
  hover: {
    y: -2,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1
    }
  }
}

const activeTabVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

export default function AnalyticsTabs({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}: AnalyticsTabsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-white rounded-2xl border border-gray-200 shadow-lg p-2 ${className}`}
    >
      <div className="flex space-x-2">
        {tabs.map((tab, index) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <motion.button
              key={tab.id}
              custom={index}
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-base font-semibold transition-all duration-200 relative ${
                isActive
                  ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  variants={activeTabVariants}
                  initial="hidden"
                  animate="visible"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg"
                  style={{ zIndex: -1 }}
                />
              )}
              
              {Icon && (
                <motion.div
                  animate={{ 
                    rotate: isActive ? 0 : 0,
                    scale: isActive ? 1.2 : 1
                  }}
                  transition={{ duration: 0.2 }}
                  className={`${isActive ? 'text-white' : 'text-gray-600'}`}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
              )}
              
              <span className={`relative z-10 font-bold ${isActive ? 'text-white' : 'text-gray-700'}`}>
                {tab.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
} 