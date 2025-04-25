import { useState, useEffect } from "react";
import { format } from "date-fns";
import { FiMenu, FiCalendar, FiBell } from "react-icons/fi";
import { motion } from "framer-motion";
import { usePlanner } from "../context/PlannerContext";
import "./Header.css";

const Header = ({ toggleSidebar, isMobile }) => {
  const { selectedDate, stats } = usePlanner();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`app-header ${scrolled ? "scrolled" : ""}`}>
      <div className="header-container">
        <div className="header-left">
          {isMobile && (
            <button
              className="menu-button"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              <FiMenu />
            </button>
          )}

          <div className="logo-container">
            <FiCalendar className="logo-icon" />
            <h1 className="app-title">Monthly Planner</h1>
          </div>
        </div>

        <div className="header-center">
          <div className="current-date">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              key={selectedDate.toString()}
              transition={{ duration: 0.3 }}
            >
              {format(selectedDate, "MMMM yyyy")}
            </motion.span>
          </div>
        </div>

        <div className="header-right">
          <div className="points-display">
            <div className="points-badge">
              <span>{stats.totalPoints}</span>
              <span className="points-label">Points</span>
            </div>
            {stats.optionalPoints > 0 && (
              <div className="points-badge optional">
                <span>{stats.optionalPoints}</span>
                <span className="points-label">Optional</span>
              </div>
            )}
          </div>

          {/* <button className="notification-button" aria-label="Notifications">
            <FiBell />
            {stats.missedTasks > 0 && (
              <span className="notification-badge">{stats.missedTasks}</span>
            )}
          </button> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
