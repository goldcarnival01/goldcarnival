import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import configurations
import { sequelize } from './config/database.js';
import { DataTypes } from 'sequelize';
import { redisClient } from './config/redis.js';

// Import models and associations
import './models/associations.js';

// Import seeders
import { seedInitialData } from './seeders/initialData.js';

// Import models for seeding check
import Role from './models/Role.js';
import User from './models/User.js';
import Jackpot from './models/Jackpot.js';
import Plan from './models/Plan.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import jackpotRoutes from './routes/jackpot.js';
import ticketRoutes from './routes/ticket.js';
import walletRoutes from './routes/wallet.js';
import transactionRoutes from './routes/transaction.js';
import referralRoutes from './routes/referral.js';
import settingsRoutes from './routes/settings.js';
import pagesRoutes from './routes/pages.js';
import rolesRoutes from './routes/roles.js';
import adminRoutes from './routes/admin.js';
import nowpaymentsRoutes from './routes/nowpayments.js';
import planRoutes from './routes/plans.js';
import userPlanRoutes from './routes/userPlans.js';
import nowpaymentsWebhookHandler from './routes/handlers/nowpaymentsWebhookHandler.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://goldcarnivals.com',
      'https://www.goldcarnivals.com',
      'https://jumboticket.vercel.app',
      'https://gold-carnival-frontend.onrender.com',
      'https://goldcarnival-qt17mtszo-goldcarnival01s-projects.vercel.app',
      'http://localhost:8080',
      'http://localhost:3000',
      'http://localhost:5173' // Vite dev server
    ].filter(Boolean);
    
    console.log('🔍 CORS check - Origin:', origin);
    console.log('🔍 CORS check - Allowed origins:', allowedOrigins);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ CORS: Allowing origin:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS: Blocking origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-nowpayments-sig']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working!',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Gold Carnival API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      jackpots: '/api/jackpots',
      tickets: '/api/tickets',
      wallet: '/api/wallet',
      user: '/api/user'
    },
    documentation: 'API documentation available at /api endpoints'
  });
});

// API Routes
// Public NOWPayments webhook must be accessible without auth
app.post('/api/nowpayments/webhook', nowpaymentsWebhookHandler);

app.use('/api/auth', authRoutes);
app.use('/api/user', authenticateToken, userRoutes);
app.use('/api/jackpots', jackpotRoutes);
app.use('/api/tickets', authenticateToken, ticketRoutes);
app.use('/api/wallet', authenticateToken, walletRoutes);
app.use('/api/transactions', authenticateToken, transactionRoutes);
app.use('/api/referrals', authenticateToken, referralRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/roles', authenticateToken, rolesRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/user-plans', userPlanRoutes);

// NOWPayments routes - PUBLIC routes first (no authentication)
app.use('/api/nowpayments/public', nowpaymentsRoutes);
// NOWPayments routes - AUTHENTICATED routes (with authentication)
app.use('/api/nowpayments', authenticateToken, nowpaymentsRoutes);

// Debug route to list all registered routes
app.get('/api/routes', (req, res) => {
  res.json({
    message: 'Available API Routes',
    routes: [
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/logout',
      '/api/jackpots',
      '/api/settings/public',
      '/api/settings/category/:category',
      '/api/pages',
      '/api/user/profile',
      '/api/tickets/my-tickets',
      '/api/wallet/balance',
      '/api/transactions',
      '/api/referrals/stats'
    ],
    note: 'Some routes require authentication (Bearer token)'
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Handle draw timer updates
  socket.on('subscribe-draw-timer', () => {
    socket.join('draw-timer');
  });

  // Handle jackpot updates
  socket.on('subscribe-jackpot-updates', () => {
    socket.join('jackpot-updates');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});


// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync database models (creates tables if they do not exist)
    await sequelize.sync();
    // Ensure new columns required by recent updates exist (idempotent safe check)
    try {
      const qi = sequelize.getQueryInterface();
      const usersTable = await qi.describeTable('users');
      if (!usersTable.password_encrypted) {
        await qi.addColumn('users', 'password_encrypted', {
          type: DataTypes.TEXT,
          allowNull: true,
        });
        console.log('✅ Added missing column users.password_encrypted');
      }
      // Ensure transactions.metadata exists
      const transactionsTable = await qi.describeTable('transactions');
      if (!transactionsTable.metadata) {
        await qi.addColumn('transactions', 'metadata', {
          type: DataTypes.TEXT,
          allowNull: true,
        });
        console.log('✅ Added missing column transactions.metadata');
      }
      // Ensure user_plans.wallet_address exists
      const userPlansTable = await qi.describeTable('user_plans');
      if (!userPlansTable.wallet_address) {
        await qi.addColumn('user_plans', 'wallet_address', {
          type: DataTypes.STRING(255),
          allowNull: true,
        });
        console.log('✅ Added missing column user_plans.wallet_address');
      }
      if (!userPlansTable.verified) {
        await qi.addColumn('user_plans', 'verified', {
          type: DataTypes.ENUM('pending', 'verified', 'rejected'),
          allowNull: false,
          defaultValue: 'pending'
        });
        console.log('✅ Added missing column user_plans.verified');
      }
    } catch (ensureErr) {
      console.warn('⚠️ Skipped ensuring users.password_encrypted column:', ensureErr.message);
    }
    console.log('✅ Database models synchronized.');

    // Seed/ensure initial data every start (idempotent)
    try {
      console.log('🌱 Ensuring initial data (idempotent)...');
      await seedInitialData();
      console.log('✅ Initial data ensured.');

      // Always enforce critical role permissions
      // This helps when databases were seeded before permissions were added/changed
      const ensureRole = async (slug, permissions, options = {}) => {
        const role = await Role.findOne({ where: { slug } });
        if (role) {
          const current = Array.isArray(role.permissions) ? role.permissions : [];
          const merged = Array.from(new Set([...(current || []), ...permissions]));
          await role.update({
            permissions: merged,
            isActive: true,
            ...(typeof options.isDefault === 'boolean' ? { isDefault: options.isDefault } : {})
          });
          console.log(`🔐 Ensured permissions for role '${slug}':`, merged);
        }
      };

      await ensureRole('super-admin', [
        'user.manage',
        'role.manage',
        'jackpot.manage',
        'plan.manage',
        'transaction.manage',
        'setting.manage',
        'page.manage',
        'language.manage'
      ], { isDefault: false });

      await ensureRole('admin', [
        'user.view',
        'jackpot.manage',
        'plan.manage',
        'transaction.view',
        'setting.view'
      ], { isDefault: false });

      await ensureRole('user', [
        'ticket.purchase',
        'wallet.view',
        'profile.manage'
      ], { isDefault: true });

      // Ensure at least some active plans exist for public frontend display
      const activePlanCount = await Plan.count({ where: { isActive: true } });
      if (activePlanCount === 0) {
        const totalPlans = await Plan.count();
        if (totalPlans > 0) {
          await Plan.update({ isActive: true }, { where: {} });
          console.log('⚙️ Enabled all existing plans since none were active.');
        }
      }
    } catch (seedCheckError) {
      console.warn('⚠️ Seed check failed:', seedCheckError.message);
    }

    // Test Redis connection
    try {
      await redisClient.ping();
      console.log('✅ Redis connection established successfully.');
    } catch (error) {
      console.warn('⚠️ Redis connection failed, continuing without Redis:', error.message);
      console.log('ℹ️ Some features like caching and session management will be limited.');
    }

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await sequelize.close();
  await redisClient.quit();
  server.close(() => {
    console.log('Process terminated');
  });
});

startServer(); 