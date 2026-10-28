import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  Sparkles,
  CheckCircle,
  Circle,
  Coffee,
  Trash2,
  Edit3,
  Plus,
  RefreshCw,
  X,
  Play
} from 'lucide-react';
import { api } from '../api';

export default function StudyPlannerView({ onStudyNow }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Generation Form State
  const [availableHours, setAvailableHours] = useState(4.0);
  const [startTime, setStartTime] = useState('18:00');
  const [breakDuration, setBreakDuration] = useState(10);
  const [generating, setGenerating] = useState(false);

  // Edit Task Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    topic: '',
    start_time: '',
    end_time: '',
    date: ''
  });

  const loadTasks = async (date) => {
    try {
      setLoading(true);
      const data = await api.getStudyPlan(date || selectedDate);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks(selectedDate);
  }, [selectedDate]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      setGenerating(true);
      await api.generateStudyPlan({
        date: selectedDate,
        available_hours: Number(availableHours),
        start_time: startTime,
        break_duration: Number(breakDuration)
      });
      setSuccess('AI Study Plan generated based on your ML subject priorities!');
      loadTasks(selectedDate);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggle = async (taskId) => {
    try {
      const res = await api.toggleTask(taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: res.completed } : t))
      );
      if (res.completed === 1) {
        setSuccess('Task completed! Added to your daily study minutes.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTaskFormData({
      topic: task.topic,
      start_time: task.start_time,
      end_time: task.end_time,
      date: task.date
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updateTask(editingTask.id, taskFormData);
      setEditModalOpen(false);
      loadTasks(selectedDate);
      setSuccess('Task updated successfully.');
    } catch (err) {
      setError(err.message);
    }
  };

  // Stats
  const studyTasks = tasks.filter((t) => !t.is_break);
  const completedCount = studyTasks.filter((t) => t.completed === 1).length;
  const progressPct = studyTasks.length > 0 ? Math.round((completedCount / studyTasks.length) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Smart Daily Study Plan</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            Machine learning allocates optimal focus blocks according to subject urgency and weak topics.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Date:</label>
          <input
            type="date"
            className="form-input"
            style={{ width: 'auto' }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          {success}
        </div>
      )}

      {/* Plan Generator Settings Card */}
      <div className="card" style={{ marginBottom: '24px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Sparkles size={20} color="#4f46e5" />
          <h3 style={{ fontSize: '1.05rem', color: '#0f172a' }}>AI Timetable Generator</h3>
        </div>

        <form onSubmit={handleGenerate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Available Study Hours</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="12"
                className="form-input"
                value={availableHours}
                onChange={(e) => setAvailableHours(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Study Start Time</label>
              <input
                type="time"
                className="form-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Break Duration (Minutes)</label>
              <select
                className="form-select"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={generating}
                style={{ width: '100%', height: '42px' }}
              >
                <RefreshCw size={16} className={generating ? 'spin-icon' : ''} />
                <span>{generating ? 'Generating...' : 'Generate Smart Schedule'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Progress Metric for Selected Day */}
      {studyTasks.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: '24px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: progressPct === 100 ? '#dcfce7' : '#e0e7ff',
                color: progressPct === 100 ? '#16a34a' : '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem'
              }}
            >
              {progressPct}%
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Daily Target Progress</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {completedCount} of {studyTasks.length} study tasks completed for {selectedDate}
              </div>
            </div>
          </div>

          <div style={{ width: '220px' }}>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${progressPct}%`,
                  background: progressPct === 100 ? '#10b981' : '#4f46e5'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Timetable Task List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Clock size={20} color="#4f46e5" />
            <span>Today's Study Schedule</span>
          </h3>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {tasks.length} time blocks scheduled
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>Loading timetable...</div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <CalendarDays size={42} color="#cbd5e1" style={{ margin: '0 auto 12px auto' }} />
            <p>No study tasks scheduled for this date.</p>
            <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
              Click <strong>"Generate Smart Schedule"</strong> above to let AI build your timetable.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tasks.map((task) => {
              const isBreak = Boolean(task.is_break);
              const isDone = Boolean(task.completed);

              if (isBreak) {
                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 18px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px dashed #cbd5e1'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Coffee size={18} color="#94a3b8" />
                      <span style={{ fontWeight: 600, color: '#64748b', fontSize: '0.88rem' }}>
                        {task.topic}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                      {task.start_time} – {task.end_time}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: isDone ? '#bbf7d0' : '#e2e8f0',
                    background: isDone ? '#f0fdf4' : '#ffffff',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      onClick={() => handleToggle(task.id)}
                      title={isDone ? 'Mark Incomplete' : 'Mark Completed'}
                    >
                      {isDone ? (
                        <CheckCircle size={22} color="#16a34a" />
                      ) : (
                        <Circle size={22} color="#94a3b8" />
                      )}
                    </button>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: isDone ? '#15803d' : '#0f172a',
                          textDecoration: isDone ? 'line-through' : 'none'
                        }}
                      >
                        {task.topic}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        {task.subject_name ? `${task.subject_name} • ` : ''}
                        Focus Session
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        padding: '4px 10px',
                        background: '#f1f5f9',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#334155'
                      }}
                    >
                      {task.start_time} – {task.end_time}
                    </div>

                    {!isDone && onStudyNow && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          onStudyNow({
                            subject: task.subject_name || 'Study Block',
                            topic: task.topic,
                            recommended_time: 45
                          })
                        }
                        title="Start Pomodoro for this task"
                      >
                        <Play size={12} />
                        <span>Focus</span>
                      </button>
                    )}

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEditModal(task)}
                      title="Edit Task"
                    >
                      <Edit3 size={13} />
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(task.id)}
                      title="Delete Task"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Task Modal */}
      {editModalOpen && (
        <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem' }}>Edit / Reschedule Task</h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                onClick={() => setEditModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Task Topic / Activity</label>
                  <input
                    type="text"
                    className="form-input"
                    value={taskFormData.topic}
                    onChange={(e) => setTaskFormData({ ...taskFormData, topic: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date (Reschedule)</label>
                  <input
                    type="date"
                    className="form-input"
                    value={taskFormData.date}
                    onChange={(e) => setTaskFormData({ ...taskFormData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={taskFormData.start_time}
                      onChange={(e) => setTaskFormData({ ...taskFormData, start_time: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={taskFormData.end_time}
                      onChange={(e) => setTaskFormData({ ...taskFormData, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
