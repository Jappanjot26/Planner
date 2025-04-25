import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays } from 'date-fns'

const PlannerContext = createContext()

export const usePlanner = () => useContext(PlannerContext)

export const PlannerProvider = ({ children }) => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [stats, setStats] = useState({
    totalPoints: 0,
    completedTasks: 0,
    missedTasks: 0,
    optionalPoints: 0
  })

  // API base URL
  const API_URL = 'http://localhost:3001/api'

  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/tasks`)
      const tasksWithDates = response.data.map(task => ({
        ...task,
        date: new Date(task.date)
      }))
      setTasks(tasksWithDates)
      calculateStats(tasksWithDates)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Calculate statistics from tasks
  const calculateStats = useCallback((taskList) => {
    const stats = {
      totalPoints: 0,
      completedTasks: 0,
      missedTasks: 0,
      optionalPoints: 0
    }

    taskList.forEach(task => {
      if (task.completed) {
        stats.completedTasks++
        stats.totalPoints += task.points
        if (task.optional) {
          stats.optionalPoints += task.points
        }
      } else if (task.missed) {
        stats.missedTasks++
        stats.totalPoints -= task.penaltyPoints
      }
    })

    setStats(stats)
  }, [])

  // Add new task
  const addTask = useCallback(async (taskData) => {
    try {
      const response = await axios.post(`${API_URL}/tasks`, {
        ...taskData,
        date: taskData.date.toISOString()
      })
      const newTask = { ...response.data, date: new Date(response.data.date) }
      setTasks(prev => [...prev, newTask])
      calculateStats([...tasks, newTask])
      return newTask
    } catch (error) {
      console.error('Error adding task:', error)
      throw error
    }
  }, [tasks, calculateStats])

  // Update task
  const updateTask = useCallback(async (id, updates) => {
    try {
      const response = await axios.put(`${API_URL}/tasks/${id}`, updates)
      const updatedTask = { ...response.data, date: new Date(response.data.date) }
      setTasks(prev => prev.map(task => task._id === id ? updatedTask : task))
      calculateStats(tasks.map(task => task._id === id ? updatedTask : task))
      return updatedTask
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }, [tasks, calculateStats])

  // Delete task
  const deleteTask = useCallback(async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`)
      const updatedTasks = tasks.filter(task => task._id !== id)
      setTasks(updatedTasks)
      calculateStats(updatedTasks)
      return id
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }, [tasks, calculateStats])

  // Mark task as completed
  const completeTask = useCallback(async (id) => {
    return updateTask(id, { completed: true, missed: false })
  }, [updateTask])

  // Mark task as missed
  const missTask = useCallback(async (id) => {
    return updateTask(id, { missed: true, completed: false })
  }, [updateTask])

  // Get tasks for a specific date
  const getTasksForDate = useCallback((date) => {
    const formattedDate = format(date, 'yyyy-MM-dd')
    return tasks.filter(task => 
      format(task.date, 'yyyy-MM-dd') === formattedDate
    )
  }, [tasks])

  // Get tasks for current week
  const getTasksForWeek = useCallback((date = selectedDate) => {
    const start = startOfWeek(date, { weekStartsOn: 1 })
    const end = endOfWeek(date, { weekStartsOn: 1 })
    
    return tasks.filter(task => {
      const taskDate = task.date
      return taskDate >= start && taskDate <= end
    })
  }, [tasks, selectedDate])

  // Get tasks for current month
  const getTasksForMonth = useCallback((date = selectedDate) => {
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    
    return tasks.filter(task => {
      const taskDate = task.date
      return taskDate >= start && taskDate <= end
    })
  }, [tasks, selectedDate])

  // Get weekly stats
  const getWeeklyStats = useCallback(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const weekTasks = getTasksForWeek()
    
    const dailyStats = Array(7).fill().map((_, i) => {
      const day = addDays(weekStart, i)
      const dayTasks = weekTasks.filter(task => 
        format(task.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      )
      
      return {
        date: day,
        completed: dayTasks.filter(t => t.completed).length,
        missed: dayTasks.filter(t => t.missed).length,
        total: dayTasks.length,
        points: dayTasks.reduce((sum, task) => {
          if (task.completed) return sum + task.points
          if (task.missed) return sum - task.penaltyPoints
          return sum
        }, 0)
      }
    })
    
    return dailyStats
  }, [selectedDate, getTasksForWeek])

  // Initial data fetch
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const value = {
    tasks,
    loading,
    stats,
    selectedDate,
    setSelectedDate,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    missTask,
    getTasksForDate,
    getTasksForWeek,
    getTasksForMonth,
    getWeeklyStats,
    fetchTasks
  }

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
}