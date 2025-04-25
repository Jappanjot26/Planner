import express from 'express'
import { Task } from '../models/Task.js'

const router = express.Router()

// Get all tasks
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ date: 1 })
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single task
router.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    res.json(task)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create new task
router.post('/tasks', async (req, res) => {
  const task = new Task({
    title: req.body.title,
    date: req.body.date,
    points: req.body.points,
    penaltyPoints: req.body.penaltyPoints,
    optional: req.body.optional,
    completed: req.body.completed,
    missed: req.body.missed
  })

  try {
    const newTask = await task.save()
    res.status(201).json(newTask)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update task
router.put('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    
    if (req.body.title) task.title = req.body.title
    if (req.body.date) task.date = req.body.date
    if (req.body.points !== undefined) task.points = req.body.points
    if (req.body.penaltyPoints !== undefined) task.penaltyPoints = req.body.penaltyPoints
    if (req.body.optional !== undefined) task.optional = req.body.optional
    if (req.body.completed !== undefined) task.completed = req.body.completed
    if (req.body.missed !== undefined) task.missed = req.body.missed
    
    const updatedTask = await task.save()
    res.json(updatedTask)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete task
router.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    
    await task.deleteOne()
    res.json({ message: 'Task deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get tasks by date range
router.get('/tasks/range/:start/:end', async (req, res) => {
  try {
    const { start, end } = req.params
    const tasks = await Task.find({
      date: {
        $gte: new Date(start),
        $lte: new Date(end)
      }
    }).sort({ date: 1 })
    
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export const taskRoutes = router