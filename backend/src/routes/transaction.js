import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import { sequelize } from '../config/database.js';

const router = express.Router();

// Get all transactions for user
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, status, startDate, endDate } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = { userId: req.user.id };
  
  if (type) whereClause.transactionType = type;
  if (status) whereClause.status = status;
  
  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) whereClause.createdAt.$gte = new Date(startDate);
    if (endDate) whereClause.createdAt.$lte = new Date(endDate);
  }

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

// Get transaction by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const transaction = await Transaction.findOne({
    where: { id, userId: req.user.id },
    include: [
      {
        model: Wallet,
        as: 'wallet',
        attributes: ['walletType']
      }
    ]
  });

  if (!transaction) {
    return res.status(404).json({
      error: 'Transaction Not Found',
      message: 'The requested transaction does not exist'
    });
  }

  res.json({
    message: 'Transaction details retrieved successfully',
    transaction
  });
}));

// Get transaction statistics
router.get('/stats/summary', asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get transaction statistics by type
  const statsByType = await Transaction.findAll({
    where: { userId },
    attributes: [
      'transactionType',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
      [sequelize.fn('AVG', sequelize.col('amount')), 'averageAmount']
    ],
    group: ['transactionType']
  });

  // Get transaction statistics by status
  const statsByStatus = await Transaction.findAll({
    where: { userId },
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
    ],
    group: ['status']
  });

  // Get monthly statistics
  const monthlyStats = await Transaction.findAll({
    where: { userId },
    attributes: [
      [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'month'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
    ],
    group: ['month'],
    order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'DESC']],
    limit: 12
  });

  res.json({
    message: 'Transaction statistics retrieved successfully',
    stats: {
      byType: statsByType,
      byStatus: statsByStatus,
      monthly: monthlyStats
    }
  });
}));

export default router; 