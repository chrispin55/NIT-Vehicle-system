# NIT University - Integrated Transport & Vehicle Management System (ITVMS)

**PROJECT KALI** - A comprehensive transport management system for NIT University Dar es Salaam.

## 🚀 Features

### Core Modules
- **Dashboard** - Real-time statistics and overview
- **Vehicle Management** - Add, update, and manage university vehicles
- **Driver Management** - Manage driver information and assignments
- **Trip Management** - Schedule and track vehicle trips
- **Maintenance Tracking** - Track vehicle maintenance and service history
- **Reports & Analytics** - Generate comprehensive reports

### Technical Features
- **RESTful API** - Complete backend API with Express.js
- **MySQL Database** - Robust data storage with proper relationships
- **Authentication System** - Secure user authentication with JWT
- **Real-time Updates** - Live data synchronization
- **Responsive Design** - Mobile-friendly interface
- **Data Validation** - Input validation and error handling
- **Security Features** - Rate limiting, CORS, helmet security

## 🌐 Deployment Options

### 🏠 Local Development
- Traditional setup with local MySQL database
- Perfect for development and testing

### ☁️ Google Cloud Platform Deployment ⭐ **Recommended**
- **App Engine** - Scalable hosting platform
- **Cloud SQL** - Managed MySQL database
- **Automatic SSL Certificates** - Secure HTTPS by default
- **Zero-Configuration Deployment** - Deploy with automated scripts
- **Built-in Monitoring** - Health checks and logging
- **Scalable Infrastructure** - Automatic scaling based on demand
- **Cost-Effective** - Free tier available for moderate usage

## �🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database (Local or Google Cloud SQL)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5, CSS3, JavaScript** - Core technologies
- **Bootstrap 5** - UI framework
- **Chart.js** - Data visualization
- **Font Awesome** - Icons

### Deployment
- **Railway** - Cloud platform (Recommended)
- **GitHub** - Version control and CI/CD

## 📋 Prerequisites

### For Local Development
- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- npm or yarn package manager

### For Railway Deployment
- Railway account (https://railway.app)
- GitHub account
- Git installed locally

## 🚀 Quick Start

### 🏠 Local Development

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd "NIT university"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   ```sql
   CREATE DATABASE nit_itvms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   mysql -u your_username -p nit_itvms < database/schema.sql
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Start the Application**
   ```bash
   npm run dev
   ```

### 🚂 Railway Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - NIT ITVMS"
   git branch -M main
   git remote add origin https://github.com/your-username/nit-itvms.git
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Set environment variables:
     - `JWT_SECRET` (required)
     - `MYSQL_ROOT_PASSWORD` (required)

3. **Access Your Application**
   - Railway will provide you with a live URL
   - Database is automatically created and configured

📖 **For detailed Railway deployment instructions, see [DEPLOYMENT-RAILWAY.md](DEPLOYMENT-RAILWAY.md)**

## 📁 Project Structure

```
NIT university/
├── backend/
│   ├── config/
│   │   ├── database.js          # Local database config
│   │   └── database-railway.js  # Railway database config
│   ├── models/                  # Data models
│   ├── routes/                  # API routes
│   └── utils/                   # Utility functions
├── database/
│   ├── schema.sql               # Local database schema
│   └── schema-railway.sql       # Railway database schema
├── frontend/
│   ├── js/                      # Frontend JavaScript modules
│   └── css/                     # Custom styles
├── server.js                    # Local development server
├── server-railway.js            # Railway production server
├── railway.toml                 # Railway deployment config
├── package.json                 # Node.js dependencies
├── .env.example                 # Environment template
├── .env.railway                 # Railway environment template
├── README.md                    # This file
└── DEPLOYMENT-RAILWAY.md        # Railway deployment guide
```

## 🔐 Default Login Credentials

### Administrator
- **Username**: admin
- **Password**: password

### Manager
- **Username**: jmanager
- **Password**: password

*⚠️ Change these passwords in production environment!*

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Drivers
- `GET /api/drivers` - Get all drivers
- `POST /api/drivers` - Create new driver
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver

### Trips
- `GET /api/trips` - Get all trips
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Maintenance
- `GET /api/maintenance` - Get all maintenance records
- `POST /api/maintenance` - Create maintenance record
- `PUT /api/maintenance/:id` - Update maintenance record
- `DELETE /api/maintenance/:id` - Delete maintenance record

### Reports
- `GET /api/reports/dashboard` - Get dashboard data
- `GET /api/reports/fuel-consumption` - Fuel consumption report
- `GET /api/reports/trip-summary` - Trip summary report
- `GET /api/reports/vehicle-utilization` - Vehicle utilization report

## 🏥 Health Check

The application includes a health check endpoint:
- **Local**: http://localhost:3000/api/health
- **Railway**: https://your-app.up.railway.app/api/health

## 🔧 Development Scripts

```bash
# Local development
npm run dev              # Start with local database
npm run dev:railway      # Start with Railway database config

# Production
npm start                # Start production server (Railway)
npm test                 # Run tests
npm run build            # Build (no-op for this project)
```

## 🐛 Troubleshooting

### Local Development Issues
1. **Database Connection Error**
   - Check MySQL server is running
   - Verify database credentials in `.env`
   - Ensure database `nit_itvms` exists

2. **Port Already in Use**
   - Change port in `.env` file
   - Kill process: `netstat -ano | findstr :3000`

### Railway Deployment Issues
1. **Build Failures**
   - Check Railway build logs
   - Ensure `package.json` is correct
   - Verify `start` script points to `server-railway.js`

2. **Database Issues**
   - Check if MySQL service is running in Railway
   - Verify environment variables are set
   - Check deployment logs

📖 **For complete Railway troubleshooting, see [DEPLOYMENT-RAILWAY.md](DEPLOYMENT-RAILWAY.md)**

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support and queries:
- **Email**: support@nit.ac.tz
- **Phone**: +255 123 456 789
- **Location**: NIT University, Dar es Salaam, Tanzania
- **GitHub**: Create issues in the repository

---

## 🎉 Choose Your Deployment Method

### 🏠 **For Development & Testing**
Use local development with your own MySQL database.

### 🚂 **For Production** ⭐ **Recommended**
Deploy to Railway for:
- ✅ **Managed Database** - No database maintenance
- ✅ **Automatic SSL** - Secure HTTPS by default  
- ✅ **Zero Config** - Deploy in minutes
- ✅ **Built-in Monitoring** - Health checks & logs
- ✅ **Auto-scaling** - Handle traffic spikes
- ✅ **Global CDN** - Fast content delivery

**Deploy to Railway now:** [DEPLOYMENT-RAILWAY.md](DEPLOYMENT-RAILWAY.md) 🚀

---

**© 2023 NIT University Dar es Salaam. All rights reserved.**
#   N I T - V e h i c l e - s y s t e m 
 
 