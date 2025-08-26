import express from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Ticket from '../models/Ticket.js';
import Role from '../models/Role.js';
import { sequelize } from '../config/database.js';
import UserPlan from '../models/UserPlan.js';

const router = express.Router();

// Get user profile
router.get('/profile', asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [
      {
        model: Wallet,
        as: 'wallets',
        attributes: ['id', 'walletType', 'balance', 'currency']
      },
      {
        model: Role,
        as: 'role',
        attributes: ['id', 'name', 'slug', 'permissions']
      }
    ]
  });

  res.json({
    message: 'Profile retrieved successfully',
    user: user.toJSON()
  });
}));

// Update user profile
router.put('/profile', [
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const { firstName, lastName, phone } = req.body;
  const user = await User.findByPk(req.user.id);

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone;

  user.profileCompleted = true;
  await user.save();

  res.json({
    message: 'Profile updated successfully',
    user: user.toJSON()
  });
}));

// Get user wallets
router.get('/wallets', asyncHandler(async (req, res) => {
  const wallets = await Wallet.findAll({
    where: { userId: req.user.id },
    attributes: ['id', 'walletType', 'balance', 'currency', 'isActive']
  });

  res.json({
    message: 'Wallets retrieved successfully',
    wallets
  });
}));

// Get user transactions
router.get('/transactions', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = { userId: req.user.id };
  if (type) whereClause.transactionType = type;

  const transactions = await Transaction.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Wallet,
        as: 'wallet',
        attributes: ['walletType']
      }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    message: 'Transactions retrieved successfully',
    transactions: transactions.rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(transactions.count / limit),
      totalItems: transactions.count,
      itemsPerPage: parseInt(limit)
    }
  });
}));

// Get user statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Ensure user has all wallet types created
  const walletTypes = ['deposit', 'winnings', 'ticket_bonus'];
  for (const walletType of walletTypes) {
    await Wallet.findOrCreate({
      where: { userId, walletType },
      defaults: {
        userId,
        walletType,
        balance: 0.00,
        currency: 'USD',
        isActive: true
      }
    });
  }

  // Get wallet balances
  const wallets = await Wallet.findAll({
    where: { userId },
    attributes: ['walletType', 'balance']
  });

  // Get transaction statistics (with fallback)
  let transactionStats = [];
  try {
    transactionStats = await Transaction.findAll({
      where: { userId },
      attributes: [
        'transactionType',
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['transactionType']
    });
  } catch (error) {
    console.log('Transaction statistics error:', error.message);
    transactionStats = [];
  }

  // Get ticket statistics (with fallback for missing table/columns)
  let ticketStats = [];
  try {
    ticketStats = await Ticket.findAll({
      where: { userId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('purchaseAmount')), 'totalSpent'],
        [sequelize.fn('SUM', sequelize.col('winningAmount')), 'totalWon']
      ],
      group: ['status']
    });
  } catch (error) {
    console.log('Ticket statistics not available yet (table/columns may not exist):', error.message);
    // Return default ticket stats since winner mechanism is not implemented yet
    ticketStats = [
      { status: 'active', count: 0, totalSpent: 0, totalWon: 0 },
      { status: 'won', count: 0, totalSpent: 0, totalWon: 0 },
      { status: 'lost', count: 0, totalSpent: 0, totalWon: 0 }
    ];
  }

  // Get referral statistics (with fallback)
  let referralStats = [];
  try {
    referralStats = await User.findAll({
      where: { referredBy: userId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalReferrals']
      ]
    });
  } catch (error) {
    console.log('Referral statistics error:', error.message);
    referralStats = [{ dataValues: { totalReferrals: 0 } }];
  }

  // Calculate additional statistics for MY STATS section
  const totalDeposit = transactionStats
    .filter(stat => stat.transactionType === 'deposit')
    .reduce((sum, stat) => sum + parseFloat(stat.dataValues?.totalAmount || 0), 0);

  const totalCommission = transactionStats
    .filter(stat => stat.transactionType === 'commission')
    .reduce((sum, stat) => sum + parseFloat(stat.dataValues?.totalAmount || 0), 0);

  const totalWithdraw = transactionStats
    .filter(stat => stat.transactionType === 'withdrawal')
    .reduce((sum, stat) => sum + parseFloat(stat.dataValues?.totalAmount || 0), 0);

  const totalTickets = ticketStats
    .reduce((sum, stat) => sum + parseInt(stat.dataValues?.count || 0), 0);

  const totalWinnings = ticketStats
    .filter(stat => stat.status === 'won')
    .reduce((sum, stat) => sum + parseInt(stat.dataValues?.count || 0), 0);

  res.json({
    message: 'Statistics retrieved successfully',
    stats: {
      wallets: wallets.reduce((acc, wallet) => {
        acc[wallet.walletType] = parseFloat(wallet.balance);
        return acc;
      }, {}),
      transactions: transactionStats,
      tickets: ticketStats,
      referrals: {
        total: parseInt(referralStats[0]?.dataValues?.totalReferrals || 0)
      },
      // Additional stats for MY STATS section
      totalDeposit: totalDeposit.toFixed(2),
      totalCommission: totalCommission.toFixed(2),
      totalWithdraw: totalWithdraw.toFixed(2),
      totalTickets,
      totalWinnings
    }
  });
}));

// Change password
router.put('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const { currentPassword, newPassword } = req.body;
  const user = await User.findByPk(req.user.id);

  // Verify current password
  const isValidPassword = await user.validatePassword(currentPassword);
  if (!isValidPassword) {
    return res.status(400).json({
      error: 'Invalid Password',
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.passwordHash = newPassword; // Will be hashed by model hook
  await user.save();

  res.json({
    message: 'Password changed successfully'
  });
}));

// Delete account
router.delete('/account', [
  body('password').notEmpty().withMessage('Password is required for account deletion')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const { password } = req.body;
  const user = await User.findByPk(req.user.id);

  // Verify password
  const isValidPassword = await user.validatePassword(password);
  if (!isValidPassword) {
    return res.status(400).json({
      error: 'Invalid Password',
      message: 'Password is incorrect'
    });
  }

  // Check if user has active tickets
  const activeTickets = await Ticket.count({
    where: { userId: req.user.id, status: 'active' }
  });

  if (activeTickets > 0) {
    return res.status(400).json({
      error: 'Active Tickets Found',
      message: 'Cannot delete account with active tickets. Please wait for draws to complete.'
    });
  }

  // Hard delete user and related data
  await sequelize.transaction(async (t) => {
    // Detach referrals pointing to this user
    await User.update({ referredBy: null }, { where: { referredBy: req.user.id }, transaction: t });

    const wallets = await Wallet.findAll({ where: { userId: req.user.id }, attributes: ['id'], transaction: t });
    const walletIds = wallets.map(w => w.id);

    await Transaction.destroy({ where: { userId: req.user.id }, transaction: t });
    if (walletIds.length > 0) {
      await Transaction.destroy({ where: { walletId: walletIds }, transaction: t });
    }
    await Ticket.destroy({ where: { userId: req.user.id }, transaction: t });
    await UserPlan.destroy({ where: { userId: req.user.id }, transaction: t });
    await Wallet.destroy({ where: { userId: req.user.id }, transaction: t });

    await user.destroy({ transaction: t });
  });

  res.json({ message: 'Account deleted permanently' });
}));

export default router; 