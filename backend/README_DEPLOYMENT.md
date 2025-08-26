# Deploy Backend to Render - Free Tier

## Prerequisites
1. GitHub account with your backend code pushed
2. Render account (free tier)
3. Database service (PostgreSQL recommended for Render, MySQL also supported)
4. Redis service (optional but recommended)

## Step-by-Step Deployment Guide

### 1. Prepare Your Repository
- Ensure your backend folder is in a GitHub repository
- Make sure all dependencies are in `package.json`
- Verify `src/server.js` is your main entry point

### 2. Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Verify your email

### 3. Deploy Backend Service

#### Option A: Using render.yaml (Recommended)
1. In your repository, ensure `render.yaml` exists
2. Go to Render Dashboard → "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect and deploy using `render.yaml`

#### Option B: Manual Deployment
1. Go to Render Dashboard → "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `gold-carnival-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### 4. Set Environment Variables
In Render Dashboard → Your Service → Environment:

```
NODE_ENV=production
PORT=10000
DB_HOST=your-database-host
DB_PORT=5432 (for PostgreSQL) or 3306 (for MySQL)
DB_DATABASE=your-database-name
DB_USERNAME=your-database-username
DB_PASSWORD=your-database-password
REDIS_URL=your-redis-url
JWT_SECRET=your-secure-jwt-secret
FRONTEND_URL=https://your-frontend-domain.com
```

### 5. Database Setup Options

#### Option A: Render PostgreSQL (Recommended)
1. Create new PostgreSQL service in Render
2. Use the provided connection details in environment variables
3. Database will be automatically created
4. **Note**: PostgreSQL is automatically detected and SSL is configured

#### Option B: Render MySQL
1. Create new MySQL service in Render
2. Use the provided connection details in environment variables
3. Database will be automatically created

#### Option C: External Database
- Use services like PlanetScale, Railway, or your own database server
- Update environment variables accordingly

### 6. Redis Setup (Optional)
- Use Redis Cloud (free tier) or Render Redis
- Add Redis URL to environment variables

### 7. Deploy and Test
1. Click "Deploy" in Render
2. Wait for build to complete
3. Test your API endpoints:
   - Health check: `https://your-app-name.onrender.com/health`
   - API endpoints: `https://your-app-name.onrender.com/api/...`

## Important Notes

### Free Tier Limitations
- **Sleep after 15 minutes of inactivity**
- **512 MB RAM**
- **Shared CPU**
- **750 hours/month**

### Database Support
- **PostgreSQL**: Fully supported with automatic SSL configuration
- **MySQL**: Supported with mysql2 driver
- **Auto-detection**: Database type is automatically detected based on host

### Environment Variables Required
- All database credentials
- JWT secret
- Frontend URL for CORS
- Email configuration (if using email features)

### Troubleshooting
1. **Build fails**: Check `package.json` and dependencies
2. **Database connection fails**: 
   - Verify environment variables
   - Check if database service is running
   - For PostgreSQL: SSL is automatically configured
3. **CORS errors**: Update `FRONTEND_URL` environment variable
4. **Service sleeps**: First request after inactivity will be slow

### Custom Domain (Optional)
1. Go to your service settings
2. Add custom domain
3. Configure DNS records

## API Endpoints Available
- `GET /health` - Health check
- `POST /api/auth/*` - Authentication
- `GET /api/jackpots` - Jackpot data
- `GET /api/settings` - App settings
- And more based on your routes

## Monitoring
- Render provides basic logs and metrics
- Check logs for errors during deployment
- Monitor service status in dashboard

## Recent Fixes
- ✅ Added PostgreSQL support with automatic detection
- ✅ Added SSL configuration for Render PostgreSQL
- ✅ Added `pg` and `pg-hstore` dependencies
- ✅ Enhanced database connection logging 