const express = require('express');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
let store = null;
try { store = require('../in_memory_store'); } catch (e) { store = null; }

const router = express.Router();

// GET /api/admin/notification-templates - list saved templates (admin)
router.get('/notification-templates', authMiddleware, adminOnly, async (req, res) => {
  try {
    if (store) {
      const rows = await store.listNotificationTemplates();
      return res.json(rows);
    }
    return res.status(501).json({ error: 'notification templates not implemented for DB mode in this demo' });
  } catch (err) {
    console.error('Templates list error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST /api/admin/notification-templates - create a template (admin)
router.post('/notification-templates', authMiddleware, adminOnly, async (req, res) => {
  const { name, message } = req.body;
  try {
    if (store) {
      const rec = await store.addNotificationTemplate({ name, message, created_by: req.user.id });
      return res.json({ ok: true, template: rec });
    }
    return res.status(501).json({ error: 'notification templates not implemented for DB mode in this demo' });
  } catch (err) {
    console.error('Create template error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST /api/admin/simulate-notify - admin triggers a simulated notification to a user
router.post('/simulate-notify', authMiddleware, adminOnly, async (req, res) => {
  const { userId, caseId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  try {
    if (store) {
      const finalMessage =
        "Hello, this is the Epidemiology Prevention Center. You have been identified as a primary contact following contact tracing analysis. Please monitor your health closely and follow the recommended public health measures.";

      const rec = await store.addNotification({
        user_id: userId,
        message: finalMessage,
        simulated_by: req.user.id,
        case_id: caseId || null
      });

      return res.json({ ok: true, notification: rec });
    }

    return res.status(501).json({
      error: 'simulate-notify not implemented for DB mode in this demo'
    });

  } catch (err) {
    console.error('Simulate notify error', err);
    return res.status(500).json({ error: 'server error' });
  }
});


// POST /api/admin/cases - report a case (admin)
router.post('/cases', authMiddleware, adminOnly, async (req, res) => {
  const { userId, reportedAt } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  try {
    if (!process.env.DATABASE_URL && store) {
      const rec = await store.addCase({ user_id: userId, reported_by: req.user.id, reported_at: reportedAt });
      return res.json({ ok: true, case: rec });
    }
    const reported_at_val = reportedAt ? reportedAt : null;
    const q = reported_at_val ? 'INSERT INTO cases (user_id, reported_by, reported_at, created_at) VALUES ($1,$2,$3,NOW()) RETURNING id, user_id, reported_at' : 'INSERT INTO cases (user_id, reported_by, reported_at, created_at) VALUES ($1,$2,NOW(),NOW()) RETURNING id, user_id, reported_at';
    const params = reported_at_val ? [userId, req.user.id, reported_at_val] : [userId, req.user.id];
    const result = await db.query(q, params);
    res.json({ ok: true, case: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST /api/admin/trace - compute primary contacts for a caseUserId within windowDays
// Returns distinct users who interacted with the case user within the specified time window
router.post('/trace', authMiddleware, adminOnly, async (req, res) => {
  const { caseUserId, windowDays } = req.body;
  if (!caseUserId) return res.status(400).json({ error: 'caseUserId required' });
  const days = Number(windowDays) || 14;
  if (days < 1 || days > 90) return res.status(400).json({ error: 'windowDays must be between 1 and 90' });
  
  try {
    if (!process.env.DATABASE_URL && store) {
      // In-memory fallback: get interactions for case user and dedupe
      const rows = await store.getInteractionsForUser(caseUserId);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const primaries = [];
      const seen = new Set();
      
      for (const i of rows) {
        const when = new Date(i.when_ts);
        if (when < cutoff) continue;
        
        // Identify the other user (not the case user)
        const otherId = String(i.user_id) === String(caseUserId) 
          ? String(i.contact_user_id) 
          : String(i.user_id);
        
        if (!seen.has(otherId)) {
          seen.add(otherId);
          const users = await store.listUsers();
          const u = users.find(x => String(x.id) === String(otherId));
          primaries.push({ 
            id: otherId, 
            username: u ? u.username : otherId, 
            when: i.when_ts, 
            durationMinutes: i.duration_minutes 
          });
        }
      }
      return res.json(primaries);
    }
    
    // PostgreSQL: Find distinct primary contacts who interacted with case user within window
    // This query finds all interactions where the case user participated, identifies the other user,
    // and returns distinct primary contacts with their interaction details
    const q = await db.query(
      `SELECT DISTINCT ON (u_contact.id)
         u_contact.id,
         u_contact.username,
         i.when_ts AS when,
         i.duration_minutes AS "durationMinutes"
       FROM interactions i
       INNER JOIN users u_contact ON (
         CASE 
           WHEN i.user_id = $1 THEN i.contact_user_id
           ELSE i.user_id
         END
       ) = u_contact.id
       WHERE (i.user_id = $1 OR i.contact_user_id = $1)
         AND i.when_ts >= NOW() - ($2::int || ' days')::interval
       ORDER BY u_contact.id, i.when_ts DESC
      `,
      [caseUserId, days]
    );
    
    res.json(q.rows);
  } catch (err) {
    console.error('Trace error:', err);
    res.status(500).json({ error: 'server error', details: err.message });
  }
});

// GET /api/admin/users - list users (admin)
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    if (!process.env.DATABASE_URL && store) {
      const u = await store.listUsers();
      return res.json(u);
    }
    const q = await db.query('SELECT id, username, role, created_at FROM users ORDER BY username');
    res.json(q.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /api/admin/interactions - list all interactions (admin-only)
router.get('/interactions', authMiddleware, adminOnly, async (req, res) => {
  try {
    if (!process.env.DATABASE_URL && store) {
      const rows = await store.listAllInteractions();
      return res.json(rows);
    }
    const q = await db.query(
      `SELECT i.id, i.when_ts, i.duration_minutes, i.notes, i.created_at,
              u1.id AS user_id, u1.username AS user_username,
              u2.id AS contact_user_id, u2.username AS contact_username
       FROM interactions i
       LEFT JOIN users u1 ON i.user_id = u1.id
       LEFT JOIN users u2 ON i.contact_user_id = u2.id
       ORDER BY i.when_ts DESC
      `
    );
    res.json(q.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /api/admin/cases - list reported cases
router.get('/cases', authMiddleware, adminOnly, async (req, res) => {
  try {
    const q = await db.query('SELECT c.id, c.user_id, c.reported_by, c.reported_at, u.username FROM cases c LEFT JOIN users u ON u.id = c.user_id ORDER BY c.reported_at DESC');
    res.json(q.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;

