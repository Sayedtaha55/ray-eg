# Ray Marketplace - Deployment Guide

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Redis Setup](#redis-setup)
- [Docker Deployment](#docker-deployment)
- [Manual Deployment](#manual-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## 🚀 Prerequisites

### Required Software
- **Node.js** 18+ LTS
- **Docker** & **Docker Compose**
- **PostgreSQL** client tools
- **Redis** client tools
- **Git**

### System Requirements
- **Minimum**: 2 CPU cores, 4GB RAM, 20GB storage
- **Recommended**: 4 CPU cores, 8GB RAM, 50GB storage
- **Network**: Stable internet connection

## 🔧 Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/Sayedtaha55/test.git
cd test
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
```env
# Database
DATABASE_URL="postgres://username:password@host:5432/database"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD="your_redis_password"

# Application
NODE_ENV="production"
JWT_SECRET="your_long_random_secret_key"

# AI Services
GEMINI_API_KEY="your_gemini_api_key"

# Monitoring
LOG_LEVEL="info"
```

## 🗄️ Database Setup

### Option 1: Prisma Cloud (Recommended)
1. Create account at [Prisma Cloud](https://cloud.prisma.io/)
2. Create new PostgreSQL database
3. Copy connection string to `.env`
4. Run migrations:
```bash
npx prisma db push
```

### Option 2: Local PostgreSQL
```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb ray_marketplace

# Create user
sudo -u postgres psql
CREATE USER ray_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ray_marketplace TO ray_user;
\q

# Update .env
DATABASE_URL="postgres://ray_user:your_password@localhost:5432/ray_marketplace"
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

## 📦 Redis Setup

### Option 1: Docker Redis (Recommended)
```bash
docker run -d \
  --name ray-redis \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7-alpine \
  redis-server --appendonly yes
```

### Option 2: Local Redis
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test connection
redis-cli ping
```

## 🐳 Docker Deployment

### 1. Development Environment
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop environment
docker-compose -f docker-compose.dev.yml down
```

### 2. Production Environment
```bash
# Build and start production
docker-compose up -d

# Scale application
docker-compose up -d --scale app=3

# View logs
docker-compose logs -f app

# Stop environment
docker-compose down
```

### 3. Production with Nginx
```bash
# Start with Nginx reverse proxy
docker-compose --profile production up -d
```

## 🔧 Manual Deployment

### 1. Build Application
```bash
# Build for production
npm run build

# Create logs directory
mkdir -p logs
```

### 2. Start Application
```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start ecosystem.config.js

# Or using Node.js directly
NODE_ENV=production npm start
```

### 3. PM2 Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'ray-marketplace',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }]
};
```

## 🔄 CI/CD Pipeline

### GitHub Actions Setup
1. Add required secrets to GitHub repository:
   - `DATABASE_URL`
   - `GEMINI_API_KEY`
   - `JWT_SECRET`
   - `PRODUCTION_HOST`
   - `PRODUCTION_USER`
   - `PRODUCTION_SSH_KEY`

### 2. Pipeline Triggers
- **Push to `main`**: Full deployment
- **Push to `develop`**: Development tests
- **Pull requests**: Testing and validation

### 3. Manual Deployment
```bash
# Deploy latest version
git pull origin main
docker-compose pull
docker-compose up -d
```

## 📊 Monitoring

### Health Checks
```bash
# Application health
curl http://localhost:3000/monitoring/health

# Metrics
curl http://localhost:3000/monitoring/metrics

# Dashboard
curl http://localhost:3000/monitoring/dashboard
```

### Log Management
```bash
# View application logs
docker-compose logs -f app

# View Redis logs
docker-compose logs -f redis

# View system logs
tail -f logs/combined.log
```

### Performance Monitoring
Access monitoring endpoints:
- `/monitoring/health` - Health status
- `/monitoring/metrics` - Performance metrics
- `/monitoring/alerts` - Active alerts
- `/monitoring/dashboard` - Complete dashboard

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
npx prisma db pull

# Reset database
npx prisma migrate reset
```

#### 2. Redis Connection Issues
```bash
# Check Redis status
docker-compose ps redis

# Test Redis connection
redis-cli -h localhost -p 6379 ping

# Restart Redis
docker-compose restart redis
```

#### 3. Application Won't Start
```bash
# Check logs
docker-compose logs app

# Check environment variables
docker-compose exec app env | grep -E "(DATABASE|REDIS|NODE)"

# Restart application
docker-compose restart app
```

#### 4. High Memory Usage
```bash
# Check memory usage
docker stats

# Scale down if needed
docker-compose up -d --scale app=1

# Add memory limits to docker-compose.yml
```

#### 5. Slow Performance
```bash
# Check cache hit rate
curl http://localhost:3000/monitoring/metrics | jq '.cache'

# Warm up cache
curl -X POST http://localhost:3000/api/admin/warm-cache

# Check database performance
npx prisma studio
```

### Performance Optimization

#### 1. Database Optimization
```sql
-- Add indexes
CREATE INDEX idx_shops_status ON shops(status);
CREATE INDEX idx_shops_active ON shops(is_active);
CREATE INDEX idx_products_shop ON products(shop_id);
```

#### 2. Redis Optimization
```bash
# Check Redis memory usage
redis-cli info memory

# Optimize Redis configuration
# Add to redis.conf:
maxmemory 256mb
maxmemory-policy allkeys-lru
```

#### 3. Application Optimization
```bash
# Enable clustering
pm2 start ecosystem.config.js --env production

# Add compression
npm install compression
```

## 🚀 Production Best Practices

### Security
1. **Environment Variables**: Never commit `.env` files
2. **Database**: Use strong passwords and SSL
3. **Redis**: Enable authentication and TLS
4. **Network**: Use firewall and VPN
5. **Updates**: Keep dependencies updated

### Backup Strategy
```bash
# Database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Redis backup
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb backup_$(date +%Y%m%d).rdb
```

### Scaling
1. **Horizontal Scaling**: Use Docker Swarm or Kubernetes
2. **Load Balancing**: Configure Nginx or HAProxy
3. **Database**: Read replicas for heavy read workloads
4. **CDN**: CloudFlare or AWS CloudFront for static assets

### Monitoring Alerts
Set up alerts for:
- CPU usage > 80%
- Memory usage > 90%
- Database connection errors
- Redis connection failures
- Application error rate > 5%

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment: `docker-compose exec app env`
3. Test connections: Database and Redis
4. Review monitoring: `/monitoring/health`

---

**Deployment Status**: ✅ Ready for production
**Last Updated**: 2026-01-08
**Version**: 1.0.0
