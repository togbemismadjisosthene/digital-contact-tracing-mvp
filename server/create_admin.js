#!/usr/bin/env node
/**
 * Script to create an admin account in the database
 * Usage: node create_admin.js <username> <password>
 * 
 * Example: node create_admin.js admin admin123
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./db');

async function createAdmin(username, password) {
  if (!username || !password) {
    console.error('Usage: node create_admin.js <username> <password>');
    process.exit(1);
  }

  try {
    // Check if user already exists
    const existing = await db.query('SELECT id, username, role FROM users WHERE username=$1', [username]);
    if (existing.rows.length > 0) {
      const user = existing.rows[0];
      if (user.role === 'admin') {
        console.log(`✓ Admin account "${username}" already exists.`);
        return;
      } else {
        // Update existing user to admin
        await db.query('UPDATE users SET role=$1, password_hash=$2 WHERE username=$3', [
          'admin',
          await bcrypt.hash(password, 10),
          username
        ]);
        console.log(`✓ Updated user "${username}" to admin role.`);
        return;
      }
    }

    // Create new admin user
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username, password_hash, role, created_at) VALUES ($1,$2,$3,NOW()) RETURNING id, username, role',
      [username, hash, 'admin']
    );

    const user = result.rows[0];
    console.log(`✓ Admin account created successfully!`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  ID: ${user.id}`);
    console.log(`\nYou can now login with username: ${username}`);
  } catch (err) {
    console.error('Error creating admin account:', err.message);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const username = args[0];
const password = args[1];

createAdmin(username, password);

