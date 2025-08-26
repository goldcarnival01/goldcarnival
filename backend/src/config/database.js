import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Determine database type and configuration
const isPostgres = process.env.DB_CONNECTION === 'postgres' || process.env.DB_HOST?.includes('postgres') || process.env.DB_HOST?.includes('render.com');
const dialect = isPostgres ? 'postgres' : 'mysql';

// Database configuration with fallback options
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  dialect: dialect,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 1, // Reduced for better stability
    min: 0,
    acquire: 60000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
};

// Add SSL configuration for PostgreSQL (only for remote connections)
if (isPostgres && process.env.DB_HOST !== 'localhost') {
  dbConfig.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000
  };
} else if (isPostgres) {
  // Local PostgreSQL connection without SSL
  dbConfig.dialectOptions = {
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000
  };
}

export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

// Test database connection with comprehensive retry logic
export const testConnection = async () => {
  const maxRetries = 5;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      console.log(`🔄 Attempting database connection (attempt ${retryCount + 1}/${maxRetries})...`);
      console.log(`📊 Database: ${process.env.DB_DATABASE} on ${process.env.DB_HOST}:${process.env.DB_PORT}`);
      
      await sequelize.authenticate();
      console.log('✅ Database connection has been established successfully.');
      console.log('Database config:', {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE,
        username: process.env.DB_USERNAME,
        dialect: dialect,
        ssl: isPostgres ? 'enabled' : 'disabled',
        nodeEnv: process.env.NODE_ENV,
        render: process.env.RENDER ? 'true' : 'false'
      });
      return;
    } catch (error) {
      retryCount++;
      console.error(`❌ Database connection attempt ${retryCount} failed:`, error.message);
      
      if (retryCount >= maxRetries) {
        console.error('❌ All database connection attempts failed.');
        console.error('💡 Troubleshooting tips:');
        console.error('   1. Check if database service is running');
        console.error('   2. Verify environment variables are correct');
        console.error('   3. Check network connectivity');
        console.error('   4. Consider using external database service');
        
        // Don't throw error, let the app start without database
        console.log('⚠️  Starting server without database connection...');
        return;
      }
      
      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.log(`⏳ Waiting ${delay/1000} seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}; 