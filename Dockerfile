FROM node:24-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install build tools
RUN apk add --no-cache dumb-init netcat-openbsd

# Copy everything needed to build
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY lib ./lib
COPY artifacts ./artifacts
COPY scripts ./scripts

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build the applications
RUN PORT=8081 BASE_PATH="/" pnpm --filter '@workspace/api-server' --filter '@workspace/siebert-services' --filter '@workspace/partner-portal' run build

# Copy entrypoint
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Create dist output directories if they don't exist
RUN mkdir -p /app/api-dist /app/public/siebert /app/public/partners

# Move built artifacts to final locations
RUN test -d artifacts/api-server/dist && cp -r artifacts/api-server/dist/* api-dist/ || echo "API dist not found"
RUN test -d artifacts/siebert-services/dist/public && cp -r artifacts/siebert-services/dist/public/* public/siebert/ || echo "Siebert dist not found"
RUN test -d artifacts/partner-portal/dist/public && cp -r artifacts/partner-portal/dist/public/* public/partners/ || echo "Partner dist not found"

# Remove source files to save space
RUN rm -rf artifacts scripts pnpm-lock.yaml lib/*/src lib/*/dist

# Install only production dependencies
RUN npm prune --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/api/healthz', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 8080

ENTRYPOINT ["dumb-init", "--"]
CMD ["/bin/sh", "/app/docker-entrypoint.sh"]
