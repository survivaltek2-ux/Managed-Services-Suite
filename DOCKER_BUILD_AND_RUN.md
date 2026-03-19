# Docker Build and Run Guide

This guide explains how to properly build and run the Siebert Services application in Docker.

## Quick Start (3 Steps)

### Step 1: Build the Application Locally (One-time)

The Dockerfile uses **pre-built artifacts** to avoid build issues. Build locally first:

```bash
# Build the application
pnpm run build

# This creates:
# - artifacts/api-server/dist/index.cjs
# - artifacts/siebert-services/dist/public/
# - artifacts/partner-portal/dist/public/
```

### Step 2: Build the Docker Image

```bash
# Build the image
docker build -t siebert-services:latest .

# Or use docker-compose
docker-compose build
```

### Step 3: Run the Container

**Option A: Using Docker Compose (Recommended)**
```bash
docker-compose up -d
```

**Option B: Manual Docker Run**
```bash
docker run -d \
  --name siebert-app \
  -e DATABASE_URL="postgresql://siebert:siebert_dev_password@postgres:5432/siebert" \
  -e NODE_ENV="production" \
  -e JWT_SECRET="your-secret-key" \
  -p 8080:8080 \
  siebert-services:latest
```

---

## How It Works

### Dockerfile Strategy

The Dockerfile **does NOT build the application inside Docker**. Instead:

1. **Builder assumes artifacts are pre-built** - Copies already-compiled code
2. **Copies pre-built artifacts:**
   - `artifacts/api-server/dist/index.cjs` → Bundled Node.js API
   - `artifacts/siebert-services/dist/public/` → Static frontend #1
   - `artifacts/partner-portal/dist/public/` → Static frontend #2
3. **Installs runtime dependencies only** - Much faster and smaller image
4. **Sets up entrypoint script** - Handles database initialization

### Why This Approach?

✅ **Simpler** - No complex build steps inside Docker  
✅ **Faster** - Docker build completes in seconds  
✅ **More Reliable** - Avoids environment differences between local and Docker  
✅ **Smaller Image** - Only includes runtime code, not build tools  

---

## Common Tasks

### Rebuild After Code Changes

```bash
# 1. Rebuild locally
pnpm run build

# 2. Rebuild Docker image
docker build -t siebert-services:latest .

# 3. Restart container
docker-compose down
docker-compose up -d
```

### Deploy to Production

1. **Ensure code is built:**
   ```bash
   pnpm run build
   ```

2. **Build Docker image:**
   ```bash
   docker build -t siebert-services:latest .
   ```

3. **Tag for registry** (example: Docker Hub):
   ```bash
   docker tag siebert-services:latest your-username/siebert-services:latest
   docker push your-username/siebert-services:latest
   ```

4. **Deploy to cloud** (see cloud provider docs):
   - AWS ECS, Google Cloud Run, DigitalOcean, Kubernetes, etc.

### Troubleshooting Build Failures

If `docker build` fails:

**Issue: "failed to solve"**
```bash
# Solution: Make sure to build locally first
pnpm run build

# Then try docker build again
docker build -t siebert-services:latest .
```

**Issue: "file not found"**
```bash
# Check if dist folders exist
ls -la artifacts/api-server/dist
ls -la artifacts/siebert-services/dist/public
ls -la artifacts/partner-portal/dist/public

# If missing, run the build
pnpm run build
```

**Issue: Database won't connect**
```bash
# Check DATABASE_URL is set correctly
docker exec siebert-app env | grep DATABASE_URL

# Test connection
docker-compose exec postgres psql -U siebert -d siebert -c "SELECT 1"
```

---

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Set to `production`
- `JWT_SECRET` - Secret key for JWT signing

### Optional
- `PORT` - Server port (default: 8080)
- `LOG_LEVEL` - Logging level (default: info)

### Example `.env.production`
```env
DATABASE_URL=postgresql://prod_user:strong_password@db.example.com:5432/siebert
NODE_ENV=production
JWT_SECRET=your-secret-key-here
PORT=8080
```

---

## Docker Commands Reference

```bash
# Build image
docker build -t siebert-services:latest .

# Run container
docker run -d -p 8080:8080 -e DATABASE_URL="..." siebert-services:latest

# View logs
docker logs siebert-app

# Stop container
docker stop siebert-app

# Remove container
docker rm siebert-app

# With docker-compose
docker-compose up -d      # Start
docker-compose down       # Stop
docker-compose logs -f    # View logs
docker-compose ps         # Status
```

---

## Accessing the Application

Once running:

- **Main website**: http://localhost:8080/
- **Partner portal**: http://localhost:8080/partners/
- **Admin panel**: http://localhost:8080/admin
- **API**: http://localhost:8080/api/
- **Health check**: http://localhost:8080/api/healthz

### Admin Credentials
- Email: `admin@siebertservices.com`
- Password: `SiebertAdmin2024!`

---

## Performance Tips

1. **Use Docker Compose** - Handles networking and volumes automatically
2. **Enable BuildKit** - Faster builds:
   ```bash
   export DOCKER_BUILDKIT=1
   docker build -t siebert-services:latest .
   ```
3. **Use `.dockerignore`** - Reduces build context (already configured)
4. **Add resource limits** - Prevent memory issues:
   ```yaml
   # In docker-compose.yml
   app:
     deploy:
       resources:
         limits:
           memory: 1G
   ```

---

## What Gets Built

### During `pnpm run build`
- TypeScript type checking
- API server bundled to `dist/index.cjs` (1.3MB)
- Siebert website to `dist/public/` (~600KB gzipped)
- Partner portal to `dist/public/` (~800KB gzipped)

### During `docker build`
- Uses pre-built artifacts (no compilation)
- Copies files into container
- Installs runtime dependencies
- Sets up entrypoint script

### Result
- Docker image: ~500-600MB
- Container startup: <5 seconds
- Health check: Every 30 seconds

---

## FAQ

**Q: Why does the image size matter?**  
A: Smaller images = faster deployments, less bandwidth, cheaper storage

**Q: Can I skip the local build step?**  
A: No - the Dockerfile assumes artifacts are pre-built. This is intentional for reliability.

**Q: How do I update the code in production?**  
A: 1. Make code changes locally, 2. Run `pnpm run build`, 3. Rebuild image, 4. Redeploy

**Q: What if I add new dependencies?**  
A: Run `pnpm add`, rebuild locally (`pnpm run build`), then rebuild Docker image

**Q: How do I debug inside the container?**  
A: `docker exec -it siebert-app /bin/sh`

**Q: Can I use a different database?**  
A: Yes - set `DATABASE_URL` to any PostgreSQL server (e.g., managed RDS, Supabase, etc.)

---

## Next Steps

1. Build locally: `pnpm run build`
2. Build image: `docker build -t siebert-services:latest .`
3. Run with Compose: `docker-compose up -d`
4. Test: Open http://localhost:8080
5. Deploy: Push to your Docker registry and deploy to your cloud platform

For cloud deployment guides, see `DOCKER_DEPLOYMENT.md`.
