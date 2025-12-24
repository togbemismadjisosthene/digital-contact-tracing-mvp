const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('ct_token');
}

function setToken(token) {
  localStorage.setItem('ct_token', token);
}

function setCurrentUser(user) {
  localStorage.setItem('ct_user', JSON.stringify(user));
}

function getCurrentUserLocal() {
  try { return JSON.parse(localStorage.getItem('ct_user') || 'null'); } catch (e) { return null; }
}

async function request(path, options = {}) {
  const headers = options.headers || {};
  headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
    if (!res.ok) throw data || { error: 'request failed' };
    return data;
  } catch (err) {
    // Network error or fetch failed
    if (err.name === 'TypeError' || err.message?.includes('fetch')) {
      throw { 
        error: 'Cannot connect to server. Please make sure the backend server is running on port 4000.',
        networkError: true 
      };
    }
    throw err;
  }
}

async function signup({ username, password, role }) {
  const data = await request('/auth/signup', { method: 'POST', body: JSON.stringify({ username, password, role }) });
  if (data.token) setToken(data.token);
  if (data.user) setCurrentUser(data.user);
  return data;
}

async function login({ username, password }) {
  const data = await request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
  if (data.token) setToken(data.token);
  if (data.user) setCurrentUser(data.user);
  return data;
}

function logout() {
  localStorage.removeItem('ct_token');
}

async function getUsers() {
  // Public users endpoint (does not require admin) used to populate selects
  return await request('/auth/users', { method: 'GET' });
}

async function getCurrentUser() {
  // try local cached user first
  const local = getCurrentUserLocal();
  if (local) return local;
  try {
    const data = await request('/auth/me', { method: 'GET' });
    if (data && data.user) {
      setCurrentUser(data.user);
      return data.user;
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function addInteraction({ contactUserId, when, durationMinutes, notes }) {
  return await request('/interactions', { method: 'POST', body: JSON.stringify({ contactUserId, when, durationMinutes, notes }) });
}

async function getInteractions({ userId } = {}) {
  const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  return await request(`/interactions${qs}`, { method: 'GET' });
}

async function reportCase({ userId }) {
  return await request('/admin/cases', { method: 'POST', body: JSON.stringify({ userId }) });
}

async function reportCaseWithDate({ userId, reportedAt }) {
  return await request('/admin/cases', { method: 'POST', body: JSON.stringify({ userId, reportedAt }) });
}

async function getAdminInteractions() {
  return await request('/admin/interactions', { method: 'GET' });
}

async function getCases() {
  return await request('/admin/cases', { method: 'GET' });
}

async function trace({ caseUserId, windowDays }) {
  return await request('/admin/trace', { method: 'POST', body: JSON.stringify({ caseUserId, windowDays }) });
}

// Admin: simulate sending a privacy-preserving exposure notification to a user (demo only)
async function simulateNotification({ userId, caseId, message }) {
  return await request('/admin/simulate-notify', { method: 'POST', body: JSON.stringify({ userId, caseId, message }) });
}

// User: get notifications for current user
async function getNotifications() {
  return await request('/notifications', { method: 'GET' });
}

// User: mark a notification read
async function markNotificationRead(notificationId) {
  return await request(`/notifications/${encodeURIComponent(notificationId)}/mark-read`, { method: 'POST' });
}

// Admin: notification templates
async function getNotificationTemplates() {
  return await request('/admin/notification-templates', { method: 'GET' });
}

async function addNotificationTemplate({ name, message }) {
  return await request('/admin/notification-templates', { method: 'POST', body: JSON.stringify({ name, message }) });
}

export { signup, login, logout, getUsers, addInteraction, getInteractions, reportCase, reportCaseWithDate, getCases, trace, getAdminInteractions, simulateNotification, getNotifications, markNotificationRead, getNotificationTemplates, addNotificationTemplate, getToken, getCurrentUser };
