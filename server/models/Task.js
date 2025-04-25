import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  points: {
    type: Number,
    required: true,
    default: 5,
    min: 1
  },
  penaltyPoints: {
    type: Number,
    required: true,
    default: 3,
    min: 0
  },
  optional: {
    type: Boolean,
    default: false
  },
  completed: {
    type: Boolean,
    default: false
  },
  missed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export const Task = mongoose.model('Task', taskSchema)