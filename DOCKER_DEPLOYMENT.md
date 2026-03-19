# Docker Deployment Guide - Siebert Services

This guide explains how to build and deploy the Siebert Services application using Docker.

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- A PostgreSQL database (or use the included postgres service)
- Environment variables configured

### Build the Image

```bash
docker build -t siebert-services:latest .
```

### Run with Docker Compose (Easiest)

The included `docker-compose.yml` includes both the app and a PostgreSQL database:

```bash
# Start the application and database
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop everything
docker-compose down
```

The app will be available at `http://localhost:8080`

### Manual Docker Run

If you have an existing PostgreSQL database:

```bash
docker run -d \
  --name siebert-app \
  -e DATABASE_URL="postgresql://user:password@your-db-host:5432/siebert" \
  -e NODE_ENV="production" \
  -e JWT_SECRET="your-secret-key-here" \
  -p 8080:8080 \
  siebert-services:latest
```

## Environment Variables

Required environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `NODE_ENV` | Set to `production` for deployment | `production` |
| `JWT_SECRET` | Secret for JWT token signing | `siebert-services-secret-key-2024` |
| `PORT` | Port the API listens on | `8080` |

Example PostgreSQL URL:
```
postgresql://username:password@hostname:5432/database_name
```

## Database Setup

The Docker image automatically includes the database schema. On first run, migrations are applied via Drizzle ORM.

If you need to manually set up the database:

```bash
# Inside the container
npm run db:push
```

## Docker Image Details

### Multi-Stage Build
The Dockerfile uses a multi-stage build:
1. **Builder stage**: Installs dependencies and builds the project
2. **Runtime stage**: Contains only the built artifacts and production dependencies

This keeps the final image small (~500MB).

### Included in Image
- Node.js 24 Alpine runtime
- API server compiled and bundled
- Frontend assets for both Siebert Services and Partner Portal
- Health check endpoint

### What NOT Included
- Source code (security)
- Development dependencies (smaller image size)
- Build tools (not needed at runtime)

## Deployment Platforms

### AWS ECS

1. Create an ECS cluster
2. Push the image to ECR:
   ```bash
   # Tag and push
   docker tag siebert-services:latest YOUR_AWS_ACCOUNT.dkr.ecr.YOUR_REGION.amazonaws.com/siebert-services:latest
   docker push YOUR_AWS_ACCOUNT.dkr.ecr.YOUR_REGION.amazonaws.com/siebert-services:latest
   ```
3. Create ECS task definition with:
   - Image: Your ECR image URI
   - Port: 8080
   - Environment variables as described above
4. Create ECS service and load balancer

### Google Cloud Run

```bash
# Build and push to Google Container Registry
docker tag siebert-services:latest gcr.io/YOUR_PROJECT/siebert-services:latest
docker push gcr.io/YOUR_PROJECT/siebert-services:latest

# Deploy
gcloud run deploy siebert-services \
  --image gcr.io/YOUR_PROJECT/siebert-services:latest \
  --region us-central1 \
  --set-env-vars DATABASE_URL="postgresql://...",JWT_SECRET="..." \
  --port 8080
```

### DigitalOcean App Platform

1. Push image to DigitalOcean Container Registry
2. Create new app from container
3. Set environment variables
4. Connect to managed database or use external PostgreSQL

### Heroku (Using container registry)

```bash
heroku login
heroku container:login
heroku container:push web --app your-app-name
heroku container:release web --app your-app-name
```

### Docker Swarm (Self-hosted)

```bash
docker swarm init
docker stack deploy -c docker-compose.yml siebert
docker stack ps siebert
```

### Kubernetes (Self-hosted or managed)

1. Build and push image to your registry
2. Create deployment YAML:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: siebert-services
spec:
  replicas: 3
  selector:
    matchLabels:
      app: siebert-services
  template:
    metadata:
      labels:
        app: siebert-services
    spec:
      containers:
      - name: app
        image: your-registry/siebert-services:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: siebert-secrets
              key: database-url
        - name: NODE_ENV
          value: production
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: siebert-secrets
              key: jwt-secret
        livenessProbe:
          httpGet:
            path: /api/healthz
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/healthz
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: siebert-services
spec:
  selector:
    app: siebert-services
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

3. Deploy:
```bash
kubectl create secret generic siebert-secrets \
  --from-literal=database-url="postgresql://..." \
  --from-literal=jwt-secret="..."

kubectl apply -f deployment.yaml
```

## Health Checks

The container includes a health check at:
```
GET http://localhost:8080/api/healthz
```

Docker will automatically restart the container if this endpoint fails.

## Monitoring and Logs

### View container logs
```bash
docker logs siebert-app  # single container
docker-compose logs -f app  # with compose
docker service logs siebert_app  # with swarm
kubectl logs -f deployment/siebert-services  # with k8s
```

### Health check status
```bash
docker ps  # Shows health status
```

## Production Best Practices

1. **Use secrets management**: Never commit `.env` files with production secrets
   - Use platform secrets (AWS Secrets Manager, Google Secret Manager, etc.)
   - Or use `.env` files only in development

2. **Enable HTTPS**: Use a reverse proxy (nginx, CloudFlare) or platform TLS termination

3. **Database backups**: 
   - Enable automated backups on your PostgreSQL service
   - Test restoration procedures regularly

4. **Resource limits**: Set CPU/memory limits to prevent runaway processes
   - Docker: `--memory 1g --cpus 2`
   - Kubernetes: Set requests and limits

5. **Zero-downtime deployments**: 
   - Use load balancers with multiple replicas
   - Implement graceful shutdown in Node.js (already included)

6. **Monitoring**: Set up monitoring/alerting for:
   - Container restarts
   - CPU/memory usage
   - HTTP error rates
   - Database connection pool

## Troubleshooting

### Container won't start
```bash
docker logs siebert-app
# Common causes:
# - DATABASE_URL not set or invalid
# - Port 8080 already in use
# - Missing required environment variables
```

### Database connection fails
```bash
# Test connection from container
docker exec siebert-app npm run db:push
# Or test directly
psql $DATABASE_URL -c "SELECT 1"
```

### Out of memory
```bash
# Increase memory limit
docker run --memory 2g ...
# Or check if there are memory leaks in logs
```

### Permission errors
The image runs as non-root user `nodejs` (UID 1001) for security.
If mounting volumes, ensure proper permissions:
```bash
chown -R 1001:1001 /path/to/volume
```

## Building for Different Architectures

```bash
# Build for ARM64 (Apple Silicon, Raspberry Pi, AWS Graviton)
docker buildx build --platform linux/arm64 -t siebert-services:latest .

# Build for multiple architectures
docker buildx build --platform linux/amd64,linux/arm64 -t siebert-services:latest .
```

## Updating the Image

When you make code changes:

```bash
# Rebuild the image
docker build -t siebert-services:latest .

# Stop old container
docker-compose down  # if using compose
docker stop siebert-app  # if using manual docker run

# Start new container
docker-compose up -d  # if using compose
docker run ... siebert-services:latest  # if using manual run
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
