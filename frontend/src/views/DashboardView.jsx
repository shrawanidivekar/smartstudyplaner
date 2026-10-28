import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  Sparkles,
  ArrowRight,
  AlertCircle,
  BookOpen,
  ChevronRight,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

export default function DashboardView({
  dashboardData,
  onStudyNow,
  onNavigateTab,
  onOpenNotifications
}) {
  if (!dashboardData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div className="spinner" />
        <p style={{ marginTop: '16px', color: '#64748b' }}>Loading your smart study dashboard...</p>
      </div>
    );
  }

  const { summary, today_recommendation, priority_subjects, notifications } = dashboardData;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <span className="badge badge-high">🔴 HIGH PRIORITY</span>;
      case 'MEDIUM':
        return <span className="badge badge-med">🟡 MEDIUM PRIORITY</span>;
      case 'LOW':
      default:
        return <span className="badge badge-low">🟢 LOW PRIORITY</span>;
    }
  };

  const getDifficultyStars = (diff) => {
    return '★'.repeat(diff) + '☆'.repeat(5 - diff);
  };

  return (
    <div>
      {/* Notifications Alert Banner if any urgent items */}
      {notifications && notifications.length > 0 && (
        <div
          style={{
            background: '#fff1f2',
            border: '1px solid #ffe4e6',
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} color="#e11d48" />
            <div>
              <strong style={{ color: '#9f1239', fontSize: '0.9rem' }}>
                {notifications[0].title}:
              </strong>{' '}
              <span style={{ color: '#be123c', fontSize: '0.86rem' }}>
                {notifications[0].message}
              </span>
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ borderColor: '#fecdd3', color: '#9f1239', background: 'white' }}
            onClick={onOpenNotifications}
          >
            View All ({notifications.length})
          </button>
        </div>
      )}

      {/* Summary Cards Grid */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon-box" style={{ background: '#e0e7ff', color: '#4338ca' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div className="summary-label">Exams Remaining</div>
            <div className="summary-value">{summary?.exams_remaining ?? 0}</div>
            <div className="summary-subtext">Active semester courses</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="summary-label">Syllabus Completed</div>
            <div className="summary-value">{summary?.syllabus_completed_pct ?? 0}%</div>
            <div className="summary-subtext">Overall coverage</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon-box" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="summary-label">Today's Study Hours</div>
            <div className="summary-value">
              {summary?.today_study_hours ?? 0}h
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                {' '}/ {summary?.target_study_hours || 4.5}h
              </span>
            </div>
            <div className="summary-subtext">Target daily allocation</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon-box" style={{ background: '#fff7ed', color: '#ea580c' }}>
            <Flame size={24} />
          </div>
          <div>
            <div className="summary-label">Study Streak</div>
            <div className="summary-value">{summary?.current_streak_days ?? 1} Days</div>
            <div className="summary-subtext">Consecutive daily study</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon-box" style={{ background: '#fdf4ff', color: '#c026d3' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="summary-label">Average Performance</div>
            <div className="summary-value">{summary?.average_performance ?? 75}%</div>
            <div className="summary-subtext">From recent mock quizzes</div>
          </div>
        </div>
      </div>

      {/* Today's Recommendation Banner */}
      {today_recommendation && (
        <div className="recommendation-banner">
          <div className="recommendation-content">
            <div style={{ maxWidth: '650px' }}>
              <div className="rec-title-tag">
                <Sparkles size={14} />
                <span>🎯 WHAT SHOULD I STUDY NOW?</span>
              </div>
              <div className="rec-subject">{today_recommendation.subject}</div>
              <div className="rec-topic">
                Topic: <strong>{today_recommendation.topic}</strong> • {today_recommendation.recommended_time} minutes suggested
              </div>

              <div className="rec-reasons">
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c7d2fe', fontWeight: 700 }}>
                  Why this subject now:
                </span>
                {today_recommendation.reasons?.map((reason, idx) => (
                  <div key={idx} className="rec-reason-item">
                    <span style={{ color: '#a5b4fc' }}>•</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                className="btn-study-now"
                onClick={() => onStudyNow(today_recommendation)}
              >
                <span>Study Now</span>
                <ArrowRight size={18} />
              </button>
              <div style={{ color: '#e0e7ff', fontSize: '0.78rem', marginTop: '8px' }}>
                Opens Pomodoro Focus Session
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Priority Subjects Section */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <BrainCircuit size={20} color="#4f46e5" />
              <span>Priority Subjects (Machine Learning Ranked)</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
              The ML classification model evaluates days until exam, syllabus gap, difficulty, and past score to prioritize what needs attention first.
            </p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigateTab('subjects')}
          >
            <span>Manage Subjects</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Exam Date</th>
                <th>Days Left</th>
                <th>Syllabus Completion</th>
                <th>Difficulty</th>
                <th>Past Marks</th>
                <th>ML Priority Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {priority_subjects?.map((sub) => (
                <tr key={sub.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{sub.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {sub.completed_chapters} / {sub.total_chapters} chapters completed
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{sub.exam_date}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontWeight: 700,
                        color: sub.days_remaining <= 7 ? '#dc2626' : sub.days_remaining <= 14 ? '#d97706' : '#16a34a'
                      }}
                    >
                      {sub.days_remaining} day{sub.days_remaining === 1 ? '' : 's'}
                    </span>
                  </td>
                  <td style={{ minWidth: '150px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600 }}>{sub.syllabus_completion}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${sub.syllabus_completion}%`,
                          backgroundColor:
                            sub.syllabus_completion >= 70
                              ? '#10b981'
                              : sub.syllabus_completion >= 45
                              ? '#f59e0b'
                              : '#ef4444'
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <span style={{ color: '#f59e0b', fontSize: '0.95rem' }} title={`Difficulty ${sub.difficulty} / 5`}>
                      {getDifficultyStars(sub.difficulty)}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{sub.previous_marks}%</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          background:
                            sub.ml_priority === 'HIGH'
                              ? '#fee2e2'
                              : sub.ml_priority === 'MEDIUM'
                              ? '#fef3c7'
                              : '#dcfce7',
                          color:
                            sub.ml_priority === 'HIGH'
                              ? '#991b1b'
                              : sub.ml_priority === 'MEDIUM'
                              ? '#92400e'
                              : '#166534',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {Math.round(sub.ml_priority_score)}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>/ 100</span>
                    </div>
                  </td>
                  <td>{getPriorityBadge(sub.ml_priority)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ padding: '8px', background: '#e0e7ff', borderRadius: '8px', color: '#4f46e5' }}>
                <Clock size={18} />
              </div>
              <h3 style={{ fontSize: '1rem' }}>Smart Daily Timetable</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
              Auto-generate today's schedule based on ML priority scores and optimal focus intervals with built-in breaks.
            </p>
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: '16px', width: '100%' }}
            onClick={() => onNavigateTab('study-plan')}
          >
            <span>Open Study Planner</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ padding: '8px', background: '#fee2e2', borderRadius: '8px', color: '#dc2626' }}>
                <TrendingUp size={18} />
              </div>
              <h3 style={{ fontSize: '1rem' }}>Weak Topic Diagnostics</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
              Detect conceptual pain points from recent quizzes and receive AI recommendations on what to review.
            </p>
          </div>
          <button
            className="btn btn-secondary"
            style={{ marginTop: '16px', width: '100%' }}
            onClick={() => onNavigateTab('performance')}
          >
            <span>Check Weak Topics</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ padding: '8px', background: '#dcfce7', borderRadius: '8px', color: '#16a34a' }}>
                <BrainCircuit size={18} />
              </div>
              <h3 style={{ fontSize: '1rem' }}>Expected Exam Score ML</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
              Simulate expected exam outcomes using our regression model and explore what-if prep improvements.
            </p>
          </div>
          <button
            className="btn btn-secondary"
            style={{ marginTop: '16px', width: '100%' }}
            onClick={() => onNavigateTab('score-predict')}
          >
            <span>Run Score Prediction</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
