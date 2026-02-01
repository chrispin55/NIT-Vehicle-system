# Cloud Run Database Setup Guide

## 🔍 Current Issue

Your application is running but can't connect to the database because:
1. **MySQL2 warnings** - Invalid configuration options
2. **Database connection failed** - No Cloud SQL instance configured

## ✅ Fixed Issues

### 1. MySQL2 Configuration Warnings
- ✅ Removed invalid options: `acquireTimeout`, `timeout`, `reconnect`
- ✅ Clean database configuration

### 2. Database Connection
- ⚠️ **Need to set up Cloud SQL instance**

## 🚀 Database Setup Steps

### Option 1: Create Cloud SQL Instance (Recommended)

```bash
# 1. Set your project
gcloud config set project YOUR_PROJECT_ID

# 2. Create Cloud SQL instance
gcloud sql instances create nit-itvms-db \
    --database-version=MYSQL_8_0 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --storage-size=10GB \
    --storage-type=SSD

# 3. Create database
gcloud sql databases create nit_itvms --instance=nit-itvms-db

# 4. Create database user
gcloud sql users create nit_user --instance=nit-itvms-db --password=YOUR_SECURE_PASSWORD

# 5. Get connection string
gcloud sql instances describe nit-itvms-db --format='value(connectionName)'
```

### Option 2: Use External MySQL (Quick Test)

For testing, you can use any external MySQL database:
- **PlanetScale** (free tier)
- **Railway** (MySQL service)
- **Local MySQL** (for development)

## 🔧 Environment Variables for Cloud Run

Set these in Google Cloud Console → Cloud Run → Service → Edit & Deploy New Revision:

```bash
# Database Configuration
DB_HOST=/cloudsql/YOUR_PROJECT_ID:us-central1:nit-itvms-db
DB_PORT=3306
DB_USER=nit_user
DB_PASSWORD=YOUR_SECURE_PASSWORD
DB_NAME=nit_itvms

# Application Configuration
NODE_ENV=production
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=https://your-service-url.run.app
```

## 🎯 Quick Test with External Database

If you want to test quickly without Cloud SQL:

1. **Get a free MySQL database** (PlanetScale, Railway, etc.)
2. **Set environment variables** in Cloud Run:
   ```bash
   DB_HOST=your-mysql-host.com
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database
   ```
3. **Redeploy** Cloud Run service

## 🚀 Redeploy After Database Setup

```bash
# Deploy with updated database configuration
./deploy-cloud-run.sh
```

## 📊 Verify Database Connection

After deployment, check logs:
```bash
gcloud run services logs read nit-itvms --region=us-central1 --limit=50
```

You should see:
```
✅ Google Cloud SQL connected successfully
🔄 Initializing Google Cloud SQL database...
✅ Database initialized successfully
```

## 🔍 Troubleshooting

### If still getting connection errors:
1. **Check Cloud SQL instance is running**
2. **Verify environment variables are correct**
3. **Ensure IAM permissions allow Cloud Run to access Cloud SQL**
4. **Check firewall rules**

### Common Issues:
- **Wrong connection name** - Use `gcloud sql instances describe`
- **Incorrect password** - Reset database user password
- **Missing permissions** - Add Cloud SQL Admin role

## 🎉 Success Indicators

✅ Clean logs without MySQL2 warnings
✅ Database connection successful
✅ API endpoints responding
✅ Frontend loading properly

Your NIT ITVMS will be fully functional once the database is properly configured!
