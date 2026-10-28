import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  CheckCircle2,
  BookOpen,
  Award,
  Sparkles,
  Volume2
} from 'lucide-react';
import { api } from '../api';

export default function PomodoroView({ activeStudyItem, onStudyComplete }) {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [sessionTopic, setSessionTopic] = useState('');

  // Timer Configuration (in minutes)
  const [studyMinutes, setStudyMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  // Timer State
  const [mode, setMode] = useState('study'); // 'study' or 'break'
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({ today_sessions: 0, today_minutes: 0, today_hours: 0, total_sessions: 0 });
  const [notification, setNotification] = useState('');

  const timerRef = useRef(null);

  // Load subjects and stats
  useEffect(() => {
    api.getSubjects().then((data) => {
      setSubjects(data);
      if (data.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(data[0].id);
      }
    }).catch(() => {});

    loadStats();
  }, []);

  // Sync if opened via "Study Now" button
  useEffect(() => {
    if (activeStudyItem) {
      if (activeStudyItem.subject_id) {
        setSelectedSubjectId(activeStudyItem.subject_id);
      }
      if (activeStudyItem.topic) {
        setSessionTopic(activeStudyItem.topic);
      }
      if (activeStudyItem.recommended_time) {
        setStudyMinutes(activeStudyItem.recommended_time);
        setTimeLeft(activeStudyItem.recommended_time * 60);
      }
    }
  }, [activeStudyItem]);

  const loadStats = async () => {
    try {
      const data = await api.getPomodoroStats();
      setStats(data);
    } catch (e) {}
  };

  // Timer Tick Effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    if (mode === 'study') {
      try {
        await api.logPomodoro({
          subject_id: selectedSubjectId ? Number(selectedSubjectId) : null,
          duration: Number(studyMinutes),
          session_type: 'pomodoro'
        });
        loadStats();
        if (onStudyComplete) onStudyComplete();
      } catch (e) {}

      setNotification(`🎉 Great job! You completed ${studyMinutes} minutes of focused study! Take a well-deserved ${breakMinutes} minute break.`);
      setMode('break');
      setTimeLeft(breakMinutes * 60);
    } else {
      setNotification('☕ Break completed! Ready to begin your next study interval?');
      setMode('study');
      setTimeLeft(studyMinutes * 60);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    setNotification('');
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft((mode === 'study' ? studyMinutes : breakMinutes) * 60);
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft((newMode === 'study' ? studyMinutes : breakMinutes) * 60);
  };

  const applyPreset = (sMins, bMins) => {
    setIsRunning(false);
    setStudyMinutes(sMins);
    setBreakMinutes(bMins);
    setTimeLeft(sMins * 60);
    setMode('study');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalCurrentSeconds = (mode === 'study' ? studyMinutes : breakMinutes) * 60;
  const progressPercent = Math.round(((totalCurrentSeconds - timeLeft) / totalCurrentSeconds) * 100);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem' }}>Pomodoro Focus Timer</h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
          Interleave focused 25 or 45 minute deep work sprints with restorative rest intervals. Completed blocks automatically update your study streak!
        </p>
      </div>

      {notification && (
        <div
          style={{
            background: mode === 'break' ? '#f0fdf4' : '#eff6ff',
            border: '1px solid',
            borderColor: mode === 'break' ? '#bbf7d0' : '#bfdbfe',
            color: mode === 'break' ? '#166534' : '#1e40af',
            padding: '14px 20px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <Sparkles size={20} />
          <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{notification}</span>
        </div>
      )}

      {/* Main Timer Display Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* Mode Switch Tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '999px', marginBottom: '24px' }}>
            <button
              className={`btn btn-sm ${mode === 'study' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '999px', border: 'none' }}
              onClick={() => switchMode('study')}
            >
              <BookOpen size={14} />
              <span>Study Session ({studyMinutes}m)</span>
            </button>
            <button
              className={`btn btn-sm ${mode === 'break' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '999px', border: 'none' }}
              onClick={() => switchMode('break')}
            >
              <Coffee size={14} />
              <span>Rest Break ({breakMinutes}m)</span>
            </button>
          </div>

          {/* Circular Timer Visual */}
          <div
            className="timer-circle"
            style={{
              borderColor: mode === 'study' ? '#e0e7ff' : '#dcfce7',
              borderTopColor: mode === 'study' ? '#4f46e5' : '#10b981'
            }}
          >
            <div className="timer-display">{formatTime(timeLeft)}</div>
            <div className="timer-mode">
              {mode === 'study' ? '🎯 Focus Mode' : '☕ Rest Break'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
              {progressPercent}% Complete
            </div>
          </div>

          {/* Active Topic Banner if specified */}
          {sessionTopic && (
            <div style={{ marginBottom: '20px', padding: '6px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Active Topic: </span>
              <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{sessionTopic}</strong>
            </div>
          )}

          {/* Controls */}
          <div style={{ display: 'flex', gap: '14px', marginBottom: '28px' }}>
            <button
              className="btn btn-primary"
              style={{
                padding: '12px 32px',
                fontSize: '1rem',
                borderRadius: '999px',
                background: isRunning ? '#d97706' : '#4f46e5'
              }}
              onClick={toggleTimer}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
            </button>

            <button
              className="btn btn-secondary"
              style={{ padding: '12px 20px', borderRadius: '999px' }}
              onClick={resetTimer}
              title="Reset Timer"
            >
              <RotateCcw size={18} />
              <span>Reset</span>
            </button>
          </div>

          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', alignSelf: 'center', marginRight: '4px' }}>
              Presets:
            </span>
            <button className="btn btn-secondary btn-sm" onClick={() => applyPreset(25, 5)}>
              25 / 5 min
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => applyPreset(45, 10)}>
              45 / 10 min
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => applyPreset(50, 10)}>
              50 / 10 min
            </button>
          </div>
        </div>

        {/* Configuration and Stats Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>
              <BookOpen size={18} color="#4f46e5" />
              <span>Session Details</span>
            </h3>

            <div className="form-group">
              <label className="form-label">Subject to Log For</label>
              <select
                className="form-select"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Topic Description (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Principal Component Analysis derivation"
                value={sessionTopic}
                onChange={(e) => setSessionTopic(e.target.value)}
              />
            </div>

            <div className="form-grid">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Custom Study (Mins)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  className="form-input"
                  value={studyMinutes}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setStudyMinutes(val);
                    if (mode === 'study') setTimeLeft(val * 60);
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Custom Break (Mins)</label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  className="form-input"
                  value={breakMinutes}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setBreakMinutes(val);
                    if (mode === 'break') setTimeLeft(val * 60);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Today's Focus Stats */}
          <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="#f59e0b" />
              <span>Focus Session Tracking</span>
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Sessions Today</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4f46e5' }}>
                  {stats.today_sessions}
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Minutes Studied Today</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
                  {stats.today_minutes}m
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '12px' }}>
              Every completed study cycle automatically updates your daily study hours and maintains your streak!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
