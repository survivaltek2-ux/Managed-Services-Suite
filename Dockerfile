# Multi-stage: uses pre-built artifacts OR builds from source as fallback

# Builder stage - only used if artifacts need to be built
FROM node:24-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY lib ./lib
COPY artifacts/api-server ./artifacts/api-server
COPY artifacts/siebert-services ./artifacts/siebert-services
COPY artifacts/partner-portal ./artifacts/partner-portal

RUN pnpm install

# Build only needed artifacts
RUN PORT=8081 BASE_PATH="/" pnpm --filter '@workspace/api-server' --filter '@workspace/siebert-services' --filter '@workspace/partner-portal' run build || true

# Production runtime
FROM node:24-alpine

WORKDIR /app

RUN npm install -g pnpm && \
    apk add --no-cache dumb-init netcat-openbsd

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Copy from builder stage (will have built artifacts)
COPY --from=builder /app/artifacts/api-server/dist ./api-dist
COPY --from=builder /app/artifacts/siebert-services/dist/public ./public/siebert
COPY --from=builder /app/artifacts/partner-portal/dist/public ./public/partners
COPY --from=builder /app/lib/db ./lib/db

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

USER nodejs

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/api/healthz', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 8080

ENTRYPOINT ["dumb-init", "--"]

CMD ["/bin/sh", "/app/docker-entrypoint.sh"]
