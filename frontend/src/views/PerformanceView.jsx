import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  TrendingDown,
  Sparkles,
  BookOpen,
  Award,
  X
} from 'lucide-react';
import { api } from '../api';

export default function PerformanceView({ onStudyNow }) {
  const [performanceData, setPerformanceData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Test Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject_id: '',
    topic: '',
    marks: '',
    total_marks: 100,
    test_date: new Date().toISOString().split('T')[0]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [perf, subs] = await Promise.all([api.getPerformance(), api.getSubjects()]);
      setPerformanceData(perf);
      setSubjects(subs);
      if (subs.length > 0 && !formData.subject_id) {
        setFormData((prev) => ({ ...prev, subject_id: subs[0].id }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddTest = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.subject_id) {
      setError('Please select a subject.');
      return;
    }
    if (!formData.topic.trim()) {
      setError('Please enter a topic name.');
      return;
    }
    if (Number(formData.marks) > Number(formData.total_marks)) {
      setError('Marks obtained cannot exceed total marks.');
      return;
    }

    try {
      await api.addTestResult({
        subject_id: Number(formData.subject_id),
        topic: formData.topic.trim(),
        marks: Number(formData.marks),
        total_marks: Number(formData.total_marks),
        test_date: formData.test_date
      });
      setSuccess(`Test result recorded for ${formData.topic}!`);
      setModalOpen(false);
      setFormData({
        subject_id: subjects[0]?.id || '',
        topic: '',
        marks: '',
        total_marks: 100,
        test_date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTest = async (id, topic) => {
    if (!window.confirm(`Delete test score for "${topic}"?`)) return;
    try {
      await api.deleteTestResult(id);
      setSuccess('Test score removed.');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const weakestTopic = performanceData?.weakest_topic;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Weak Topic Detection & Performance</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            Enter quiz and test results to automatically detect conceptual knowledge gaps and receive targeted study advice.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} />
          <span>Add Test Result</span>
        </button>
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

      {/* Weakest Topic Alert Card */}
      {weakestTopic && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%)',
            border: '1px solid #fecaca',
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
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#dc2626',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <TrendingDown size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Priority Action Identified
              </div>
              <h3 style={{ fontSize: '1.3rem', color: '#7f1d1d', margin: '4px 0' }}>
                Your weakest topic is: <strong>{weakestTopic.topic}</strong> ({weakestTopic.percentage}%)
              </h3>
              <p style={{ color: '#991b1b', fontSize: '0.88rem' }}>
                Subject: <strong>{weakestTopic.subject_name}</strong> • Scored {weakestTopic.marks}/{weakestTopic.total_marks} on {weakestTopic.test_date}
              </p>
              <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#b91c1c', fontStyle: 'italic' }}>
                💡 Recommendation: {weakestTopic.recommendation}
              </div>
            </div>
          </div>

          <div>
            <button
              className="btn btn-primary"
              style={{ background: '#dc2626' }}
              onClick={() =>
                onStudyNow({
                  subject: weakestTopic.subject_name,
                  topic: weakestTopic.topic,
                  recommended_time: 45
                })
              }
            >
              <Sparkles size={16} />
              <span>Study Weak Topic Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Summary Chips */}
      {performanceData?.summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '10px' }}>
              <XCircle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Needs Work (&lt; 50%)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626' }}>
                {performanceData.summary.weak_count} Topics
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '10px', background: '#fef3c7', color: '#d97706', borderRadius: '10px' }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Moderate (50 - 72%)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706' }}>
                {performanceData.summary.average_count} Topics
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '10px', background: '#dcfce7', color: '#16a34a', borderRadius: '10px' }}>
              <CheckCircle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Mastered (&gt; 72%)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>
                {performanceData.summary.strong_count} Topics
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance by Subject Accordions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <BookOpen size={20} color="#4f46e5" />
            <span>Subject-wise Topic Diagnostics</span>
          </h3>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Visual indicator: ✅ Strong • ⚠️ Average • ❌ Weak
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>Loading diagnostic tests...</div>
        ) : !performanceData?.subjects_breakdown || performanceData.subjects_breakdown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <p>No test or quiz results recorded yet.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
              Click <strong>"Add Test Result"</strong> above to log your marks.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {performanceData.subjects_breakdown.map((subj) => (
              <div
                key={subj.subject_name}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px 22px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: '#0f172a' }}>{subj.subject_name}</h4>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {subj.topics.length} topic tests recorded
                    </span>
                  </div>
                  <div
                    style={{
                      padding: '4px 12px',
                      borderRadius: '8px',
                      background: subj.avg_percentage >= 70 ? '#dcfce7' : subj.avg_percentage >= 50 ? '#fef3c7' : '#fee2e2',
                      color: subj.avg_percentage >= 70 ? '#15803d' : subj.avg_percentage >= 50 ? '#92400e' : '#b91c1c',
                      fontWeight: 800,
                      fontSize: '0.88rem'
                    }}
                  >
                    Avg: {subj.avg_percentage}%
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {subj.topics.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{t.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#0f172a' }}>
                            {t.topic}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                            Test Date: {t.test_date} • {t.recommendation}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              fontWeight: 800,
                              fontSize: '1rem',
                              color: t.status === 'WEAK' ? '#dc2626' : t.status === 'AVERAGE' ? '#d97706' : '#16a34a'
                            }}
                          >
                            {t.percentage}%
                          </span>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            ({t.marks} / {t.total_marks})
                          </div>
                        </div>

                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDeleteTest(t.id, t.topic)}
                          title="Delete test result"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Test Result Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem' }}>Record Test / Quiz Result</h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                onClick={() => setModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddTest}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <select
                    className="form-select"
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                    required
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Topic Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Principal Component Analysis, Normalization"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Marks Obtained *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      className="form-input"
                      placeholder="e.g. 45"
                      value={formData.marks}
                      onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Total Marks *</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      value={formData.total_marks}
                      onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Test Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.test_date}
                    onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
                    required
                  />
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
                  Save Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
