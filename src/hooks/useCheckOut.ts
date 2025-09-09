import { useState, useEffect } from 'react'
import { CheckOutService, TodoItem, GuestFeedback, CleaningTask } from '@/services/checkout.service'
import { useToast } from '@/hooks/use-toast'

export function useCheckOut(booking: any) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'feedback' | 'todos' | 'cleaning'>('feedback')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [guestFeedback, setGuestFeedback] = useState<GuestFeedback>({
    rating: 5,
    comment: '',
    category: 'overall'
  })
  
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newTodo, setNewTodo] = useState('')
  
  const [cleaningTasks, setCleaningTasks] = useState<CleaningTask[]>([])
  const [newCleaningTask, setNewCleaningTask] = useState<{
    task_type: 'cleaning' | 'maintenance' | 'inspection'
    notes: string
  }>({
    task_type: 'cleaning',
    notes: ''
  })

  // Generate todos from feedback
  useEffect(() => {
    if (guestFeedback.comment) {
      const feedbackTodos = CheckOutService.generateTodosFromFeedback(guestFeedback)
      if (feedbackTodos.length > 0) {
        setTodos(prev => {
          // Remove existing feedback todos and add new ones
          const nonFeedbackTodos = prev.filter(todo => !todo.id.startsWith('feedback-'))
          return [...nonFeedbackTodos, ...feedbackTodos]
        })
      }
    }
  }, [guestFeedback])

  const handleFeedbackSubmit = () => {
    const error = CheckOutService.validateFeedback(guestFeedback)
    if (error) {
      toast({
        title: "Feedback Required",
        description: error,
        variant: "destructive",
      })
      return
    }
    setActiveTab('todos')
  }

  const addTodo = () => {
    if (!newTodo.trim()) return
    
    const todo: TodoItem = {
      id: `todo-${Date.now()}`,
      task: newTodo,
      completed: false,
      priority: 'medium',
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
    
    setTodos(prev => [...prev, todo])
    setNewTodo('')
  }

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  const addCleaningTask = () => {
    const error = CheckOutService.validateCleaningTask(newCleaningTask.notes)
    if (error) {
      toast({
        title: "Notes Required",
        description: error,
        variant: "destructive",
      })
      return
    }

    const task: CleaningTask = {
      id: `cleaning-${Date.now()}`,
      room_number: booking.room_numbers?.[0] || 'Unknown',
      task_type: newCleaningTask.task_type,
      status: 'pending',
      notes: newCleaningTask.notes,
      created_at: new Date().toISOString()
    }

    setCleaningTasks(prev => [...prev, task])
    setNewCleaningTask({
      task_type: 'cleaning',
      notes: ''
    })
  }

  const updateCleaningStatus = (id: string, status: 'pending' | 'in_progress' | 'completed') => {
    setCleaningTasks(prev => prev.map(task => 
      task.id === id ? { ...task, status } : task
    ))
  }

  const processCheckOut = async (): Promise<boolean> => {
    setIsProcessing(true)
    try {
      await CheckOutService.processCheckOut(booking.id, guestFeedback, todos, cleaningTasks)
      
      toast({
        title: "Check-Out Successful",
        description: `${booking.guest_name} has been checked out successfully.`,
      })
      
      return true
    } catch (error: any) {
      console.error('Check-out error:', error)
      toast({
        title: "Check-Out Failed",
        description: error.message || "Failed to complete check-out. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    activeTab,
    setActiveTab,
    isProcessing,
    guestFeedback,
    setGuestFeedback,
    todos,
    newTodo,
    setNewTodo,
    cleaningTasks,
    newCleaningTask,
    setNewCleaningTask,
    handleFeedbackSubmit,
    addTodo,
    toggleTodo,
    deleteTodo,
    addCleaningTask,
    updateCleaningStatus,
    processCheckOut
  }
}