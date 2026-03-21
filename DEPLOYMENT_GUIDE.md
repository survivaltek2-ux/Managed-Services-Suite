# Deployment Guide for Siebert Services

This project can be deployed directly on a Linux server without Docker. The production setup is:

- PostgreSQL running on the host or a managed provider
- Node.js running the bundled API with `systemd`
- The API serving the built frontend assets for `/`, `/admin`, `/portal`, and `/partners`
- Nginx in front for HTTPS and reverse proxying

## Fast Path

On Ubuntu or Debian, the easiest path is:

```bash
git clone https://github.com/your-org/managed-services-suite.git /opt/siebert-services
cd /opt/siebert-services
cp .env.example .env
nano .env
DOMAIN=your-domain.com sh ./scripts/deploy-linux.sh
```

That script will:

- install Node.js, pnpm, Nginx, and PostgreSQL if needed
- install workspace dependencies
- build the frontend and API bundles
- run `db:push`
- create or update the admin user
- install and start a `systemd` service
- install and enable an Nginx site that proxies to the Node app

Optional:

```bash
DOMAIN=your-domain.com ENABLE_CERTBOT=true sh ./scripts/deploy-linux.sh
```

That also attempts to issue an HTTPS certificate with Certbot.

## Prerequisites

The script currently assumes:

- Ubuntu or Debian with `apt-get`
- the repo has already been cloned onto the server
- `.env` has been filled with production values
- DNS for `DOMAIN` points at the server if using HTTPS

## Step 1: Copy the Project

```bash
sudo mkdir -p /opt/siebert-services
sudo chown "$USER":"$USER" /opt/siebert-services
git clone https://github.com/your-org/managed-services-suite.git /opt/siebert-services
cd /opt/siebert-services
```

## Step 2: Configure the Environment

```bash
cp .env.example .env
nano .env
```

Set at least:

```env
DATABASE_URL=postgresql://siebert:YOUR_PASSWORD@localhost:5432/siebert_services
JWT_SECRET=replace-with-a-long-random-secret
NODE_ENV=production
PORT=8080
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
```

Optional but recommended:

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-user
SMTP_PASS=your-password
SMTP_FROM_EMAIL=notifications@siebertrservices.com
SMTP_FROM_NAME=Siebert Services
NOTIFICATION_EMAIL=sales@siebertrservices.com
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TENANT_ID=common
MICROSOFT_REDIRECT_URI=https://your-domain.com/api/auth/sso/microsoft/callback
```

## Step 3: Create the Database

If Postgres is local:

```bash
sudo -u postgres psql
```

Then:

```sql
CREATE USER siebert WITH PASSWORD 'YOUR_PASSWORD';
CREATE DATABASE siebert_services OWNER siebert;
\q
```

## Step 4: Install, Build, and Prepare the Service

```bash
pnpm install --frozen-lockfile
pnpm run build:deploy
pnpm run db:push
pnpm run setup:admin
```

The production entry point is:

```bash
node --env-file=.env ./artifacts/api-server/dist/index.cjs
```

You can test it directly:

```bash
pnpm start
curl http://127.0.0.1:8080/api/healthz
```

## Step 5: Install the Systemd Service and Nginx

Automatic:

```bash
DOMAIN=your-domain.com sh ./scripts/deploy-linux.sh
```

Manual:

```bash
pnpm run deploy:bootstrap
sudo cp siebert-services.service /etc/systemd/system/siebert-services.service
sudo cp siebert-services.nginx /etc/nginx/sites-available/siebert-services
sudo ln -sfn /etc/nginx/sites-available/siebert-services /etc/nginx/sites-enabled/siebert-services
sudo systemctl daemon-reload
sudo nginx -t
sudo systemctl enable --now siebert-services
sudo systemctl reload nginx
```

Useful commands:

```bash
sudo journalctl -u siebert-services -f
sudo systemctl restart siebert-services
sudo systemctl stop siebert-services
```

## Step 6: Example Nginx Config

The deployment script writes a file equivalent to:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/siebert-services /etc/nginx/sites-enabled/siebert-services
sudo nginx -t
sudo systemctl reload nginx
```

Then add HTTPS with Certbot if desired:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Updating the App

```bash
cd /opt/siebert-services
git pull
pnpm install --frozen-lockfile
pnpm run build:deploy
pnpm run db:push
sudo systemctl restart siebert-services
```

## Verification

Check these URLs after deployment:

- `https://your-domain.com/`
- `https://your-domain.com/admin`
- `https://your-domain.com/portal`
- `https://your-domain.com/partners`
- `https://your-domain.com/api/healthz`

## Notes

- The main site bundle serves `/`, `/admin`, and `/portal`.
- The partner portal bundle serves `/partners`.
- The API and frontend are same-origin in production, so no separate frontend host is required.
