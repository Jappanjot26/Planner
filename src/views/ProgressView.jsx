import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'
import { usePlanner } from '../context/PlannerContext'
import './ProgressView.css'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
)

const ProgressView = () => {
  const { selectedDate, tasks, stats, getTasksForMonth, getWeeklyStats } = usePlanner()
  const [monthDays, setMonthDays] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [weeklyStats, setWeeklyStats] = useState([])
  
  // Generate month days
  useEffect(() => {
    const start = startOfMonth(selectedDate)
    const end = endOfMonth(selectedDate)
    const days = eachDayOfInterval({ start, end })
    setMonthDays(days)
  }, [selectedDate])
  
  // Calculate monthly data
  useEffect(() => {
    const monthTasks = getTasksForMonth()
    
    const dailyStats = monthDays.map(day => {
      const dayTasks = monthTasks.filter(task => 
        isSameDay(new Date(task.date), day)
      )
      
      return {
        date: day,
        total: dayTasks.length,
        completed: dayTasks.filter(t => t.completed).length,
        missed: dayTasks.filter(t => t.missed).length,
        points: dayTasks.reduce((sum, task) => {
          if (task.completed) return sum + task.points
          if (task.missed) return sum - task.penaltyPoints
          return sum
        }, 0)
      }
    })
    
    setMonthlyData(dailyStats)
  }, [monthDays, getTasksForMonth])
  
  // Get weekly stats
  useEffect(() => {
    const stats = getWeeklyStats()
    setWeeklyStats(stats)
  }, [getWeeklyStats])
  
  // Chart data for monthly progress
  const monthlyChartData = {
    labels: monthlyData.map(d => format(d.date, 'd')),
    datasets: [
      {
        label: 'Points',
        data: monthlyData.map(d => d.points),
        borderColor: 'rgba(10, 132, 255, 1)',
        backgroundColor: 'rgba(10, 132, 255, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  }
  
  // Chart options for monthly progress
  const monthlyChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Points Progression for ${format(selectedDate, 'MMMM yyyy')}`,
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex
            return format(monthlyData[index].date, 'MMMM d, yyyy')
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
      }
    }
  }
  
  // Chart data for weekly tasks
  const weeklyChartData = {
    labels: weeklyStats.map(d => format(d.date, 'EEE')),
    datasets: [
      {
        label: 'Completed Tasks',
        data: weeklyStats.map(d => d.completed),
        backgroundColor: 'rgba(48, 209, 88, 0.8)',
      },
      {
        label: 'Missed Tasks',
        data: weeklyStats.map(d => d.missed),
        backgroundColor: 'rgba(255, 69, 58, 0.8)',
      }
    ]
  }
  
  // Chart options for weekly tasks
  const weeklyChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weekly Task Completion',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  }
  
  // Task status distribution
  const completedCount = tasks.filter(t => t.completed).length
  const missedCount = tasks.filter(t => t.missed).length
  const pendingCount = tasks.filter(t => !t.completed && !t.missed).length
  
  // Chart data for task distribution
  const distributionChartData = {
    labels: ['Completed', 'Missed', 'Pending'],
    datasets: [
      {
        data: [completedCount, missedCount, pendingCount],
        backgroundColor: [
          'rgba(48, 209, 88, 0.8)',
          'rgba(255, 69, 58, 0.8)',
          'rgba(10, 132, 255, 0.8)'
        ],
        borderColor: [
          'rgba(48, 209, 88, 1)',
          'rgba(255, 69, 58, 1)',
          'rgba(10, 132, 255, 1)'
        ],
        borderWidth: 1,
      }
    ]
  }
  
  // Calculate task completion rate
  const completionRate = tasks.length > 0 
    ? Math.round((completedCount / tasks.length) * 100) 
    : 0
  
  return (
    <div className="progress-view">
      <div className="view-header">
        <div className="view-title">
          <h2>Progress Analytics</h2>
          <p className="view-subtitle">
            Visualize your productivity metrics and task completion
          </p>
        </div>
      </div>
      
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-value large">{stats.totalPoints}</div>
          <div className="stat-label">Total Points</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value large">{completionRate}%</div>
          <div className="stat-label">Completion Rate</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value large">{stats.completedTasks}</div>
          <div className="stat-label">Completed Tasks</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value large">{stats.optionalPoints}</div>
          <div className="stat-label">Optional Points</div>
        </div>
      </div>
      
      <div className="charts-container">
        <div className="chart-card large">
          <Line data={monthlyChartData} options={monthlyChartOptions} />
        </div>
        
        <div className="charts-row">
          <div className="chart-card">
            <Bar data={weeklyChartData} options={weeklyChartOptions} />
          </div>
          
          <div className="chart-card">
            <div className="pie-container">
              <Pie data={distributionChartData} />
              <h3 className="chart-title">Task Distribution</h3>
            </div>
          </div>
        </div>
      </div>
      
      <div className="progress-summary">
        <h3>Month Summary</h3>
        <div className="summary-content">
          <div className="summary-stat">
            <span className="label">Most Productive Day:</span> 
            <span className="value">
              {monthlyData.length > 0 ? 
                format(monthlyData.reduce((max, day) => 
                  day.completed > max.completed ? day : max
                , monthlyData[0]).date, 'MMMM d, yyyy') : 
                'No data'
              }
            </span>
          </div>
          
          <div className="summary-stat">
            <span className="label">Highest Points Day:</span>
            <span className="value">
              {monthlyData.length > 0 ? 
                format(monthlyData.reduce((max, day) => 
                  day.points > max.points ? day : max
                , monthlyData[0]).date, 'MMMM d, yyyy') : 
                'No data'
              }
            </span>
          </div>
          
          <div className="summary-stat">
            <span className="label">Average Daily Completion:</span>
            <span className="value">
              {monthlyData.length > 0 ? 
                `${(monthlyData.reduce((sum, day) => 
                  sum + (day.total > 0 ? day.completed / day.total : 0)
                , 0) / monthlyData.length * 100).toFixed(1)}%` : 
                '0%'
              }
            </span>
          </div>
          
          <div className="summary-stat">
            <span className="label">Tasks Completed:</span>
            <span className="value">
              {completedCount} of {tasks.length} ({completionRate}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgressView