# Deploy Frontend to Render - Free Tier

## Prerequisites
1. GitHub account with your frontend code pushed
2. Render account (free tier)
3. Backend API URL: `https://gold-carnival-backend.onrender.com`

## Step-by-Step Deployment Guide

### 1. Prepare Your Repository
- Ensure your frontend folder is in a GitHub repository
- Make sure all dependencies are in `package.json`
- Verify `vite.config.ts` is properly configured

### 2. Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Verify your email

### 3. Deploy Frontend Service

#### Option A: Using render.yaml (Recommended)
1. In your repository, ensure `render.yaml` exists
2. Go to Render Dashboard → "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect and deploy using `render.yaml`

#### Option B: Manual Deployment
1. Go to Render Dashboard → "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `gold-carnival-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: `Free`

### 4. Set Environment Variables
In Render Dashboard → Your Service → Environment:

```
VITE_API_URL=https://gold-carnival-backend.onrender.com
```

### 5. Update API Configuration
The API configuration is already set up to use the environment variable:

```typescript
// In src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:3000/api';
```

### 6. Deploy and Test
1. Click "Deploy" in Render
2. Wait for build to complete
3. Test your frontend:
   - Visit your frontend URL
   - Test API connections to backend
   - Verify routing works correctly

## Important Notes

### Free Tier Limitations
- **Sleep after 15 minutes of inactivity**
- **512 MB RAM**
- **Shared CPU**
- **750 hours/month**

### Environment Variables Required
- `VITE_API_URL=https://gold-carnival-backend.onrender.com`

### Build Optimization
- Static files are served from `dist` folder
- React Router is configured for SPA routing
- `_redirects` file handles client-side routing

### Troubleshooting
1. **Build fails**: Check `package.json` and dependencies
2. **API calls fail**: Verify `VITE_API_URL` environment variable
3. **Routing issues**: Check `_redirects` file
4. **CORS errors**: Ensure backend allows frontend domain

### Custom Domain (Optional)
1. Go to your service settings
2. Add custom domain
3. Configure DNS records

## Frontend Features
- ✅ React 18 with TypeScript
- ✅ Vite for fast builds
- ✅ Tailwind CSS for styling
- ✅ shadcn/ui components
- ✅ React Router for navigation
- ✅ Axios for API calls
- ✅ React Query for data fetching

## Monitoring
- Render provides basic logs and metrics
- Check build logs for errors
- Monitor service status in dashboard

## Quick Commands

### Local Development
```bash
cd frontend
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

## Deployment Checklist
- ✅ Frontend code is in GitHub repository
- ✅ `render.yaml` is configured with correct backend URL
- ✅ Environment variables are set
- ✅ API URL points to deployed backend: `https://gold-carnival-backend.onrender.com`
- ✅ Build command works locally
- ✅ Static files are generated in `dist` folder

## Backend Integration
- **Backend URL**: `https://gold-carnival-backend.onrender.com`
- **API Endpoints**: Available at `/api/*`
- **Health Check**: `https://gold-carnival-backend.onrender.com/health` 