# Digital Contact Tracing Web App (Form-Based)

A privacy-first, form-based contact tracing system designed for closed communities (e.g., university campuses, workplaces). This MVP enables organizations to log and manage close contacts through secure, user-reported interaction data without relying on GPS or Bluetooth tracking.

## 🎯 Project Overview

This application assists organizations in:
- **Logging Interactions**: Community members voluntarily log their close interactions with other known users
- **Case Reporting**: Authorized administrators can mark users as confirmed cases
- **Contact Tracing**: Administrators can trace primary contacts who interacted with reported cases
- **Privacy Protection**: Uses only form-based data entry (no location tracking)

## ✨ Key Features

### For Community Members
- ✅ Secure sign up/login with JWT authentication
- ✅ Simple form to log interactions (Who, When, Duration, Notes)
- ✅ View personal interaction history
- ✅ Privacy-focused: Only see interactions involving themselves

### For Administrators
- ✅ Secure admin dashboard with role-based access control
- ✅ Report confirmed cases
- ✅ Trace primary contacts for any reported case
- ✅ Configurable time window for contact tracing (default: 14 days)
- ✅ Simulate notifications to primary contacts
- ✅ View all reported cases with audit trail

## 🛠️ Tech Stack

- **Frontend**: React.js with Bootstrap 5
- **Backend**: Node.js with Express
- **Database**: PostgreSQL (with proper indexing for efficient queries)
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **Security**: Role-based access control (RBAC) with middleware protection

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Database Setup

Create a PostgreSQL database and apply the schema:

```bash
# Create database
createdb contact_tracing

# Apply schema
psql -d contact_tracing -f server/schema.sql
```

Alternatively, use the provided setup script:

```bash
cd server
chmod +x setup_postgres_and_schema.sh
./setup_postgres_and_schema.sh
```

### 3. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```bash
cd server
cat > .env << EOF
DATABASE_URL=postgresql://username:password@localhost:5432/contact_tracing
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
PORT=4000
EOF
```

**⚠️ Security Note**: Change `JWT_SECRET` to a strong, random string in production!

### 4. Start the Backend Server

```bash
cd server
npm start
# or for development with auto-reload:
npm run dev
```

The API will be available at `http://localhost:4000/api`

### 5. Start the Frontend

In a new terminal:

```bash
# From project root
npm start
```

The app will open at `http://localhost:3000`

### 6. Create Your First Account

1. Click "Sign up" on the homepage
2. Choose a username and password
3. Select your role:
   - **Member**: For logging interactions
   - **Administrator**: For case reporting and tracing

## 📁 Project Structure

```
demoapp/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── Login.js       # Login form
│   │   ├── Signup.js      # Signup form
│   │   ├── MemberDashboard.js    # Member interface
│   │   ├── AdminDashboard.js     # Admin interface
│   │   ├── InteractionForm.js    # Interaction logging form
│   │   └── TraceResults.js       # Contact tracing results
│   ├── utils/
│   │   ├── api.js         # API client functions
│   │   └── storage.js     # LocalStorage utilities (fallback)
│   ├── App.js             # Main app component
│   └── App.css            # Application styles
├── server/
│   ├── routes/
│   │   ├── auth.js        # Authentication endpoints
│   │   ├── interactions.js # Interaction endpoints
│   │   └── admin.js       # Admin endpoints (protected)
│   ├── middleware/
│   │   └── auth.js         # JWT authentication middleware
│   ├── db.js              # PostgreSQL connection pool
│   ├── schema.sql         # Database schema
│   └── index.js           # Express server entry point
├── DATA_POLICY.md         # Privacy and data policy
└── README.md              # This file
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based sessions
- **Password Hashing**: bcrypt with 10 rounds
- **Role-Based Access Control**: Strict separation between Members and Administrators
- **Protected Endpoints**: Admin routes require authentication + admin role
- **SQL Injection Prevention**: Parameterized queries
- **CORS Configuration**: Configured for development/production

## 📊 Database Schema

### Users Table
- `id` (SERIAL PRIMARY KEY)
- `username` (TEXT UNIQUE)
- `password_hash` (TEXT) - bcrypt hashed
- `role` (TEXT) - 'member' or 'admin'
- `created_at` (TIMESTAMP)

### Interactions Table
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER) - References users(id)
- `contact_user_id` (INTEGER) - References users(id)
- `when_ts` (TIMESTAMP) - Interaction timestamp
- `duration_minutes` (INTEGER)
- `notes` (TEXT) - Optional notes
- `created_at` (TIMESTAMP)

**Indexes**: Created on `user_id`, `contact_user_id`, and `when_ts` for efficient queries

### Cases Table
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER) - References users(id)
- `reported_by` (INTEGER) - References users(id) - Admin who reported
- `reported_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)

## 🔄 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user (requires auth)
- `GET /api/auth/users` - List all users (public, for dropdowns)

### Interactions (`/api/interactions`)
- `POST /api/interactions` - Log new interaction (requires auth)
- `GET /api/interactions` - Get interactions (requires auth, filtered by role)

### Admin (`/api/admin`) - **Admin only**
- `POST /api/admin/cases` - Report a confirmed case
- `GET /api/admin/cases` - List all reported cases
- `POST /api/admin/trace` - Trace primary contacts for a case
- `GET /api/admin/users` - List all users with details

## 🧪 Testing the Application

### Test Flow

1. **Create Test Accounts**:
   - Create a member account (e.g., "alice")
   - Create an admin account (e.g., "admin")

2. **Log Interactions** (as member):
   - Login as a member
   - Log interactions with other users
   - View your interaction history

3. **Report Case** (as admin):
   - Login as admin
   - Select a user from the dropdown
   - Click "Report case"

4. **Trace Contacts** (as admin):
   - Select the same user
   - Set time window (default: 14 days)
   - Click "Find primary contacts"
   - Review the list of primary contacts
   - Use "Simulate notification" to test notification flow

## 📝 Development Notes

### Environment Variables

**Frontend** (optional):
- `REACT_APP_API_BASE` - API base URL (default: `http://localhost:4000/api`)

**Backend** (required):
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRES_IN` - Token expiration (default: `7d`)
- `PORT` - Server port (default: `4000`)

### Fallback Mode

If `DATABASE_URL` is not set, the server will use an in-memory store (for development/testing only). This is **not recommended** for production.

## 🚨 Production Deployment Checklist

- [ ] Set strong `JWT_SECRET` environment variable
- [ ] Use HTTPS for all communications
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Implement rate limiting on API endpoints
- [ ] Enable request logging and monitoring
- [ ] Review and update `DATA_POLICY.md`
- [ ] Conduct security audit
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure environment-specific variables

## 📄 License & Data Policy

See [DATA_POLICY.md](./DATA_POLICY.md) for detailed information about:
- Privacy-first design principles
- Data collection and storage
- Access control and security
- Data retention policies
- Compliance considerations

## 🤝 Contributing

This is a demo/MVP project. For production use:
1. Conduct thorough security review
2. Implement additional features (secondary contacts, location fields, etc.)
3. Add comprehensive test coverage
4. Set up CI/CD pipeline
5. Implement proper logging and monitoring

## 📞 Support

For questions or issues:
- Review the [DATA_POLICY.md](./DATA_POLICY.md) for privacy concerns
- Check server logs for API errors
- Verify database connection and schema
- Ensure environment variables are properly set

---

**Built for**: Privacy-first contact tracing in closed communities  
**Version**: MVP (Minimum Viable Product)  
**Status**: Demo/Development - Requires security review before production use
