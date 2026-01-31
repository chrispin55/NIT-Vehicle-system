# PROJECT KALI - ITVMS
**Integrated Transport & Vehicle Management System**  
NIT University Dar es Salaam

## Overview
PROJECT KALI is a comprehensive vehicle management system designed for NIT University Dar es Salaam to manage university vehicles, drivers, trips, maintenance, and fuel records efficiently.

## Features
- 🚗 **Vehicle Management** - Add, update, and track university vehicles
- 👨‍✈️ **Driver Management** - Manage driver information and assignments
- 🛣️ **Trip Management** - Schedule and track vehicle trips
- 🔧 **Maintenance Tracking** - Monitor vehicle maintenance and service records
- ⛽ **Fuel Management** - Track fuel consumption and costs
- 📊 **Reports & Analytics** - Generate comprehensive reports
- 🔐 **Authentication & Authorization** - Secure user management with role-based access

## Technology Stack
- **Backend**: Node.js, Express.js
- **Database**: MySQL (with Railway MySQL support)
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting, bcryptjs

## Deployment

### Railway.app Deployment
1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Railway Project**
   ```bash
   railway init
   ```

4. **Add MySQL Service**
   ```bash
   railway add mysql
   ```

5. **Deploy Application**
   ```bash
   railway up
   ```

### Environment Variables for Railway
Set these environment variables in your Railway project:
- `NODE_ENV=production`
- `JWT_SECRET` (generate a secure random string)
- `ENCRYPTION_KEY` (generate a secure random string)
- `API_KEY` (generate a secure random string)

### Local Development
1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local database configuration
   ```

3. **Initialize Database**
   ```bash
   npm run init-db
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Database Configuration

### Railway MySQL
The application automatically detects Railway environment variables:
- `RAILWAY_PRIVATE_MYSQL_HOST`
- `RAILWAY_PRIVATE_MYSQL_USER`
- `RAILWAY_PRIVATE_MYSQL_PASSWORD`
- `RAILWAY_PRIVATE_MYSQL_DATABASE_NAME`
- `RAILWAY_PRIVATE_MYSQL_PORT`

### Local MySQL
Update your `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nit_vehicle_management
DB_PORT=3306
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/logout` - Logout

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get vehicle by ID
- `POST /api/vehicles` - Create new vehicle (Admin/Manager)
- `PUT /api/vehicles/:id` - Update vehicle (Admin/Manager)
- `DELETE /api/vehicles/:id` - Delete vehicle (Admin)
- `GET /api/vehicles/stats` - Get vehicle statistics

### Drivers
- `GET /api/drivers` - Get all drivers
- `GET /api/drivers/:id` - Get driver by ID
- `POST /api/drivers` - Create new driver (Admin/Manager)
- `PUT /api/drivers/:id` - Update driver (Admin/Manager)
- `DELETE /api/drivers/:id` - Delete driver (Admin)
- `GET /api/drivers/stats` - Get driver statistics

### Trips
- `GET /api/trips` - Get all trips
- `GET /api/trips/:id` - Get trip by ID
- `POST /api/trips` - Create new trip (Admin/Manager)
- `PUT /api/trips/:id` - Update trip (Admin/Manager)
- `DELETE /api/trips/:id` - Delete trip (Admin)
- `GET /api/trips/stats` - Get trip statistics

### Maintenance
- `GET /api/maintenance` - Get maintenance records
- `GET /api/maintenance/:id` - Get maintenance record by ID
- `POST /api/maintenance` - Create maintenance record
- `PUT /api/maintenance/:id` - Update maintenance record
- `DELETE /api/maintenance/:id` - Delete maintenance record

### Fuel
- `GET /api/fuel` - Get fuel records
- `GET /api/fuel/:id` - Get fuel record by ID
- `POST /api/fuel` - Create fuel record
- `PUT /api/fuel/:id` - Update fuel record
- `DELETE /api/fuel/:id` - Delete fuel record

### Reports
- `GET /api/reports/dashboard` - Get dashboard data
- `GET /api/reports/vehicles` - Get vehicle reports
- `GET /api/reports/drivers` - Get driver reports
- `GET /api/reports/trips` - Get trip reports
- `GET /api/reports/fuel` - Get fuel reports

## Default Credentials
- **Username**: admin
- **Password**: nit2023

⚠️ **Important**: Change the default password after first login in production environment.

## Project Structure
```
├── controllers/          # API controllers
├── database/            # Database configuration and initialization
├── middleware/          # Express middleware
├── routes/             # API routes
├── css/                # Stylesheets
├── js/                 # Frontend JavaScript
├── gcp/                # Google Cloud configuration
├── docs/               # Documentation
├── index.html          # Main frontend file
├── server.js           # Express server
├── package.json        # Node.js dependencies
├── railway.json        # Railway deployment configuration
├── Procfile            # Heroku/Railway process file
└── .env.example        # Environment variables template
```

## Security Features
- JWT-based authentication
- Role-based access control (Admin, Manager, Driver, User)
- Password hashing with bcryptjs
- Rate limiting to prevent abuse
- CORS configuration
- Helmet.js for security headers
- Input validation and sanitization

## Health Check
The application includes a health check endpoint:
- `GET /health` - Returns application status and environment info

## Support
For support and inquiries, contact:
- **NIT University Dar es Salaam**
- **IT Department**

## License
MIT License - © NIT University Dar es Salaam