# Multi-stage build for Siebert Services full-stack application
FROM node:24-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY lib ./lib
COPY artifacts/api-server ./artifacts/api-server
COPY artifacts/siebert-services ./artifacts/siebert-services
COPY artifacts/partner-portal ./artifacts/partner-portal

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build everything (exclude mockup-sandbox which is dev-only)
RUN PORT=8081 BASE_PATH="/" pnpm --filter='!@workspace/mockup-sandbox' run build

# Production runtime image
FROM node:24-alpine

WORKDIR /app

# Install pnpm for runtime (needed for pushing migrations)
RUN npm install -g pnpm

# Install dumb-init and netcat for proper signal handling and db checks
RUN apk add --no-cache dumb-init netcat-openbsd

# Copy entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Copy built artifacts from builder
COPY --from=builder /app/artifacts/api-server/dist ./api-dist
COPY --from=builder /app/artifacts/siebert-services/dist/public ./public/siebert
COPY --from=builder /app/artifacts/partner-portal/dist/public ./public/partners
COPY --from=builder /app/lib/db ./lib/db
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod && \
    pnpm install --filter @workspace/db

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/api/healthz', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose API port
EXPOSE 8080

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run the entrypoint script which handles db setup and starts the server
CMD ["/bin/sh", "/app/docker-entrypoint.sh"]
