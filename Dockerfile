FROM node:24-slim

WORKDIR /app

# Install pnpm and system tools (debian-based, glibc-compatible)
RUN npm install -g pnpm && \
    apt-get update && \
    apt-get install -y --no-install-recommends dumb-init netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*

# Copy workspace config (including root tsconfig files referenced by all artifacts)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY tsconfig.base.json tsconfig.json ./
COPY lib ./lib
COPY artifacts/api-server ./artifacts/api-server
COPY artifacts/siebert-services ./artifacts/siebert-services
COPY artifacts/partner-portal ./artifacts/partner-portal
COPY scripts ./scripts
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

# Install all dependencies (glibc, so rollup native binaries work)
RUN pnpm install --frozen-lockfile

# Build all three artifacts
RUN PORT=8081 BASE_PATH="/" pnpm \
    --filter '@workspace/api-server' \
    --filter '@workspace/siebert-services' \
    --filter '@workspace/partner-portal' \
    run build

# Move built artifacts to clean locations
RUN mkdir -p api-dist public/siebert public/partners && \
    cp -r artifacts/api-server/dist/* api-dist/ && \
    cp -r artifacts/siebert-services/dist/public/* public/siebert/ && \
    cp -r artifacts/partner-portal/dist/public/* public/partners/

# Run as non-root for security
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nodejs
USER nodejs

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/api/healthz', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

EXPOSE 8080

ENTRYPOINT ["dumb-init", "--"]
CMD ["/bin/bash", "/app/docker-entrypoint.sh"]
