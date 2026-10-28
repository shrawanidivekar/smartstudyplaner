import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Plus,
  CheckCircle,
  Clock,
  Calendar,
  Trash2,
  Sparkles,
  BookOpen,
  X
} from 'lucide-react';
import { api } from '../api';

export default function RevisionView() {
  const [revisions, setRevisions] = useState({ due: [], soon: [], recent: [] });
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Revision Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject_id: '',
    topic: '',
    last_revised: new Date().toISOString().split('T')[0],
    next_revision: new Date().toISOString().split('T')[0]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [revs, subs] = await Promise.all([api.getRevisions(), api.getSubjects()]);
      setRevisions(revs);
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

  const handleMarkRevised = async (id, topic) => {
    try {
      const res = await api.markRevised(id);
      setSuccess(`Awesome! ${topic} marked revised. ${res.message}`);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id, topic) => {
    if (!window.confirm(`Remove "${topic}" from revision schedule?`)) return;
    try {
      await api.deleteRevision(id);
      setSuccess(`Removed "${topic}".`);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject_id || !formData.topic.trim()) {
      setError('Please provide subject and topic name.');
      return;
    }
    try {
      await api.addRevision({
        subject_id: Number(formData.subject_id),
        topic: formData.topic.trim(),
        last_revised: formData.last_revised,
        next_revision: formData.next_revision
      });
      setSuccess(`Added "${formData.topic}" to revision tracker!`);
      setModalOpen(false);
      setFormData({
        subject_id: subjects[0]?.id || '',
        topic: '',
        last_revised: new Date().toISOString().split('T')[0],
        next_revision: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Spaced Revision Tracker</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            Combines active recall and the Ebbinghaus forgetting curve intervals (+2, +4, +7, +14 days) to cement concepts into long-term memory.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} />
          <span>Add Topic for Revision</span>
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

      {/* 3 Categories: 🔴 Revision Due, 🟡 Revision Soon, 🟢 Recently Revised */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Category 1: Revision Due */}
        <div className="card" style={{ borderTop: '4px solid #ef4444' }}>
          <div className="card-header">
            <h3 className="card-title">
              <span className="badge badge-high">🔴 REVISION DUE</span>
            </h3>
            <span style={{ fontWeight: 700, color: '#dc2626', fontSize: '0.9rem' }}>
              {revisions.due?.length || 0} Topics
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '16px' }}>
            Topics past their scheduled recall window. Revise today to prevent memory loss.
          </p>

          {revisions.due?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
              <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 8px auto' }} />
              <div>No overdue revisions! You are up to date.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {revisions.due?.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#991b1b' }}>
                        {item.topic}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#7f1d1d' }}>
                        {item.subject_name} • Revised {item.revision_count} time(s)
                      </div>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px' }}
                      onClick={() => handleDelete(item.id, item.topic)}
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
                      Due: <strong>{item.next_revision}</strong>
                    </span>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ background: '#dc2626', padding: '6px 12px' }}
                      onClick={() => handleMarkRevised(item.id, item.topic)}
                    >
                      <CheckCircle size={14} />
                      <span>Mark Revised</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category 2: Revision Soon */}
        <div className="card" style={{ borderTop: '4px solid #f59e0b' }}>
          <div className="card-header">
            <h3 className="card-title">
              <span className="badge badge-med">🟡 REVISION SOON</span>
            </h3>
            <span style={{ fontWeight: 700, color: '#d97706', fontSize: '0.9rem' }}>
              {revisions.soon?.length || 0} Topics
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '16px' }}>
            Scheduled for review within the next 1 to 3 days.
          </p>

          {revisions.soon?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
              <div>No upcoming revisions in next 3 days.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {revisions.soon?.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fef3c7',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#92400e' }}>
                        {item.topic}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#78350f' }}>
                        {item.subject_name} • Revised {item.revision_count} time(s)
                      </div>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px' }}
                      onClick={() => handleDelete(item.id, item.topic)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#b45309' }}>
                      Scheduled: <strong>{item.next_revision}</strong> ({item.days_until_next}d)
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ borderColor: '#fde68a', color: '#92400e', background: 'white' }}
                      onClick={() => handleMarkRevised(item.id, item.topic)}
                    >
                      <CheckCircle size={14} />
                      <span>Revise Early</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category 3: Recently Revised */}
        <div className="card" style={{ borderTop: '4px solid #10b981' }}>
          <div className="card-header">
            <h3 className="card-title">
              <span className="badge badge-low">🟢 RECENTLY REVISED</span>
            </h3>
            <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.9rem' }}>
              {revisions.recent?.length || 0} Topics
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '16px' }}>
            Freshly consolidated. Next spaced review is farther out.
          </p>

          {revisions.recent?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
              <div>No recently completed revisions yet.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {revisions.recent?.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #dcfce7',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#166534' }}>
                        {item.topic}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#14532d' }}>
                        {item.subject_name} • Revised {item.revision_count} time(s)
                      </div>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px' }}
                      onClick={() => handleDelete(item.id, item.topic)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#15803d' }}>
                      Next recall: <strong>{item.next_revision}</strong> ({item.days_until_next}d)
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>
                      ✓ Solidified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Revision Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem' }}>Schedule Spaced Revision</h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                onClick={() => setModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
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
                  <label className="form-label">Topic / Concept Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Distance Vector Routing, Normalization"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Last Studied Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.last_revised}
                      onChange={(e) => setFormData({ ...formData, last_revised: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Next Revision Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.next_revision}
                      onChange={(e) => setFormData({ ...formData, next_revision: e.target.value })}
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
                  Save Revision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
