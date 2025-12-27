require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../db');

async function setPassword(username, password) {
  try {
    const hash = await bcrypt.hash(password, 10);
    const res = await db.query('UPDATE users SET password_hash=$1 WHERE username=$2 RETURNING id, username, role', [hash, username]);
    if (res.rows.length) {
      console.log('Updated admin password for user:', res.rows[0]);
    } else {
      console.log('No user found with username:', username);
    }
  } catch (err) {
    console.error('Error updating password:', err);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
}

const args = process.argv.slice(2);
const username = args[0] || 'admin';
const password = args[1] || 'admin123';

setPassword(username, password);
