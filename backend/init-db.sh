#!/bin/sh
# Database initialization script for HopHop backend
# This runs migrations when the container starts

set -e

echo "Waiting for database to be ready..."
until pg_isready -h ${DB_HOST:-hophop-db} -U ${DB_USER:-hophop}; do
  sleep 1
done

echo "Database is ready. Running migrations..."

# Run all SQL migrations in order
for migration in /app/migrations/*.sql; do
  if [ -f "$migration" ]; then
    echo "Running migration: $(basename $migration)"
    PGPASSWORD=${DB_PASSWORD:-hophop123} psql -h ${DB_HOST:-hophop-db} -U ${DB_USER:-hophop} -d ${DB_NAME:-hophop} -f "$migration" 2>&1 || {
      echo "Warning: Migration $(basename $migration) failed or already applied"
    }
  fi
done

echo "Migrations complete. Starting application..."
exec npm start
