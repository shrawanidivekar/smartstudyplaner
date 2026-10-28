import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  LineChart,
  BrainCircuit,
  RotateCcw,
  Timer,
  BarChart3,
  Calendar,
  User,
  Info,
  LogOut,
  Target
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, user, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'study-plan', label: 'Study Planner', icon: CalendarDays },
    { id: 'performance', label: 'Performance & Weak Topics', icon: LineChart },
    { id: 'ml-priority', label: 'ML Priority Predictor', icon: Target },
    { id: 'score-predict', label: 'Score Predictor (ML)', icon: BrainCircuit },
    { id: 'revision', label: 'Revision Tracker', icon: RotateCcw },
    { id: 'progress', label: 'Progress Charts', icon: BarChart3 },
    { id: 'calendar', label: 'Academic Calendar', icon: Calendar },
    { id: 'pomodoro', label: 'Pomodoro Timer', icon: Timer },
    { id: 'profile', label: 'Student Profile', icon: User },
    { id: 'about', label: 'About Project', icon: Info },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">
          <BrainCircuit size={22} />
        </div>
        <div className="brand-text">
          <h2>SmartStudy</h2>
          <p>AI Student Assistant</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-mini-card">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="user-info-text">
            <div className="user-name">{user?.name || 'Student'}</div>
            <div className="user-role">{user?.course ? user.course.split(' ')[0] : 'Student'} • {user?.semester || 'Sem 6'}</div>
          </div>
        </div>
        <button
          className="nav-item"
          style={{ color: '#ef4444', padding: '8px 12px' }}
          onClick={onLogout}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
