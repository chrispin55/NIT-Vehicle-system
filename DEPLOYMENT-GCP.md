# Google Cloud Platform Deployment Guide

## Overview
This guide will help you deploy the NIT ITVMS (Integrated Transport & Vehicle Management System) to Google Cloud Platform using App Engine and Cloud SQL.

## Prerequisites

### 1. Google Cloud Account
- Active Google Cloud account with billing enabled
- Project created in Google Cloud Console

### 2. Google Cloud SDK
Install the Google Cloud SDK:
```bash
# macOS
brew install google-cloud-sdk

# Windows
# Download and install from: https://cloud.google.com/sdk/docs/install

# Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### 3. Authentication
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

## Deployment Options

### Option 1: Automated Deployment (Recommended)
Use the provided deployment script:
```bash
chmod +x scripts/deploy-gcp.sh
./scripts/deploy-gcp.sh
```

### Option 2: Manual Deployment
Follow the manual steps below.

## Manual Deployment Steps

### 1. Enable Required APIs
```bash
gcloud services enable appengine.googleapis.com
gcloud services enable sql-component.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 2. Create Cloud SQL Instance
```bash
gcloud sql instances create nit-itvms-db \
    --database-version=MYSQL_8_0 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --storage-size=10GB \
    --storage-type=SSD
```

### 3. Create Database
```bash
gcloud sql databases create nit_itvms --instance=nit-itvms-db
```

### 4. Create Database User
```bash
gcloud sql users create nit_user --instance=nit-itvms-db --password=YOUR_PASSWORD
```

### 5. Create App Engine Application
```bash
gcloud app create --region=us-central1
```

### 6. Configure Environment Variables
In Google Cloud Console → App Engine → Settings → Environment Variables, set:

```
DB_HOST=your-project:us-central1:nit-itvms-db
DB_PORT=3306
DB_USER=nit_user
DB_PASSWORD=your_database_password
DB_NAME=nit_itvms
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-project.appspot.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 7. Deploy Application
```bash
gcloud app deploy
```

## Configuration Files

### app.yaml
Configures App Engine settings:
- Runtime: Node.js 20
- Instance class: F2 (auto-scaling)
- Static file handling
- Health checks

### cloudbuild.yaml
Configures Cloud Build for deployment:
- Install dependencies
- Build application
- Deploy to App Engine

### server-gcp.js
Google Cloud-specific server:
- Uses Cloud SQL configuration
- GCP health checks
- Proper error handling

### backend/config/database-gcp.js
Cloud SQL database configuration:
- SSL connection support
- Connection pooling
- Schema initialization

## Database Setup

### Automatic Schema Creation
The application automatically creates the database schema on startup:
- Users table (authentication)
- Vehicles table (fleet management)
- Drivers table (driver management)
- Trips table (trip scheduling)
- Maintenance records table

### Sample Data
Default sample data is inserted:
- Admin user (username: admin, password: admin123)
- Sample vehicles
- Sample drivers

## Security Configuration

### SSL/TLS
- HTTPS enforced by default
- Cloud SQL connections use SSL
- Security headers configured

### Authentication
- JWT-based authentication
- Session management
- Password hashing with bcrypt

### Rate Limiting
- API rate limiting configured
- DDoS protection
- Request throttling

## Monitoring and Logging

### Health Check
Monitor application health:
```bash
curl https://your-project.appspot.com/api/health
```

### Logs
View application logs:
```bash
gcloud app logs tail -s default
```

### Error Reporting
Errors are automatically reported to Google Cloud Error Reporting.

## Scaling and Performance

### Auto-scaling
App Engine automatically scales based on traffic:
- Minimum 1 instance
- Maximum 5 instances
- CPU target utilization: 65%

### Database Performance
- Connection pooling configured
- Query optimization
- Indexes on frequently accessed fields

## Cost Optimization

### App Engine
- Free tier available (28 instance-hours per day)
- Pay-per-use beyond free tier
- Automatic scaling reduces costs

### Cloud SQL
- db-f1-micro tier (free tier eligible)
- 10GB storage included
- Automatic backups

## Troubleshooting

### Common Issues

#### Database Connection Failed
1. Check environment variables
2. Verify Cloud SQL instance is running
3. Ensure user permissions are correct
4. Check network configuration

#### Deployment Failed
1. Check app.yaml syntax
2. Verify all dependencies in package.json
3. Check Cloud Build logs
4. Ensure APIs are enabled

#### Application Not Loading
1. Check App Engine logs
2. Verify static file configuration
3. Check health endpoint
4. Ensure database is accessible

### Debug Commands
```bash
# Check deployment status
gcloud app describe

# View logs
gcloud app logs tail -s default

# Check database status
gcloud sql instances describe nit-itvms-db

# Test database connection
gcloud sql connect nit-itvms-db --user=nit_user
```

## Backup and Recovery

### Database Backups
Cloud SQL automatically creates backups:
- Daily backups enabled
- 7-day retention
- Point-in-time recovery

### Application Backup
- Code stored in Git repository
- Environment variables in Cloud Console
- Static files served from App Engine

## Maintenance

### Updates
Deploy updates with:
```bash
git add .
git commit -m "Update description"
git push origin main
gcloud app deploy
```

### Database Maintenance
- Monitor performance metrics
- Update statistics regularly
- Optimize queries as needed

## Support

### Google Cloud Support
- Documentation: https://cloud.google.com/docs
- Community: https://cloud.google.com/community
- Support: https://cloud.google.com/support

### Application Support
- GitHub Issues: https://github.com/chrispin55/NIT-Vehicle-system/issues
- Documentation: Check project README.md

## Next Steps

1. **Deploy the application** using the automated script or manual steps
2. **Configure environment variables** in Google Cloud Console
3. **Test the deployment** by accessing the health endpoint
4. **Monitor performance** using Google Cloud Console
5. **Set up alerts** for important metrics

## Success Criteria

✅ Application deployed successfully  
✅ Database connected and schema created  
✅ Health endpoint responding  
✅ Static assets loading correctly  
✅ API endpoints functional  
✅ Authentication working  
✅ Auto-scaling configured  

Your NIT ITVMS is now running on Google Cloud Platform! 🎉
