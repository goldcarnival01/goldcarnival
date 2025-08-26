import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');

// Read the current .env file
let envContent = fs.readFileSync(envPath, 'utf8');

// Remove all duplicate entries and create a clean configuration
const cleanEnv = `# Database Configuration
DB_CONNECTION=postgres
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=gold_carnival
DB_USERNAME=postgres
DB_PASSWORD=Admin@123

# Email Configuration
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=256b0adcb18ba5
MAIL_PASSWORD=92e00241c2c27b
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="sankalp@hipster-inc.com"
MAIL_FROM_NAME="Gold Carnival"

# Application Configuration
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-in-production
REFRESH_TOKEN_EXPIRES_IN=1d

# Frontend URL
FRONTEND_URL=http://localhost:8080

# Backend URL
BACKEND_URL=https://gold-carnival-backend.onrender.com

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# NOWPayments Configuration (Production API Key)
NOWPAYMENTS_API_KEY=N6N5VX3-580MJNM-G48F2T8-JA81FVX
NOWPAYMENTS_IPN_SECRET=s0QkFewoVORf9ZQVFGvGnMnoKr2eQwJz

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

// Write the clean .env file
fs.writeFileSync(envPath, cleanEnv);

console.log('✅ .env file has been cleaned and fixed!');
console.log('📊 Database name changed from "gold-carnival" to "gold_carnival"');
console.log('🔄 Removed all duplicate entries'); 