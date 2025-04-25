import { useState } from 'react'
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isToday,
  isSameDay,
  addWeeks,
  subWeeks
} from 'date-fns'
import { FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlanner } from '../context/PlannerContext'
import TaskItem from '../components/TaskItem'
import NewTaskForm from '../components/NewTaskForm'
import './WeeklyView.css'

const WeeklyView = () => {
  const { selectedDate, setSelectedDate, getTasksForDate, getWeeklyStats } = usePlanner()
  const [isAddingTask, setIsAddingTask] = useState(false)
  
  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 }) // Monday as start of week
  const endDate = endOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: startDate, end: endDate })
  
  const weeklyStats = getWeeklyStats()
  
  const handlePrevWeek = () => {
    setSelectedDate(subWeeks(selectedDate, 1))
  }
  
  const handleNextWeek = () => {
    setSelectedDate(addWeeks(selectedDate, 1))
  }
  
  const handleDayClick = (date) => {
    setSelectedDate(date)
  }
  
  const handleAddTask = () => {
    setIsAddingTask(true)
  }
  
  const handleCloseForm = () => {
    setIsAddingTask(false)
  }
  
  const getTotalWeeklyPoints = () => {
    return weeklyStats.reduce((total, day) => total + day.points, 0)
  }
  
  return (
    <div className="weekly-view">
      <div className="view-header">
        <div className="view-title">
          <h2>Weekly Overview</h2>
          <p className="view-subtitle">
            {format(startDate, 'MMMM d')} - {format(endDate, 'MMMM d, yyyy')}
          </p>
        </div>
        
        <div className="view-actions">
          <div className="week-navigation">
            <button 
              className="nav-button" 
              onClick={handlePrevWeek}
              aria-label="Previous week"
            >
              <FiChevronLeft />
            </button>
            <button 
              className="nav-button today" 
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </button>
            <button 
              className="nav-button" 
              onClick={handleNextWeek}
              aria-label="Next week"
            >
              <FiChevronRight />
            </button>
          </div>
          
          <button className="add-task-button" onClick={handleAddTask}>
            <FiPlus />
            <span>Add Task</span>
          </button>
        </div>
      </div>
      
      <div className="weekly-stats-summary">
        <div className="stat-card">
          <div className="stat-label">Total Weekly Points</div>
          <div className={`stat-value ${getTotalWeeklyPoints() >= 0 ? 'positive' : 'negative'}`}>
            {getTotalWeeklyPoints() >= 0 ? '+' : ''}{getTotalWeeklyPoints()}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Weekly Progress</div>
          <div className="week-progress-bar">
            {weeklyStats.map((day, index) => {
              const totalTasks = day.total
              const progressPercent = totalTasks > 0 ? (day.completed / totalTasks) * 100 : 0
              
              return (
                <div key={index} className="day-progress">
                  <div className="day-label">{format(day.date, 'EEE')}</div>
                  <div className="progress-bar">
                    <motion.div 
                      className={`progress-fill ${day.points < 0 ? 'negative' : ''}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
                    />
                  </div>
                  <div className="day-stats">
                    <span className="day-completed">{day.completed}</span>
                    <span className="day-total">/{totalTasks}</span>
                    <span className={`day-points ${day.points >= 0 ? 'positive' : 'negative'}`}>
                      {day.points >= 0 ? '+' : ''}{day.points}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      <div className="week-calendar">
        {weekDays.map((day) => {
          const dayTasks = getTasksForDate(day)
          const isSelected = isSameDay(day, selectedDate)
          
          return (
            <div 
              key={day.toString()} 
              className={`day-column ${isToday(day) ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleDayClick(day)}
            >
              <div className="day-header">
                <div className="day-name">{format(day, 'EEE')}</div>
                <div className="day-date">{format(day, 'd')}</div>
              </div>
              
              <div className="day-tasks">
                {dayTasks.length > 0 ? (
                  dayTasks.map(task => (
                    <motion.div 
                      key={task._id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`task-card ${task.completed ? 'completed' : ''} ${task.missed ? 'missed' : ''}`}
                    >
                      <div className="task-card-title">{task.title}</div>
                      <div className="task-card-points">
                        {task.completed ? 
                          `+${task.points}` : 
                          task.missed ? 
                          `-${task.penaltyPoints}` : 
                          `${task.points}pts`
                        }
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="no-tasks">
                    <span>No tasks</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="selected-day-tasks">
        <h3 className="section-title">
          Tasks for {format(selectedDate, 'EEEE, MMMM d')}
        </h3>
        
        <div className="tasks-list">
          <AnimatePresence>
            {getTasksForDate(selectedDate).map(task => (
              <TaskItem key={task._id} task={task} />
            ))}
          </AnimatePresence>
          
          {getTasksForDate(selectedDate).length === 0 && (
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

export default WeeklyView