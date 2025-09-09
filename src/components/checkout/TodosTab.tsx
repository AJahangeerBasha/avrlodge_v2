import { motion } from 'framer-motion'
import { ClipboardList, CheckSquare, Square, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TodoItem, CheckOutService } from '@/services/checkout.service'

interface TodosTabProps {
  todos: TodoItem[]
  newTodo: string
  onNewTodoChange: (value: string) => void
  onAddTodo: () => void
  onToggleTodo: (id: string) => void
  onDeleteTodo: (id: string) => void
  onBack: () => void
  onNext: () => void
}

export default function TodosTab({
  todos,
  newTodo,
  onNewTodoChange,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onBack,
  onNext
}: TodosTabProps) {
  return (
    <motion.div
      key="todos"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ToDo List</h3>
        
        {/* Add Todo */}
        <div className="flex gap-2 mb-4">
          <Input
            value={newTodo}
            onChange={(e) => onNewTodoChange(e.target.value)}
            placeholder="Add a new task..."
            onKeyPress={(e) => e.key === 'Enter' && onAddTodo()}
            className="flex-1"
          />
          <Button onClick={onAddTodo} variant="outline">
            Add
          </Button>
        </div>

        {/* Todo List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {todos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ClipboardList className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No tasks yet. Add some tasks based on guest feedback.</p>
            </div>
          ) : (
            todos.map((todo) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <button
                  onClick={() => onToggleTodo(todo.id)}
                  className="flex-shrink-0"
                >
                  {todo.completed ? (
                    <CheckSquare className="w-5 h-5 text-green-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <p className={`text-sm ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {todo.task}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full border ${CheckOutService.getPriorityColor(todo.priority)}`}>
                      {todo.priority}
                    </span>
                    {todo.due_date && (
                      <span className="text-xs text-gray-500">
                        Due: {new Date(todo.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
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
            onClick={onNext}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Next: Room Cleaning
          </Button>
        </div>
      </div>
    </motion.div>
  )
}