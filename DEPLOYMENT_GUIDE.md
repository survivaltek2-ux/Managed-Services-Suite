# Deployment Guide for Siebert Services

This guide walks you through deploying the entire Siebert Services platform to a production server.

## What's Included

The deployment package contains:
- **API Server** — Express.js backend (port 8080)
- **Siebert Services Site** — Marketing/company website (served from `/`)
- **Partner Portal** — Reseller management dashboard (served from `/partners`)
- **PostgreSQL Database** — All data storage
- **Admin Panel** — Admin management interface (served from `/admin`)

All components are containerized with Docker for easy deployment.

---

## Prerequisites

**On your target server**, you need:
- Docker & Docker Compose installed
- Ubuntu 20.04+ (or other Linux distro with Docker support)
- At least 2GB RAM, 10GB disk space
- Ports 80, 443, 5433 available (HTTP, HTTPS, optional Postgres external access)
- Domain name (for SSL/HTTPS)

**Install Docker:**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

## Step 1: Copy Files to Server

Copy the entire project directory to your server:

```bash
scp -r /path/to/Managed-Services-Suite user@your-server:/opt/siebert-services
```

Or clone if using Git:
```bash
ssh user@your-server
cd /opt
git clone https://github.com/your-repo/managed-services-suite.git siebert-services
cd siebert-services
```

---

## Step 2: Configure Environment Variables

Copy the example `.env` file and customize it:

```bash
cp .env.example .env
nano .env  # Edit with your values
```

**Required variables:**

```bash
# Database (change password!)
DATABASE_URL=postgresql://siebert:YOUR_SECURE_PASSWORD@postgres:5432/siebert

# Security (generate a new secret!)
JWT_SECRET=$(openssl rand -hex 32)

# Production flag
NODE_ENV=production

# Port (keep as 8080, nginx will handle port 80/443)
PORT=8080
```

**Optional (for email features):**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@siebertrservices.com
```

---

## Step 3: Adjust Docker Configuration

**Edit `docker-compose.yml`** for production:

```yaml
services:
  postgres:
    # ... existing config ...
    ports:
      - "5433:5432"  # Keep internal only if external DB access not needed
    environment:
      POSTGRES_PASSWORD: YOUR_SECURE_PASSWORD  # Match .env

  app:
    # ... existing config ...
    environment:
      DATABASE_URL: postgresql://siebert:YOUR_SECURE_PASSWORD@postgres:5432/siebert
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}
    restart: unless-stopped  # Auto-restart on failure
    # Add SSL/reverse proxy config (see Step 4)
```

---

## Step 4: Set Up Reverse Proxy (Nginx) for HTTPS

Install nginx:
```bash
sudo apt-get update && sudo apt-get install -y nginx certbot python3-certbot-nginx
```

**Create nginx config** at `/etc/nginx/sites-available/siebert`:

```nginx
upstream siebert_app {
    server localhost:8080;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Proxy requests to Docker container
    location / {
        proxy_pass http://siebert_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/siebert /etc/nginx/sites-enabled/
sudo nginx -t  # Test config
sudo systemctl restart nginx
```

**Get SSL certificate:**
```bash
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com
```

Certbot will auto-renew certificates (runs daily).

---

## Step 5: Start the Application

```bash
cd /opt/siebert-services

# Start containers
docker compose up -d

# Verify services are running
docker compose ps
docker compose logs -f app  # Watch startup logs
```

Expected output:
```
app-1      | 🚀 Siebert Services - Starting up...
app-1      | 📦 Waiting for database...
app-1      | ✅ Database is ready!
app-1      | 🗄️  Setting up database schema...
app-1      | ✨ Starting API server...
app-1      | Server listening on port 8080
```

---

## Step 6: Verify Everything Works

Test the app:
```bash
curl https://your-domain.com/api/healthz  # Should return 200 OK
```

Access in browser:
- **Main site**: https://your-domain.com
- **Partner portal**: https://your-domain.com/partners
- **Admin panel**: https://your-domain.com/admin

**Admin credentials** (change these immediately after first login!):
- Email: `admin@siebertrservices.com`
- Password: `SiebertAdmin2024!`

---

## Step 7: Backup Strategy

**Backup the database regularly:**

```bash
# Manual backup
docker compose exec postgres pg_dump -U siebert siebert > backup_$(date +%Y%m%d).sql

# Automated daily backups (add to crontab)
0 2 * * * cd /opt/siebert-services && docker compose exec -T postgres pg_dump -U siebert siebert > /backups/siebert_$(date +\%Y\%m\%d).sql
```

**Backup volumes:**
```bash
docker compose exec postgres pg_dump -U siebert siebert | gzip > /backups/siebert_$(date +%Y%m%d).sql.gz
```

---

## Step 8: Post-Deployment

### Change Admin Password
1. Log in at https://your-domain.com/admin
2. Navigate to Settings → Change Password
3. Update `admin@siebertrservices.com` password

### Configure Email (Optional)
If you have SMTP configured in `.env`, test it:
1. Go to Partner Resources or Announcements
2. Create an entry and check that emails are sent

### Monitor Health
```bash
# Check app status
docker compose ps

# View logs
docker compose logs -f app

# Check disk usage
df -h

# Monitor container stats
docker stats
```

---

## Troubleshooting

**Database won't connect:**
```bash
docker compose logs postgres
docker compose exec postgres psql -U siebert -d siebert -c "SELECT 1;"
```

**Port 8080 in use:**
```bash
lsof -i :8080
docker compose restart
```

**SSL certificate renewal failed:**
```bash
sudo certbot renew --dry-run
sudo systemctl restart nginx
```

**Container keeps restarting:**
```bash
docker compose logs app  # Check the error
docker compose up --build  # Rebuild image
```

---

## Maintenance

**Update the app** (after code changes):
```bash
cd /opt/siebert-services
git pull  # or manually update files
docker compose down
docker compose build --no-cache
docker compose up -d
```

**Monitor logs regularly:**
```bash
docker compose logs --tail 100 app
```

**Keep backups safe:**
- Copy backups to a different server/cloud storage
- Test restore procedures monthly
- Keep 30+ days of backups

---

## Summary

You now have:
- ✅ Full Siebert Services platform running in Docker
- ✅ PostgreSQL database with persistent storage
- ✅ HTTPS/SSL with automatic renewal
- ✅ Admin panel for management
- ✅ Partner portal for resellers
- ✅ Marketing website

The entire stack runs on a single server. For high-availability deployments, see the advanced guide.

**Questions?** Check the Docker logs: `docker compose logs -f`
