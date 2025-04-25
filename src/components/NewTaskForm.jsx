import { useState } from 'react'
import { FiPlus, FiX } from 'react-icons/fi'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { usePlanner } from '../context/PlannerContext'
import './NewTaskForm.css'

const NewTaskForm = ({ onClose }) => {
  const { addTask, selectedDate } = usePlanner()
  
  const [taskData, setTaskData] = useState({
    title: '',
    date: selectedDate,
    points: 5,
    penaltyPoints: 3,
    optional: false,
    completed: false,
    missed: false
  })
  
  const [errors, setErrors] = useState({})
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    setTaskData({
      ...taskData,
      [name]: type === 'checkbox' ? checked : value
    })
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }
  
  const handleDateChange = (date) => {
    setTaskData({
      ...taskData,
      date
    })
  }
  
  const validate = () => {
    const newErrors = {}
    
    if (!taskData.title.trim()) {
      newErrors.title = 'Task title is required'
    }
    
    if (taskData.points < 1) {
      newErrors.points = 'Points must be at least 1'
    }
    
    if (taskData.penaltyPoints < 0) {
      newErrors.penaltyPoints = 'Penalty points cannot be negative'
    }
    
    return newErrors
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    try {
      await addTask(taskData)
      onClose()
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }
  
  return (
    <div className="new-task-form-container">
      <div className="form-header">
        <h3>Add New Task</h3>
        <button className="close-button" onClick={onClose}>
          <FiX />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Task Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={taskData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <div className="error-message">{errors.title}</div>}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Due Date</label>
            <DatePicker
              selected={taskData.date}
              onChange={handleDateChange}
              dateFormat="MMMM d, yyyy"
              className="date-picker"
            />
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                id="optional"
                name="optional"
                checked={taskData.optional}
                onChange={handleChange}
              />
              Optional Task
            </label>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="points">Completion Points</label>
            <input
              type="number"
              id="points"
              name="points"
              value={taskData.points}
              onChange={handleChange}
              min="1"
              max="100"
              className={errors.points ? 'error' : ''}
            />
            {errors.points && <div className="error-message">{errors.points}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="penaltyPoints">Penalty Points</label>
            <input
              type="number"
              id="penaltyPoints"
              name="penaltyPoints"
              value={taskData.penaltyPoints}
              onChange={handleChange}
              min="0"
              max="100"
              className={errors.penaltyPoints ? 'error' : ''}
            />
            {errors.penaltyPoints && <div className="error-message">{errors.penaltyPoints}</div>}
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" className="button outline" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button">
            <FiPlus />
            Add Task
          </button>
        </div>
      </form>
    </div>
  )
}

export default NewTaskForm