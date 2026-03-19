# Simplified Dockerfile - uses pre-built artifacts
# Build locally: pnpm run build
# Then build image: docker build -t siebert-services .

FROM node:24-alpine

WORKDIR /app

# Install pnpm for runtime (needed for pushing migrations)
RUN npm install -g pnpm

# Install dumb-init and netcat for proper signal handling and db checks
RUN apk add --no-cache dumb-init netcat-openbsd

# Copy entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Copy pre-built API server
COPY artifacts/api-server/dist ./api-dist

# Copy pre-built frontend assets
COPY artifacts/siebert-services/dist/public ./public/siebert
COPY artifacts/partner-portal/dist/public ./public/partners

# Copy database configuration (for migrations)
COPY lib/db ./lib/db
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod

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
