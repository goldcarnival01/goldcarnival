# Gold Carnival - Project Summary

## 🎯 Project Overview

**Gold Carnival** is a comprehensive lottery/ticket purchasing platform with real-time features, cryptocurrency payments, and a referral system. The project consists of a React frontend and Node.js backend with MySQL database.

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Location**: `frontend/`
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/ui components
- **Styling**: Tailwind CSS
- **State Management**: React Context + TanStack Query
- **Routing**: React Router DOM
- **Authentication**: JWT with refresh tokens

### Backend (Node.js + Express)
- **Location**: `backend/`
- **Framework**: Express.js with ES6 modules
- **Database**: MySQL with Sequelize ORM
- **Cache**: Redis for sessions and caching
- **Authentication**: JWT with refresh tokens
- **Real-time**: Socket.IO for live updates
- **Email**: Nodemailer with templates
- **Security**: Helmet, CORS, Rate limiting

## 🚀 Key Features Implemented

### ✅ Authentication System
- JWT-based authentication with refresh tokens
- User registration with referral codes
- Password reset functionality
- Protected routes
- Token blacklisting for logout

### ✅ User Management
- User profiles with member IDs
- Multi-wallet system (Deposit, Winnings, Ticket Bonus)
- Profile completion tracking
- Account status management

### ✅ Lottery System
- Multiple jackpot tiers (Mega, Royal, Jumbo)
- Real-time draw timers
- Ticket purchasing system
- Winner selection and tracking
- Jackpot statistics

### ✅ Payment System
- Cryptocurrency deposit/withdrawal
- Multiple crypto support (Bitcoin, USDT, Ethereum, etc.)
- Transaction history and tracking
- Wallet balance management

### ✅ Referral System
- 10% commission on referrals
- Referral link generation
- Commission tracking
- Referral statistics

### ✅ Real-time Features
- Live draw countdown
- Winner announcements
- Wallet balance updates
- WebSocket integration

### ✅ Email Notifications
- Welcome emails
- Password reset
- Ticket purchase confirmations
- Winner notifications
- Commission notifications

## 📊 Database Schema

### Core Tables
- **users**: User accounts and profiles
- **wallets**: Multi-wallet system (deposit, winnings, ticket_bonus)
- **jackpots**: Lottery jackpot management
- **tickets**: User ticket purchases
- **transactions**: All financial transactions
- **winners**: Winning ticket records

## 🔧 Setup Instructions

### Prerequisites
1. **Node.js** (v16 or higher)
2. **MySQL** (v8.0 or higher)
3. **Redis** (v6.0 or higher)
4. **npm** or **yarn**

### Quick Start

1. **Clone and navigate to project**:
   ```bash
   cd gold-carnival
   ```

2. **Set up database**:
   ```sql
   CREATE DATABASE `new-eureka` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Start Redis server**:
   ```bash
   redis-server
   ```

4. **Run the startup script**:
   ```bash
   ./start.sh
   ```

   This script will:
   - Check database connections
   - Install dependencies
   - Create .env file from template
   - Start both frontend and backend servers

### Manual Setup

#### Backend Setup
```bash
cd backend
cp env.example .env
# Edit .env with your database credentials
npm install
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **API Documentation**: Available in backend/README.md

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS protection
- Helmet security headers
- SQL injection protection

## 📧 Email Configuration

The system uses Mailtrap for development:
- **Host**: sandbox.smtp.mailtrap.io
- **Port**: 2525
- **Username**: 256b0adcb18ba5
- **Password**: 92e00241c2c27b

## 🔄 Real-time Features

WebSocket events implemented:
- `draw_timer_update`: Live countdown updates
- `new_winner_announced`: Winner notifications
- `wallet_balance_update`: Balance changes
- `jackpot_status_change`: Jackpot status updates

## 📈 Performance Features

- Redis caching for frequently accessed data
- Database connection pooling
- Rate limiting to prevent abuse
- Optimized database queries with indexes
- Pagination for large datasets

## 🚀 Deployment Ready

### Production Checklist
- [ ] Update environment variables for production
- [ ] Configure SSL certificates
- [ ] Set up database backups
- [ ] Configure PM2 for process management
- [ ] Set up Nginx reverse proxy
- [ ] Configure monitoring and logging

### Docker Support
The backend includes Docker configuration for easy deployment.

## 🧪 Testing

### API Testing
Use the health check endpoint to verify backend status:
```bash
curl http://localhost:3000/health
```

### Database Testing
Verify database connection:
```bash
mysql -u admin -pAdmin@123 -e "USE new-eureka; SHOW TABLES;"
```

## 📚 API Documentation

Complete API documentation is available in `backend/README.md` with examples for:
- Authentication endpoints
- User management
- Jackpot operations
- Ticket purchasing
- Wallet operations
- Referral system

## 🔧 Development Workflow

1. **Backend Development**:
   - Models in `backend/src/models/`
   - Routes in `backend/src/routes/`
   - Controllers in `backend/src/controllers/`
   - Middleware in `backend/src/middleware/`

2. **Frontend Development**:
   - Components in `frontend/src/components/`
   - Pages in `frontend/src/pages/`
   - Services in `frontend/src/services/`
   - Contexts in `frontend/src/contexts/`

## 🎯 Next Steps

### Immediate Tasks
1. **Test the complete flow**:
   - User registration
   - Login/logout
   - Ticket purchasing
   - Wallet operations

2. **Create sample data**:
   - Add sample jackpots
   - Create test users
   - Test referral system

3. **Frontend Integration**:
   - Connect login/register forms
   - Integrate dashboard with real data
   - Add real-time updates

### Future Enhancements
1. **Payment Gateway Integration**:
   - Real cryptocurrency payment processing
   - Multiple payment gateways
   - Payment verification

2. **Admin Panel**:
   - Jackpot management
   - User management
   - Transaction monitoring
   - Analytics dashboard

3. **Advanced Features**:
   - Multi-language support
   - Mobile app
   - Advanced analytics
   - Automated draw system

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Verify MySQL is running
   - Check credentials in .env file
   - Ensure database exists

2. **Redis Connection Error**:
   - Start Redis server: `redis-server`
   - Check Redis configuration

3. **Port Conflicts**:
   - Frontend: Change port in vite.config.ts
   - Backend: Change PORT in .env

4. **CORS Issues**:
   - Verify FRONTEND_URL in backend .env
   - Check CORS configuration

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check server logs for errors
4. Verify database and Redis connections

---

**Project Status**: ✅ Backend Complete | ✅ Frontend Structure Ready | 🔄 Integration In Progress

**Ready for**: Development, Testing, and Deployment 