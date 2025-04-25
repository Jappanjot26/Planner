import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiGrid,
  FiBarChart2,
  FiClock,
  FiSettings,
  FiHelpCircle,
} from "react-icons/fi";
import "./Sidebar.css";

const Sidebar = ({ currentView, setCurrentView, isMobile, closeSidebar }) => {
  const [expanded, setExpanded] = useState(false);

  const handleViewChange = (view) => {
    setCurrentView(view);
    if (isMobile) closeSidebar();
  };

  const menuItems = [
    { id: "daily", icon: <FiClock />, label: "Daily" },
    { id: "weekly", icon: <FiGrid />, label: "Weekly" },
    { id: "monthly", icon: <FiCalendar />, label: "Monthly" },
    { id: "progress", icon: <FiBarChart2 />, label: "Progress" },
  ];

  return (
    <aside className={`sidebar ${expanded ? "expanded" : ""}`}>
      <div className="sidebar-content">
        <div className="sidebar-header">
          <h2>Views</h2>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`nav-item ${
                    currentView === item.id ? "active" : ""
                  }`}
                  onClick={() => handleViewChange(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {currentView === item.id && (
                    <motion.div
                      className="active-indicator"
                      layoutId="activeIndicator"
                      transition={{ type: "spring", duration: 0.3 }}
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* <div className="sidebar-footer">
          <button className="footer-button">
            <FiSettings />
            <span>Settings</span>
          </button>
          <button className="footer-button">
            <FiHelpCircle />
            <span>Help</span>
          </button>
        </div> */}
      </div>
    </aside>
  );
};

export default Sidebar;
