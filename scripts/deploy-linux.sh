#!/usr/bin/env sh

set -eu

APP_DIR=${APP_DIR:-$(pwd)}
APP_USER=${APP_USER:-$(id -un)}
APP_GROUP=${APP_GROUP:-$(id -gn)}
SERVICE_NAME=${SERVICE_NAME:-siebert-services}
NODE_ENV=${NODE_ENV:-production}
PORT=${PORT:-8080}
DOMAIN=${DOMAIN:-_}
ENABLE_CERTBOT=${ENABLE_CERTBOT:-false}
RUN_SETUP_ADMIN=${RUN_SETUP_ADMIN:-true}

if [ "$(uname -s)" != "Linux" ]; then
  echo "This script is intended for Linux servers."
  exit 1
fi

if [ ! -f "${APP_DIR}/package.json" ]; then
  echo "Run this script from the project root, or set APP_DIR to the repo path."
  exit 1
fi

if [ "$(id -u)" -eq 0 ]; then
  SUDO=""
elif command -v sudo >/dev/null 2>&1; then
  SUDO="sudo"
else
  echo "sudo is required when not running as root."
  exit 1
fi

run_root() {
  if [ -n "$SUDO" ]; then
    "$SUDO" sh -c "$1"
  else
    sh -c "$1"
  fi
}

if ! command -v apt-get >/dev/null 2>&1; then
  echo "This deployment script currently supports Debian/Ubuntu-style systems with apt-get."
  exit 1
fi

echo "Installing system packages..."
run_root "apt-get update"
run_root "apt-get install -y curl ca-certificates gnupg nginx postgresql postgresql-contrib"

NODE_MAJOR=0
if command -v node >/dev/null 2>&1; then
  NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
fi

if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "Installing Node.js 22..."
  run_root "curl -fsSL https://deb.nodesource.com/setup_22.x | bash -"
  run_root "apt-get install -y nodejs"
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "Installing pnpm..."
  run_root "npm install -g pnpm"
fi

cd "$APP_DIR"

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp ".env.example" ".env"
  echo "Created .env from .env.example."
  echo "Update .env before exposing the app publicly."
fi

if [ ! -f ".env" ]; then
  echo ".env is required. Copy .env.example to .env and set real production values."
  exit 1
fi

set -a
# shellcheck disable=SC1091
. "./.env"
set +a

echo "Installing app dependencies..."
pnpm install --frozen-lockfile

echo "Building production bundles..."
pnpm run build:deploy

echo "Applying database schema..."
pnpm run db:push

if [ "$RUN_SETUP_ADMIN" = "true" ]; then
  echo "Ensuring admin user exists..."
  pnpm run setup:admin
fi

SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
NGINX_FILE="/etc/nginx/sites-available/${SERVICE_NAME}"
CURRENT_DIR=$(pwd)
NODE_BIN=$(command -v node)

cat > "${SERVICE_NAME}.service" <<EOF
[Unit]
Description=Siebert Services
After=network.target postgresql.service

[Service]
Type=simple
User=${APP_USER}
Group=${APP_GROUP}
WorkingDirectory=${CURRENT_DIR}
Environment=NODE_ENV=${NODE_ENV}
Environment=PORT=${PORT}
ExecStart=${NODE_BIN} --env-file=${CURRENT_DIR}/.env ${CURRENT_DIR}/artifacts/api-server/dist/index.cjs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

cat > "${SERVICE_NAME}.nginx" <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

echo "Installing systemd service and Nginx config..."
run_root "cp '${SERVICE_NAME}.service' '${SERVICE_FILE}'"
run_root "cp '${SERVICE_NAME}.nginx' '${NGINX_FILE}'"
run_root "ln -sfn '${NGINX_FILE}' '/etc/nginx/sites-enabled/${SERVICE_NAME}'"
run_root "rm -f /etc/nginx/sites-enabled/default"
run_root "systemctl daemon-reload"
run_root "nginx -t"
run_root "systemctl enable --now '${SERVICE_NAME}'"
run_root "systemctl enable --now nginx"
run_root "systemctl reload nginx"

if [ "$ENABLE_CERTBOT" = "true" ] && [ "$DOMAIN" != "_" ]; then
  echo "Installing HTTPS certificate..."
  run_root "apt-get install -y certbot python3-certbot-nginx"
  run_root "certbot --nginx --non-interactive --agree-tos --register-unsafely-without-email -d ${DOMAIN}"
fi

echo "Deployment complete."
echo "Health check: http://127.0.0.1:${PORT}/api/healthz"
echo "Service status: ${SUDO:+sudo }systemctl status ${SERVICE_NAME}"
echo "Logs: ${SUDO:+sudo }journalctl -u ${SERVICE_NAME} -f"
