import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Flame,
  CheckCircle2,
  Calendar,
  Award,
  TrendingUp,
  PieChart
} from 'lucide-react';
import { api } from '../api';

export default function ProgressView() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProgressCharts().then((data) => {
      setChartData(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || !chartData) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading academic progress analytics...</div>;
  }

  const { syllabus_by_subject, daily_study_hours, test_performance, priority_distribution } = chartData;

  // Max hours for scaling daily study chart
  const maxHours = Math.max(5.0, ...daily_study_hours.map((d) => d.hours));

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem' }}>Progress Analytics & Study Streak</h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
          Visual performance metrics tracking syllabus milestones, daily focus hours, diagnostic scores, and consistency streaks.
        </p>
      </div>

      {/* Streak Celebration Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
          border: '1px solid #fed7aa',
          borderRadius: '16px',
          padding: '24px 28px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#ea580c',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)'
            }}
          >
            <Flame size={32} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#9a3412', textTransform: 'uppercase' }}>
              Study Consistency
            </div>
            <h3 style={{ fontSize: '1.4rem', color: '#7c2d12', margin: '2px 0' }}>
              🔥 7 Day Active Study Streak!
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#c2410c' }}>
              You have completed study tasks or Pomodoro sessions every single day this week. Keep up the momentum!
            </p>
          </div>
        </div>

        {/* Weekly Day Tracker Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {daily_study_hours.map((d, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px 10px',
                borderRadius: '8px',
                background: d.hours > 0 ? '#ea580c' : '#ffffff',
                color: d.hours > 0 ? '#ffffff' : '#64748b',
                border: '1px solid',
                borderColor: d.hours > 0 ? '#ea580c' : '#e2e8f0',
                minWidth: '42px'
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>{d.date.split(' ')[0]}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, marginTop: '2px' }}>
                {d.hours > 0 ? '✓' : '-'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Chart 1: Syllabus Completion by Subject */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <CheckCircle2 size={18} color="#4f46e5" />
              <span>1. Syllabus Completion by Subject</span>
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {syllabus_by_subject.map((s, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{s.subject}</span>
                  <span style={{ fontWeight: 700, color: '#4f46e5' }}>{s.completion}%</span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${s.completion}%`,
                      background:
                        s.completion >= 75 ? '#10b981' : s.completion >= 50 ? '#4f46e5' : '#ef4444'
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                  {s.completed_chapters} of {s.total_chapters} chapters completed
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Study Hours Per Day (Past 7 Days Bar Chart) */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <BarChart3 size={18} color="#4f46e5" />
              <span>2. Study Hours Per Day (Last 7 Days)</span>
            </h3>
          </div>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '10px 0' }}>
            {daily_study_hours.map((d, idx) => {
              const heightPct = Math.min(100, (d.hours / maxHours) * 100);
              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5', marginBottom: '4px' }}>
                    {d.hours}h
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${heightPct}%`,
                      minHeight: '8px',
                      background: 'linear-gradient(180deg, #6366f1 0%, #4338ca 100%)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.4s ease'
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px', whiteSpace: 'nowrap' }}>
                    {d.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Test Performance by Subject */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Award size={18} color="#4f46e5" />
              <span>3. Average Test Performance by Subject</span>
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {test_performance.map((tp, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{tp.subject}</span>
                  <span style={{ fontWeight: 700, color: tp.average_score >= 70 ? '#16a34a' : '#d97706' }}>
                    {tp.average_score}%
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${tp.average_score}%`,
                      background: tp.average_score >= 70 ? '#10b981' : tp.average_score >= 50 ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Subject Priority Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <PieChart size={18} color="#4f46e5" />
              <span>4. ML Subject Priority Distribution</span>
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {priority_distribution.map((p, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: p.color }} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{p.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ fontSize: '1.1rem', color: p.color }}>{p.count}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Subjects</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
