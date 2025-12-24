# Deployment Guide - Contact Tracing MVP

## Quick Start (Development)

### 1. Prerequisites
```bash
# Check Node.js version (v14+ required)
node --version

# Check PostgreSQL version (v12+ required)
psql --version
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb contact_tracing

# Apply schema
psql -d contact_tracing -f server/schema.sql

# Or use the setup script
cd server
chmod +x setup_postgres_and_schema.sh
./setup_postgres_and_schema.sh
```

### 3. Backend Configuration

```bash
cd server

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://username:password@localhost:5432/contact_tracing
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d
PORT=4000
NODE_ENV=development
EOF

# Edit .env with your actual database credentials
nano .env  # or use your preferred editor
```

### 4. Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:4000/api`

### 5. Frontend Configuration

```bash
# From project root
cd ..

# Install dependencies
npm install

# Optional: Set API base URL (defaults to http://localhost:4000/api)
export REACT_APP_API_BASE=http://localhost:4000/api

# Start development server
npm start
```

The app will open at `http://localhost:3000`

## Production Deployment

### Backend Deployment (Example: Heroku/Railway/Render)

1. **Set Environment Variables:**
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=<strong-random-string>
   JWT_EXPIRES_IN=7d
   PORT=4000
   NODE_ENV=production
   ```

2. **Build Command:** (if needed)
   ```bash
   npm install
   ```

3. **Start Command:**
   ```bash
   npm start
   ```

### Frontend Deployment (Example: Vercel/Netlify)

1. **Build Command:**
   ```bash
   npm run build
   ```

2. **Environment Variables:**
   ```
   REACT_APP_API_BASE=https://your-api-domain.com/api
   ```

3. **Output Directory:** `build`

## Testing the Application

### 1. Create Test Accounts

1. Go to `http://localhost:3000`
2. Click "Sign Up"
3. Create a **Member** account (e.g., username: `alice`, password: `password123`)
4. Create an **Admin** account (e.g., username: `admin`, password: `admin123`)

### 2. Test Member Features

1. Login as member
2. Go to Member Dashboard
3. Log an interaction:
   - Select another user from dropdown
   - Set date/time
   - Set duration
   - Add optional notes
   - Click "Save interaction"
4. Verify interaction appears in "Your recent interactions"

### 3. Test Admin Features

1. Login as admin
2. Go to Admin Dashboard
3. **Report a Case:**
   - Select a user from dropdown
   - Click "Report case"
   - Verify case appears in "Reported cases"
4. **Trace Contacts:**
   - Select the same user
   - Set time window (default: 14 days)
   - Click "Find primary contacts"
   - Verify list of primary contacts appears
5. **Simulate Notification:**
   - Click "Simulate notification" on any primary contact
   - Verify alert/feedback appears

### 4. Test Security

1. Login as member
2. Try to access admin endpoints directly:
   ```bash
   curl -H "Authorization: Bearer <member-token>" \
        http://localhost:4000/api/admin/cases
   ```
   Should return `403 Forbidden`

3. Verify member cannot see admin dashboard in UI

## API Endpoints Reference

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth)
- `GET /api/auth/users` - List users (public)

### Interactions (Authenticated)
- `POST /api/interactions` - Log interaction
- `GET /api/interactions` - Get interactions (filtered by role)

### Admin (Admin only)
- `POST /api/admin/cases` - Report case
- `GET /api/admin/cases` - List cases
- `POST /api/admin/trace` - Trace primary contacts
- `GET /api/admin/users` - List all users

## Deploying to Render (recommended single-service setup)

This repository includes a `render.yaml` so you can deploy the app as a single Web Service on Render: the Node/Express backend will serve the built React frontend from `/build`.

Key points:
- The `server/package.json` contains a `postinstall` script that runs `cd .. && npm install && npm run build` when Render installs dependencies in the `server` root. That builds the React app into the `build/` directory.
- `render.yaml` in the repo root points Render to the `server` folder as the service root and sets the start command to `npm start` (which runs `node index.js`).

Recommended Render service settings (when creating a new Web Service):
- Environment: Node
- Root Directory: `server`
- Build Command: leave default (`npm install`) — the `postinstall` will run automatically to build the frontend
- Start Command: `npm start`
- Branch: your deployment branch (e.g., `main`)

Environment variables to set in Render (Environment > Environment Variables):
- `DATABASE_URL` - the Postgres connection string (e.g. `postgres://USER:PASS@HOST:5432/DBNAME`)
- `JWT_SECRET` - strong random string for JWT signing
- `JWT_EXPIRES_IN` - e.g. `7d`
- `NODE_ENV` - `production`

Notes & troubleshooting on Render:
- If your frontend build fails during `postinstall`, check the full build logs (Render shows them under Deploys). You can also run the same commands locally (`cd server && npm install`) to reproduce.
- If the app starts but the frontend doesn't load, ensure the `build/` directory exists in the service container and that the server is using `express.static(build)` (this repo already includes that).
- For better performance / caching you can split frontend and backend into two Render services (Static Site for frontend + Web Service for API). I can prepare that `render.yaml` configuration on request.

Example quick steps to deploy on Render UI:
1. Connect your GitHub/Git provider and select the repo.
2. Choose "Web Service" and set the root to `server`.
3. Set the branch to `main` (or your branch).
4. Confirm the build and start commands as above and add the environment variables.
5. Deploy and watch the logs. First deploy will run `npm install` in `server` and then `postinstall` will install and build the frontend; finally `npm start` will run the Node server.

## Troubleshooting

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -d contact_tracing -c "SELECT 1;"

# Check if DATABASE_URL is set
cd server
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL);"
```

### Port Already in Use
```bash
# Find process using port 4000
lsof -i :4000

# Kill process
kill <PID>
```

### Frontend Can't Connect to Backend
- Verify backend is running on correct port
- Check `REACT_APP_API_BASE` environment variable
- Check CORS settings in `server/index.js`
- Check browser console for errors

### JWT Token Issues
- Verify `JWT_SECRET` is set in backend `.env`
- Check token expiration time
- Clear browser localStorage if needed

## Security Checklist for Production

- [ ] Change `JWT_SECRET` to strong random string
- [ ] Use HTTPS for all communications
- [ ] Set up proper CORS origins (not `*`)
- [ ] Enable rate limiting on API endpoints
- [ ] Set up database backups
- [ ] Configure environment-specific variables
- [ ] Enable request logging
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Review and update `DATA_POLICY.md`
- [ ] Conduct security audit

## Support

For issues or questions:
1. Check `README.md` for detailed documentation
2. Review `DATA_POLICY.md` for privacy information
3. Check server logs: `server/server.log`
4. Check browser console for frontend errors

---

**Status:** ✅ MVP Complete - Ready for Deployment

