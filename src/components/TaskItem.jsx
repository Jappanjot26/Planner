import { useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { 
  FiCheckCircle, 
  FiCircle, 
  FiTrash2, 
  FiEdit2, 
  FiAlertCircle,
  FiStar
} from 'react-icons/fi'
import { usePlanner } from '../context/PlannerContext'
import './TaskItem.css'

const TaskItem = ({ task }) => {
  const { completeTask, missTask, deleteTask, updateTask } = usePlanner()
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(task.title)
  const [showOptions, setShowOptions] = useState(false)
  
  const handleComplete = () => {
    completeTask(task._id)
  }
  
  const handleMiss = () => {
    missTask(task._id)
  }
  
  const handleDelete = () => {
    deleteTask(task._id)
  }
  
  const handleEdit = () => {
    setIsEditing(true)
  }
  
  const handleSave = () => {
    if (editedTitle.trim()) {
      updateTask(task._id, { title: editedTitle })
      setIsEditing(false)
    }
  }
  
  const handleCancel = () => {
    setEditedTitle(task.title)
    setIsEditing(false)
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }
  
  const getTaskStatusIcon = () => {
    if (task.completed) {
      return <FiCheckCircle className="status-icon completed" />
    } else if (task.missed) {
      return <FiAlertCircle className="status-icon missed" />
    } else {
      return <FiCircle className="status-icon pending" />
    }
  }
  
  return (
    <motion.div 
      className={`task-item ${task.completed ? 'completed' : ''} ${task.missed ? 'missed' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      layout
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      <div className="task-content">
        <div className="task-status" onClick={task.completed || task.missed ? null : handleComplete}>
          {getTaskStatusIcon()}
        </div>
        
        <div className="task-details">
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              autoFocus
              className="task-edit-input"
            />
          ) : (
            <div className="task-title">
              {task.title}
              {task.optional && <FiStar className="optional-icon" />}
            </div>
          )}
          
          <div className="task-meta">
            <span className="task-date">{format(new Date(task.date), 'MMM d')}</span>
            <span className="task-points">
              {task.completed ? (
                `+${task.points} pts`
              ) : task.missed ? (
                `-${task.penaltyPoints} pts`
              ) : (
                `${task.points}/${task.penaltyPoints} pts`
              )}
            </span>
          </div>
        </div>
      </div>
      
      <motion.div 
        className="task-actions"
        initial={{ opacity: 0 }}
        animate={{ opacity: showOptions || isEditing ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {!isEditing && (
          <>
            {!task.completed && !task.missed && (
              <>
                <button onClick={handleComplete} className="action-button complete">
                  <FiCheckCircle />
                </button>
                <button onClick={handleMiss} className="action-button miss">
                  <FiAlertCircle />
                </button>
              </>
            )}
            <button onClick={handleEdit} className="action-button edit">
              <FiEdit2 />
            </button>
            <button onClick={handleDelete} className="action-button delete">
              <FiTrash2 />
            </button>
          </>
        )}
        
        {isEditing && (
          <div className="edit-actions">
            <button onClick={handleSave} className="action-button save">Save</button>
            <button onClick={handleCancel} className="action-button cancel">Cancel</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default TaskItem