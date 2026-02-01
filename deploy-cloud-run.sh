#!/bin/bash

# NIT ITVMS - Google Cloud Run Deployment Script
# This script deploys the application to Google Cloud Run using Docker

echo "🚀 Starting NIT ITVMS Cloud Run Deployment..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK is not installed. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get project information
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No Google Cloud project set. Please run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📋 Project ID: $PROJECT_ID"

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable sql-component.googleapis.com

# Build and deploy using Cloud Build
echo "🏗️ Building and deploying with Cloud Build..."
gcloud builds submit --config cloudbuild-run.yaml

# Get the deployed service URL
SERVICE_URL=$(gcloud run services describe nit-itvms --region=us-central1 --format='value(status.url)')

echo "✅ Deployment completed!"
echo "🌐 Application URL: $SERVICE_URL"
echo "🔍 Health check: $SERVICE_URL/api/health"

# Open the application in browser (optional)
echo "🌐 Opening application in browser..."
if command -v open &> /dev/null; then
    open "$SERVICE_URL"
elif command -v xdg-open &> /dev/null; then
    xdg-open "$SERVICE_URL"
else
    echo "Please manually open: $SERVICE_URL"
fi

echo "🎉 NIT ITVMS is now running on Cloud Run!"
