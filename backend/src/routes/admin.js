import express from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Ticket from '../models/Ticket.js';
import Jackpot from '../models/Jackpot.js';
import Role from '../models/Role.js';
import crypto from 'crypto';
import Setting from '../models/Setting.js';
import Language from '../models/Language.js';
import Page from '../models/Page.js';
import { sequelize } from '../config/database.js';
import { Op } from 'sequelize';
import UserPlan from '../models/UserPlan.js';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    include: [{ model: Role, as: 'role' }]
  });

  if (!user || !user.role || !['super-admin', 'admin'].includes(user.role.slug)) {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Admin access required'
    });
  }

  next();
});

// Middleware to check if user is super admin only
const requireSuperAdmin = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    include: [{ model: Role, as: 'role' }]
  });

  if (!user || !user.role || user.role.slug !== 'super-admin') {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Super admin access required'
    });
  }

  next();
});

// Helper to generate strong temporary passwords
function generateTempPassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Decrypt helper to reveal user passwords (only for super admin with correct token)
const ENCRYPTION_KEY = (process.env.PASSWORD_ENCRYPTION_KEY || process.env.JWT_SECRET || 'changemechangemechangemechangeme').slice(0, 32);
function decryptPassword(enc) {
  if (!enc) return null;
  try {
    const [ivB64, dataB64] = enc.split(':');
    const iv = Buffer.from(ivB64, 'base64');
    const encryptedText = Buffer.from(dataB64, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return null;
  }
}

// ==================== DASHBOARD STATS ====================

// Get dashboard statistics
router.get('/dashboard/stats', requireAdmin, asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalJackpots,
    totalTickets,
    totalTransactions,
    activeJackpots,
    pendingTransactions,
    totalRevenue
  ] = await Promise.all([
    User.count(),
    Jackpot.count(),
    Ticket.count(),
    Transaction.count(),
    Jackpot.count({ where: { status: 'active' } }),
    Transaction.count({ where: { status: 'pending' } }),
    Transaction.sum('amount', { where: { status: 'completed' } })
  ]);

  // Get recent activity
  const recentActivity = await Promise.all([
    // Recent user registrations
    User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'memberId', 'firstName', 'lastName', 'email', 'createdAt']
    }),
    // Recent transactions
    Transaction.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }]
    }),
    // Recent jackpot activities
    Jackpot.findAll({
      order: [['updatedAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'status', 'updatedAt']
    })
  ]);

  res.json({
    stats: {
      totalUsers,
      totalJackpots,
      totalTickets,
      totalTransactions,
      activeJackpots,
      pendingTransactions,
      totalRevenue: totalRevenue || 0
    },
    recentActivity: {
      users: recentActivity[0],
      transactions: recentActivity[1],
      jackpots: recentActivity[2]
    }
  });
}));

// ==================== USERS MANAGEMENT ====================

// Get all users with pagination and filters
router.get('/users', requireAdmin, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status, role } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = {};
  if (search) {
    whereClause[Op.or] = [
      { email: { [Op.iLike]: `%${search}%` } },
      { firstName: { [Op.iLike]: `%${search}%` } },
      { lastName: { [Op.iLike]: `%${search}%` } },
      { memberId: { [Op.iLike]: `%${search}%` } }
    ];
  }
  if (status && status !== 'all') {
    whereClause.status = status;
  }

  const includeClause = [
    { model: Role, as: 'role', attributes: ['id', 'name', 'slug'] },
    { model: User, as: 'referrer', attributes: ['id', 'memberId', 'email'] }
  ];

  if (role && role !== 'all') {
    includeClause[0].where = { slug: role };
  }

  const { count, rows: users } = await User.findAndCountAll({
    where: whereClause,
    include: includeClause,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    users,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit)
    }
  });
}));

// Create user
router.post('/users', requireAdmin, [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('memberId').optional().isString(),
  body('firstName').optional().isString(),
  body('lastName').optional().isString(),
  body('phone').optional().isString(),
  body('roleId').optional().isInt(),
  body('status').optional().isIn(['active', 'suspended', 'pending'])
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation Error', details: errors.array() });
  }

  const { email, password, memberId, firstName, lastName, phone, roleId, status = 'active' } = req.body;

  // Uniqueness checks
  const existing = await User.findOne({ where: { [Op.or]: [{ email }, { memberId }] } });
  if (existing) {
    return res.status(409).json({ error: 'User Already Exists', message: 'Email or Member ID already in use' });
  }

  // Validate role if provided
  let resolvedRoleId = null;
  if (roleId) {
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ error: 'Invalid Role', message: 'Provided roleId does not exist' });
    }
    resolvedRoleId = role.id;
  } else {
    // Fallback to default role
    const defaultRole = await Role.findOne({ where: { isDefault: true, isActive: true } });
    resolvedRoleId = defaultRole?.id || null;
  }

  // Generate memberId if not provided
  const generatedMemberId = memberId || `GC${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 900 + 100)}`;

  const user = await User.create({
    email,
    passwordHash: password,
    memberId: generatedMemberId,
    firstName,
    lastName,
    phone,
    roleId: resolvedRoleId,
    status,
    emailVerified: status === 'active'
  });

  // Ensure wallets
  const walletTypes = ['deposit', 'winnings', 'ticket_bonus'];
  for (const walletType of walletTypes) {
    await Wallet.findOrCreate({ where: { userId: user.id, walletType }, defaults: { userId: user.id, walletType, balance: 0.0 } });
  }

  res.status(201).json({ message: 'User created successfully', user: user.toJSON() });
}));

// Update user
router.put('/users/:id', requireAdmin, [
  body('email').optional().isEmail(),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').optional().isString(),
  body('lastName').optional().isString(),
  body('phone').optional().isString(),
  body('status').optional().isIn(['active', 'suspended', 'pending']),
  body('roleId').optional().isInt()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation Error', details: errors.array() });
  }

  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User Not Found', message: 'User does not exist' });
  }

  const { email, password, firstName, lastName, phone, status, roleId } = req.body;

  if (email && email !== user.email) {
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: 'Email In Use', message: 'Another user already uses this email' });
    }
    user.email = email;
  }
  if (password && password.trim() !== '') {
    user.passwordHash = password; // Will be hashed automatically by the User model hook
  }
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (phone !== undefined) user.phone = phone;
  if (status !== undefined) user.status = status;
  if (roleId !== undefined) {
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ error: 'Invalid Role', message: 'Provided roleId does not exist' });
    }
    user.roleId = roleId;
  }

  await user.save();

  res.json({ message: 'User updated successfully', user: user.toJSON() });
}));

// Reset user password (Super Admin only). Returns a temporary password that was set.
router.post('/users/:id/reset-password', requireSuperAdmin, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User Not Found', message: 'User does not exist' });
  }

  const providedPassword = (req.body && typeof req.body.newPassword === 'string' && req.body.newPassword.trim().length >= 6)
    ? req.body.newPassword.trim()
    : null;

  const tempPassword = providedPassword || generateTempPassword();
  user.passwordHash = tempPassword; // Will be hashed by model hook
  await user.save();

  return res.json({ message: 'Password reset successfully', tempPassword });
}));

// View user password (Super Admin only) with token verification
router.post('/users/:id/view-password', requireSuperAdmin, asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (token !== 'sankalp') {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }

  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User Not Found', message: 'User does not exist' });
  }

  const plain = decryptPassword(user.passwordEncrypted);
  if (!plain) {
    return res.status(404).json({ error: 'Password Not Available', message: 'Password cannot be retrieved' });
  }

  return res.json({ password: plain });
}));

// Simple password view for admins (no token). Used by UI to show password in user details
router.get('/users/:id/password', requireAdmin, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User Not Found', message: 'User does not exist' });
  }

  const plain = decryptPassword(user.passwordEncrypted);
  if (!plain) {
    return res.status(404).json({ error: 'Password Not Available', message: 'Password cannot be retrieved' });
  }

  return res.json({ password: plain });
}));

// Delete user permanently (hard delete)
router.delete('/users/:id', requireAdmin, asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({ error: 'User Not Found', message: 'User does not exist' });
  }

  await sequelize.transaction(async (t) => {
    // Detach referrals pointing to this user
    await User.update({ referredBy: null }, { where: { referredBy: userId }, transaction: t });

    // Collect wallet ids
    const wallets = await Wallet.findAll({ where: { userId }, attributes: ['id'], transaction: t });
    const walletIds = wallets.map(w => w.id);

    // Delete dependent data in safe order
    await Transaction.destroy({ where: { userId }, transaction: t });
    if (walletIds.length > 0) {
      await Transaction.destroy({ where: { walletId: walletIds }, transaction: t });
    }
    await Ticket.destroy({ where: { userId }, transaction: t });
    await UserPlan.destroy({ where: { userId }, transaction: t });
    await Wallet.destroy({ where: { userId }, transaction: t });

    // Finally delete the user
    await user.destroy({ transaction: t });
  });

  res.json({ message: 'User deleted permanently' });
}));

// Get user details
router.get('/users/:id', requireAdmin, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    include: [
      { model: Role, as: 'role' },
      { model: Wallet, as: 'wallets' },
      { model: Transaction, as: 'transactions', limit: 10, order: [['createdAt', 'DESC']] },
      { model: Ticket, as: 'tickets', limit: 10, order: [['createdAt', 'DESC']] }
    ]
  });

  if (!user) {
    return res.status(404).json({
      error: 'User Not Found',
      message: 'User does not exist'
    });
  }

  res.json({ user });
}));

// Update user status
router.patch('/users/:id/status', requireAdmin, [
  body('status').isIn(['active', 'suspended', 'pending']).withMessage('Invalid status')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array()
    });
  }

  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(404).json({
      error: 'User Not Found',
      message: 'User does not exist'
    });
  }

  user.status = req.body.status;
  await user.save();

  res.json({
    message: 'User status updated successfully',
    user: user.toJSON()
  });
}));

// Verify user (set status=active and emailVerified=true)
router.post('/users/:id/verify', requireAdmin, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(404).json({
      error: 'User Not Found',
      message: 'User does not exist'
    });
  }

  await user.update({
    status: 'active',
    emailVerified: true,
    emailVerificationToken: null,
    emailVerificationExpires: null
  });

  res.json({
    message: 'User verified successfully',
    user: user.toJSON()
  });
}));

// ==================== JACKPOTS MANAGEMENT ====================

// Get all jackpots with pagination and filters
router.get('/jackpots', requireAdmin, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = {};
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } }
    ];
  }
  if (status && status !== 'all') {
    whereClause.status = status;
  }

  const { count, rows: jackpots } = await Jackpot.findAndCountAll({
    where: whereClause,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    jackpots,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit)
    }
  });
}));

// Get jackpot details
router.get('/jackpots/:id', requireAdmin, asyncHandler(async (req, res) => {
  const jackpot = await Jackpot.findByPk(req.params.id, {
    include: [
      { model: Ticket, as: 'tickets', limit: 20, order: [['createdAt', 'DESC']] }
    ]
  });

  if (!jackpot) {
    return res.status(404).json({
      error: 'Jackpot Not Found',
      message: 'Jackpot does not exist'
    });
  }

  res.json({ jackpot });
}));

// Create jackpot
router.post('/jackpots', requireAdmin, [
  body('name').notEmpty().withMessage('Name is required'),
  body('amount').isNumeric().withMessage('Amount must be numeric'),
  body('ticketPrice').isNumeric().withMessage('Ticket price must be numeric'),
  body('maxWinners').isInt({ min: 1 }).withMessage('Max winners must be at least 1'),
  body('drawTime').notEmpty().withMessage('Draw time is required'),
  body('description').optional().isString()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation Error', details: errors.array() });
  }

  const { name, amount, ticketPrice, maxWinners, drawTime, description } = req.body;

  const lastJackpot = await Jackpot.findOne({ order: [['drawNumber', 'DESC']] });
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

  res.status(201).json({ message: 'Jackpot created successfully', jackpot });
}));

// Update jackpot
router.put('/jackpots/:id', requireAdmin, [
  body('name').optional(),
  body('amount').optional().isNumeric(),
  body('ticketPrice').optional().isNumeric(),
  body('maxWinners').optional().isInt({ min: 1 }),
  body('drawTime').optional(),
  body('description').optional(),
  body('status').optional().isIn(['active', 'drawing', 'completed']),
  body('isActive').optional().isBoolean()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation Error', details: errors.array() });
  }

  const jackpot = await Jackpot.findByPk(req.params.id);
  if (!jackpot) {
    return res.status(404).json({ error: 'Jackpot Not Found', message: 'Jackpot does not exist' });
  }

  const { name, amount, ticketPrice, maxWinners, drawTime, description, status, isActive } = req.body;
  if (name !== undefined) jackpot.name = name;
  if (amount !== undefined) jackpot.amount = parseFloat(amount);
  if (ticketPrice !== undefined) jackpot.ticketPrice = parseFloat(ticketPrice);
  if (maxWinners !== undefined) jackpot.maxWinners = parseInt(maxWinners);
  if (drawTime !== undefined) jackpot.drawTime = new Date(drawTime);
  if (description !== undefined) jackpot.description = description;
  if (status !== undefined) jackpot.status = status;
  if (isActive !== undefined) jackpot.isActive = isActive;

  await jackpot.save();
  res.json({ message: 'Jackpot updated successfully', jackpot });
}));

// Delete jackpot
router.delete('/jackpots/:id', requireAdmin, asyncHandler(async (req, res) => {
  const jackpot = await Jackpot.findByPk(req.params.id);
  if (!jackpot) {
    return res.status(404).json({ error: 'Jackpot Not Found', message: 'Jackpot does not exist' });
  }
  const activeTickets = await Ticket.count({ where: { jackpotId: req.params.id, status: 'active' } });
  if (activeTickets > 0) {
    return res.status(400).json({ error: 'Active Tickets Found', message: 'Cannot delete jackpot with active tickets' });
  }
  await jackpot.destroy();
  res.json({ message: 'Jackpot deleted successfully' });
}));

// ==================== TRANSACTIONS MANAGEMENT ====================

// Get all transactions with pagination and filters
router.get('/transactions', requireAdmin, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status, type } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = {};
  if (search) {
    whereClause[Op.or] = [
      { referenceId: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } }
    ];
  }
  if (status && status !== 'all') {
    whereClause.status = status;
  }
  if (type && type !== 'all') {
    whereClause.transactionType = type;
  }

  const { count, rows: transactions } = await Transaction.findAndCountAll({
    where: whereClause,
    include: [
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: Wallet, as: 'wallet', attributes: ['walletType'] }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    transactions,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit)
    }
  });
}));

// ==================== TICKETS MANAGEMENT ====================

// Get all tickets with pagination and filters
router.get('/tickets', requireAdmin, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = {};
  if (search) {
    whereClause[Op.or] = [
      { ticketNumber: { [Op.iLike]: `%${search}%` } }
    ];
  }
  if (status && status !== 'all') {
    whereClause.status = status;
  }

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereClause,
    include: [
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: Jackpot, as: 'jackpot', attributes: ['id', 'name'] }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    tickets,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit)
    }
  });
}));

// ==================== WALLETS MANAGEMENT ====================

// Get all wallets with pagination and filters
router.get('/wallets', requireAdmin, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, type } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = {};
  if (type && type !== 'all') {
    whereClause.walletType = type;
  }

  const { count, rows: wallets } = await Wallet.findAndCountAll({
    where: whereClause,
    include: [
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }
    ],
    order: [['updatedAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    wallets,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit)
    }
  });
}));

// ==================== ROLES MANAGEMENT ====================

// Get all roles
router.get('/roles', requireAdmin, asyncHandler(async (req, res) => {
  const roles = await Role.findAll({
    include: [
      { model: User, as: 'users', attributes: ['id'] }
    ]
  });

  // Add user count to each role
  const rolesWithCount = roles.map(role => ({
    ...role.toJSON(),
    userCount: role.users?.length || 0
  }));

  res.json({ roles: rolesWithCount });
}));

// ==================== SETTINGS MANAGEMENT ====================

// Get all settings
router.get('/settings', requireAdmin, asyncHandler(async (req, res) => {
  const { category, group } = req.query;

  const whereClause = {};
  if (category && category !== 'all') {
    whereClause.category = category;
  }
  if (group && group !== 'all') {
    whereClause.group = group;
  }

  const settings = await Setting.findAll({
    where: whereClause,
    order: [['sortOrder', 'ASC'], ['key', 'ASC']]
  });

  res.json({ settings });
}));

// Update setting
router.put('/settings/:key', requireAdmin, [
  body('value').notEmpty().withMessage('Value is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array()
    });
  }

  const setting = await Setting.findOne({
    where: { key: req.params.key }
  });

  if (!setting) {
    return res.status(404).json({
      error: 'Setting Not Found',
      message: 'Setting does not exist'
    });
  }

  setting.setValue(req.body.value);
  await setting.save();

  res.json({
    message: 'Setting updated successfully',
    setting: setting.toJSON()
  });
}));

// Create setting
router.post('/settings', requireAdmin, [
  body('key').notEmpty().withMessage('Key is required'),
  body('value').notEmpty().withMessage('Value is required'),
  body('type').isIn(['string', 'number', 'boolean', 'json', 'file']).withMessage('Invalid type'),
  body('category').notEmpty().withMessage('Category is required'),
  body('description').optional(),
  body('isPublic').optional().isBoolean(),
  body('languageCode').optional().isString()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation Error', details: errors.array() });
  }

  const { key, value, type, category, description, isPublic = true, languageCode = 'en', group, sortOrder = 0 } = req.body;

  const existing = await Setting.findOne({ where: { key, languageCode } });
  if (existing) {
    return res.status(409).json({ error: 'Setting Already Exists', message: 'Key already exists for this language' });
  }

  const setting = await Setting.create({ key, value, type, category, description, isPublic, languageCode, group, sortOrder });
  res.status(201).json({ message: 'Setting created successfully', setting: setting.toJSON() });
}));

// Delete setting
router.delete('/settings/:key', requireAdmin, asyncHandler(async (req, res) => {
  const setting = await Setting.findOne({ where: { key: req.params.key } });
  if (!setting) {
    return res.status(404).json({ error: 'Setting Not Found', message: 'Setting does not exist' });
  }
  await setting.destroy();
  res.json({ message: 'Setting deleted successfully' });
}));

// ==================== LANGUAGES MANAGEMENT ====================

// Get all languages
router.get('/languages', requireAdmin, asyncHandler(async (req, res) => {
  const languages = await Language.findAll({
    order: [['isDefault', 'DESC'], ['name', 'ASC']]
  });

  res.json({ languages });
}));

// ==================== PAGES MANAGEMENT ====================

// Get all pages
router.get('/pages', requireAdmin, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, type, status } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = {};
  if (search) {
    whereClause[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { slug: { [Op.iLike]: `%${search}%` } }
    ];
  }
  if (type && type !== 'all') {
    whereClause.pageType = type;
  }
  if (status && status !== 'all') {
    whereClause.isPublished = status === 'published';
  }

  const { count, rows: pages } = await Page.findAndCountAll({
    where: whereClause,
    order: [['sortOrder', 'ASC'], ['title', 'ASC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    pages,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit)
    }
  });
}));

// Create page
router.post('/pages', requireAdmin, [
  body('title').notEmpty().withMessage('Title is required'),
  body('slug').notEmpty().withMessage('Slug is required'),
  body('content').optional(),
  body('metaTitle').optional(),
  body('metaDescription').optional(),
  body('metaKeywords').optional(),
  body('pageType').optional().isIn(['static', 'dynamic', 'system']),
  body('isPublished').optional().isBoolean(),
  body('isPublic').optional().isBoolean(),
  body('requiresAuth').optional().isBoolean(),
  body('sortOrder').optional().isInt(),
  body('parentId').optional().isInt(),
  body('languageCode').optional().isString(),
  body('template').optional(),
  body('customFields').optional().isObject()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation Error', details: errors.array() });
  }

  const { slug, languageCode = 'en' } = req.body;
  const exists = await Page.findOne({ where: { slug, languageCode } });
  if (exists) {
    return res.status(409).json({ error: 'Page Already Exists', message: 'A page with this slug already exists for this language' });
  }

  const page = await Page.create(req.body);
  res.status(201).json({ message: 'Page created successfully', page });
}));

// Update page
router.put('/pages/:id', requireAdmin, [
  body('title').optional(),
  body('slug').optional(),
  body('content').optional(),
  body('metaTitle').optional(),
  body('metaDescription').optional(),
  body('metaKeywords').optional(),
  body('pageType').optional().isIn(['static', 'dynamic', 'system']),
  body('isPublished').optional().isBoolean(),
  body('isPublic').optional().isBoolean(),
  body('requiresAuth').optional().isBoolean(),
  body('sortOrder').optional().isInt(),
  body('parentId').optional().isInt(),
  body('template').optional(),
  body('customFields').optional().isObject()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation Error', details: errors.array() });
  }

  const page = await Page.findByPk(req.params.id);
  if (!page) {
    return res.status(404).json({ error: 'Page Not Found', message: 'The requested page does not exist' });
  }

  if (req.body.slug && req.body.slug !== page.slug) {
    const conflict = await Page.findOne({ where: { slug: req.body.slug, languageCode: page.languageCode } });
    if (conflict) {
      return res.status(409).json({ error: 'Page Already Exists', message: 'A page with this slug already exists for this language' });
    }
  }

  await page.update(req.body);
  res.json({ message: 'Page updated successfully', page });
}));

// Delete page
router.delete('/pages/:id', requireAdmin, asyncHandler(async (req, res) => {
  const page = await Page.findByPk(req.params.id);
  if (!page) {
    return res.status(404).json({ error: 'Page Not Found', message: 'The requested page does not exist' });
  }
  const children = await Page.count({ where: { parentId: req.params.id } });
  if (children > 0) {
    return res.status(400).json({ error: 'Cannot Delete Page', message: 'This page has child pages. Please delete them first.' });
  }
  await page.destroy();
  res.json({ message: 'Page deleted successfully' });
}));

export default router;

