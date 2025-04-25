import { useState } from 'react'
import { format } from 'date-fns'
import { FiPlus, FiCalendar } from 'react-icons/fi'
import DatePicker from 'react-datepicker'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlanner } from '../context/PlannerContext'
import TaskItem from '../components/TaskItem'
import NewTaskForm from '../components/NewTaskForm'
import './DailyView.css'

const DailyView = () => {
  const { selectedDate, setSelectedDate, getTasksForDate, stats } = usePlanner()
  const [isAddingTask, setIsAddingTask] = useState(false)
  
  const dailyTasks = getTasksForDate(selectedDate)
  const completedTasks = dailyTasks.filter(task => task.completed)
  const pendingTasks = dailyTasks.filter(task => !task.completed && !task.missed)
  const missedTasks = dailyTasks.filter(task => task.missed)
  
  const handleAddTask = () => {
    setIsAddingTask(true)
  }
  
  const handleCloseForm = () => {
    setIsAddingTask(false)
  }
  
  const calculateDailyProgress = () => {
    if (dailyTasks.length === 0) return 0
    return Math.round((completedTasks.length / dailyTasks.length) * 100)
  }
  
  const getDailyPoints = () => {
    return dailyTasks.reduce((total, task) => {
      if (task.completed) {
        return total + task.points
      } else if (task.missed) {
        return total - task.penaltyPoints
      }
      return total
    }, 0)
  }
  
  const progress = calculateDailyProgress()
  const dailyPoints = getDailyPoints()
  
  return (
    <div className="daily-view">
      <div className="view-header">
        <div className="view-title">
          <h2>Daily Tasks</h2>
          <p className="view-subtitle">
            Manage your tasks for {format(selectedDate, 'MMMM d, yyyy')}
          </p>
        </div>
        
        <div className="view-actions">
          <div className="date-picker-container">
            <DatePicker 
              selected={selectedDate}
              onChange={date => setSelectedDate(date)}
              dateFormat="MMMM d, yyyy"
              className="date-picker"
              customInput={
                <button className="date-picker-button">
                  <FiCalendar />
                  <span>{format(selectedDate, 'MMM d, yyyy')}</span>
                </button>
              }
            />
          </div>
          
          <button className="add-task-button" onClick={handleAddTask}>
            <FiPlus />
            <span>Add Task</span>
          </button>
        </div>
      </div>
      
      <div className="daily-stats">
        <div className="stat-card">
          <div className="stat-label">Progress</div>
          <div className="progress-container">
            <div className="progress-bar">
              <motion.div 
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="progress-text">{progress}%</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Tasks</div>
          <div className="stat-value">{completedTasks.length}/{dailyTasks.length}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Points Today</div>
          <div className={`stat-value ${dailyPoints >= 0 ? 'positive' : 'negative'}`}>
            {dailyPoints >= 0 ? '+' : ''}{dailyPoints}
          </div>
        </div>
      </div>
      
      <div className="tasks-container">
        {pendingTasks.length > 0 && (
          <div className="task-section">
            <h3 className="section-title">Pending Tasks</h3>
            <AnimatePresence>
              {pendingTasks.map(task => (
                <TaskItem key={task._id} task={task} />
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {completedTasks.length > 0 && (
          <div className="task-section">
            <h3 className="section-title">Completed Tasks</h3>
            <AnimatePresence>
              {completedTasks.map(task => (
                <TaskItem key={task._id} task={task} />
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {missedTasks.length > 0 && (
          <div className="task-section">
            <h3 className="section-title">Missed Tasks</h3>
            <AnimatePresence>
              {missedTasks.map(task => (
                <TaskItem key={task._id} task={task} />
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {dailyTasks.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <FiCalendar />
            </div>
            <h3>No Tasks for Today</h3>
            <p>Click the "Add Task" button to create a new task.</p>
            <button className="button" onClick={handleAddTask}>
              <FiPlus />
              Add Your First Task
            </button>
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {isAddingTask && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseForm}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <NewTaskForm onClose={handleCloseForm} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DailyView