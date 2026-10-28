import React from 'react';
import {
  Info,
  BrainCircuit,
  Target,
  LineChart,
  CheckCircle2,
  Database,
  Code2,
  Sparkles,
  BookOpen,
  Layers,
  Award
} from 'lucide-react';

export default function AboutProjectView() {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>About Project & Technical Documentation</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Overview, Machine Learning methodologies, system architecture, and viva examination reference guide.
        </p>
      </div>

      {/* Main Project Overview Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ padding: '10px', background: '#e0e7ff', borderRadius: '10px', color: '#4f46e5' }}>
            <Award size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>
              Smart Study Planner – AI Based Student Study Assistant
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Academic College Mini Project • Machine Learning & Full-Stack Web Application
            </span>
          </div>
        </div>

        <div style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '12px' }}>
            <strong>Objective:</strong> To help college students systematically manage their academic workload, eliminate exam anxiety, and optimize revision by applying Machine Learning algorithms that prioritize urgent subjects, detect conceptual weak spots, project final examination scores, and automatically synthesize personalized daily study timetables.
          </p>
        </div>
      </div>

      {/* Complete Workflow Flowchart */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="card-title" style={{ marginBottom: '16px' }}>
          <Layers size={18} color="#4f46e5" />
          <span>Complete System Workflow</span>
        </h3>

        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {[
            { step: '1', title: 'Student Authentication', desc: 'Secure student login and academic profile configuration.' },
            { step: '2', title: 'Subject & Syllabus Input', desc: 'Enters subject details, exam dates, difficulty levels, and syllabus progress.' },
            { step: '3', title: 'ML Priority Classification', desc: 'Random Forest model predicts HIGH, MEDIUM, or LOW priority + 0-100 score.' },
            { step: '4', title: 'Diagnostic Test Logging', desc: 'Quiz scores are evaluated to identify weak topics (❌ < 50%, ⚠️ 50-70%, ✅ > 70%).' },
            { step: '5', title: 'ML Expected Score Regression', desc: 'Predicts expected final examination score percentage and generates what-if guidance.' },
            { step: '6', title: 'Smart Timetable Synthesis', desc: 'Generates time-blocked schedule with interleaved breaks based on ML priorities.' },
            { step: '7', title: 'Task Execution & Pomodoro', desc: 'Interactive focus timer logs study duration and automatically maintains streaks.' },
            { step: '8', title: 'Spaced Revision Scheduling', desc: 'Active recall intervals (+2, +4, +7, +14 days) keep knowledge retained long-term.' }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#4f46e5',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  flexShrink: 0
                }}
              >
                {item.step}
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{item.title}: </strong>
                <span style={{ fontSize: '0.85rem', color: '#475569' }}>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Machine Learning Models Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Target size={20} color="#dc2626" />
            <h3 style={{ fontSize: '1.05rem', color: '#0f172a' }}>1. Subject Priority Prediction</h3>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
            <p style={{ marginBottom: '8px' }}>
              <strong>Type:</strong> Multi-class Classification + Regression Scoring
            </p>
            <p style={{ marginBottom: '8px' }}>
              <strong>Algorithm:</strong> Random Forest Classifier & Gradient Boosting Regressor
            </p>
            <p style={{ marginBottom: '8px' }}>
              <strong>Input Features:</strong>
            </p>
            <ul style={{ paddingLeft: '20px', marginBottom: '8px' }}>
              <li>Days remaining until exam</li>
              <li>Syllabus completion percentage</li>
              <li>Subject difficulty (1-5)</li>
              <li>Previous marks / internal test scores</li>
              <li>Self-reported confidence level</li>
              <li>Available study hours</li>
              <li>Revision count completed</li>
            </ul>
            <p>
              <strong>Outputs:</strong> Priority Category (🔴 HIGH, 🟡 MEDIUM, 🟢 LOW), Numerical Priority Score (0–100), and Explainable Reasoning text.
            </p>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <LineChart size={20} color="#0284c7" />
            <h3 style={{ fontSize: '1.05rem', color: '#0f172a' }}>2. Expected Exam Score Prediction</h3>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
            <p style={{ marginBottom: '8px' }}>
              <strong>Type:</strong> Supervised Continuous Regression
            </p>
            <p style={{ marginBottom: '8px' }}>
              <strong>Algorithm:</strong> Gradient Boosting Regressor / Ridge Regression
            </p>
            <p style={{ marginBottom: '8px' }}>
              <strong>Input Features:</strong>
            </p>
            <ul style={{ paddingLeft: '20px', marginBottom: '8px' }}>
              <li>Daily study hours dedicated</li>
              <li>Syllabus completion %</li>
              <li>Past marks & internal performance</li>
              <li>Practice test / quiz score %</li>
              <li>Revision cycles completed</li>
              <li>Days remaining until examination</li>
              <li>Subject difficulty rating</li>
            </ul>
            <p>
              <strong>Outputs:</strong> Predicted final exam score %, potential uplift simulation (+X%), and actionable study tips.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack Reference Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="card-title" style={{ marginBottom: '16px' }}>
          <Code2 size={18} color="#4f46e5" />
          <span>Technology Stack</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Frontend</strong>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              React 19, Vite, Modern CSS Design System, Lucide Icons, Responsive Layouts.
            </p>
          </div>

          <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Backend & REST API</strong>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Python FastAPI, Uvicorn ASGI Server, Pydantic Schema Validation, CORS Middleware.
            </p>
          </div>

          <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Database</strong>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              SQLite3 relational database with foreign keys, easily adaptable to PostgreSQL.
            </p>
          </div>

          <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Machine Learning</strong>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Scikit-Learn, Pandas, NumPy, Joblib model serialization, 1500+ realistic dataset.
            </p>
          </div>
        </div>
      </div>

      {/* Viva Preparation FAQ */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '16px' }}>
          <Sparkles size={18} color="#f59e0b" />
          <span>College Viva Questions & Model Answers</span>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem', marginBottom: '4px' }}>
              Q1: Why did you use Machine Learning instead of hardcoded rules for priority calculation?
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              <strong>Answer:</strong> Hardcoded if-else statements fail to capture complex non-linear interactions between multi-dimensional features (e.g., a student might have an exam in 4 days with 80% syllabus covered vs. 15 days with only 25% covered in a difficult subject). Random Forest models train on generalized historical cohorts, providing probabilistic weighting and robust priority ranking.
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem', marginBottom: '4px' }}>
              Q2: How does the Spaced Repetition logic work?
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              <strong>Answer:</strong> It implements the psychological forgetting curve principle. Each time a student marks a concept revised, the interval to the next scheduled recall increases (+2 days, +4 days, +7 days, +14 days), converting working memory into permanent cortical consolidation.
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem', marginBottom: '4px' }}>
              Q3: What makes this project production-ready?
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              <strong>Answer:</strong> It features complete end-to-end CRUD persistence, RESTful API contract separation between FastAPI and React, automated database seeding with realistic demo records, input validation error boundaries, and genuine ML inference.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
