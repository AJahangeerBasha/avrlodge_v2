import { Plus } from 'lucide-react'

interface FloatingActionButtonProps {
  onPress: () => void
  icon?: React.ReactNode
  label?: string
  className?: string
}

export default function FloatingActionButton({
  onPress,
  icon = <Plus className="w-6 h-6" />,
  label,
  className = ""
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onPress}
      className={`
        fixed bottom-6 right-6 z-30
        w-14 h-14 rounded-full
        bg-blue-500 hover:bg-blue-600
        text-white shadow-lg
        flex items-center justify-center
        transition-all duration-200
        hover:scale-110 active:scale-95
        ${className}
      `}
      aria-label={label || "Add new"}
    >
      {icon}
    </button>
  )
} 