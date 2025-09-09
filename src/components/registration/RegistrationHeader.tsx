import { motion } from 'framer-motion'
import { UserPlus, Calendar, CreditCard, MapPin } from 'lucide-react'

interface RegistrationHeaderProps {
  currentStep: number
  totalSteps: number
  title?: string
  subtitle?: string
}

export default function RegistrationHeader({
  currentStep,
  totalSteps,
  title = "Guest Registration",
  subtitle = "Complete the form to create a new reservation"
}: RegistrationHeaderProps) {
  const steps = [
    { name: 'Guest Details', icon: UserPlus },
    { name: 'Location & Dates', icon: MapPin },
    { name: 'Room Allocation', icon: Calendar },
    { name: 'Payment & Confirm', icon: CreditCard }
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3"
    >
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-gray-900 rounded-md">
            <UserPlus className="w-3 h-3 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">{title}</h1>
            <p className="text-xs text-gray-600">{subtitle}</p>
          </div>
        </div>
        <div className="text-xs text-gray-500 font-medium">
          {currentStep}/{totalSteps}
        </div>
      </div>

      {/* Compact Progress Steps */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = index + 1 === currentStep
            const isCompleted = index + 1 < currentStep
            
            return (
              <motion.div
                key={step.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex flex-col items-center relative z-10"
              >
                <div
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center border transition-colors text-xs
                    ${isCompleted 
                      ? 'bg-green-100 border-green-300 text-green-700' 
                      : isActive 
                        ? 'bg-gray-900 border-gray-900 text-white' 
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }
                  `}
                >
                  <step.icon className="w-3 h-3" />
                </div>
                
                <p className={`text-xs font-medium mt-1 text-center max-w-16 leading-tight
                    ${isActive ? 'text-gray-900' : 'text-gray-500'}
                  `}
                >
                  {step.name}
                </p>
              </motion.div>
            )
          })}
        </div>
        
        {/* Progress Bar */}
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200 -z-10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gray-900 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  )
} 