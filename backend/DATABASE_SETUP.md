# Database Setup Guide

## Current Issue
Render's PostgreSQL service is having connection issues. Here are alternative database solutions:

## Option 1: PlanetScale (MySQL) - Recommended
**Free tier with 1GB storage**

1. **Sign up at [planetscale.com](https://planetscale.com)**
2. **Create new database:**
   - Database name: `jumboticket`
   - Region: Choose closest to you
3. **Get connection details:**
   ```
   DB_HOST=aws.connect.psdb.cloud
   DB_PORT=3306
   DB_DATABASE=jumboticket
   DB_USERNAME=your-username
   DB_PASSWORD=your-password
   ```

## Option 2: Railway (PostgreSQL)
**Free tier with $5 credit**

1. **Sign up at [railway.app](https://railway.app)**
2. **Create PostgreSQL service**
3. **Get connection details from Railway dashboard**

## Option 3: Supabase (PostgreSQL)
**Free tier with 500MB**

1. **Sign up at [supabase.com](https://supabase.com)**
2. **Create new project**
3. **Get connection details from Settings → Database**

## Option 4: Neon (PostgreSQL)
**Free tier with 3GB**

1. **Sign up at [neon.tech](https://neon.tech)**
2. **Create new project**
3. **Get connection string from dashboard**

## Environment Variables Setup

### For MySQL (PlanetScale):
```
DB_HOST=aws.connect.psdb.cloud
DB_PORT=3306
DB_DATABASE=jumboticket
DB_USERNAME=your-username
DB_PASSWORD=your-password
```

### For PostgreSQL (Railway/Supabase/Neon):
```
DB_HOST=your-postgres-host
DB_PORT=5432
DB_DATABASE=your-database
DB_USERNAME=your-username
DB_PASSWORD=your-password
```

## Quick Setup Steps:

1. **Choose a database provider** (PlanetScale recommended)
2. **Create database and get credentials**
3. **Update Render environment variables**
4. **Redeploy your backend**

## Database Migration (if needed):
If you have existing data, you can export/import:
- **MySQL**: Use mysqldump
- **PostgreSQL**: Use pg_dump

## Testing Connection:
The updated code will automatically retry connections and provide detailed logs. 