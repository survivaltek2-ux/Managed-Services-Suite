# Docker Quick Start Guide

## Local Development with Docker Compose

The easiest way to run everything locally with PostgreSQL included.

### Prerequisites
- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- docker-compose (usually included with Docker Desktop)

### Start the Stack

```bash
# Clone the repository (or ensure you're in the project directory)
cd siebert-services

# Start the app and database
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app

# Access the app
# Open http://localhost:8080 in your browser
```

The application will:
- Create and initialize the PostgreSQL database automatically
- Apply all migrations
- Start the API server
- Serve the frontend

### Stop Everything

```bash
docker-compose down

# Also remove volumes (deletes database data)
docker-compose down -v
```

---

## Production Deployment

### Option 1: Using Docker Compose (Recommended for Small Deployments)

1. **Copy environment file**
```bash
cp .env.example .env.production
```

2. **Update `.env.production` with production values**
```env
DATABASE_URL=postgresql://prod_user:STRONG_PASSWORD@prod-db.example.com:5432/siebert
NODE_ENV=production
JWT_SECRET=YOUR_SUPER_SECRET_KEY_2024
```

3. **Deploy to your server**
```bash
# On your server
docker-compose -f docker-compose.yml up -d \
  --env-file .env.production
```

### Option 2: Manual Docker Commands

For more control or custom infrastructure:

```bash
# Build the image
docker build -t siebert-services:latest .

# Run the container
docker run -d \
  --name siebert \
  --restart unless-stopped \
  -e DATABASE_URL="postgresql://user:pass@db-host:5432/siebert" \
  -e NODE_ENV="production" \
  -e JWT_SECRET="your-secret" \
  -p 8080:8080 \
  siebert-services:latest

# View logs
docker logs -f siebert

# Stop and remove
docker stop siebert && docker rm siebert
```

### Option 3: Push to Container Registry

Deploy to AWS, Google Cloud, DigitalOcean, etc:

```bash
# Tag for your registry (example: Docker Hub)
docker tag siebert-services:latest your-username/siebert-services:latest

# Push
docker push your-username/siebert-services:latest

# Then deploy from your cloud platform
# (See DOCKER_DEPLOYMENT.md for cloud-specific instructions)
```

---

## What's Running?

### Services in `docker-compose.yml`

| Service | Port | Purpose |
|---------|------|---------|
| `app` | 8080 | Main API & frontend |
| `postgres` | 5432 | PostgreSQL database |

### Application Structure

```
:8080
├── / → Siebert Services main site
├── /partners/ → Partner portal
├── /api/ → REST API endpoints
├── /admin → CMS admin panel
└── /api/healthz → Health check
```

---

## Useful Docker Commands

```bash
# See all containers
docker ps -a

# View logs with timestamps
docker logs --timestamps siebert

# Follow logs in real-time
docker logs -f siebert

# Execute command in container
docker exec siebert npm run db:push

# Get container details
docker inspect siebert

# Stop container gracefully (30 second timeout)
docker stop siebert

# Kill container immediately
docker kill siebert

# Remove container
docker rm siebert

# View resource usage
docker stats
```

---

## Docker Compose Commands

```bash
# Start services in background
docker-compose up -d

# Stop services
docker-compose stop

# Stop and remove containers, networks
docker-compose down

# Remove volumes too (WARNING: deletes database!)
docker-compose down -v

# View logs
docker-compose logs
docker-compose logs -f app          # Follow app logs
docker-compose logs -f postgres     # Follow database logs

# List services and status
docker-compose ps

# Execute command in running service
docker-compose exec app npm run db:push

# Restart services
docker-compose restart
docker-compose restart app  # Just app

# Rebuild images
docker-compose build
docker-compose build --no-cache  # Ignore cache
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Common issues:
# 1. Port 8080 already in use
#    → Change port in docker-compose.yml: 8080:8080 → 9000:8080

# 2. Database connection failed
#    → Wait 30 seconds, Docker will retry
#    → Check DATABASE_URL in .env

# 3. Out of disk space
#    → Run: docker system prune -a
```

### Database Locked

```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Start fresh
docker-compose up -d
```

### Want to Inspect the Database

```bash
# Connect to PostgreSQL in the container
docker-compose exec postgres psql -U siebert -d siebert

# Common SQL commands
\dt                    # List tables
\d+ table_name        # Describe table
SELECT * FROM users;  # Query data
\q                    # Quit
```

### High Memory Usage

```bash
# Check memory
docker stats

# Limit memory in docker-compose.yml
# services:
#   app:
#     ...
#     deploy:
#       resources:
#         limits:
#           memory: 1G
```

---

## Next Steps

1. **Access the applications**
   - Main site: http://localhost:8080
   - Partner portal: http://localhost:8080/partners
   - Admin: http://localhost:8080/admin (user: admin@siebertrservices.com / pass: SiebertAdmin2024!)

2. **View deployment guide**
   - See `DOCKER_DEPLOYMENT.md` for cloud deployment options

3. **Configure for production**
   - Update `.env.production` with real values
   - Set up SSL/HTTPS with reverse proxy (nginx, CloudFlare, etc.)
   - Enable automated backups for PostgreSQL
   - Set up monitoring and alerts

4. **Monitor your application**
   - Check health: `curl http://localhost:8080/api/healthz`
   - View logs: `docker-compose logs -f app`
   - Monitor resources: `docker stats`

---

## Getting Help

If you encounter issues:

1. **Check logs first**: `docker-compose logs app`
2. **Review DOCKER_DEPLOYMENT.md** for detailed information
3. **Verify environment variables** are correct
4. **Test database connection**: `docker-compose exec postgres psql -U siebert -d siebert`
5. **Reset everything**: `docker-compose down -v && docker-compose up -d`

---

## Useful Endpoints

Once running, try these URLs:

```
# Health check
http://localhost:8080/api/healthz

# Frontend
http://localhost:8080/
http://localhost:8080/partners/

# Admin Panel
http://localhost:8080/admin

# API (examples - requires auth token)
GET    /api/cms/services
POST   /api/auth/login
GET    /api/partner/deals
```

Enjoy your containerized application! 🚀
