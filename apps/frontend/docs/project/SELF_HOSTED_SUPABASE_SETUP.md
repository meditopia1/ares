# Self-Hosted Supabase Setup Guide
## Google Cloud Johannesburg (africa-south1)

**Target**: Production-ready self-hosted Supabase for Day1Health  
**Location**: South Africa (Johannesburg)  
**Timeline**: 4-8 weeks  
**Cost**: ~$450-1,050/month

---

## Prerequisites

### 1. Google Cloud Account
- Create account at https://cloud.google.com
- Enable billing
- $300 free credit for new accounts

### 2. Required Tools
```bash
# Install Google Cloud SDK
# Windows: Download from https://cloud.google.com/sdk/docs/install
# Or use Cloud Shell (browser-based, pre-installed)

# Install Docker Desktop
# Download from https://www.docker.com/products/docker-desktop

# Install kubectl
gcloud components install kubectl

# Install Supabase CLI
npm install -g supabase
```

### 3. Domain Name
- Purchase domain (e.g., `day1health.co.za`)
- Point DNS to Google Cloud (we'll configure later)

---

## Phase 1: Google Cloud Project Setup (Week 1)

### Step 1: Create Project

```bash
# Set project ID
export PROJECT_ID="day1health-prod"
export REGION="africa-south1"
export ZONE="africa-south1-a"

# Create project
gcloud projects create $PROJECT_ID --name="Day1Health Production"

# Set as active project
gcloud config set project $PROJECT_ID

# Enable billing (do this in console: https://console.cloud.google.com/billing)
```

### Step 2: Enable Required APIs

```bash
# Enable all required APIs
gcloud services enable \
  compute.googleapis.com \
  container.googleapis.com \
  sqladmin.googleapis.com \
  storage.googleapis.com \
  cloudresourcemanager.googleapis.com \
  servicenetworking.googleapis.com \
  vpcaccess.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com
```

### Step 3: Set Up VPC Network

```bash
# Create VPC network
gcloud compute networks create day1health-vpc \
  --subnet-mode=custom \
  --bgp-routing-mode=regional

# Create subnet in Johannesburg
gcloud compute networks subnets create day1health-subnet \
  --network=day1health-vpc \
  --region=$REGION \
  --range=10.0.0.0/24

# Create firewall rules
gcloud compute firewall-rules create allow-internal \
  --network=day1health-vpc \
  --allow=tcp,udp,icmp \
  --source-ranges=10.0.0.0/24

gcloud compute firewall-rules create allow-https \
  --network=day1health-vpc \
  --allow=tcp:443 \
  --source-ranges=0.0.0.0/0

gcloud compute firewall-rules create allow-http \
  --network=day1health-vpc \
  --allow=tcp:80 \
  --source-ranges=0.0.0.0/0
```

---

## Phase 2: PostgreSQL Database Setup (Week 1-2)

### Step 1: Create Cloud SQL PostgreSQL Instance

```bash
# Create PostgreSQL instance
gcloud sql instances create day1health-db \
  --database-version=POSTGRES_15 \
  --tier=db-custom-2-7680 \
  --region=$REGION \
  --network=projects/$PROJECT_ID/global/networks/day1health-vpc \
  --no-assign-ip \
  --storage-type=SSD \
  --storage-size=100GB \
  --storage-auto-increase \
  --backup-start-time=02:00 \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=03 \
  --enable-bin-log \
  --retained-backups-count=30

# This takes 10-15 minutes to create
```

### Step 2: Set Root Password

```bash
# Generate strong password
export DB_PASSWORD=$(openssl rand -base64 32)

# Set root password
gcloud sql users set-password postgres \
  --instance=day1health-db \
  --password=$DB_PASSWORD

# Save this password securely!
echo "Database Password: $DB_PASSWORD" > db-credentials.txt
echo "IMPORTANT: Save this password in a secure location!"
```

### Step 3: Create Supabase Database

```bash
# Connect to database
gcloud sql connect day1health-db --user=postgres

# In PostgreSQL prompt:
CREATE DATABASE supabase;
\c supabase

# Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgjwt";

# Exit
\q
```

### Step 4: Get Database Connection Details

```bash
# Get private IP
gcloud sql instances describe day1health-db \
  --format="value(ipAddresses[0].ipAddress)"

# Save this IP address
export DB_HOST="<IP_FROM_ABOVE>"
```

---

## Phase 3: Cloud Storage Setup (Week 2)

### Step 1: Create Storage Buckets

```bash
# Create buckets in Johannesburg region
gsutil mb -l $REGION gs://${PROJECT_ID}-public-assets
gsutil mb -l $REGION gs://${PROJECT_ID}-member-documents
gsutil mb -l $REGION gs://${PROJECT_ID}-claim-documents
gsutil mb -l $REGION gs://${PROJECT_ID}-application-documents

# Set bucket permissions (private by default)
gsutil iam ch allUsers:objectViewer gs://${PROJECT_ID}-public-assets

# Other buckets remain private
```

### Step 2: Enable Uniform Bucket-Level Access

```bash
gsutil uniformbucketlevelaccess set on gs://${PROJECT_ID}-member-documents
gsutil uniformbucketlevelaccess set on gs://${PROJECT_ID}-claim-documents
gsutil uniformbucketlevelaccess set on gs://${PROJECT_ID}-application-documents
```

---

## Phase 4: Self-Hosted Supabase Deployment (Week 2-3)

### Step 1: Clone Supabase Repository

```bash
# Clone Supabase
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

# Copy example env file
cp .env.example .env
```

### Step 2: Configure Environment Variables

Edit `.env` file with these critical settings:

```bash
############
# Secrets
############
POSTGRES_PASSWORD=<YOUR_DB_PASSWORD_FROM_STEP_2>
JWT_SECRET=$(openssl rand -base64 32)
ANON_KEY=$(supabase gen keys anon)
SERVICE_ROLE_KEY=$(supabase gen keys service_role)

############
# Database
############
POSTGRES_HOST=$DB_HOST
POSTGRES_PORT=5432
POSTGRES_DB=supabase
POSTGRES_USER=postgres

############
# API
############
API_EXTERNAL_URL=https://api.day1health.co.za
SUPABASE_PUBLIC_URL=https://api.day1health.co.za

############
# Auth
############
SITE_URL=https://app.day1health.co.za
ADDITIONAL_REDIRECT_URLS=https://app.day1health.co.za/*
JWT_EXPIRY=3600
DISABLE_SIGNUP=false
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false

############
# Storage
############
STORAGE_BACKEND=gcs
GCS_BUCKET=${PROJECT_ID}-member-documents
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

############
# SMTP (for emails)
############
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@day1health.co.za
SMTP_PASS=<YOUR_SMTP_PASSWORD>
SMTP_ADMIN_EMAIL=admin@day1health.co.za

############
# Security
############
PGRST_DB_ANON_ROLE=anon
PGRST_DB_SCHEMA=public,storage,graphql_public
PGRST_JWT_SECRET=$JWT_SECRET
```

### Step 3: Create Service Account for Storage

```bash
# Create service account
gcloud iam service-accounts create supabase-storage \
  --display-name="Supabase Storage Service Account"

# Grant storage permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:supabase-storage@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Create and download key
gcloud iam service-accounts keys create supabase-storage-key.json \
  --iam-account=supabase-storage@${PROJECT_ID}.iam.gserviceaccount.com

# Save this key securely!
```

### Step 4: Build and Deploy Supabase Containers

```bash
# Build containers
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

---

## Phase 5: Deploy to Google Cloud Run (Week 3-4)

### Step 1: Create Container Registry

```bash
# Enable Artifact Registry
gcloud services enable artifactregistry.googleapis.com

# Create repository
gcloud artifacts repositories create supabase \
  --repository-format=docker \
  --location=$REGION \
  --description="Supabase containers"
```

### Step 2: Build and Push Containers

```bash
# Configure Docker for GCP
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Tag and push each service
# (This is simplified - actual deployment uses multiple services)

# Example for API service
docker tag supabase/postgres:15 \
  ${REGION}-docker.pkg.dev/${PROJECT_ID}/supabase/postgres:latest

docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/supabase/postgres:latest
```

### Step 3: Deploy to Cloud Run

```bash
# Deploy Kong (API Gateway)
gcloud run deploy supabase-kong \
  --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/supabase/kong:latest \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --vpc-connector=supabase-connector \
  --set-env-vars="POSTGRES_HOST=${DB_HOST}" \
  --min-instances=1 \
  --max-instances=10 \
  --memory=512Mi \
  --cpu=1

# Deploy Auth (GoTrue)
gcloud run deploy supabase-auth \
  --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/supabase/gotrue:latest \
  --region=$REGION \
  --platform=managed \
  --no-allow-unauthenticated \
  --vpc-connector=supabase-connector \
  --set-env-vars="DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:5432/supabase" \
  --min-instances=1 \
  --max-instances=5

# Deploy Storage
gcloud run deploy supabase-storage \
  --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/supabase/storage:latest \
  --region=$REGION \
  --platform=managed \
  --no-allow-unauthenticated \
  --vpc-connector=supabase-connector \
  --set-env-vars="DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:5432/supabase" \
  --min-instances=1 \
  --max-instances=5

# Deploy Realtime
gcloud run deploy supabase-realtime \
  --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/supabase/realtime:latest \
  --region=$REGION \
  --platform=managed \
  --no-allow-unauthenticated \
  --vpc-connector=supabase-connector \
  --set-env-vars="DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:5432/supabase" \
  --min-instances=1 \
  --max-instances=5
```

---

## Phase 6: DNS and SSL Setup (Week 4)

### Step 1: Configure Domain Mapping

```bash
# Map custom domain to Cloud Run
gcloud run domain-mappings create \
  --service=supabase-kong \
  --domain=api.day1health.co.za \
  --region=$REGION

# Get DNS records to configure
gcloud run domain-mappings describe \
  --domain=api.day1health.co.za \
  --region=$REGION
```

### Step 2: Update DNS Records

Add these records to your domain registrar:

```
Type: A
Name: api
Value: <IP_FROM_CLOUD_RUN>

Type: AAAA
Name: api
Value: <IPv6_FROM_CLOUD_RUN>
```

### Step 3: SSL Certificate (Automatic)

Google Cloud Run automatically provisions SSL certificates for custom domains. Wait 15-30 minutes for certificate to be issued.

---

## Phase 7: Data Migration (Week 5-6)

### Step 1: Export Current Supabase Data

```bash
# Export from current Supabase
supabase db dump --db-url "postgresql://postgres:<PASSWORD>@db.ldygmpaipxbokxzyzyti.supabase.co:5432/postgres" > current-data.sql
```

### Step 2: Import to New Database

```bash
# Import to new Cloud SQL
gcloud sql import sql day1health-db gs://${PROJECT_ID}-backups/current-data.sql \
  --database=supabase
```

### Step 3: Migrate Storage Files

```bash
# Use gsutil to copy files from Supabase Storage to GCS
# (Requires Supabase Storage API access)

# Example:
gsutil -m cp -r \
  "https://ldygmpaipxbokxzyzyti.supabase.co/storage/v1/object/*" \
  gs://${PROJECT_ID}-member-documents/
```

---

## Phase 8: Security Hardening (Week 6-7)

### Step 1: Enable RLS Policies

```sql
-- Connect to database
gcloud sql connect day1health-db --user=postgres --database=supabase

-- Enable RLS on all sensitive tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_dependants ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Create policies (example for members)
CREATE POLICY "Members can view own record"
  ON members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Staff can view assigned members"
  ON members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'call_centre', 'operations_manager')
    )
  );
```

### Step 2: Configure Audit Logging

```sql
-- Enable PostgreSQL audit extension
CREATE EXTENSION IF NOT EXISTS pgaudit;

-- Configure audit logging
ALTER SYSTEM SET pgaudit.log = 'write, ddl';
ALTER SYSTEM SET pgaudit.log_catalog = off;
ALTER SYSTEM SET pgaudit.log_parameter = on;
```

### Step 3: Set Up Monitoring

```bash
# Enable Cloud Monitoring
gcloud services enable monitoring.googleapis.com

# Create uptime check
gcloud monitoring uptime create https-check \
  --display-name="Supabase API Health" \
  --resource-type=uptime-url \
  --host=api.day1health.co.za \
  --path=/health

# Create alert policy
gcloud alpha monitoring policies create \
  --notification-channels=<CHANNEL_ID> \
  --display-name="Supabase API Down" \
  --condition-display-name="API Unavailable" \
  --condition-threshold-value=1 \
  --condition-threshold-duration=300s
```

---

## Phase 9: Testing (Week 7-8)

### Step 1: Update Frontend Configuration

```javascript
// apps/frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://api.day1health.co.za
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SERVICE_ROLE_KEY>
```

### Step 2: Test All Functionality

```bash
# Test authentication
curl https://api.day1health.co.za/auth/v1/health

# Test database access
curl https://api.day1health.co.za/rest/v1/members?limit=1 \
  -H "apikey: <YOUR_ANON_KEY>"

# Test storage
curl https://api.day1health.co.za/storage/v1/bucket/list \
  -H "Authorization: Bearer <YOUR_SERVICE_ROLE_KEY>"
```

### Step 3: Performance Testing

```bash
# Use Apache Bench for load testing
ab -n 1000 -c 10 https://api.day1health.co.za/rest/v1/members?limit=10
```

---

## Phase 10: Go Live (Week 8)

### Step 1: Final Checks

- [ ] All data migrated
- [ ] RLS policies enabled
- [ ] Audit logging active
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] SSL certificate valid
- [ ] DNS propagated
- [ ] Performance acceptable

### Step 2: Switch DNS

Update your application to point to new Supabase URL:

```
Old: https://ldygmpaipxbokxzyzyti.supabase.co
New: https://api.day1health.co.za
```

### Step 3: Monitor

Watch for:
- Error rates
- Response times
- Database connections
- Storage usage
- Costs

---

## Ongoing Maintenance

### Daily
- Monitor uptime
- Check error logs
- Review security alerts

### Weekly
- Review performance metrics
- Check backup status
- Update dependencies

### Monthly
- Security patches
- Cost optimization
- Capacity planning

---

## Cost Breakdown

### Monthly Costs (Estimated)

**Compute (Cloud Run)**:
- Kong (API Gateway): $50-100
- Auth (GoTrue): $30-50
- Storage API: $30-50
- Realtime: $30-50
- **Subtotal**: $140-250/month

**Database (Cloud SQL)**:
- db-custom-2-7680 (2 vCPU, 7.5GB RAM): $200-300
- Storage (100GB SSD): $17
- Backups (30 days): $10-20
- **Subtotal**: $227-337/month

**Storage (Cloud Storage)**:
- Storage (100GB): $2.60
- Operations: $10-20
- **Subtotal**: $12.60-22.60/month

**Networking**:
- Egress: $50-100
- Load Balancing: $20-30
- **Subtotal**: $70-130/month

**Monitoring & Logging**:
- Cloud Monitoring: $20-30
- Cloud Logging: $20-30
- **Subtotal**: $40-60/month

**TOTAL**: **$489.60 - $799.60/month**

At scale (10,000+ members), costs may increase to $800-1,500/month.

---

## Support & Resources

**Supabase Documentation**: https://supabase.com/docs/guides/self-hosting  
**Google Cloud Documentation**: https://cloud.google.com/docs  
**Community Support**: https://github.com/supabase/supabase/discussions

---

## Next Steps

1. Review this guide
2. Set up Google Cloud account
3. Follow Phase 1-2 to get started
4. Schedule weekly check-ins to track progress
5. Plan migration timeline with stakeholders

**Ready to start? Let me know which phase you'd like help with first!**
