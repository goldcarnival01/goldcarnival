import express from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';
import Ticket from '../models/Ticket.js';
import Jackpot from '../models/Jackpot.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { sendEmail } from '../services/emailService.js';
import { sequelize } from '../config/database.js';

const router = express.Router();

// Purchase ticket with specific numbers
router.post('/purchase', [
  body('jackpotId').isInt().withMessage('Valid jackpot ID is required'),
  body('ticketNumbers').isArray({ min: 1, max: 108 }).withMessage('Ticket numbers must be an array (1-108 tickets)'),
  body('ticketNumbers.*').isString().withMessage('Each ticket number must be a string'),
  body('walletType').isIn(['deposit', 'winnings', 'ticket_bonus']).withMessage('Valid wallet type is required'),
  body('buyFor').optional().isIn(['yourself', 'gift']).withMessage('Buy for must be yourself or gift')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const { jackpotId, ticketNumbers, walletType, buyFor = 'yourself' } = req.body;
  const userId = req.user.id;
  const quantity = ticketNumbers.length;

  // Get jackpot
  const jackpot = await Jackpot.findByPk(jackpotId);
  if (!jackpot || !jackpot.isActive || jackpot.status !== 'active') {
    return res.status(404).json({
      error: 'Jackpot Not Available',
      message: 'The requested jackpot is not available for ticket purchase'
    });
  }

  // Check if draw time has passed
  if (jackpot.isDrawTimeReached()) {
    return res.status(400).json({
      error: 'Draw Time Passed',
      message: 'Ticket sales have ended for this jackpot'
    });
  }

  // Get user's selected wallet
  const selectedWallet = await Wallet.findOne({
    where: { userId, walletType }
  });

  if (!selectedWallet) {
    return res.status(500).json({
      error: 'Wallet Error',
      message: `${walletType} wallet not found`
    });
  }

  const totalCost = parseFloat(jackpot.ticketPrice) * quantity;

  // Check if user has sufficient balance
  if (parseFloat(selectedWallet.balance) < totalCost) {
    return res.status(400).json({
      error: 'Insufficient Balance',
      message: `You do not have sufficient balance in your ${walletType} wallet to purchase tickets`
    });
  }

  // Validate ticket numbers are unique
  const uniqueTicketNumbers = [...new Set(ticketNumbers)];
  if (uniqueTicketNumbers.length !== ticketNumbers.length) {
    return res.status(400).json({
      error: 'Duplicate Tickets',
      message: 'Cannot purchase duplicate ticket numbers'
    });
  }

  // Check if any ticket numbers are already taken
  const existingTickets = await Ticket.findAll({
    where: { 
      jackpotId, 
      ticketNumber: ticketNumbers,
      status: 'active'
    }
  });

  if (existingTickets.length > 0) {
    return res.status(400).json({
      error: 'Tickets Already Taken',
      message: `Some ticket numbers are already taken: ${existingTickets.map(t => t.ticketNumber).join(', ')}`
    });
  }

  // Start transaction
  const transaction = await sequelize.transaction();

  try {
    // Deduct amount from selected wallet
    await selectedWallet.deductBalance(totalCost);

    // Create transaction record
    await Transaction.create({
      userId,
      walletId: selectedWallet.id,
      transactionType: 'ticket_purchase',
      amount: totalCost,
      status: 'completed',
      referenceId: `TKT_${Date.now()}`,
      description: `Ticket purchase for ${jackpot.name}`,
      processedAt: new Date()
    }, { transaction });

    // Create tickets with specific numbers
    const tickets = [];
    for (const ticketNumber of ticketNumbers) {
      const ticket = await Ticket.create({
        userId,
        jackpotId,
        ticketNumber,
        purchaseAmount: parseFloat(jackpot.ticketPrice),
        status: 'active'
      }, { transaction });
      tickets.push(ticket);
    }

    // Update jackpot statistics
    jackpot.totalTicketsSold += quantity;
    jackpot.totalRevenue += totalCost;
    await jackpot.save({ transaction });

    await transaction.commit();

    // Send confirmation email
    try {
      await sendEmail({
        to: req.user.email,
        template: 'ticketPurchase',
        data: {
          name: req.user.firstName || req.user.memberId,
          ticketNumber: tickets[0].ticketNumber,
          jackpotName: jackpot.name,
          amount: totalCost,
          quantity
        }
      });
    } catch (emailError) {
      console.error('Failed to send ticket confirmation email:', emailError);
    }

    res.status(201).json({
      message: 'Tickets purchased successfully',
      tickets: tickets.map(ticket => ({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        jackpotName: jackpot.name,
        purchaseAmount: ticket.purchaseAmount,
        status: ticket.status
      })),
      totalCost,
      walletType,
      buyFor,
      remainingBalance: parseFloat(selectedWallet.balance)
    });

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}));

// Get user's tickets
router.get('/my-tickets', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = { userId: req.user.id };
  if (status) whereClause.status = status;

  const tickets = await Ticket.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Jackpot,
        as: 'jackpot',
        attributes: ['name', 'amount', 'drawTime', 'status']
      }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    message: 'Tickets retrieved successfully',
    tickets: tickets.rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(tickets.count / limit),
      totalItems: tickets.count,
      itemsPerPage: parseInt(limit)
    }
  });
}));

// Get ticket details
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ticket = await Ticket.findOne({
    where: { id, userId: req.user.id },
    include: [
      {
        model: Jackpot,
        as: 'jackpot',
        attributes: ['name', 'amount', 'drawTime', 'status', 'maxWinners']
      }
    ]
  });

  if (!ticket) {
    return res.status(404).json({
      error: 'Ticket Not Found',
      message: 'The requested ticket does not exist'
    });
  }

  res.json({
    message: 'Ticket details retrieved successfully',
    ticket
  });
}));

// Get ticket history
router.get('/history', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const tickets = await Ticket.findAndCountAll({
    where: { userId: req.user.id },
    include: [
      {
        model: Jackpot,
        as: 'jackpot',
        attributes: ['name', 'amount', 'drawTime', 'status']
      }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    message: 'Ticket history retrieved successfully',
    tickets: tickets.rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(tickets.count / limit),
      totalItems: tickets.count,
      itemsPerPage: parseInt(limit)
    }
  });
}));

// Get winning tickets
router.get('/winnings', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const winningTickets = await Ticket.findAndCountAll({
    where: { 
      userId: req.user.id,
      isWinner: true,
      status: 'won'
    },
    include: [
      {
        model: Jackpot,
        as: 'jackpot',
        attributes: ['name', 'amount']
      }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    message: 'Winning tickets retrieved successfully',
    tickets: winningTickets.rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(winningTickets.count / limit),
      totalItems: winningTickets.count,
      itemsPerPage: parseInt(limit)
    }
  });
}));

// Generate ticket number
function generateTicketNumber() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TKT${timestamp}${random}`;
}

export default router; 