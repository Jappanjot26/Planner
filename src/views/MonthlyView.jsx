import { useState } from 'react'
import Calendar from 'react-calendar'
import { format, isSameDay, isSameMonth } from 'date-fns'
import { FiPlus, FiCalendar } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlanner } from '../context/PlannerContext'
import TaskItem from '../components/TaskItem'
import NewTaskForm from '../components/NewTaskForm'
import 'react-calendar/dist/Calendar.css'
import './MonthlyView.css'

const MonthlyView = () => {
  const { selectedDate, setSelectedDate, getTasksForDate, getTasksForMonth } = usePlanner()
  const [isAddingTask, setIsAddingTask] = useState(false)
  
  const handleDateChange = (date) => {
    setSelectedDate(date)
  }
  
  const handleAddTask = () => {
    setIsAddingTask(true)
  }
  
  const handleCloseForm = () => {
    setIsAddingTask(false)
  }
  
  const monthTasks = getTasksForMonth()
  const selectedDayTasks = getTasksForDate(selectedDate)
  
  // Calendar tile content
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null
    
    const dayTasks = monthTasks.filter(task => 
      isSameDay(new Date(task.date), date)
    )
    
    if (dayTasks.length === 0) return null
    
    const completedTasks = dayTasks.filter(task => task.completed)
    const missedTasks = dayTasks.filter(task => task.missed)
    const pendingTasks = dayTasks.filter(task => !task.completed && !task.missed)
    
    return (
      <div className="calendar-tile-content">
        {pendingTasks.length > 0 && (
          <div className="task-dot pending">
            <span>{pendingTasks.length}</span>
          </div>
        )}
        {completedTasks.length > 0 && (
          <div className="task-dot completed">
            <span>{completedTasks.length}</span>
          </div>
        )}
        {missedTasks.length > 0 && (
          <div className="task-dot missed">
            <span>{missedTasks.length}</span>
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className="monthly-view">
      <div className="view-header">
        <div className="view-title">
          <h2>Monthly Calendar</h2>
          <p className="view-subtitle">
            Plan and track your tasks for {format(selectedDate, 'MMMM yyyy')}
          </p>
        </div>
        
        <div className="view-actions">
          <button className="add-task-button" onClick={handleAddTask}>
            <FiPlus />
            <span>Add Task</span>
          </button>
        </div>
      </div>
      
      <div className="monthly-container">
        <div className="calendar-wrapper">
          <Calendar 
            value={selectedDate}
            onChange={handleDateChange}
            tileContent={tileContent}
            showNeighboringMonth={false}
            tileClassName={({ date }) => {
              if (!isSameMonth(date, selectedDate)) return 'other-month'
              if (isSameDay(date, selectedDate)) return 'selected-day'
              return null
            }}
          />
        </div>
        
        <div className="selected-day-panel">
          <h3 className="panel-title">
            <FiCalendar className="title-icon" />
            {format(selectedDate, 'EEEE, MMMM d')}
          </h3>
          
          <div className="tasks-list">
            <AnimatePresence>
              {selectedDayTasks.map(task => (
                <TaskItem key={task._id} task={task} />
              ))}
            </AnimatePresence>
            
            {selectedDayTasks.length === 0 && (
              <div className="empty-day">
                <p>No tasks scheduled for this day.</p>
                <button className="button outline" onClick={handleAddTask}>
                  <FiPlus />
                  Add Task
                </button>
              </div>
            )}
          </div>
        </div>
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

export default MonthlyView