#!/bin/bash

# Google Cloud Deployment Script for NIT ITVMS
# This script helps deploy the application to Google Cloud Platform

set -e

echo "🚀 Starting Google Cloud deployment for NIT ITVMS..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK (gcloud) is not installed."
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo "❌ Not logged in to Google Cloud. Please run: gcloud auth login"
    exit 1
fi

# Get project info
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No Google Cloud project set. Please run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "✅ Using Google Cloud project: $PROJECT_ID"

# Enable required APIs
echo "🔄 Enabling required Google Cloud APIs..."
gcloud services enable appengine.googleapis.com
gcloud services enable sql-component.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com

# Create Cloud SQL instance if it doesn't exist
echo "🔄 Setting up Cloud SQL instance..."
DB_INSTANCE_NAME="nit-itvms-db"

if ! gcloud sql instances list --filter="name=$DB_INSTANCE_NAME" --format="value(name)" | grep -q "$DB_INSTANCE_NAME"; then
    echo "📝 Creating new Cloud SQL instance: $DB_INSTANCE_NAME"
    gcloud sql instances create $DB_INSTANCE_NAME \
        --database-version=MYSQL_8_0 \
        --tier=db-f1-micro \
        --region=us-central1 \
        --storage-size=10GB \
        --storage-type=SSD \
        --backup-start-time=02:00 \
        --retained-backups-count=7
else
    echo "✅ Cloud SQL instance already exists: $DB_INSTANCE_NAME"
fi

# Create database if it doesn't exist
echo "🔄 Setting up database..."
if ! gcloud sql databases list --instance=$DB_INSTANCE_NAME --filter="name=nit_itvms" --format="value(name)" | grep -q "nit_itvms"; then
    echo "📝 Creating database: nit_itvms"
    gcloud sql databases create nit_itvms --instance=$DB_INSTANCE_NAME
else
    echo "✅ Database already exists: nit_itvms"
fi

# Create database user if it doesn't exist
echo "🔄 Setting up database user..."
DB_USER="nit_user"
if ! gcloud sql users list --instance=$DB_INSTANCE_NAME --filter="name=$DB_USER" --format="value(name)" | grep -q "$DB_USER"; then
    echo "📝 Creating database user: $DB_USER"
    DB_PASSWORD=$(openssl rand -base64 32)
    gcloud sql users create $DB_USER --instance=$DB_INSTANCE_NAME --password=$DB_PASSWORD
    echo "🔑 Generated password for user $DB_USER: $DB_PASSWORD"
    echo "⚠️  Save this password! You'll need it for environment variables."
else
    echo "✅ Database user already exists: $DB_USER"
fi

# Get connection details
echo "🔍 Getting Cloud SQL connection details..."
CONNECTION_NAME=$(gcloud sql instances describe $DB_INSTANCE_NAME --format="value(connectionName)")
DB_HOST=$CONNECTION_NAME
DB_PORT=3306

echo "📊 Cloud SQL Connection Details:"
echo "   Connection Name: $CONNECTION_NAME"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: nit_itvms"
echo "   User: $DB_USER"

# Create App Engine app if it doesn't exist
echo "🔄 Setting up App Engine..."
if ! gcloud app describe --format="value(serviceAccount)" 2>/dev/null; then
    echo "📝 Creating App Engine application..."
    gcloud app create --region=us-central1
else
    echo "✅ App Engine application already exists"
fi

# Prepare deployment
echo "🔄 Preparing for deployment..."

# Update package.json for GCP
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found"
    exit 1
fi

# Add GCP-specific scripts to package.json
echo "📝 Updating package.json for GCP deployment..."
npm pkg set scripts.gcp-deploy="gcloud app deploy"
npm pkg set scripts.gcp-build="npm run build"
npm pkg set scripts.gcp-start="node server-gcp.js"

# Build the application
echo "🔨 Building application..."
npm install
npm run build 2>/dev/null || echo "⚠️  Build script not found, continuing..."

# Deploy to App Engine
echo "🚀 Deploying to Google App Engine..."
gcloud app deploy --quiet

# Get the application URL
APP_URL=$(gcloud app describe --format="value(defaultHostname)")
echo "✅ Deployment completed!"
echo "🌐 Application URL: https://$APP_URL"
echo "🔗 Health Check: https://$APP_URL/api/health"

echo ""
echo "📋 Next Steps:"
echo "1. Set environment variables in Google Cloud Console:"
echo "   - Go to: https://console.cloud.google.com/appengine/settings?project=$PROJECT_ID"
echo "   - Add the following variables:"
echo "     * DB_HOST=$DB_HOST"
echo "     * DB_PORT=$DB_PORT"
echo "     * DB_USER=$DB_USER"
echo "     * DB_PASSWORD=your_database_password"
echo "     * DB_NAME=nit_itvms"
echo "     * JWT_SECRET=your_jwt_secret"
echo "     * FRONTEND_URL=https://$APP_URL"
echo ""
echo "2. Test your deployment:"
echo "   curl https://$APP_URL/api/health"
echo ""
echo "3. Monitor your application:"
echo "   gcloud app logs tail -s default"
echo ""
echo "🎉 NIT ITVMS is now deployed on Google Cloud Platform!"
