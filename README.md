# Digital Contact Tracing Web App (Form-Based)

A privacy-first, form-based contact tracing system designed for closed communities (e.g., university campuses, workplaces).
This MVP enables organizations to log and manage close contacts through secure, user-reported interaction data **without relying on GPS or Bluetooth tracking**.

---

## 🎯 Project Overview

This application assists organizations in:

* **Logging Interactions**: Community members voluntarily log close interactions with other known users
* **Case Reporting**: Authorized administrators can mark users as confirmed cases
* **Contact Tracing**: Administrators can trace primary contacts who interacted with reported cases
* **Privacy Protection**: Uses only form-based data entry (no location tracking)

---

## ✨ Key Features

### For Community Members

* ✅ Secure sign up and login with JWT authentication
* ✅ Simple form to log interactions (Who, When, Duration, Notes)
* ✅ View personal interaction history
* ✅ Privacy-focused: users only see their own data

### For Administrators

* ✅ Secure admin dashboard with role-based access control
* ✅ Report confirmed cases
* ✅ Trace primary contacts for any reported case
* ✅ Configurable time window for contact tracing (default: 14 days)
* ✅ Simulate notifications to primary contacts
* ✅ View all reported cases with audit trail

---

## 🛠️ Tech Stack

* **Frontend**: React.js (Create React App) + Bootstrap 5
* **Backend**: Node.js with Express
* **Database**: PostgreSQL (**optional**)
* **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
* **Security**: Role-Based Access Control (RBAC)

---

## 📋 Prerequisites

### Required

* Node.js (v14 or higher)
* npm or yarn

### Optional

* PostgreSQL (v12 or higher)

> ⚠️ PostgreSQL is **NOT mandatory**.
> The application can run in **two distinct modes** explained below.

---

# 🚀 How to Run the Project

## 🅰️ MODE A — Run WITHOUT PostgreSQL (In-Memory Mode)

✔ No PostgreSQL installation required
✔ Ideal for **quick testing, demos, and academic evaluation**
✔ Backend uses an **in-memory data store**

⚠️ **All data is lost when the server restarts**

---

### Steps (Mode A)

#### 1. Clone the repository

```bash
git clone https://github.com/togbemismadjisosthene/digital-contact-tracing-mvp.git
cd MVP_APP
```

#### 2. Install dependencies

```bash
npm install
cd server
npm install
cd ..
```

#### 3. Do NOT install PostgreSQL

#### 4. Do NOT create `server/.env`

#### 5. Start backend

```bash
cd server
npm start
```

Backend API:

```
http://localhost:4000/api
```

#### 6. Start frontend (new terminal)

```bash
npm start
```

Frontend:

```
http://localhost:3000
```

✅ The application works immediately.

---

## 🅱️ MODE B — Run WITH PostgreSQL (Persistent Mode – Recommended)

✔ Data is persistent
✔ Recommended for serious testing and deployment
✔ Required for production use

---

### 1. Install PostgreSQL

#### Ubuntu / Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### macOS

```bash
brew install postgresql
brew services start postgresql
```

---

### 2. Create database and user

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE contact_tracing;
CREATE USER ct_user WITH PASSWORD 'ct_pass';
GRANT ALL PRIVILEGES ON DATABASE contact_tracing TO ct_user;
\q
```

---

### 3. Create tables

```bash
psql -U ct_user -d contact_tracing
```

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE interactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  contact_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  when_ts TIMESTAMP NOT NULL,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_interactions_user ON interactions(user_id);
CREATE INDEX idx_interactions_contact ON interactions(contact_user_id);
CREATE INDEX idx_interactions_when ON interactions(when_ts);

CREATE TABLE cases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reported_by INTEGER REFERENCES users(id),
  reported_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

```sql
\q
```

---

### 4. Configure environment variables

Create `server/.env`:

```bash
cd server
cat > .env << EOF
DATABASE_URL=postgresql://ct_user:ct_pass@localhost:5432/contact_tracing
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
PORT=4000
EOF
```

---

### 5. Start servers (Mode B)

#### Backend

```bash
cd server
npm start
```

#### Frontend (new terminal)

```bash
npm start
```

Frontend:

```
http://localhost:3000
```

---

## 🔐 Authentication Notes (Important)

* `POST /api/auth/signup`

  * Creates a user
  * ❌ Does **NOT** issue a JWT token

* Users must explicitly log in via `/login`

This prevents accidental auto-login after signup.

---

## 📁 Project Structure

```
MVP_APP/
├── public/
├── src/
│   ├── components/
│   ├── utils/
│   ├── App.js
│   └── App.css
├── server/
│   ├── routes/
│   ├── middleware/
│   ├── db.js
│   ├── schema.sql
│   └── index.js
├── build/                # Production build (optional)
├── DATA_POLICY.md
├── DEPLOYMENT_GUIDE.md
└── README.md
```

---

## 🧪 Testing Flow

1. Create a **member** account
2. Create an **admin** account
3. Log interactions as member
4. Report a case as admin
5. Trace contacts

---

## ⚠️ Important Notes

* PostgreSQL is **optional**
* Mode A works instantly (no database)
* Mode B enables persistence
* This project is an **academic MVP / demo**

---

## 📄 License & Data Policy

See `DATA_POLICY.md` for privacy and data handling details.

---

**Built for**: Privacy-first contact tracing in closed communities
**Version**: MVP (Minimum Viable Product)
**Status**: Demo / Academic Project
