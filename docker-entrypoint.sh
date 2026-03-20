#!/bin/sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Siebert Services - Starting up..."

# Wait for database to be ready (if DATABASE_URL is set)
if [ -n "$DATABASE_URL" ]; then
  echo "📦 Waiting for database..."
  
  DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\).*/\1/p')
  DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
  DB_PORT=${DB_PORT:-5432}
  
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
cd "$SCRIPT_DIR" && pnpm --filter @workspace/db run push --force || true

echo "🔐 Ensuring admin user exists..."
cd "$SCRIPT_DIR" && npx tsx scripts/src/create-admin.ts || true

echo "🌱 Checking if production data needs to be seeded..."
CONTACT_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM contacts;" 2>/dev/null || echo "0")
if [ "$CONTACT_COUNT" -eq 0 ]; then
  echo "📥 Restoring seed data to production..."
  psql "$DATABASE_URL" -f "$SCRIPT_DIR/migrations/dev-data-dump.sql" > /dev/null 2>&1 || true
  echo "✅ Seed data restored"
else
  echo "✓ Production data already exists, skipping seed"
fi

echo "✨ Starting API server..."
if [ -f "$SCRIPT_DIR/api-dist/index.cjs" ]; then
  exec node "$SCRIPT_DIR/api-dist/index.cjs"
elif [ -f "$SCRIPT_DIR/artifacts/api-server/dist/index.cjs" ]; then
  exec node "$SCRIPT_DIR/artifacts/api-server/dist/index.cjs"
else
  echo "❌ Could not find built API server. Run 'pnpm --filter @workspace/api-server run build' first."
  exit 1
fi
