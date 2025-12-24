#!/bin/bash
# setup_postgres_and_schema.sh
# Usage (run as a sudo-capable user): sudo bash setup_postgres_and_schema.sh

set -euo pipefail

# Variables - modify as needed before running
APP_DIR="/home/student25/Desktop/demoapp"
DB_NAME="contact_tracing"
DB_USER="ct_user"
DB_PASS="ct_password"   # <-- REPLACE with a strong password before running

echo "1) Installing PostgreSQL packages..."
apt update
apt install -y postgresql postgresql-client

echo "2) Enabling and starting PostgreSQL service..."
systemctl enable --now postgresql

echo "3) Creating DB role and database (if not exists)..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 || sudo -u postgres psql -c "CREATE ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASS}';"
sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw ${DB_NAME} || sudo -u postgres createdb -O ${DB_USER} ${DB_NAME}

echo "4) Applying schema: $APP_DIR/server/schema.sql"
if [ ! -f "$APP_DIR/server/schema.sql" ]; then
  echo "ERROR: schema file not found at $APP_DIR/server/schema.sql"
  exit 1
fi
sudo -u postgres psql -d ${DB_NAME} -f "$APP_DIR/server/schema.sql"

echo "5) Prepare server .env from example (will set DATABASE_URL)."
cp -n "$APP_DIR/server/.env.example" "$APP_DIR/server/.env"
sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}|" "$APP_DIR/server/.env"
if ! grep -q '^JWT_SECRET=' "$APP_DIR/server/.env"; then
  echo "JWT_SECRET=$(head -c 32 /dev/urandom | base64)" >> "$APP_DIR/server/.env"
fi

echo "6) Install Node dependencies for server (will run as the current user)."
cd "$APP_DIR/server"
if command -v npm >/dev/null 2>&1; then
  npm install --no-audit --no-fund
else
  echo "npm not found - please install Node/npm (nvm recommended) and run 'npm install' in $APP_DIR/server"
fi

echo "Setup complete. Start the server with: cd $APP_DIR/server && npm run dev"
