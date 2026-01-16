#!/bin/sh
# Database initialization script for HopHop backend
# This runs migrations when the container starts

set -e

echo "Waiting for database to be ready..."
until pg_isready -h hophop-db -U hophop; do
  sleep 1
done

echo "Database is ready. Running migrations..."

# Run all SQL migrations in order
for migration in /app/migrations/*.sql; do
  if [ -f "$migration" ]; then
    echo "Running migration: $(basename $migration)"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f "$migration" || {
      echo "Warning: Migration $(basename $migration) failed or already applied"
    }
  fi
done

echo "Migrations complete. Starting application..."
exec npm start
