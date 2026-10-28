import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  GraduationCap,
  Building,
  Clock,
  Save,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { api, setStoredUser } from '../api';

export default function ProfileView({ user, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: '',
    semester: '',
    college: '',
    daily_available_hours: 4.0
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        course: user.course || '',
        semester: user.semester || '',
        college: user.college || '',
        daily_available_hours: user.daily_available_hours || 4.0
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.updateProfile({
        name: formData.name,
        course: formData.course,
        semester: formData.semester,
        college: formData.college,
        daily_available_hours: Number(formData.daily_available_hours)
      });
      setStoredUser(res.user);
      setSuccess('Profile details saved successfully!');
      if (onProfileUpdated) onProfileUpdated(res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem' }}>Student Profile</h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
          Manage your personal academic profile and daily study time preferences.
        </p>
      </div>

      {success && (
        <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="card">
        {/* Profile Header Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9', marginBottom: '24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 800
            }}
          >
            {formData.name ? formData.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a' }}>{formData.name || 'Student Name'}</h3>
            <p style={{ fontSize: '0.86rem', color: '#64748b' }}>
              {formData.course} • {formData.semester}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-input"
                style={{ background: '#f8fafc', color: '#64748b' }}
                value={formData.email}
                disabled
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Degree / Course</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. B.Tech Computer Science & Engineering"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Semester</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Semester 6"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">College / University Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. National Institute of Technology"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Daily Available Study Hours</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="14"
                className="form-input"
                value={formData.daily_available_hours}
                onChange={(e) => setFormData({ ...formData, daily_available_hours: Number(e.target.value) })}
                required
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Used by AI Timetable generator to balance study blocks.
              </span>
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
