# Deployment Guide - Dashboard Analytics

Complete deployment instructions for different environments.

## Table of Contents
- [Production Checklist](#production-checklist)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployments](#cloud-deployments)
- [Performance Tuning](#performance-tuning)
- [Monitoring and Logging](#monitoring-and-logging)

## Production Checklist

Before deploying to production, ensure:

- [ ] Environment variables securely configured
- [ ] API keys stored in secrets management (not in code)
- [ ] HTTPS enabled for all endpoints
- [ ] CORS properly restricted to known domains
- [ ] Rate limiting configured
- [ ] Error logging enabled
- [ ] Database backups configured
- [ ] Security headers set
- [ ] Input validation enabled
- [ ] SQL injection prevention in place

## Docker Deployment

### Build Images

```bash
# Build backend image
docker build -t dashboard-backend:latest ./backend

# Build frontend image  
docker build -t dashboard-frontend:latest ./frontend
```

### Run with Docker Compose

```bash
# Create .env file with your API key
echo "GOOGLE_API_KEY=your_key_here" > .env.production

# Run services
docker-compose -f docker-compose.yml up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Docker Hub Deployment

```bash
# Tag images
docker tag dashboard-backend:latest yourusername/dashboard-backend:latest
docker tag dashboard-frontend:latest yourusername/dashboard-frontend:latest

# Push to Docker Hub
docker push yourusername/dashboard-backend:latest
docker push yourusername/dashboard-frontend:latest

# Pull and run on server
docker pull yourusername/dashboard-backend:latest
docker pull yourusername/dashboard-frontend:latest
docker-compose up -d
```

## Cloud Deployments

### Vercel (Frontend)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable: `VITE_API_BASE=https://your-api-domain.com`
4. Deploy

```bash
# Or deploy via CLI
npm install -g vercel
vercel login
vercel
```

### Railway (Backend)

1. Connect GitHub repository
2. Create backend service
3. Set environment: `GOOGLE_API_KEY=your_key`
4. Deploy

### Heroku (Backend)

```bash
# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set GOOGLE_API_KEY=your_key_here

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### AWS (Full Stack)

#### Backend (EC2 + RDS)

1. Launch EC2 instance
2. Install Python, dependencies
3. Set up RDS PostgreSQL database
4. Deploy with Gunicorn + Nginx

```bash
# On EC2 instance
git clone your-repo
cd backend
pip -r requirements.txt
gunicorn main:app -w 4 -b 0.0.0.0:8000
```

5. Set up Nginx reverse proxy
6. Configure security groups

#### Frontend (CloudFront + S3)

```bash
# Build frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket/

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### DigitalOcean (App Platform)

1. Connect GitHub
2. Create App
3. Add backend service with `uvicorn` command
4. Add frontend service with `npm run build`
5. Set environment variables
6. Deploy

## Performance Tuning

### Backend Optimization

```python
# In main.py - Add caching
from fastapi_cache2 import FastAPICache2
from fastapi_cache2.backends.redis import RedisBackend

# Enable gzip compression
from fastapi.middleware.gzip import GZIPMiddleware
app.add_middleware(GZIPMiddleware, minimum_size=1000)

# Use connection pooling for database
from sqlalchemy.pool import QueuePool
```

### Frontend Optimization

```javascript
// Split code chunks
import { lazy, Suspense } from 'react'
const Dashboard = lazy(() => import('./components/Dashboard'))

// Lazy load images
const img = new Image()
img.loading = 'lazy'

// Service Worker for caching
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```

### Database Optimization

```sql
-- Create indexes for common queries
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_region ON sales(region);
CREATE INDEX idx_sales_category ON sales(product_category);

-- Analyze query performance
EXPLAIN QUERY PLAN SELECT ... FROM sales ...
```

## Monitoring and Logging

### Backend Logging

```python
import logging
from pythonjsonlogger import jsonlogger

# Configure JSON logging
logHandler = logging.FileHandler('logs/app.log')
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)

# Level: DEBUG, INFO, WARNING, ERROR, CRITICAL
```

### Frontend Error Tracking

```javascript
// Use error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, info) {
    logErrorToService(error, info)
  }
}

// Track events
fetch('/api/analytics', {
  method: 'POST',
  body: JSON.stringify({ event: 'query_executed' })
})
```

### Monitoring Tools

- **Backend**: DataDog, New Relic, Sentry
- **Frontend**: Sentry, LogRocket, Rollbar
- **Infrastructure**: Prometheus, Grafana
- **Database**: pgAdmin (PostgreSQL), phpmyadmin (MySQL)

### Health Checks

```bash
# Kubernetes liveness probe
curl http://localhost:8000/health

# Readiness probe
curl http://localhost:8000/schema
```

## Scaling

### Horizontal Scaling

```yaml
# Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dashboard-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: backend
        image: dashboard-backend:latest
        ports:
        - containerPort: 8000
        resources:
          limits:
            memory: "512Mi"
          requests:
            memory: "256Mi"
```

### Load Balancing

- **NGINX**: Reverse proxy + load balancer
- **HAProxy**: High performance load balancer
- **Cloud LB**: AWS ALB, GCP Load Balancer, Azure LB

### Database Scaling

- **Read Replicas**: For read-heavy workloads
- **Sharding**: Partition data by region/category
- **Caching**: Redis for frequent queries

## Security

### Environment Variables

```bash
# Use secure secret management
# AWS Secrets Manager
# GCP Secret Manager
# Azure Key Vault
# Hashicorp Vault

# Never commit .env files
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore
```

### HTTPS/TLS

```bash
# Generate certificate (Let's Encrypt)
certbot certonly --standalone -d yourdomain.com

# Configure Nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

### Security Headers

```python
# In FastAPI
from fastapi.middleware.trustedhost import TrustedHostMiddleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["yourdomain.com"])

# Add security headers
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response
```

### Input Validation

```python
# Validate all inputs
from pydantic import BaseModel, validator

class QueryRequest(BaseModel):
    query: str
    
    @validator('query')
    def query_length(cls, v):
        if len(v) > 1000:
            raise ValueError('Query too long')
        return v
```

## Backup & Recovery

### Database Backups

```bash
# SQLite
cp dashboard.db backup_$(date +%Y%m%d).db

# PostgreSQL
pg_dump database_name > backup.sql

# Restore
psql database_name < backup.sql
```

### Automated Backups

```bash
# Cron job (daily at 2 AM)
0 2 * * * /home/user/backup.sh
```

## Troubleshooting

### High Memory Usage
```bash
# Check running processes
docker stats

# Restart container
docker restart container_name
```

### Slow Queries
```sql
-- Find slow queries
SELECT * FROM slow_queries;

-- Add indexes (see Performance Tuning)
```

### CORS Errors
```python
# In backend config
CORS_ORIGINS = ["https://yourdomain.com", "https://api.yourdomain.com"]
```

### API Down
```bash
# Check service health
curl http://localhost:8000/health

# View logs
docker logs container_name
journalctl -u service_name -n 100
```

## Rollback Procedure

```bash
# If deployment fails

# 1. Identify last good version
git log --oneline | head -10

# 2. Rollback
git revert <commit-hash>

# 3. Redeploy
docker-compose down
docker-compose up -d

# Or
heroku releases
heroku rollback v42
```

## Maintenance Windows

Schedule regular maintenance:
- Database optimization (VACUUM/ANALYZE)
- Dependency updates
- Security patches
- Log cleanup

```bash
# Schedule with cron
0 3 * * 0 /app/maintenance.sh  # Every Sunday at 3 AM
```

---

For more help, see:
- [Main README](../README.md)
- [Setup Guide](../SETUP_GUIDE.md)
- [Getting Started](../GETTING_STARTED.md)

Happy deploying! 🚀
