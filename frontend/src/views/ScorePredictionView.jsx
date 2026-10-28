import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sliders,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { api } from '../api';

export default function ScorePredictionView() {
  const [subjects, setSubjects] = useState([]);
  const [inputs, setInputs] = useState({
    daily_study_hours: 3.0,
    syllabus_completion: 60.0,
    previous_marks: 68.0,
    revision_count: 1,
    practice_test_score: 65.0,
    days_remaining: 15,
    difficulty: 3
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSubjects().then((data) => {
      setSubjects(data);
    }).catch(() => {});
    runScorePrediction(inputs);
  }, []);

  const runScorePrediction = async (params) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.predictScore({
        daily_study_hours: Number(params.daily_study_hours),
        syllabus_completion: Number(params.syllabus_completion),
        previous_marks: Number(params.previous_marks),
        revision_count: Number(params.revision_count),
        practice_test_score: Number(params.practice_test_score),
        days_remaining: Number(params.days_remaining),
        difficulty: Number(params.difficulty)
      });
      setPrediction(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, val) => {
    const updated = { ...inputs, [field]: val };
    setInputs(updated);
    runScorePrediction(updated);
  };

  const loadFromSubject = (sub) => {
    const newInputs = {
      daily_study_hours: sub.target_hours || 2.5,
      syllabus_completion: sub.syllabus_completion || 50,
      previous_marks: sub.previous_marks || 65,
      revision_count: sub.revision_count || 0,
      practice_test_score: sub.previous_marks || 65,
      days_remaining: sub.days_remaining || 14,
      difficulty: sub.difficulty || 3
    };
    setInputs(newInputs);
    runScorePrediction(newInputs);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem' }}>Expected Exam Score Prediction (ML Regression)</h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
          Evaluate projected final examination performance based on daily study consistency, syllabus coverage, and practice test results.
        </p>
      </div>

      {subjects.length > 0 && (
        <div className="card" style={{ padding: '14px 20px', marginBottom: '24px', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
              Load Existing Subject:
            </span>
            {subjects.map((s) => (
              <button
                key={s.id}
                className="btn btn-secondary btn-sm"
                onClick={() => loadFromSubject(s)}
              >
                <BookOpen size={13} />
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Controls Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Sliders size={20} color="#4f46e5" />
              <span>Regression Features</span>
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.86rem' }}>
                <label style={{ fontWeight: 600 }}>Daily Study Hours</label>
                <strong style={{ color: '#4f46e5' }}>{inputs.daily_study_hours} hrs/day</strong>
              </div>
              <input
                type="range"
                min="0.5"
                max="8.0"
                step="0.5"
                style={{ width: '100%' }}
                value={inputs.daily_study_hours}
                onChange={(e) => handleInputChange('daily_study_hours', e.target.value)}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.86rem' }}>
                <label style={{ fontWeight: 600 }}>Syllabus Completion %</label>
                <strong style={{ color: '#4f46e5' }}>{inputs.syllabus_completion}%</strong>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                style={{ width: '100%' }}
                value={inputs.syllabus_completion}
                onChange={(e) => handleInputChange('syllabus_completion', e.target.value)}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.86rem' }}>
                <label style={{ fontWeight: 600 }}>Practice Test / Quiz Score %</label>
                <strong style={{ color: '#4f46e5' }}>{inputs.practice_test_score}%</strong>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                style={{ width: '100%' }}
                value={inputs.practice_test_score}
                onChange={(e) => handleInputChange('practice_test_score', e.target.value)}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.86rem' }}>
                <label style={{ fontWeight: 600 }}>Previous Exam / Internal Marks %</label>
                <strong style={{ color: '#4f46e5' }}>{inputs.previous_marks}%</strong>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                style={{ width: '100%' }}
                value={inputs.previous_marks}
                onChange={(e) => handleInputChange('previous_marks', e.target.value)}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.86rem' }}>
                <label style={{ fontWeight: 600 }}>Revision Rounds Completed</label>
                <strong style={{ color: '#4f46e5' }}>{inputs.revision_count} cycles</strong>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                style={{ width: '100%' }}
                value={inputs.revision_count}
                onChange={(e) => handleInputChange('revision_count', e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="form-label">Days to Exam</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  className="form-input"
                  value={inputs.days_remaining}
                  onChange={(e) => handleInputChange('days_remaining', e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Difficulty (1-5)</label>
                <select
                  className="form-select"
                  value={inputs.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                >
                  <option value={1}>1 - Easy</option>
                  <option value={2}>2 - Fair</option>
                  <option value={3}>3 - Moderate</option>
                  <option value={4}>4 - Hard</option>
                  <option value={5}>5 - Very Hard</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Results & Advice Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <h3 className="card-title">
                <BrainCircuit size={20} color="#4f46e5" />
                <span>Predicted Performance</span>
              </h3>
              {loading && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Calculating...</span>}
            </div>

            {prediction && (
              <div>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                    border: '1px solid #c7d2fe',
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Predicted Exam Score
                  </div>
                  <div
                    style={{
                      fontSize: '3.6rem',
                      fontWeight: 900,
                      fontFamily: 'Outfit, sans-serif',
                      color:
                        prediction.predicted_score >= 75
                          ? '#15803d'
                          : prediction.predicted_score >= 60
                          ? '#0369a1'
                          : '#b91c1c',
                      margin: '6px 0'
                    }}
                  >
                    {prediction.predicted_score}%
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ffffff', padding: '6px 14px', borderRadius: '999px', fontSize: '0.82rem', color: '#4338ca', fontWeight: 600 }}>
                    <TrendingUp size={16} />
                    <span>Potential Uplift: +{prediction.potential_uplift}% with prep boost</span>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Lightbulb size={18} color="#f59e0b" />
                    <h4 style={{ fontSize: '0.95rem', color: '#0f172a' }}>AI Study Advice</h4>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {prediction.recommendations?.map((rec, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          padding: '10px 14px',
                          background: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '0.86rem',
                          color: '#334155'
                        }}
                      >
                        <CheckCircle size={16} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Important Disclaimer Note */}
                <div
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}
                >
                  <AlertCircle size={18} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.78rem', color: '#92400e', lineHeight: 1.4 }}>
                    <strong>Note:</strong> {prediction.disclaimer}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
