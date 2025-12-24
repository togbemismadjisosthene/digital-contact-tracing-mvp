const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
let store = null;
try { store = require('../in_memory_store'); } catch (e) { store = null; }

const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// POST /api/auth/signup
// Security: Only members can be created via signup. Admin accounts must be created by database administrators.
router.post('/signup', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  
  // Prevent admin account creation via signup endpoint
  if (role === 'admin') {
    return res.status(403).json({ error: 'Admin accounts cannot be created via signup. Contact system administrator.' });
  }
  
  try {
    if (!process.env.DATABASE_URL && store) {
      // in-memory fallback - force member role
      const user = await store.createUser({ username, password, role: 'member' });
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'change_this_secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
      return res.json({ token, user });
    }
    const existing = await db.query('SELECT id FROM users WHERE username=$1', [username]);
    if (existing.rows.length) return res.status(400).json({ error: 'username exists' });
    const hash = await bcrypt.hash(password, 10);
    // Force member role - admin accounts must be created directly in database
    const result = await db.query(
      'INSERT INTO users (username, password_hash, role, created_at) VALUES ($1,$2,$3,NOW()) RETURNING id, username, role',
      [username, hash, 'member']
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'change_this_secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  try {
    if (!process.env.DATABASE_URL && store) {
      const user = await store.findUserByUsername(username);
      if (!user) return res.status(400).json({ error: 'invalid credentials' });
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(400).json({ error: 'invalid credentials' });
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'change_this_secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
      return res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    }
    const result = await db.query('SELECT id, username, password_hash, role FROM users WHERE username=$1', [username]);
    if (!result.rows.length) return res.status(400).json({ error: 'invalid credentials' });
    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ error: 'invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'change_this_secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /api/auth/me - returns the authenticated user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // authMiddleware injects req.user from the JWT
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
});

// GET /api/auth/users - authenticated endpoint for members and admins
router.get('/users', authMiddleware, async (req, res) => {
  try {
    if (!process.env.DATABASE_URL && store) {
      const u = await store.listUsers();
      return res.json(u);
    }
    const q = await db.query('SELECT id, username, role FROM users ORDER BY username');
    res.json(q.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;

