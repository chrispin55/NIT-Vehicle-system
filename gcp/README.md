# Google Cloud Integration Guide
# PROJECT KALI - ITVMS | NIT University Dar es Salaam

This guide explains how to set up and deploy the NIT University Vehicle Management System on Google Cloud Platform.

## 🏗️ Architecture Overview

The system is designed to run on Google Cloud Platform with the following components:

- **App Engine**: Web application hosting
- **Cloud SQL**: MySQL database
- **Cloud Storage**: File storage and backups
- **Secret Manager**: Secure credential storage
- **Cloud Build**: CI/CD pipeline
- **Cloud Logging**: Application logging

## 📋 Prerequisites

1. **Google Cloud Account** with billing enabled
2. **gcloud CLI** installed and configured
3. **Node.js 20+** installed locally
4. **Git** for version control

## 🚀 Quick Setup

### 1. Clone and Setup Project

```bash
git clone <repository-url>
cd nit-vehicle-management
npm install
```

### 2. Run Automated Setup

```bash
chmod +x gcp/deployment-setup.sh
./gcp/deployment-setup.sh
```

This script will:
- Enable required Google Cloud APIs
- Create Cloud SQL instance
- Create Cloud Storage bucket
- Set up service account
- Configure secrets
- Initialize App Engine

### 3. Initialize Database

```bash
npm run init-db
```

### 4. Deploy Application

```bash
npm run deploy
```

## 🔧 Manual Setup

### 1. Enable APIs

```bash
gcloud services enable sqladmin.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 2. Create Cloud SQL Instance

```bash
gcloud sql instances create nit-vehicle-db \
    --database-version=MYSQL_8_0 \
    --tier=db-f1-micro \
    --region=africa-east1 \
    --storage-size=10GB \
    --backup-start-time=02:00
```

### 3. Create Database

```bash
gcloud sql databases create nit_vehicle_management \
    --instance=nit-vehicle-db
```

### 4. Create Service Account

```bash
gcloud iam service-accounts create nit-vehicle-app \
    --display-name="PROJECT KALI ITVMS Service Account"

# Grant permissions
gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
    --member="serviceAccount:nit-vehicle-app@$(gcloud config get-value project).iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
    --member="serviceAccount:nit-vehicle-app@$(gcloud config get-value project).iam.gserviceaccount.com" \
    --role="roles/storage.objectAdmin"
```

### 5. Create Storage Bucket

```bash
gsutil mb -l africa-east1 gs://nit-vehicle-management-storage
```

## 🔐 Environment Configuration

### Development (.env)
```env
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
GOOGLE_CLOUD_PROJECT=nit-vehicle-management
GOOGLE_APPLICATION_CREDENTIALS=./gcp/service-account-key.json
```

### Production (.env.production)
```env
NODE_ENV=production
DB_CONNECTION_NAME=nit-vehicle-management:africa-east1:nit-vehicle-db
GOOGLE_CLOUD_PROJECT=nit-vehicle-management
GCS_BUCKET_NAME=nit-vehicle-management-storage
```

## 📊 Database Management

### Initialize Database
```bash
npm run init-db
```

### Connect to Cloud SQL
```bash
gcloud sql connect nit-vehicle-db --user=app_user
```

### Backup Database
```bash
gcloud sql backups create --instance=nit-vehicle-db
```

## 🗂️ Cloud Storage Usage

The system uses Cloud Storage for:
- File uploads and documents
- Database backups
- Static assets
- Export files

### Upload Files
```javascript
const cloudStorage = require('./gcp/cloud-storage');
await cloudStorage.uploadFile('./local-file.txt', 'remote-file.txt');
```

### Generate Signed URLs
```javascript
const url = await cloudStorage.getSignedUrl('file.pdf', 3600);
```

## 🔒 Secret Management

### Store Secrets
```bash
echo -n "your-secret" | gcloud secrets create secret-name --data-file=-
```

### Access Secrets
```javascript
const secretManager = require('./gcp/secret-manager');
const secret = await secretManager.getSecret('secret-name');
```

## 🚀 Deployment

### Deploy to App Engine
```bash
npm run deploy
```

### View Logs
```bash
npm run logs
```

### Scale Application
```bash
gcloud app services set-traffic --splits=default=1
gcloud app instances list
```

## 📈 Monitoring and Logging

### View Application Logs
```bash
gcloud app logs tail -s default
```

### Monitor Database Performance
```bash
gcloud sql instances describe nit-vehicle-db
```

### Check Storage Usage
```bash
gsutil du -sh gs://nit-vehicle-management-storage
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check Cloud SQL instance status
   - Verify service account permissions
   - Ensure database user exists

2. **Deployment Failed**
   - Check App Engine logs
   - Verify all required files are present
   - Ensure environment variables are set

3. **Storage Access Denied**
   - Verify bucket permissions
   - Check service account roles
   - Ensure bucket exists

### Debug Commands

```bash
# Check Cloud SQL status
gcloud sql instances list

# Check service account permissions
gcloud projects get-iam-policy $(gcloud config get-value project)

# Test database connection
npm run test:db

# View recent deployments
gcloud app versions list
```

## 📚 API Endpoints

Once deployed, the API will be available at:
```
https://nit-vehicle-management.uc.r.appspot.com
```

### Health Check
```
GET /health
```

### API Documentation
```
GET /api/docs
```

## 🔐 Security Best Practices

1. **Use Secret Manager** for all sensitive data
2. **Enable SSL/TLS** for all connections
3. **Regular Backups** of database and storage
4. **Monitor Access Logs** regularly
5. **Update Dependencies** regularly
6. **Use IAM Roles** with minimum required permissions

## 📞 Support

For technical support:
- Email: it-support@nit.ac.tz
- Documentation: Check this README
- Google Cloud Support: https://cloud.google.com/support

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
