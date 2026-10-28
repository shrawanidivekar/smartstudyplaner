import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Award,
  Layers,
  Clock,
  RotateCcw,
  Sparkles,
  X,
  Info
} from 'lucide-react';
import { api } from '../api';

export default function SubjectsView({ onRefreshDashboard }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [detailModalSubject, setDetailModalSubject] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    exam_date: '',
    difficulty: 3,
    total_chapters: 10,
    completed_chapters: 0,
    previous_marks: 65,
    confidence: 3,
    target_hours: 2.0,
    revision_count: 0
  });

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await api.getSubjects();
      setSubjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const openAddModal = () => {
    setEditingSubject(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 14);
    setFormData({
      name: '',
      exam_date: tomorrow.toISOString().split('T')[0],
      difficulty: 3,
      total_chapters: 10,
      completed_chapters: 0,
      previous_marks: 65,
      confidence: 3,
      target_hours: 2.0,
      revision_count: 0
    });
    setModalOpen(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = (sub) => {
    setEditingSubject(sub);
    setFormData({
      name: sub.name,
      exam_date: sub.exam_date,
      difficulty: sub.difficulty,
      total_chapters: sub.total_chapters,
      completed_chapters: sub.completed_chapters,
      previous_marks: sub.previous_marks,
      confidence: sub.confidence,
      target_hours: sub.target_hours,
      revision_count: sub.revision_count
    });
    setModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.name.trim()) {
      setError('Please provide a subject name.');
      return;
    }
    if (Number(formData.completed_chapters) > Number(formData.total_chapters)) {
      setError('Completed chapters cannot exceed total chapters.');
      return;
    }
    if (Number(formData.previous_marks) < 0 || Number(formData.previous_marks) > 100) {
      setError('Previous marks must be between 0 and 100.');
      return;
    }

    try {
      if (editingSubject) {
        await api.updateSubject(editingSubject.id, formData);
        setSuccess(`Subject "${formData.name}" updated successfully.`);
      } else {
        await api.addSubject(formData);
        setSuccess(`Subject "${formData.name}" added successfully.`);
      }
      setModalOpen(false);
      loadSubjects();
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will also remove its associated tasks and test results.`)) {
      return;
    }
    try {
      await api.deleteSubject(id);
      setSuccess(`Deleted "${name}".`);
      loadSubjects();
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const viewDetails = async (sub) => {
    try {
      const details = await api.getSubjectDetail(sub.id);
      setDetailModalSubject(details);
    } catch (err) {
      setError(err.message);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <span className="badge badge-high">🔴 HIGH</span>;
      case 'MEDIUM':
        return <span className="badge badge-med">🟡 MEDIUM</span>;
      case 'LOW':
      default:
        return <span className="badge badge-low">🟢 LOW</span>;
    }
  };

  return (
    <div>
      {/* Header with Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Subject Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            Add, update, and track syllabus completion with real-time Machine Learning priority calculations.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Alerts */}
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

      {/* Subjects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading subjects...</div>
      ) : subjects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <BookOpen size={48} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
          <h3>No Subjects Added Yet</h3>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>
            Start by adding your first subject and exam date to let AI structure your study schedule.
          </p>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} />
            <span>Add Your First Subject</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {subjects.map((sub) => (
            <div key={sub.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>{sub.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <Calendar size={14} color="#64748b" />
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Exam: <strong>{sub.exam_date}</strong> ({sub.days_remaining} days left)
                      </span>
                    </div>
                  </div>
                  <div>{getPriorityBadge(sub.ml_priority)}</div>
                </div>

                {/* Progress bar */}
                <div style={{ margin: '14px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Syllabus Completion</span>
                    <span style={{ fontWeight: 700 }}>{sub.syllabus_completion}%</span>
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
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                    {sub.completed_chapters} of {sub.total_chapters} chapters finished
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    background: '#f8fafc',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    textAlign: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Difficulty</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f59e0b' }}>
                      {'★'.repeat(sub.difficulty)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Past Marks</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                      {sub.previous_marks}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>ML Score</div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#4f46e5' }}>
                      {Math.round(sub.ml_priority_score)}/100
                    </div>
                  </div>
                </div>

                {/* ML Reason Snippet */}
                {sub.ml_reasons && (
                  <div style={{ fontSize: '0.78rem', color: '#475569', background: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', marginBottom: '16px' }}>
                    <div style={{ fontWeight: 600, color: '#334155', marginBottom: '2px' }}>ML Urgency Insight:</div>
                    <div>{sub.ml_reasons[0] || 'Scheduled for routine review.'}</div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => viewDetails(sub)}
                >
                  <Info size={14} />
                  <span>Details</span>
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => openEditModal(sub)}
                  title="Edit Subject"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(sub.id, sub.name)}
                  title="Delete Subject"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem' }}>
                {editingSubject ? `Edit Subject: ${editingSubject.name}` : 'Add New Subject'}
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                onClick={() => setModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Subject Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Machine Learning, DBMS"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Exam Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.exam_date}
                      onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Difficulty Level (1 - 5)</label>
                    <select
                      className="form-select"
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) })}
                    >
                      <option value={1}>1 - Very Easy</option>
                      <option value={2}>2 - Easy</option>
                      <option value={3}>3 - Moderate</option>
                      <option value={4}>4 - Hard</option>
                      <option value={5}>5 - Very Challenging</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Total Chapters *</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="form-input"
                      value={formData.total_chapters}
                      onChange={(e) => setFormData({ ...formData, total_chapters: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Completed Chapters *</label>
                    <input
                      type="number"
                      min="0"
                      max={formData.total_chapters}
                      className="form-input"
                      value={formData.completed_chapters}
                      onChange={(e) => setFormData({ ...formData, completed_chapters: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Previous Marks (%) *</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-input"
                      value={formData.previous_marks}
                      onChange={(e) => setFormData({ ...formData, previous_marks: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Self Confidence (1 - 5)</label>
                    <select
                      className="form-select"
                      value={formData.confidence}
                      onChange={(e) => setFormData({ ...formData, confidence: Number(e.target.value) })}
                    >
                      <option value={1}>1 - Low Confidence</option>
                      <option value={2}>2 - Somewhat Shaky</option>
                      <option value={3}>3 - Moderate</option>
                      <option value={4}>4 - Confident</option>
                      <option value={5}>5 - Fully Confident</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Daily Target Study Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="8"
                      className="form-input"
                      value={formData.target_hours}
                      onChange={(e) => setFormData({ ...formData, target_hours: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Revision Rounds Done</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      className="form-input"
                      value={formData.revision_count}
                      onChange={(e) => setFormData({ ...formData, revision_count: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Detail Modal */}
      {detailModalSubject && (
        <div className="modal-overlay" onClick={() => setDetailModalSubject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem' }}>{detailModalSubject.name}</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Exam in {detailModalSubject.days_remaining} days ({detailModalSubject.exam_date})
                </span>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                onClick={() => setDetailModalSubject(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={{ flex: 1, background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ML Priority Score</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4f46e5' }}>
                    {Math.round(detailModalSubject.ml_priority_score)}/100
                  </div>
                  <div>{getPriorityBadge(detailModalSubject.ml_priority)}</div>
                </div>
                <div style={{ flex: 1, background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Syllabus Covered</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                    {detailModalSubject.syllabus_completion}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {detailModalSubject.completed_chapters}/{detailModalSubject.total_chapters} Chapters
                  </div>
                </div>
              </div>

              <h4 style={{ fontSize: '0.95rem', marginBottom: '10px' }}>Why this priority was assigned:</h4>
              <ul style={{ paddingLeft: '20px', fontSize: '0.86rem', color: '#475569', marginBottom: '20px' }}>
                {detailModalSubject.ml_reasons?.map((r, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>{r}</li>
                ))}
              </ul>

              <h4 style={{ fontSize: '0.95rem', marginBottom: '10px' }}>Recent Topic Test Scores:</h4>
              {detailModalSubject.test_results && detailModalSubject.test_results.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {detailModalSubject.test_results.map((tr) => (
                    <div
                      key={tr.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: '#f8fafc',
                        borderRadius: '6px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <span>{tr.topic}</span>
                      <strong style={{ color: (tr.marks / tr.total_marks) < 0.5 ? '#dc2626' : '#16a34a' }}>
                        {tr.marks} / {tr.total_marks} ({Math.round((tr.marks / tr.total_marks) * 100)}%)
                      </strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No test results recorded yet for this subject.</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDetailModalSubject(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
