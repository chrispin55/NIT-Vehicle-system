# Quick Google Cloud Deployment Guide

## 🚨 Deployment Issue Fix

The error "Dockerfile not found" occurs because you're deploying to the wrong Google Cloud service. 

**You need to deploy to App Engine, not Cloud Run or Firestore.**

## ✅ Correct Deployment Steps

### 1. Set Up Google Cloud Project
```bash
# Install Google Cloud SDK if not already installed
# https://cloud.google.com/sdk/docs/install

# Login and set project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable appengine.googleapis.com
gcloud services enable sql-component.googleapis.com
```

### 2. Create App Engine Application
```bash
# Create App Engine app (only once per project)
gcloud app create --region=us-central1
```

### 3. Deploy to App Engine (NOT Cloud Run)
```bash
# Deploy to App Engine using app.yaml
gcloud app deploy

# OR use the npm script
npm run deploy
```

## ❌ What NOT To Do

- ❌ Don't use `gcloud run deploy` (this looks for Dockerfile)
- ❌ Don't deploy to Firestore (this is a database, not hosting)
- ❌ Don't use Cloud Build directly for deployment

## ✅ What To Do

- ✅ Use `gcloud app deploy` (App Engine deployment)
- ✅ Ensure app.yaml exists in project root
- ✅ Deploy to App Engine (Node.js runtime)

## 🔧 Verify App Engine Configuration

Your app.yaml should be in the project root and contain:
```yaml
runtime: nodejs20
instance_class: F2
# ... other configuration
```

## 🚀 One-Command Deployment

If you have the automated script:
```bash
chmod +x scripts/deploy-gcp.sh
./scripts/deploy-gcp.sh
```

## 📊 Check Deployment Status

```bash
# Check App Engine status
gcloud app describe

# View logs
gcloud app logs tail -s default

# Browse to app
gcloud app browse
```

## 🔍 Troubleshooting

### If you still get Dockerfile errors:
1. Ensure you're in the correct project directory
2. Check that app.yaml exists in the root
3. Use `gcloud app deploy` specifically (not `gcloud deploy`)
4. Verify App Engine API is enabled

### If deployment fails:
1. Check logs: `gcloud app logs tail -s default`
2. Verify environment variables in GCP Console
3. Ensure all dependencies are in package.json

## 🎯 Success Indicators

✅ You should see:
- "Service is running on App Engine"
- Application URL: https://your-project.appspot.com
- Health check: https://your-project.appspot.com/api/health

❌ You should NOT see:
- "Dockerfile not found"
- "deployment failed on google firestore"
- Container-related errors

## 📞 Need Help?

1. Check you're using `gcloud app deploy`
2. Verify app.yaml is in project root
3. Ensure App Engine API is enabled
4. Check deployment logs for specific errors
