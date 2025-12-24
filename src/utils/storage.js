// LocalStorage-backed simple persistence for demo purposes
const USERS_KEY = 'ct_users';
const CURRENT_KEY = 'ct_currentUser';
const INTERACTIONS_KEY = 'ct_interactions';
const CASES_KEY = 'ct_cases';

function storageInit() {
  // create default admin if no users exist
  if (!localStorage.getItem(USERS_KEY)) {
    const admin = { id: 'admin', username: 'admin', password: 'admin', role: 'admin' };
    const demoUser = { id: 'user1', username: 'user1', password: 'password', role: 'member' };
    localStorage.setItem(USERS_KEY, JSON.stringify([admin, demoUser]));
  }
  if (!localStorage.getItem(INTERACTIONS_KEY)) localStorage.setItem(INTERACTIONS_KEY, JSON.stringify([]));
  if (!localStorage.getItem(CASES_KEY)) localStorage.setItem(CASES_KEY, JSON.stringify([]));
}

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function createUser({ username, password, role }) {
  const users = getUsers();
  if (users.find(u => u.username === username)) throw new Error('Username already exists');
  const id = username; // simple id
  const user = { id, username, password, role };
  users.push(user);
  saveUsers(users);
  setCurrentUser({ id: user.id, username: user.username, role: user.role });
  return user;
}

function authenticateUser({ username, password }) {
  const users = getUsers();
  const u = users.find(x => x.username === username && x.password === password);
  if (!u) return null;
  const safe = { id: u.id, username: u.username, role: u.role };
  setCurrentUser(safe);
  return safe;
}

function setCurrentUser(user) {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem(CURRENT_KEY) || 'null');
}

function logout() {
  localStorage.removeItem(CURRENT_KEY);
}

function getInteractions() {
  return JSON.parse(localStorage.getItem(INTERACTIONS_KEY) || '[]');
}

function saveInteractions(items) {
  localStorage.setItem(INTERACTIONS_KEY, JSON.stringify(items));
}

function addInteraction(interaction) {
  const items = getInteractions();
  items.push(interaction);
  saveInteractions(items);
}

function getCases() {
  return JSON.parse(localStorage.getItem(CASES_KEY) || '[]');
}

function addCase(caseRecord) {
  const cases = getCases();
  cases.push(caseRecord);
  localStorage.setItem(CASES_KEY, JSON.stringify(cases));
}

export {
  storageInit,
  getUsers,
  createUser,
  authenticateUser,
  getCurrentUser,
  logout,
  getInteractions,
  addInteraction,
  getCases,
  addCase,
};
