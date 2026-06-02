# Day1Health Self-Hosted Supabase Infrastructure

This directory contains all configuration files for self-hosting Supabase on Google Cloud (Johannesburg).

## Quick Start (Local Development)

### 1. Install Prerequisites

```bash
# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop

# Install Supabase CLI
npm install -g supabase
```

### 2. Generate Keys

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate Supabase keys
supabase gen keys anon
supabase gen keys service_role
```

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your generated keys
nano .env
```

### 4. Start Services

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 5. Access Services

- **Supabase Studio**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **PostgreSQL**: localhost:5432

### 6. Test Connection

```bash
# Test API health
curl http://localhost:8000/rest/v1/

# Test auth
curl http://localhost:8000/auth/v1/health
```

## Production Deployment (Google Cloud)

See `../docs/SELF_HOSTED_SUPABASE_SETUP.md` for complete production deployment guide.

### Quick Production Checklist

- [ ] Google Cloud project created
- [ ] VPC network configured
- [ ] Cloud SQL PostgreSQL instance created
- [ ] Cloud Storage buckets created
- [ ] Service accounts configured
- [ ] Containers built and pushed to Artifact Registry
- [ ] Cloud Run services deployed
- [ ] Custom domain configured
- [ ] SSL certificate issued
- [ ] Data migrated
- [ ] RLS policies enabled
- [ ] Monitoring configured

## Directory Structure

```
infrastructure/
├── docker-compose.yml          # Local development setup
├── .env.example                # Environment variables template
├── .env                        # Your actual env vars (gitignored)
├── README.md                   # This file
├── volumes/                    # Docker volumes (gitignored)
│   ├── db/                     # PostgreSQL data
│   ├── storage/                # File storage
│   └── api/                    # API configs
└── gcp/                        # Google Cloud configs
    ├── terraform/              # Infrastructure as Code
    ├── cloudbuild.yaml         # CI/CD pipeline
    └── kubernetes/             # K8s manifests (if using GKE)
```

## Common Commands

### Development

```bash
# Start services
docker-compose up -d

# Restart a specific service
docker-compose restart auth

# View logs for specific service
docker-compose logs -f storage

# Execute SQL in database
docker-compose exec db psql -U postgres -d supabase

# Stop and remove all containers
docker-compose down -v
```

### Database Management

```bash
# Backup database
docker-compose exec db pg_dump -U postgres supabase > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres supabase < backup.sql

# Connect to database
docker-compose exec db psql -U postgres -d supabase
```

### Monitoring

```bash
# Check resource usage
docker stats

# Check disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

## Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose logs

# Check if ports are already in use
netstat -ano | findstr :8000
netstat -ano | findstr :5432

# Remove all containers and start fresh
docker-compose down -v
docker-compose up -d
```

### Database connection errors

```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Test connection
docker-compose exec db psql -U postgres -d supabase -c "SELECT 1;"
```

### Storage not working

```bash
# Check storage service logs
docker-compose logs storage

# Check storage directory permissions
ls -la volumes/storage/

# Recreate storage volume
docker-compose down
rm -rf volumes/storage
docker-compose up -d
```

## Security Notes

### Local Development

- Default passwords are for development only
- Never commit `.env` file to git
- Use strong passwords for production

### Production

- Use Google Secret Manager for sensitive values
- Enable VPC Service Controls
- Configure Cloud Armor for DDoS protection
- Enable Cloud Audit Logs
- Use private IP for database
- Enable encryption at rest and in transit
- Implement least-privilege IAM roles

## Cost Optimization

### Development

- Stop services when not in use: `docker-compose down`
- Use smaller database instances
- Limit log retention

### Production

- Use committed use discounts (1-3 year)
- Enable autoscaling with min instances = 0 for low-traffic services
- Use Cloud CDN for static assets
- Implement caching strategies
- Monitor and optimize query performance
- Use lifecycle policies for old storage objects

## Support

- **Supabase Docs**: https://supabase.com/docs/guides/self-hosting
- **Google Cloud Docs**: https://cloud.google.com/docs
- **Community**: https://github.com/supabase/supabase/discussions
- **Day1Health Team**: Contact your DevOps lead

## Next Steps

1. ✅ Set up local development environment
2. ✅ Test all services locally
3. ⬜ Create Google Cloud project
4. ⬜ Deploy to production
5. ⬜ Migrate data
6. ⬜ Configure monitoring
7. ⬜ Go live!
