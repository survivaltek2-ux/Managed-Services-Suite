# Siebert Services - Docker Setup

## Quick Start (2 Commands)

```bash
# Build and start the application
docker-compose up -d

# Access it
open http://localhost:8080
```

That's it! The container automatically:
- Builds the application
- Sets up the database
- Starts the API server

---

## What Happens

1. **docker-compose up -d** starts two services:
   - **app** - Builds and runs the API + frontend
   - **postgres** - PostgreSQL database

2. **First time only:**
   - Docker builds the entire application
   - Database is initialized automatically
   - Takes ~2-3 minutes

3. **Subsequent runs:**
   - Instant startup (containers already built)

---

## Accessing the Application

Once running (wait ~30 seconds for database setup):

| Service | URL |
|---------|-----|
| Main Website | http://localhost:8080 |
| Partner Portal | http://localhost:8080/partners |
| Admin Panel | http://localhost:8080/admin |
| API | http://localhost:8080/api |
| Health Check | http://localhost:8080/api/healthz |

### Admin Credentials
- **Email**: `admin@siebertservices.com`
- **Password**: `SiebertAdmin2024!`

---

## Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app

# View database logs
docker-compose logs -f postgres

# Execute command in app container
docker-compose exec app /bin/sh

# Stop and remove everything (including database)
docker-compose down -v
```

---

## Updating Code

After making code changes:

```bash
# Rebuild and restart
docker-compose down
docker-compose up -d
```

Or just rebuild the app image:

```bash
docker-compose build --no-cache
docker-compose up -d
```

---

## Production Deployment

### Build Image for Registry

```bash
# Build
docker build -t your-registry/siebert-services:latest .

# Push
docker push your-registry/siebert-services:latest

# Deploy to your cloud platform
# (AWS ECS, Google Cloud Run, DigitalOcean, Kubernetes, etc.)
```

### Environment Variables

Set these when deploying:

```env
DATABASE_URL=postgresql://user:password@db.example.com:5432/siebert
NODE_ENV=production
JWT_SECRET=your-secret-key-here
```

---

## Troubleshooting

### "Connection refused" or app won't start

```bash
# Check logs
docker-compose logs app

# Wait a bit longer - database needs time to initialize
sleep 30

# Try accessing health check
curl http://localhost:8080/api/healthz
```

### Database connection errors

```bash
# Check PostgreSQL is running
docker-compose logs postgres

# Test database connection
docker-compose exec postgres psql -U siebert -d siebert -c "SELECT 1"
```

### Port 8080 already in use

Edit `docker-compose.yml` and change the port:

```yaml
services:
  app:
    ports:
      - "9000:8080"  # Changed from 8080:8080
```

Then access at http://localhost:9000

### Rebuild takes too long

```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1
docker-compose build
```

---

## How It Works

The **Dockerfile** (multi-stage build):

1. **Builder stage** - Builds the entire application from source
2. **Runtime stage** - Copies built artifacts, installs only production dependencies

This means:
- ✅ No need to pre-build locally
- ✅ Self-contained build process
- ✅ Works on any machine with Docker

The **docker-compose.yml** includes:
- API server container
- PostgreSQL database
- Auto-initialization script
- Health checks

---

## Stopping the Services

```bash
# Stop (keeps database data)
docker-compose stop

# Stop and remove containers (keeps database data)
docker-compose down

# Stop and delete EVERYTHING including database
docker-compose down -v
```

---

## For Production

This setup uses **local PostgreSQL in Docker**. For production, use a managed database:

1. Set `DATABASE_URL` to your production database
2. Remove the `postgres` service from `docker-compose.yml`
3. Deploy the app container to your cloud platform

Example production `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    image: your-registry/siebert-services:latest
    environment:
      DATABASE_URL: postgresql://user:pass@prod-db.example.com:5432/siebert
      NODE_ENV: production
      JWT_SECRET: your-secret-key
    ports:
      - "80:8080"
    restart: unless-stopped
```

---

## Next Steps

1. **Start**: `docker-compose up -d`
2. **Wait**: ~30 seconds for database initialization
3. **Access**: http://localhost:8080
4. **Enjoy**: Your containerized Siebert Services!

For detailed deployment guides, see `DOCKER_DEPLOYMENT.md`.
