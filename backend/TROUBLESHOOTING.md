# Database Connection Troubleshooting

## Current Issue: PostgreSQL Connection Terminated Unexpectedly

### Possible Causes:

1. **Database Service Not Running**
   - Check if your PostgreSQL service is active in Render dashboard
   - Ensure the database service is in "Active" state

2. **Environment Variables Missing/Incorrect**
   - Verify all database environment variables are set in Render
   - Check for typos in database credentials

3. **Network/Firewall Issues**
   - Render services might have network restrictions
   - Database might be blocking connections

4. **SSL Configuration Issues**
   - PostgreSQL on Render requires SSL
   - SSL certificate validation might be failing

### Quick Fixes to Try:

#### 1. Check Environment Variables in Render
Go to your Render service → Environment and verify:
```
DB_HOST=dpg-d26f9sogjchc73aohk90-a.oregon-postgres.render.com
DB_PORT=5432
DB_DATABASE=jumboticket
DB_USERNAME=jumbo_user
DB_PASSWORD=your-actual-password
```

#### 2. Test Database Connection Locally
Create a test script to verify database connectivity:

```javascript
// test-db.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

try {
  await sequelize.authenticate();
  console.log('✅ Connection successful!');
} catch (error) {
  console.error('❌ Connection failed:', error);
}
```

#### 3. Alternative Database Configuration
If the issue persists, try this simplified configuration:

```javascript
// In src/config/database.js
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 1,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
```

#### 4. Use External Database (Alternative)
If Render's PostgreSQL continues to fail:
- Use PlanetScale (free MySQL)
- Use Railway (free PostgreSQL)
- Use Supabase (free PostgreSQL)

### Steps to Reinitialize Git and Push Changes:

1. **Navigate to backend directory:**
   ```bash
   cd gold-carnival/backend
   ```

2. **Initialize Git:**
   ```bash
   git init
   git add .
   git commit -m "Fix database connection and add PostgreSQL support"
   ```

3. **Add remote and push:**
   ```bash
   git remote add origin https://github.com/vipinrawat01/jumboticket.git
   git branch -M main
   git push -u origin main --force
   ```

### Database Connection Checklist:
- ✅ PostgreSQL service is running in Render
- ✅ All environment variables are set correctly
- ✅ Database credentials are valid
- ✅ Network connectivity between services
- ✅ SSL configuration is correct
- ✅ Updated code is pushed to GitHub

### Next Steps:
1. Push the updated code with retry logic
2. Check Render logs for detailed error messages
3. Verify database service status
4. Test with external database if needed 