# Gold Carnival Backend

A comprehensive Node.js/Express backend for the Gold Carnival lottery platform with real-time features, cryptocurrency payments, and referral system.

## 🚀 Features

- **User Authentication**: JWT-based authentication with refresh tokens
- **Lottery System**: Jackpot management with real-time draw timers
- **Wallet System**: Multi-wallet support (Deposit, Winnings, Ticket Bonus)
- **Payment Integration**: Cryptocurrency deposit/withdrawal support
- **Referral System**: 10% commission on referrals
- **Real-time Updates**: WebSocket integration for live draws
- **Email Notifications**: Automated email system
- **Caching**: Redis-based caching for performance
- **Security**: Rate limiting, input validation, SQL injection protection

## 🛠️ Tech Stack

- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Cache**: Redis
- **Authentication**: JWT with refresh tokens
- **Real-time**: Socket.IO
- **Email**: Nodemailer
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- Redis (v6.0 or higher)
- npm or yarn

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment file and configure your settings:

```bash
cp env.example .env
```

Update the `.env` file with your configuration:

```env
# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=new-eureka
DB_USERNAME=admin
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
REFRESH_TOKEN_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:8080

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Create the MySQL database:

```sql
CREATE DATABASE `new-eureka` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "memberId": "USER123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "referralCode": "JUMBO123456" // optional
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "user@example.com", // email or memberId
  "password": "password123"
}
```

#### Refresh Token
```
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### User Management

#### Get User Profile
```
GET /api/user/profile
Authorization: Bearer <access-token>
```

#### Update Profile
```
PUT /api/user/profile
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

### Jackpot Endpoints

#### Get All Jackpots
```
GET /api/jackpots
```

#### Get Specific Jackpot
```
GET /api/jackpots/:id
```

#### Get Jackpot Statistics
```
GET /api/jackpots/:id/stats
```

### Ticket Endpoints

#### Purchase Ticket
```
POST /api/tickets/purchase
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "jackpotId": 1,
  "quantity": 2
}
```

#### Get User Tickets
```
GET /api/tickets/my-tickets?page=1&limit=10&status=active
Authorization: Bearer <access-token>
```

### Wallet Endpoints

#### Get Wallet Balance
```
GET /api/wallet/balance
Authorization: Bearer <access-token>
```

#### Deposit Funds
```
POST /api/wallet/deposit
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "amount": 100.00,
  "cryptoType": "USDT",
  "cryptoAddress": "TRC20_ADDRESS",
  "gateway": "gateway_1"
}
```

#### Withdraw Funds
```
POST /api/wallet/withdraw
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "amount": 50.00,
  "cryptoType": "USDT",
  "cryptoAddress": "TRC20_ADDRESS"
}
```

### Referral Endpoints

#### Get Referral Statistics
```
GET /api/referrals/stats
Authorization: Bearer <access-token>
```

#### Get Referral Link
```
GET /api/referrals/link
Authorization: Bearer <access-token>
```

## 🔧 Database Schema

### Core Tables

- **users**: User accounts and profiles
- **wallets**: Multi-wallet system (deposit, winnings, ticket_bonus)
- **jackpots**: Lottery jackpot management
- **tickets**: User ticket purchases
- **transactions**: All financial transactions
- **winners**: Winning ticket records

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS protection
- Helmet security headers
- SQL injection protection via Sequelize

## 📧 Email Templates

The system includes automated email templates for:
- Welcome emails
- Password reset
- Ticket purchase confirmation
- Winner notifications
- Deposit confirmations
- Commission notifications

## 🔄 Real-time Features

WebSocket events for:
- Live draw timer updates
- New winner announcements
- Wallet balance updates
- Jackpot status changes

## 🚀 Deployment

### Production Setup

1. Set environment variables for production
2. Use PM2 for process management
3. Configure Nginx reverse proxy
4. Set up SSL certificates
5. Configure database backups

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Monitoring

- Health check endpoint: `GET /health`
- Database connection monitoring
- Redis connection monitoring
- Error logging and tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions, please contact the development team. 