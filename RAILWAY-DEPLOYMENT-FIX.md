# Railway MySQL Deployment Fix

## Problem Identified
The "Failed to deploy MySQL" error occurs due to incorrect Railway service configuration.

## Solution Applied

### 1. Fixed Railway.toml Configuration
```toml
[[services]]
name = "nit-itvms-db"
source = "railway/mysql:8.0"

[services.env]
MYSQL_DATABASE = "nit_itvms"
MYSQL_USER = "nit_user"
MYSQL_PASSWORD = "${MYSQL_PASSWORD}"
MYSQL_ROOT_PASSWORD = "${MYSQL_ROOT_PASSWORD}"
```

### 2. Database Configuration
The application now uses Railway's automatic environment variables:
- `RAILWAY_PRIVATE_DOMAIN` - Database host
- `RAILWAY_TCP_PORT` - Database port
- `MYSQLUSER` - Database username
- `MYSQLPASSWORD` - Database password
- `MYSQLDATABASE` - Database name

### 3. Simplified Database Setup
- Removed complex service linking
- Added database configuration validation
- Enhanced logging for debugging

## Railway Environment Variables

### Required Variables (Set in Railway Dashboard):
1. **MYSQL_PASSWORD** - Your MySQL password
2. **MYSQL_ROOT_PASSWORD** - MySQL root password
3. **JWT_SECRET** - JWT authentication secret

### Automatic Variables (Provided by Railway):
- `RAILWAY_PRIVATE_DOMAIN`
- `RAILWAY_TCP_PORT`
- `MYSQLUSER`
- `MYSQLPASSWORD`
- `MYSQLDATABASE`

## Deployment Steps

### 1. Push Changes to GitHub
```bash
git add .
git commit -m "Fix Railway MySQL deployment"
git push origin main
```

### 2. Set Environment Variables in Railway
1. Go to Railway Dashboard
2. Select your project
3. Go to Variables tab
4. Add required variables:
   - `MYSQL_PASSWORD` (any secure password)
   - `MYSQL_ROOT_PASSWORD` (any secure password)
   - `JWT_SECRET` (any secure secret)

### 3. Redeploy
1. Railway will automatically redeploy
2. MySQL service will be created
3. Application will connect to database

### 4. Verify Deployment
Check the logs for:
```
✅ Database configuration validated
✅ Database connection established
🚀 NIT ITVMS Server running on port 3000
```

## Troubleshooting

### If MySQL Still Fails:
1. **Check Railway Variables**: Ensure all required variables are set
2. **Check Service Logs**: Look for specific error messages
3. **Manual Database Setup**: Use Railway's MySQL UI to create tables

### Alternative Approach:
If automatic deployment fails, you can:
1. Deploy the application first (without database)
2. Add MySQL service manually in Railway
3. Set environment variables
4. Redeploy

## Database Schema
The schema will be automatically created when the server starts. You can also manually run the schema file:
`database/schema-railway.sql`

## Health Check
Monitor deployment at: `https://your-app.railway.app/api/health`

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "environment": "production"
}
```

## Support
If issues persist:
1. Check Railway deployment logs
2. Verify all environment variables
3. Ensure MySQL service is running in Railway dashboard
4. Contact Railway support for service-specific issues
