# NIT ITVMS - Google Cloud Deployment Options

You now have **TWO** deployment options for Google Cloud Platform:

## 🚀 Option 1: App Engine (Recommended for Beginners)

### ✅ **When to Use App Engine:**
- **Simpler deployment** - No Docker knowledge needed
- **Built-in scaling** - Automatic scaling and load balancing
- **Lower cost** - Pay only for what you use
- **Easy maintenance** - Google manages the infrastructure

### 📋 **Deployment Steps:**
```bash
# 1. Set up Google Cloud
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable appengine.googleapis.com

# 2. Create App Engine app (once per project)
gcloud app create --region=us-central1

# 3. Deploy to App Engine
npm run deploy
# or
gcloud app deploy
```

### 📁 **Files Used:**
- `app.yaml` - App Engine configuration
- `server.js` - Main application server
- `frontend/` - Frontend files

---

## 🐳 Option 2: Cloud Run (Advanced)

### ✅ **When to Use Cloud Run:**
- **Custom Docker environment** - Full control over runtime
- **Container-based** - Portable across platforms
- **Flexible scaling** - Scale to zero when not used
- **Advanced networking** - More networking options

### 📋 **Deployment Steps:**
```bash
# 1. Set up Google Cloud
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 2. Deploy to Cloud Run
npm run deploy:cloud-run
# or
./deploy-cloud-run.sh
```

### 📁 **Files Used:**
- `Dockerfile` - Container configuration
- `.dockerignore` - Files to exclude from container
- `cloudbuild-run.yaml` - Cloud Build configuration
- `deploy-cloud-run.sh` - Automated deployment script

---

## 🔍 **Comparison**

| Feature | App Engine | Cloud Run |
|---------|------------|-----------|
| **Complexity** | ⭐ Easy | ⭐⭐⭐ Advanced |
| **Docker Required** | ❌ No | ✅ Yes |
| **Cost** | 💰 Lower | 💰💰 Higher |
| **Control** | 🎛️ Limited | 🎛️ Full |
| **Portability** | 📦 GCP only | 📦 Any cloud |
| **Scaling** | 📈 Automatic | 📈 Configurable |

---

## 🎯 **Recommendation**

### **For Most Users:**
👉 **Use App Engine** - It's simpler, cheaper, and perfect for this application.

### **For Advanced Users:**
👉 **Use Cloud Run** - If you need custom Docker configuration or want to learn containers.

---

## 🚨 **Important Notes**

### **Environment Variables:**
Both options require setting environment variables in Google Cloud Console:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`, `FRONTEND_URL`

### **Database:**
Both options work with Google Cloud SQL - create the database instance first.

### **Frontend:**
Both options serve the same frontend from the `frontend/` directory.

---

## 🔧 **Quick Start Commands**

### **App Engine (Recommended):**
```bash
npm run deploy
```

### **Cloud Run (Advanced):**
```bash
chmod +x deploy-cloud-run.sh
./deploy-cloud-run.sh
```

---

## 📞 **Need Help?**

- **App Engine issues**: Check `QUICK-DEPLOY-GCP.md`
- **Cloud Run issues**: Check deployment logs
- **Database issues**: Ensure Cloud SQL instance is running

Choose the option that best fits your needs and technical comfort level! 🎉
