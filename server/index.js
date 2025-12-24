require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const interactionsRoutes = require('./routes/interactions');
const adminRoutes = require('./routes/admin');
const notificationsRoutes = require('./routes/notifications');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/interactions', interactionsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationsRoutes);

// Serve React build static files if present (production on Render)
const buildPath = path.join(__dirname, '..', 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));

  // Serve the React app at root
  app.get('/', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });

  // For any other non-API route, serve the React app's index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.json({ ok: true, message: 'Contact Tracing API' }));
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
