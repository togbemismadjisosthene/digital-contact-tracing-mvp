const express = require('express');
const { authMiddleware } = require('../middleware/auth');
let store = null;
try { store = require('../in_memory_store'); } catch (e) { store = null; }

const router = express.Router();

// GET /api/notifications - list notifications for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (store) {
      const rows = await store.listNotificationsForUser(req.user.id);
      return res.json(rows);
    }
    // If using a real DB and no notifications table, return empty for now
    return res.status(501).json({ error: 'notifications not implemented for DB mode in this demo' });
  } catch (err) {
    console.error('Notifications list error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST /api/notifications/:id/mark-read - mark a notification read
router.post('/:id/mark-read', authMiddleware, async (req, res) => {
  const id = req.params.id;
  try {
    if (store) {
      const rec = await store.markNotificationRead(id, req.user.id);
      if (!rec) return res.status(404).json({ error: 'not found' });
      return res.json({ ok: true, notification: rec });
    }
    return res.status(501).json({ error: 'notifications not implemented for DB mode in this demo' });
  } catch (err) {
    console.error('Mark read error', err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
