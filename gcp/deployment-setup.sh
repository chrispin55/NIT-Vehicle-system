#!/bin/bash

# Google Cloud Deployment Setup Script
# NIT University Dar es Salaam - PROJECT KALI ITVMS

set -e

echo "🚀 Setting up Google Cloud deployment for PROJECT KALI ITVMS..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first:"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set project
echo "📋 Setting Google Cloud project..."
gcloud config set project nit-vehicle-management

# Enable required APIs
echo "🔧 Enabling required Google Cloud APIs..."
gcloud services enable sqladmin.googleapis.com
gcloud services enable sql-component.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Create Cloud SQL instance
echo "🗄️ Creating Cloud SQL instance..."
gcloud sql instances create nit-vehicle-db \
    --database-version=MYSQL_8_0 \
    --tier=db-f1-micro \
    --region=africa-east1 \
    --storage-size=10GB \
    --storage-type=SSD \
    --backup-start-time=02:00 \
    --retained-backups-count=7 \
    --delete-protection

# Create database
echo "📊 Creating database..."
gcloud sql databases create nit_vehicle_management \
    --instance=nit-vehicle-db

# Create database user
echo "👤 Creating database user..."
gcloud sql users create app_user \
    --instance=nit-vehicle-db \
    --password=$(openssl rand -base64 32)

# Create Cloud Storage bucket
echo "📦 Creating Cloud Storage bucket..."
gsutil mb -l africa-east1 gs://nit-vehicle-management-storage

# Create service account
echo "🔐 Creating service account..."
gcloud iam service-accounts create nit-vehicle-app \
    --display-name="PROJECT KALI ITVMS Service Account" \
    --description="Service account for NIT Vehicle Management System"

# Grant necessary permissions
echo "🔑 Granting permissions..."
PROJECT_ID=$(gcloud config get-value project)

# Cloud SQL permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:nit-vehicle-app@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

# Cloud Storage permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:nit-vehicle-app@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.objectAdmin"

# Secret Manager permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:nit-vehicle-app@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

# App Engine permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:nit-vehicle-app@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/appengine.appAdmin"

# Generate service account key
echo "📄 Generating service account key..."
gcloud iam service-accounts keys create ./gcp/service-account-key.json \
    --iam-account=nit-vehicle-app@$PROJECT_ID.iam.gserviceaccount.com

# Store secrets in Secret Manager
echo "🔒 Storing secrets in Secret Manager..."

# Get database password
DB_PASSWORD=$(gcloud sql users describe app_user --instance=nit-vehicle-db --format='value(password)')

# Store secrets
echo -n "$DB_PASSWORD" | gcloud secrets create db-password --data-file=-
echo -n "your-super-secret-jwt-key-change-this-in-production" | gcloud secrets create jwt-secret --data-file=-
echo -n "$(openssl rand -base64 32)" | gcloud secrets create encryption-key --data-file=-
echo -n "$(openssl rand -base64 32)" | gcloud secrets create api-key --data-file=-

# Create App Engine application
echo "🌐 Creating App Engine application..."
gcloud app create --region=africa-east1

# Get instance connection name
INSTANCE_CONNECTION_NAME=$(gcloud sql instances describe nit-vehicle-db --format='value(connectionName)')

# Update .env.production with actual values
echo "📝 Updating production environment file..."
cat > .env.production << EOF
# Production Environment Configuration
PORT=8080
NODE_ENV=production

# Database Configuration (Cloud SQL)
DB_HOST=localhost
DB_USER=app_user
DB_PASSWORD=
DB_NAME=nit_vehicle_management
DB_PORT=3306
DB_CONNECTION_NAME=$INSTANCE_CONNECTION_NAME

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=$PROJECT_ID
GCS_BUCKET_NAME=nit-vehicle-management-storage

# JWT Configuration
JWT_SECRET=
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=https://$PROJECT_ID.uc.r.appspot.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Application Settings
APP_NAME=PROJECT KALI - ITVMS
APP_VERSION=1.0.0
UNIVERSITY_NAME=NIT University Dar es Salaam

# Security Settings
ENCRYPTION_KEY=
API_KEY=

# Logging
LOG_LEVEL=info
ENABLE_CLOUD_LOGGING=true
EOF

echo "✅ Google Cloud setup completed successfully!"
echo ""
echo "📋 Important Information:"
echo "- Project ID: $PROJECT_ID"
echo "- Cloud SQL Instance: nit-vehicle-db"
echo "- Database: nit_vehicle_management"
echo "- Storage Bucket: gs://nit-vehicle-management-storage"
echo "- Service Account: nit-vehicle-app@$PROJECT_ID.iam.gserviceaccount.com"
echo "- Instance Connection Name: $INSTANCE_CONNECTION_NAME"
echo ""
echo "🔧 Next Steps:"
echo "1. Initialize the database schema:"
echo "   npm run init-db"
echo ""
echo "2. Deploy the application:"
echo "   npm run deploy"
echo ""
echo "3. Monitor the deployment:"
echo "   npm run logs"
