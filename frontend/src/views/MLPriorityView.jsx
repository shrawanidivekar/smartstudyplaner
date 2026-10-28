import React, { useState, useEffect } from 'react';
import {
  Target,
  BrainCircuit,
  Sliders,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { api } from '../api';

export default function MLPriorityView() {
  const [subjects, setSubjects] = useState([]);
  const [inputs, setInputs] = useState({
    days_remaining: 5,
    syllabus_completion: 40,
    difficulty: 4,
    previous_marks: 54,
    confidence_level: 2,
    available_study_time: 3.0,
    revision_count: 0
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load existing subjects to allow quick 1-click loading of their stats
  useEffect(() => {
    api.getSubjects().then((data) => {
      setSubjects(data);
    }).catch(() => {});
    runPrediction(inputs);
  }, []);

  const runPrediction = async (params) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.predictPriority({
        days_remaining: Number(params.days_remaining),
        syllabus_completion: Number(params.syllabus_completion),
        difficulty: Number(params.difficulty),
        previous_marks: Number(params.previous_marks),
        confidence_level: Number(params.confidence_level),
        available_study_time: Number(params.available_study_time),
        revision_count: Number(params.revision_count)
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
    runPrediction(updated);
  };

  const loadFromSubject = (sub) => {
    const newParams = {
      days_remaining: sub.days_remaining,
      syllabus_completion: sub.syllabus_completion,
      difficulty: sub.difficulty,
      previous_marks: sub.previous_marks,
      confidence_level: sub.confidence || 3,
      available_study_time: sub.target_hours || 2.0,
      revision_count: sub.revision_count || 0
    };
    setInputs(newParams);
    runPrediction(newParams);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem' }}>ML Subject Priority Prediction</h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
          Interactive Machine Learning Classifier demonstrating how urgency, syllabus gap, difficulty, and past performance determine subject priority.
        </p>
      </div>

      {/* Quick Select from Saved Subjects */}
      {subjects.length > 0 && (
        <div className="card" style={{ padding: '14px 20px', marginBottom: '24px', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
              Quick Load From Your Subjects:
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
        {/* Interactive Controls Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Sliders size={20} color="#4f46e5" />
              <span>Input Features (Model Parameters)</span>
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.86rem' }}>
                <label style={{ fontWeight: 600 }}>Days Remaining Until Exam</label>
                <strong style={{ color: '#4f46e5' }}>{inputs.days_remaining} days</strong>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                style={{ width: '100%' }}
                value={inputs.days_remaining}
                onChange={(e) => handleInputChange('days_remaining', e.target.value)}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.86rem' }}>
                <label style={{ fontWeight: 600 }}>Syllabus Completion %</label>
                <strong style={{ color: '#4f46e5' }}>{inputs.syllabus_completion}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                style={{ width: '100%' }}
                value={inputs.syllabus_completion}
                onChange={(e) => handleInputChange('syllabus_completion', e.target.value)}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.86rem' }}>
                <label style={{ fontWeight: 600 }}>Subject Difficulty (1 to 5)</label>
                <strong style={{ color: '#f59e0b' }}>{'★'.repeat(inputs.difficulty)}</strong>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                style={{ width: '100%' }}
                value={inputs.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.86rem' }}>
                <label style={{ fontWeight: 600 }}>Previous Marks / Midterm Score %</label>
                <strong style={{ color: '#4f46e5' }}>{inputs.previous_marks}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                style={{ width: '100%' }}
                value={inputs.previous_marks}
                onChange={(e) => handleInputChange('previous_marks', e.target.value)}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.86rem' }}>
                <label style={{ fontWeight: 600 }}>Confidence Level (1 to 5)</label>
                <strong style={{ color: '#4f46e5' }}>{inputs.confidence_level} / 5</strong>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                style={{ width: '100%' }}
                value={inputs.confidence_level}
                onChange={(e) => handleInputChange('confidence_level', e.target.value)}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.86rem' }}>
                <label style={{ fontWeight: 600 }}>Revision Count Completed</label>
                <strong style={{ color: '#4f46e5' }}>{inputs.revision_count} rounds</strong>
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
          </div>
        </div>

        {/* Prediction Output & Explainability */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="card-header">
              <h3 className="card-title">
                <BrainCircuit size={20} color="#4f46e5" />
                <span>Prediction Result</span>
              </h3>
              {loading && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Evaluating ML model...</span>}
            </div>

            {prediction && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '24px',
                    borderRadius: '16px',
                    background:
                      prediction.priority === 'HIGH'
                        ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                        : prediction.priority === 'MEDIUM'
                        ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
                        : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    border: '1px solid',
                    borderColor:
                      prediction.priority === 'HIGH'
                        ? '#fca5a5'
                        : prediction.priority === 'MEDIUM'
                        ? '#fcd34d'
                        : '#86efac',
                    marginBottom: '20px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Predicted Class
                    </div>
                    <div
                      style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        fontFamily: 'Outfit, sans-serif',
                        color:
                          prediction.priority === 'HIGH'
                            ? '#dc2626'
                            : prediction.priority === 'MEDIUM'
                            ? '#d97706'
                            : '#16a34a'
                      }}
                    >
                      {prediction.priority === 'HIGH' && '🔴 HIGH PRIORITY'}
                      {prediction.priority === 'MEDIUM' && '🟡 MEDIUM PRIORITY'}
                      {prediction.priority === 'LOW' && '🟢 LOW PRIORITY'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Priority Score</div>
                    <div
                      style={{
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        color:
                          prediction.priority === 'HIGH'
                            ? '#dc2626'
                            : prediction.priority === 'MEDIUM'
                            ? '#d97706'
                            : '#16a34a'
                      }}
                    >
                      {prediction.priority_score}
                      <span style={{ fontSize: '1rem', color: '#64748b' }}> / 100</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '10px', color: '#0f172a' }}>
                    Explainable AI: Why this subject received this priority
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {prediction.reasons?.map((r, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '0.86rem',
                          color: '#334155'
                        }}
                      >
                        <CheckCircle2 size={16} color="#4f46e5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Academic Model Details Card for Viva */}
          <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <HelpCircle size={18} color="#4f46e5" />
              <h4 style={{ fontSize: '0.95rem', color: '#0f172a' }}>College Project Viva Note</h4>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
              This module uses a <strong>Random Forest Classifier</strong> trained on 1,500 realistic academic profiles in <code style={{ background: '#e2e8f0', padding: '2px 4px', borderRadius: '4px' }}>/ml/dataset.csv</code>. It simultaneously runs a <strong>Gradient Boosting Regressor</strong> to compute the exact numerical priority score (0-100), combining urgency, preparation deficit, and subject complexity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
