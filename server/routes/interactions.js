const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
let store = null;
try { store = require('../in_memory_store'); } catch (e) { store = null; }

const router = express.Router();

// POST /api/interactions - create interaction (authenticated)
router.post('/', authMiddleware, async (req, res) => {
  const { contactUserId, when, durationMinutes, notes } = req.body;
  const userId = req.user.id;
  try {
    if (!process.env.DATABASE_URL && store) {
      const r = await store.addInteraction({ user_id: userId, contact_user_id: contactUserId, when_ts: when || new Date().toISOString(), duration_minutes: durationMinutes || 0, notes });
      return res.json({ ok: true, id: r.id });
    }
    const result = await db.query(
      'INSERT INTO interactions (user_id, contact_user_id, when_ts, duration_minutes, notes, created_at) VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING id',
      [userId, contactUserId, when || new Date().toISOString(), durationMinutes || 0, notes || null]
    );
    res.json({ ok: true, id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /api/interactions - list interactions for a user (admin can pass userId to list others)
router.get('/', authMiddleware, async (req, res) => {
  const requester = req.user;
  const targetUser = req.query.userId;
  try {
    if (!process.env.DATABASE_URL && store) {
      const userId = (requester.role === 'admin' && targetUser) ? targetUser : requester.id;
      const rows = await store.getInteractionsForUser(userId);
      return res.json(rows);
    }
    if (requester.role === 'admin' && targetUser) {
      const q = await db.query('SELECT * FROM interactions WHERE user_id=$1 OR contact_user_id=$1 ORDER BY when_ts DESC', [targetUser]);
      return res.json(q.rows);
    }
    // member: return interactions involving themselves
    const q = await db.query('SELECT * FROM interactions WHERE user_id=$1 OR contact_user_id=$1 ORDER BY when_ts DESC', [requester.id]);
    res.json(q.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
