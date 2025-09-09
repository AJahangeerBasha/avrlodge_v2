import { MessageSquare, ClipboardList, Users } from 'lucide-react'

interface TabNavigationProps {
  activeTab: 'feedback' | 'todos' | 'cleaning'
  todosCount: number
  cleaningTasksCount: number
  onTabChange: (tab: 'feedback' | 'todos' | 'cleaning') => void
}

export default function TabNavigation({
  activeTab,
  todosCount,
  cleaningTasksCount,
  onTabChange
}: TabNavigationProps) {
  return (
    <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onTabChange('feedback')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'feedback' 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <MessageSquare className="w-4 h-4" />
        Guest Feedback
      </button>
      <button
        onClick={() => onTabChange('todos')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'todos' 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <ClipboardList className="w-4 h-4" />
        ToDo List ({todosCount})
      </button>
      <button
        onClick={() => onTabChange('cleaning')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'cleaning' 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Users className="w-4 h-4" />
        Room Cleaning ({cleaningTasksCount})
      </button>
    </div>
  )
}