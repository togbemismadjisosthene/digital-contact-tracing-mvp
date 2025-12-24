# Creating Admin Accounts

## Security Note
Admin accounts cannot be created through the web interface. They must be created directly in the database for security reasons.

## Method 1: Using the create_admin.js script (Recommended)

```bash
cd server
node create_admin.js <username> <password>
```

Example:
```bash
node create_admin.js admin admin123
```

This will:
- Create a new admin account if it doesn't exist
- Update an existing user to admin role if username exists
- Hash the password securely using bcrypt

## Method 2: Using PostgreSQL directly

```bash
# First, hash the password using Node.js
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('your_password', 10).then(h => console.log(h));"

# Then insert into database (replace YOUR_HASHED_PASSWORD with the output above)
psql -d contact_tracing -c "INSERT INTO users (username, password_hash, role) VALUES ('admin', 'YOUR_HASHED_PASSWORD', 'admin');"
```

## Method 3: Using psql with bcrypt hash

```bash
# Generate hash
HASH=$(node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(h => console.log(h));")

# Insert admin
psql -d contact_tracing -c "INSERT INTO users (username, password_hash, role) VALUES ('admin', '$HASH', 'admin');"
```

## Default Admin Account

For development/testing, you can create a default admin account:

```bash
cd server
node create_admin.js admin admin123
```

Then login with:
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT:** Change the default password in production!

## Verifying Admin Account

Check if admin account exists:
```bash
psql -d contact_tracing -c "SELECT id, username, role FROM users WHERE role='admin';"
```

