const bcrypt = require('bcrypt');

const users = [];
const interactions = [];
const cases = [];
const notifications = []; // { id, user_id, message, simulated_by, case_id, created_at, read }
const templates = [];

function init() {
  if (users.length === 0) {
    // default admin and demo user
    users.push({ id: 1, username: 'admin', password_hash: bcrypt.hashSync('admin', 10), role: 'admin', created_at: new Date().toISOString() });
    users.push({ id: 2, username: 'user1', password_hash: bcrypt.hashSync('password', 10), role: 'member', created_at: new Date().toISOString() });
  }
}

async function createUser({ username, password, role }) {
  init();
  if (users.find(u => u.username === username)) throw new Error('username exists');
  const id = users.length + 1;
  const hash = await bcrypt.hash(password, 10);
  const u = { id, username, password_hash: hash, role: role || 'member', created_at: new Date().toISOString() };
  users.push(u);
  return { id: u.id, username: u.username, role: u.role };
}

async function findUserByUsername(username) {
  init();
  return users.find(u => u.username === username) || null;
}

async function listUsers() {
  init();
  return users.map(u => ({ id: u.id, username: u.username, role: u.role, created_at: u.created_at }));
}

async function addInteraction({ user_id, contact_user_id, when_ts, duration_minutes, notes }) {
  init();
  const id = interactions.length + 1;
  const row = { id, user_id, contact_user_id, when_ts: when_ts || new Date().toISOString(), duration_minutes: duration_minutes || 0, notes: notes || null, created_at: new Date().toISOString() };
  interactions.push(row);
  return row;
}

async function addNotification({ user_id, message, simulated_by, case_id }) {
  init();
  const id = notifications.length + 1;
  const rec = { id, user_id, message, simulated_by: simulated_by || null, case_id: case_id || null, created_at: new Date().toISOString(), read: false };
  notifications.push(rec);
  return rec;
}

async function listNotificationsForUser(userId) {
  init();
  return notifications.filter(n => String(n.user_id) === String(userId));
}

async function markNotificationRead(notificationId, userId) {
  init();
  const n = notifications.find(x => x.id === Number(notificationId) && String(x.user_id) === String(userId));
  if (!n) return null;
  n.read = true;
  return n;
}

async function getInteractionsForUser(userId) {
  init();
  return interactions.filter(i => String(i.user_id) === String(userId) || String(i.contact_user_id) === String(userId));
}

// (addCase implemented below with optional reported_at)

async function listAllInteractions() {
  init();
  return interactions.map(i => ({ ...i }));
}

// support reported_at optional
async function addCase({ user_id, reported_by, reported_at }) {
  init();
  const id = cases.length + 1;
  const rec = { id, user_id, reported_by, reported_at: reported_at || new Date().toISOString(), created_at: new Date().toISOString() };
  cases.push(rec);
  return rec;
}

async function listCases() {
  init();
  return cases.map(c => ({ ...c }));
}

async function listNotificationTemplates() {
  init();
  return templates.map(t => ({ ...t }));
}

async function addNotificationTemplate({ name, message, created_by }) {
  init();
  const id = templates.length + 1;
  const rec = { id, name: name || `template-${id}`, message: message || '', created_by: created_by || null, created_at: new Date().toISOString() };
  templates.push(rec);
  return rec;
}

module.exports = { init, createUser, findUserByUsername, listUsers, addInteraction, getInteractionsForUser, listAllInteractions, addCase, listCases, addNotification, listNotificationsForUser, markNotificationRead, listNotificationTemplates, addNotificationTemplate };
