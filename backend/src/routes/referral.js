import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import { sendEmail } from '../services/emailService.js';
import { sequelize } from '../config/database.js';

const router = express.Router();

// Get user's referral link
router.get('/link', asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'referralCode', 'firstName', 'lastName', 'email']
  });

  if (!user) {
    return res.status(404).json({
      error: 'User Not Found',
      message: 'User not found'
    });
  }

  // Ensure user has a referral code (migrate old JUMBO* codes to GOLD*)
  if (!user.referralCode || (typeof user.referralCode === 'string' && user.referralCode.startsWith('JUMBO'))) {
    // Generate a new referral code if user doesn't have one
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let referralCode = 'GOLD';
    for (let i = 0; i < 6; i++) {
      referralCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    user.referralCode = referralCode;
    await user.save();
  }

  const referralLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/signup?ref=${user.referralCode}`;

  res.json({
    message: 'Referral link retrieved successfully',
    referralCode: user.referralCode,
    referralLink,
    user: {
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    }
  });
}));

// Get referral statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get total referrals
  const totalReferrals = await User.count({
    where: { referredBy: userId }
  });

  // Get active referrals (users who have made transactions)
  const activeReferrals = await User.count({
    where: { referredBy: userId },
    include: [
      {
        model: Transaction,
        as: 'transactions',
        where: { status: 'completed' },
        required: true
      }
    ]
  });

  // Get total commission earned
  const commissionStats = await Transaction.findAll({
    where: { 
      userId,
      transactionType: 'commission',
      status: 'completed'
    },
    attributes: [
      [sequelize.fn('SUM', sequelize.col('amount')), 'totalCommission'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'commissionCount']
    ]
  });

  // Get monthly commission
  const monthlyCommission = await Transaction.findAll({
    where: { 
      userId,
      transactionType: 'commission',
      status: 'completed'
    },
    attributes: [
      [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'month'],
      [sequelize.fn('SUM', sequelize.col('amount')), 'commission']
    ],
    group: ['month'],
    order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'DESC']],
    limit: 12
  });

  res.json({
    message: 'Referral statistics retrieved successfully',
    stats: {
      totalReferrals,
      activeReferrals,
      totalCommission: parseFloat(commissionStats[0]?.dataValues?.totalCommission || 0),
      commissionCount: parseInt(commissionStats[0]?.dataValues?.commissionCount || 0),
      monthlyCommission
    }
  });
}));

// Get referral list
router.get('/list', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  // Step 1: fetch referred users (basic info)
  const { count, rows } = await User.findAndCountAll({
    where: { referredBy: req.user.id },
    attributes: ['id', 'memberId', 'firstName', 'lastName', 'email', 'createdAt', 'status'],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  const referredUsers = rows.map(u => u.toJSON());
  const userIds = referredUsers.map(u => u.id);

  // Step 2: aggregate transactions for those user ids
  let txnAggregates = [];
  if (userIds.length > 0) {
    txnAggregates = await Transaction.findAll({
      where: { userId: userIds, status: 'completed' },
      attributes: [
        'userId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'transactionCount'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalSpent']
      ],
      group: ['userId']
    });
  }

  const aggMap = new Map();
  txnAggregates.forEach((row) => {
    const key = Number(row.get('userId'));
    aggMap.set(key, {
      transactionCount: parseInt(row.get('transactionCount') || 0),
      totalSpent: parseFloat(row.get('totalSpent') || 0)
    });
  });

  const data = referredUsers.map(u => ({
    id: u.id,
    memberId: u.memberId,
    name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.memberId,
    email: u.email,
    joinedAt: u.createdAt,
    status: u.status,
    transactionCount: aggMap.get(u.id)?.transactionCount || 0,
    totalSpent: aggMap.get(u.id)?.totalSpent || 0
  }));

  res.json({
    message: 'Referral list retrieved successfully',
    referrals: data,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil((typeof count === 'number' ? count : data.length) / limit),
      totalItems: typeof count === 'number' ? count : data.length,
      itemsPerPage: parseInt(limit)
    }
  });
}));

// Get referral link
router.get('/link', asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  
  const referralLink = `${process.env.FRONTEND_URL}/signup?ref=${user.referralCode}`;

  res.json({
    message: 'Referral link retrieved successfully',
    referralLink,
    referralCode: user.referralCode
  });
}));

// Get commission history
router.get('/commissions', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const commissions = await Transaction.findAndCountAll({
    where: { 
      userId: req.user.id,
      transactionType: 'commission'
    },
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    message: 'Commission history retrieved successfully',
    commissions: commissions.rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(commissions.count / limit),
      totalItems: commissions.count,
      itemsPerPage: parseInt(limit)
    }
  });
}));

// Process referral commission (internal function)
export const processReferralCommission = async (referrerId, amount, description) => {
  try {
    const referrer = await User.findByPk(referrerId);
    if (!referrer) return;

    // Calculate commission (10%)
    const commissionAmount = parseFloat(amount) * 0.1;

    // Get referrer's winnings wallet
    const winningsWallet = await Wallet.findOne({
      where: { userId: referrerId, walletType: 'winnings' }
    });

    if (!winningsWallet) return;

    // Add commission to wallet
    await winningsWallet.addBalance(commissionAmount);

    // Create commission transaction
    await Transaction.create({
      userId: referrerId,
      walletId: winningsWallet.id,
      transactionType: 'commission',
      amount: commissionAmount,
      status: 'completed',
      referenceId: `COM_${Date.now()}`,
      description: `Referral commission: ${description}`,
      processedAt: new Date()
    });

    // Send commission notification email
    try {
      await sendEmail({
        to: referrer.email,
        subject: 'Referral Commission Earned!',
        template: 'commission',
        data: {
          name: referrer.firstName || referrer.memberId,
          amount: commissionAmount,
          description
        }
      });
    } catch (emailError) {
      console.error('Failed to send commission email:', emailError);
    }

  } catch (error) {
    console.error('Error processing referral commission:', error);
  }
};

export default router; 