import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import Jackpot from '../models/Jackpot.js';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import { getCache, setCache, deleteCache } from '../config/redis.js';
import { sequelize } from '../config/database.js';

const router = express.Router();

// Get all active jackpots
router.get('/', asyncHandler(async (req, res) => {
  const cacheKey = 'active_jackpots';
  let jackpots = await getCache(cacheKey);

  if (!jackpots) {
    jackpots = await Jackpot.findAll({
      where: { 
        isActive: true,
        status: ['active', 'drawing']
      },
      order: [['createdAt', 'DESC']]
    });

    // Cache for 5 minutes
    await setCache(cacheKey, jackpots, 300);
  }

  res.json({
    message: 'Jackpots retrieved successfully',
    jackpots
  });
}));

// Get specific jackpot
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cacheKey = `jackpot_${id}`;
  let jackpot = await getCache(cacheKey);

  if (!jackpot) {
    jackpot = await Jackpot.findByPk(id, {
      include: [
        {
          model: Ticket,
          as: 'tickets',
          attributes: ['id', 'status', 'isWinner'],
          where: { status: 'active' },
          required: false
        }
      ]
    });

    if (!jackpot) {
      return res.status(404).json({
        error: 'Jackpot Not Found',
        message: 'The requested jackpot does not exist'
      });
    }

    // Cache for 2 minutes
    await setCache(cacheKey, jackpot, 120);
  }

  // Add draw time remaining
  const drawTimeRemaining = jackpot.getDrawTimeRemaining();
  const isDrawTimeReached = jackpot.isDrawTimeReached();

  res.json({
    message: 'Jackpot retrieved successfully',
    jackpot: {
      ...jackpot.toJSON(),
      drawTimeRemaining,
      isDrawTimeReached
    }
  });
}));

// Get jackpot statistics
router.get('/:id/stats', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const jackpot = await Jackpot.findByPk(id);

  if (!jackpot) {
    return res.status(404).json({
      error: 'Jackpot Not Found',
      message: 'The requested jackpot does not exist'
    });
  }

  // Get ticket statistics
  const ticketStats = await Ticket.findAll({
    where: { jackpotId: id },
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('purchaseAmount')), 'totalAmount']
    ],
    group: ['status']
  });

  // Get winner statistics
  const winnerStats = await Ticket.findAll({
    where: { 
      jackpotId: id,
      isWinner: true
    },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'winnerCount'],
      [sequelize.fn('SUM', sequelize.col('winningAmount')), 'totalWinnings']
    ]
  });

  res.json({
    message: 'Jackpot statistics retrieved successfully',
    stats: {
      jackpot: {
        name: jackpot.name,
        amount: jackpot.amount,
        maxWinners: jackpot.maxWinners,
        status: jackpot.status,
        drawTime: jackpot.drawTime,
        totalTicketsSold: jackpot.totalTicketsSold,
        totalRevenue: jackpot.totalRevenue,
        winnersSelected: jackpot.winnersSelected
      },
      tickets: ticketStats,
      winners: winnerStats[0] || { winnerCount: 0, totalWinnings: 0 }
    }
  });
}));

// Get live draw timer (for WebSocket updates)
router.get('/:id/timer', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const jackpot = await Jackpot.findByPk(id);

  if (!jackpot) {
    return res.status(404).json({
      error: 'Jackpot Not Found',
      message: 'The requested jackpot does not exist'
    });
  }

  const drawTimeRemaining = jackpot.getDrawTimeRemaining();
  const isDrawTimeReached = jackpot.isDrawTimeReached();

  res.json({
    message: 'Draw timer retrieved successfully',
    timer: {
      drawTimeRemaining,
      isDrawTimeReached,
      drawTime: jackpot.drawTime,
      status: jackpot.status
    }
  });
}));

// Get latest winners (public endpoint)
router.get('/winners/latest', asyncHandler(async (req, res) => {
  const cacheKey = 'latest_winners';
  let winners = await getCache(cacheKey);

  if (!winners) {
    winners = await Ticket.findAll({
      where: { 
        isWinner: true,
        status: 'won'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'memberId']
        },
        {
          model: Jackpot,
          as: 'jackpot',
          attributes: ['name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Cache for 1 minute
    await setCache(cacheKey, winners, 60);
  }

  res.json({
    message: 'Latest winners retrieved successfully',
    winners: winners.map(winner => ({
      jackpotName: winner.jackpot.name,
      winnerName: `${winner.user.firstName || ''} ${winner.user.lastName || ''}`.trim() || winner.user.memberId,
      amount: winner.winningAmount,
      ticketNumber: winner.ticketNumber,
      drawNumber: winner.drawNumber,
      wonAt: winner.createdAt
    }))
  });
}));

// Admin: Create new jackpot (protected route)
router.post('/', asyncHandler(async (req, res) => {
  const { name, amount, ticketPrice, maxWinners, drawTime, description } = req.body;

  // Validate required fields
  if (!name || !amount || !ticketPrice || !maxWinners || !drawTime) {
    return res.status(400).json({
      error: 'Missing Required Fields',
      message: 'Name, amount, ticket price, max winners, and draw time are required'
    });
  }

  // Get next draw number
  const lastJackpot = await Jackpot.findOne({
    order: [['drawNumber', 'DESC']]
  });
  const nextDrawNumber = (lastJackpot?.drawNumber || 0) + 1;

  const jackpot = await Jackpot.create({
    name,
    amount: parseFloat(amount),
    ticketPrice: parseFloat(ticketPrice),
    maxWinners: parseInt(maxWinners),
    drawNumber: nextDrawNumber,
    drawTime: new Date(drawTime),
    description,
    status: 'active',
    isActive: true
  });

  // Clear cache
  await deleteCache('active_jackpots');

  res.status(201).json({
    message: 'Jackpot created successfully',
    jackpot
  });
}));

// Admin: Update jackpot
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const jackpot = await Jackpot.findByPk(id);

  if (!jackpot) {
    return res.status(404).json({
      error: 'Jackpot Not Found',
      message: 'The requested jackpot does not exist'
    });
  }

  const { name, amount, ticketPrice, maxWinners, drawTime, description, status, isActive } = req.body;

  if (name) jackpot.name = name;
  if (amount) jackpot.amount = parseFloat(amount);
  if (ticketPrice) jackpot.ticketPrice = parseFloat(ticketPrice);
  if (maxWinners) jackpot.maxWinners = parseInt(maxWinners);
  if (drawTime) jackpot.drawTime = new Date(drawTime);
  if (description !== undefined) jackpot.description = description;
  if (status) jackpot.status = status;
  if (isActive !== undefined) jackpot.isActive = isActive;

  await jackpot.save();

  // Clear cache
  await deleteCache('active_jackpots');
  await deleteCache(`jackpot_${id}`);

  res.json({
    message: 'Jackpot updated successfully',
    jackpot
  });
}));

// Admin: Delete jackpot
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const jackpot = await Jackpot.findByPk(id);

  if (!jackpot) {
    return res.status(404).json({
      error: 'Jackpot Not Found',
      message: 'The requested jackpot does not exist'
    });
  }

  // Check if jackpot has active tickets
  const activeTickets = await Ticket.count({
    where: { jackpotId: id, status: 'active' }
  });

  if (activeTickets > 0) {
    return res.status(400).json({
      error: 'Active Tickets Found',
      message: 'Cannot delete jackpot with active tickets'
    });
  }

  await jackpot.destroy();

  // Clear cache
  await deleteCache('active_jackpots');
  await deleteCache(`jackpot_${id}`);

  res.json({
    message: 'Jackpot deleted successfully'
  });
}));

export default router; 