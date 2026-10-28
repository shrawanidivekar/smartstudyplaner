import React, { useState } from 'react';
import {
  BrainCircuit,
  Lock,
  Mail,
  User,
  GraduationCap,
  Building,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { api, setAuthToken, setStoredUser } from '../api';

export default function AuthView({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login Form
  const [email, setEmail] = useState('student@college.edu');
  const [password, setPassword] = useState('student123');

  // Register Form
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    course: 'B.Tech Computer Science & Engineering',
    semester: 'Semester 6',
    college: 'National Institute of Technology',
    daily_available_hours: 4.5
  });

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(email.trim(), password);
      setAuthToken(res.token);
      setStoredUser(res.user);
      onAuthSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!registerData.name.trim() || !registerData.email.trim() || !registerData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.register({
        name: registerData.name.trim(),
        email: registerData.email.trim(),
        password: registerData.password,
        course: registerData.course,
        semester: registerData.semester,
        college: registerData.college,
        daily_available_hours: Number(registerData.daily_available_hours)
      });
      setAuthToken(res.token);
      setStoredUser(res.user);
      onAuthSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('student@college.edu');
    setPassword('student123');
    setTimeout(() => {
      handleLogin();
    }, 100);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        padding: '24px'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: isLogin ? '460px' : '560px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: '#ffffff'
        }}
      >
        {/* Brand Banner */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              color: 'white',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.35)',
              marginBottom: '12px'
            }}
          >
            <BrainCircuit size={30} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
            Smart Study Planner
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '4px' }}>
            AI-Based Student Study Assistant
          </p>
        </div>

        {/* Demo Account Quick Access Card */}
        {isLogin && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4338ca' }}>
                Quick Demo Testing
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Preloaded with 5 subjects, test scores & study streaks.
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ background: '#4f46e5', whiteSpace: 'nowrap' }}
              onClick={handleDemoLogin}
            >
              <Sparkles size={14} />
              <span>One-Click Login</span>
            </button>
          </div>
        )}

        {error && (
          <div
            style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}
          >
            {error}
          </div>
        )}

        {/* Tabs for Login vs Register */}
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '20px'
          }}
        >
          <button
            type="button"
            className={`btn btn-sm ${isLogin ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, borderRadius: '8px', border: 'none' }}
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
          >
            Login to Account
          </button>
          <button
            type="button"
            className={`btn btn-sm ${!isLogin ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, borderRadius: '8px', border: 'none' }}
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
          >
            New Student Register
          </button>
        </div>

        {isLogin ? (
          /* Login Form */
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', height: '44px', marginTop: '10px' }}
              disabled={loading}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* Registration Form */
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Student Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Alex Sharma"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="alex@college.edu"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Course / Degree</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="B.Tech Computer Science"
                  value={registerData.course}
                  onChange={(e) => setRegisterData({ ...registerData, course: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Semester</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Semester 6"
                  value={registerData.semester}
                  onChange={(e) => setRegisterData({ ...registerData, semester: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">College / Institute</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Engineering College"
                  value={registerData.college}
                  onChange={(e) => setRegisterData({ ...registerData, college: e.target.value })}
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
                  value={registerData.daily_available_hours}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, daily_available_hours: Number(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', height: '44px', marginTop: '10px' }}
              disabled={loading}
            >
              <span>{loading ? 'Creating Student Profile...' : 'Create Account & Begin'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.78rem', color: '#94a3b8' }}>
          Smart Study Planner • Powered by Machine Learning
        </div>
      </div>
    </div>
  );
}
