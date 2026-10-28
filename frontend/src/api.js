/**
 * API Service for Smart Study Planner
 */

const BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` 
  : '/api';

export const getAuthToken = () => {
  return localStorage.getItem('study_token') || '1';
};

export const setAuthToken = (token) => {
  localStorage.setItem('study_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('study_token');
  localStorage.removeItem('study_user');
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('study_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const setStoredUser = (user) => {
  localStorage.setItem('study_user', JSON.stringify(user));
};

async function apiRequest(endpoint, method = 'GET', body = null) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const config = {
    method,
    headers
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.detail || data.message || 'An error occurred while fetching data.';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) => apiRequest('/auth/login', 'POST', { email, password }),
  register: (payload) => apiRequest('/auth/register', 'POST', payload),
  getMe: () => apiRequest('/auth/me'),
  updateProfile: (payload) => apiRequest('/auth/profile', 'PUT', payload),

  // Dashboard
  getDashboard: () => apiRequest('/dashboard'),

  // Subjects
  getSubjects: () => apiRequest('/subjects'),
  addSubject: (payload) => apiRequest('/subjects', 'POST', payload),
  updateSubject: (id, payload) => apiRequest(`/subjects/${id}`, 'PUT', payload),
  deleteSubject: (id) => apiRequest(`/subjects/${id}`, 'DELETE'),
  getSubjectDetail: (id) => apiRequest(`/subjects/${id}`),

  // ML Predictions
  predictPriority: (payload) => apiRequest('/predict-priority', 'POST', payload),
  predictScore: (payload) => apiRequest('/predict-score', 'POST', payload),

  // Study Plan
  getStudyPlan: (date) => apiRequest(`/study-plan${date ? `?date=${date}` : ''}`),
  generateStudyPlan: (payload) => apiRequest('/study-plan', 'POST', payload),
  toggleTask: (taskId) => apiRequest(`/study-plan/tasks/${taskId}/toggle`, 'PATCH'),
  updateTask: (taskId, payload) => apiRequest(`/study-plan/tasks/${taskId}`, 'PUT', payload),
  deleteTask: (taskId) => apiRequest(`/study-plan/tasks/${taskId}`, 'DELETE'),

  // Performance & Weak Topics
  getPerformance: () => apiRequest('/performance'),
  addTestResult: (payload) => apiRequest('/performance', 'POST', payload),
  deleteTestResult: (id) => apiRequest(`/performance/${id}`, 'DELETE'),

  // Revision
  getRevisions: () => apiRequest('/revision'),
  addRevision: (payload) => apiRequest('/revision', 'POST', payload),
  markRevised: (id) => apiRequest(`/revision/${id}/mark-revised`, 'POST'),
  deleteRevision: (id) => apiRequest(`/revision/${id}`, 'DELETE'),

  // Pomodoro
  logPomodoro: (payload) => apiRequest('/pomodoro/log', 'POST', payload),
  getPomodoroStats: () => apiRequest('/pomodoro/stats'),

  // Charts & Calendar
  getProgressCharts: () => apiRequest('/progress-charts'),
  getCalendar: () => apiRequest('/calendar'),
};
