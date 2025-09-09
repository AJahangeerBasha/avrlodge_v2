import { motion } from 'framer-motion'
import { Users, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CleaningTask } from '@/services/checkout.service'

interface CleaningTabProps {
  cleaningTasks: CleaningTask[]
  newCleaningTask: {
    task_type: 'cleaning' | 'maintenance' | 'inspection'
    notes: string
  }
  onNewCleaningTaskChange: (task: {
    task_type: 'cleaning' | 'maintenance' | 'inspection'
    notes: string
  }) => void
  onAddCleaningTask: () => void
  onUpdateCleaningStatus: (id: string, status: 'pending' | 'in_progress' | 'completed') => void
  onBack: () => void
  onComplete: () => void
  isProcessing: boolean
}

export default function CleaningTab({
  cleaningTasks,
  newCleaningTask,
  onNewCleaningTaskChange,
  onAddCleaningTask,
  onUpdateCleaningStatus,
  onBack,
  onComplete,
  isProcessing
}: CleaningTabProps) {
  return (
    <motion.div
      key="cleaning"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Cleaning Management</h3>
        
        {/* Add Cleaning Task */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-3">Assign Cleaning Task</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select
              value={newCleaningTask.task_type}
              onValueChange={(value: any) => onNewCleaningTaskChange({
                ...newCleaningTask,
                task_type: value
              })}
            >
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                <SelectItem value="cleaning" className="text-gray-900 hover:bg-gray-50">Cleaning</SelectItem>
                <SelectItem value="maintenance" className="text-gray-900 hover:bg-gray-50">Maintenance</SelectItem>
                <SelectItem value="inspection" className="text-gray-900 hover:bg-gray-50">Inspection</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={onAddCleaningTask} variant="outline">
              Assign Task
            </Button>
          </div>
          <Input
            value={newCleaningTask.notes}
            onChange={(e) => onNewCleaningTaskChange({
              ...newCleaningTask,
              notes: e.target.value
            })}
            placeholder="Additional notes..."
            className="mt-3"
          />
        </div>

        {/* Cleaning Tasks List */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {cleaningTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No cleaning tasks assigned yet.</p>
            </div>
          ) : (
            cleaningTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 capitalize">{task.task_type}</span>
                    <span className="text-sm text-gray-600">• Room {task.room_number}</span>
                  </div>
                  {task.notes && (
                    <p className="text-sm text-gray-600 truncate">
                      {task.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Select
                    value={task.status}
                    onValueChange={(value: any) => onUpdateCleaningStatus(task.id, value)}
                  >
                    <SelectTrigger className="w-32 bg-white border-gray-300 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="pending" className="text-gray-900 hover:bg-gray-50">Pending</SelectItem>
                      <SelectItem value="in_progress" className="text-gray-900 hover:bg-gray-50">In Progress</SelectItem>
                      <SelectItem value="completed" className="text-gray-900 hover:bg-gray-50">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={onComplete}
            disabled={isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Check-Out
              </div>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}