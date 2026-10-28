import React, { useState, useEffect } from 'react';
import { api, getStoredUser, clearAuthToken } from './api';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

// Views
import DashboardView from './views/DashboardView';
import SubjectsView from './views/SubjectsView';
import StudyPlannerView from './views/StudyPlannerView';
import PerformanceView from './views/PerformanceView';
import MLPriorityView from './views/MLPriorityView';
import ScorePredictionView from './views/ScorePredictionView';
import RevisionView from './views/RevisionView';
import ProgressView from './views/ProgressView';
import CalendarView from './views/CalendarView';
import PomodoroView from './views/PomodoroView';
import ProfileView from './views/ProfileView';
import AboutProjectView from './views/AboutProjectView';
import AuthView from './views/AuthView';

import { X, Bell, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeStudyItem, setActiveStudyItem] = useState(null);

  // Load Dashboard Data
  const loadDashboard = async () => {
    try {
      setLoadingDashboard(true);
      const data = await api.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadDashboard();
    }
  }, [currentUser]);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    loadDashboard();
  };

  const handleLogout = () => {
    clearAuthToken();
    setCurrentUser(null);
    setCurrentTab('dashboard');
  };

  const handleStudyNow = (recommendation) => {
    setActiveStudyItem(recommendation);
    setCurrentTab('pomodoro');
  };

  if (!currentUser) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Student Academic Dashboard';
      case 'subjects':
        return 'Subject Management & Syllabus Tracking';
      case 'study-plan':
        return 'Smart Daily Study Planner';
      case 'performance':
        return 'Performance Diagnostics & Weak Topics';
      case 'ml-priority':
        return 'ML Subject Priority Prediction';
      case 'score-predict':
        return 'ML Expected Exam Score Prediction';
      case 'revision':
        return 'Spaced Revision Tracker';
      case 'progress':
        return 'Progress Charts & Streak Analytics';
      case 'calendar':
        return 'Academic Calendar & Milestones';
      case 'pomodoro':
        return 'Pomodoro Focus Timer';
      case 'profile':
        return 'Student Profile Settings';
      case 'about':
        return 'Project Documentation & Viva Guide';
      default:
        return 'Smart Study Planner';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Topbar
          title={getPageTitle()}
          streakDays={dashboardData?.summary?.current_streak_days || 7}
          notificationsCount={dashboardData?.notifications?.length || 0}
          onOpenNotifications={() => setNotificationsOpen(true)}
          onQuickStudy={() => {
            if (dashboardData?.today_recommendation) {
              handleStudyNow(dashboardData.today_recommendation);
            } else {
              setCurrentTab('pomodoro');
            }
          }}
        />

        <main className="content-body">
          {currentTab === 'dashboard' && (
            <DashboardView
              dashboardData={dashboardData}
              onStudyNow={handleStudyNow}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenNotifications={() => setNotificationsOpen(true)}
            />
          )}

          {currentTab === 'subjects' && (
            <SubjectsView onRefreshDashboard={loadDashboard} />
          )}

          {currentTab === 'study-plan' && (
            <StudyPlannerView onStudyNow={handleStudyNow} />
          )}

          {currentTab === 'performance' && (
            <PerformanceView onStudyNow={handleStudyNow} />
          )}

          {currentTab === 'ml-priority' && <MLPriorityView />}

          {currentTab === 'score-predict' && <ScorePredictionView />}

          {currentTab === 'revision' && <RevisionView />}

          {currentTab === 'progress' && <ProgressView />}

          {currentTab === 'calendar' && <CalendarView />}

          {currentTab === 'pomodoro' && (
            <PomodoroView
              activeStudyItem={activeStudyItem}
              onStudyComplete={loadDashboard}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              user={currentUser}
              onProfileUpdated={(updated) => setCurrentUser(updated)}
            />
          )}

          {currentTab === 'about' && <AboutProjectView />}
        </main>
      </div>

      {/* Notifications Drawer Modal */}
      {notificationsOpen && (
        <div className="modal-overlay" onClick={() => setNotificationsOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px' }}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bell size={20} color="#4f46e5" />
                <h3 style={{ fontSize: '1.15rem' }}>Academic Reminders & Alerts</h3>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                onClick={() => setNotificationsOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {!dashboardData?.notifications || dashboardData.notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
                  No pending reminders! All tasks and revisions are on schedule.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {dashboardData.notifications.map((notif, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        background:
                          notif.type === 'exam'
                            ? '#fff1f2'
                            : notif.type === 'revision'
                            ? '#fffbeb'
                            : '#f8fafc',
                        border: '1px solid',
                        borderColor:
                          notif.type === 'exam'
                            ? '#fecdd3'
                            : notif.type === 'revision'
                            ? '#fde68a'
                            : '#e2e8f0'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '4px'
                        }}
                      >
                        <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>
                          {notif.title}
                        </strong>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            background:
                              notif.type === 'exam'
                                ? '#fee2e2'
                                : notif.type === 'revision'
                                ? '#fef3c7'
                                : '#e0e7ff',
                            color:
                              notif.type === 'exam'
                                ? '#dc2626'
                                : notif.type === 'revision'
                                ? '#d97706'
                                : '#4338ca'
                          }}
                        >
                          {notif.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#475569' }}>
                        {notif.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setNotificationsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
