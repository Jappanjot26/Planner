import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import DailyView from './views/DailyView'
import WeeklyView from './views/WeeklyView'
import MonthlyView from './views/MonthlyView'
import ProgressView from './views/ProgressView'
import { usePlanner } from './context/PlannerContext'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('monthly')
  const { loading } = usePlanner()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setSidebarOpen(!mobile)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const renderView = () => {
    switch (currentView) {
      case 'daily':
        return <DailyView />
      case 'weekly':
        return <WeeklyView />
      case 'monthly':
        return <MonthlyView />
      case 'progress':
        return <ProgressView />
      default:
        return <MonthlyView />
    }
  }

  return (
    <div className="app">
      <Header toggleSidebar={toggleSidebar} isMobile={isMobile} />
      <div className="app-container">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: isMobile ? '-100%' : 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isMobile ? '-100%' : 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="sidebar-container"
            >
              <Sidebar 
                currentView={currentView} 
                setCurrentView={setCurrentView} 
                isMobile={isMobile}
                closeSidebar={() => isMobile && setSidebarOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <main className="main-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading your planner...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="view-container"
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  )
}

export default App