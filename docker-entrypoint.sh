#!/bin/sh
set -e

echo "🚀 Siebert Services - Starting up..."

# Wait for database to be ready (if DATABASE_URL is set)
if [ -n "$DATABASE_URL" ]; then
  echo "📦 Waiting for database..."
  
  # Extract host and port from DATABASE_URL
  # Example: postgresql://user:pass@localhost:5432/db
  DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\).*/\1/p')
  DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
  
  # Default to standard postgres port if not found
  DB_PORT=${DB_PORT:-5432}
  
  # Wait up to 30 seconds for database to be ready
  COUNTER=0
  until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null || [ $COUNTER -gt 30 ]; do
    echo "⏳ Database not ready yet... ($COUNTER/30)"
    COUNTER=$((COUNTER + 1))
    sleep 1
  done
  
  if [ $COUNTER -gt 30 ]; then
    echo "❌ Database failed to become ready after 30 seconds"
    exit 1
  fi
  
  echo "✅ Database is ready!"
fi

echo "🗄️  Setting up database schema..."
# The db:push command needs to be run from the workspace root
# Since we're in /app and db is at ./lib/db, we need to run pnpm from there
cd /app && pnpm --filter @workspace/db run push --force || true

echo "✨ Starting API server..."
exec node api-dist/index.cjs
