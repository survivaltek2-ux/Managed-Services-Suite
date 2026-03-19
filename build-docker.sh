#!/bin/bash
set -e

echo "🏗️  Building Siebert Services Docker Setup..."

# Step 1: Build the application locally
echo "📦 Step 1: Building application locally..."
PORT=8081 BASE_PATH="/" pnpm --filter '@workspace/api-server' --filter '@workspace/siebert-services' --filter '@workspace/partner-portal' run build

# Step 2: Verify artifacts exist
echo "✅ Step 2: Verifying artifacts..."
if [ ! -d "artifacts/api-server/dist" ]; then
  echo "❌ API server dist not found"
  exit 1
fi
if [ ! -d "artifacts/siebert-services/dist/public" ]; then
  echo "❌ Siebert services dist not found"
  exit 1
fi
if [ ! -d "artifacts/partner-portal/dist/public" ]; then
  echo "❌ Partner portal dist not found"
  exit 1
fi
echo "✅ All artifacts found"

# Step 3: Build Docker image
echo "🐳 Step 3: Building Docker image..."
docker build -t siebert-services:latest .

echo ""
echo "✅ Docker image built successfully!"
echo ""
echo "🚀 To start the application, run:"
echo "   docker-compose up -d"
echo ""
echo "📍 Access the apps at:"
echo "   - Main site: http://localhost:8080"
echo "   - Partner portal: http://localhost:8080/partners"
echo "   - Admin: http://localhost:8080/admin"
