import express from 'express';
import { Op } from 'sequelize';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateTokens, blacklistToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import Role from '../models/Role.js';
import { sendEmail } from '../services/emailService.js';
import { redisClient } from '../config/redis.js';

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('referralCode').optional().trim().isLength({ min: 6 }).withMessage('Referral code must be at least 6 characters')
];

const validateLogin = [
  body('identifier').notEmpty().withMessage('Email or Member ID is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Register new user
router.post('/register', validateRegistration, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  let { email, password, memberId, firstName, lastName, phone, referralCode } = req.body;

  // Generate memberId automatically if not provided
  if (!memberId) {
    // simple unique memberId: 'GC' + timestamp + random 3 digits
    memberId = `GC${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 900 + 100)}`;
  }

  // Check if user already exists (email or memberId)
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [
        { email },
        { memberId }
      ]
    }
  });

  if (existingUser) {
    return res.status(409).json({
      error: 'User Already Exists',
      message: 'A user with this email or member ID already exists'
    });
  }

  // Check referral code if provided
  let referredBy = null;
  if (referralCode) {
    const referrer = await User.findOne({ where: { referralCode } });
    if (!referrer) {
      return res.status(400).json({
        error: 'Invalid Referral Code',
        message: 'The provided referral code is invalid'
      });
    }
    referredBy = referrer.id;
  }

  // Get default role
  const defaultRole = await Role.findOne({
    where: { isDefault: true, isActive: true }
  });

  // Fallback: ensure a default user role exists
  let resolvedRole = defaultRole;
  if (!resolvedRole) {
    // Try to find an active 'user' role and promote it to default
    const existingUserRole = await Role.findOne({ where: { slug: 'user', isActive: true } });
    if (existingUserRole) {
      await existingUserRole.update({ isDefault: true });
      resolvedRole = existingUserRole;
    } else {
      // Create a minimal User role
      const createdRole = await Role.create({
        name: 'User',
        slug: 'user',
        description: 'Standard user access',
        permissions: [
          'ticket.purchase',
          'wallet.view',
          'profile.manage'
        ],
        isActive: true,
        isDefault: true
      });
      resolvedRole = createdRole;
    }
  }

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user
  const user = await User.create({
    email,
    passwordHash: password, // Will be hashed by model hook
    memberId,
    firstName,
    lastName,
    phone,
    referredBy,
    roleId: resolvedRole.id,
    status: 'pending',
    emailVerificationToken,
    emailVerificationExpires
  });

  // Create wallets for the user
  const walletTypes = ['deposit', 'winnings', 'ticket_bonus'];
  for (const walletType of walletTypes) {
    await Wallet.create({
      userId: user.id,
      walletType,
      balance: 0.00
    });
  }

  // Send verification email
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
  
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email - Gold Carnival',
      template: 'email-verification',
      data: {
        name: user.firstName || user.memberId,
        memberId: user.memberId,
        verificationUrl
      }
    });
    console.log('✅ Verification email sent successfully to:', user.email);
  } catch (emailError) {
    console.error('❌ Failed to send verification email:', emailError);
    // In development, we can still allow registration without email verification
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Development mode: Skipping email verification');
      // Auto-verify in development
      await user.update({
        status: 'active',
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      });
    }
  }

  res.status(201).json({
    message: 'Registration successful! Please check your email to verify your account.',
    user: {
      id: user.id,
      email: user.email,
      memberId: user.memberId,
      status: user.status
    }
  });
}));

// Login user
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const { identifier, password } = req.body;

  // Find user by email or member ID
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { email: identifier },
        { memberId: identifier }
      ]
    }
  });

  if (!user) {
    return res.status(401).json({
      error: 'Invalid Credentials',
      message: 'Invalid email/member ID or password'
    });
  }

  // Check if account is verified and active
  if (user.status === 'pending') {
    return res.status(403).json({
      error: 'Account Not Verified',
      message: 'Please verify your email address before logging in. Check your inbox for the verification link.'
    });
  }
  
  if (user.status !== 'active') {
    return res.status(403).json({
      error: 'Account Suspended',
      message: 'Your account has been suspended. Please contact support.'
    });
  }

  // Validate password
  const isValidPassword = await user.validatePassword(password);
  if (!isValidPassword) {
    return res.status(401).json({
      error: 'Invalid Credentials',
      message: 'Invalid email/member ID or password'
    });
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id);

  res.json({
    message: 'Login successful',
    user: user.toJSON(),
    tokens: {
      accessToken,
      refreshToken
    }
  });
}));

// Logout user
router.post('/logout', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    await blacklistToken(token);
  }

  res.json({
    message: 'Logged out successfully'
  });
}));

// Refresh token
router.post('/refresh-token', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      error: 'Refresh Token Required',
      message: 'Please provide a refresh token'
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        error: 'Invalid Refresh Token',
        message: 'User not found or account suspended'
      });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

    res.json({
      message: 'Token refreshed successfully',
      tokens: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid Refresh Token',
      message: 'The refresh token is invalid or expired'
    });
  }
}));

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    // Don't reveal if email exists or not
    return res.json({
      message: 'If an account with this email exists, a password reset link has been sent'
    });
  }

  // Generate reset token
  const resetToken = uuidv4();
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

  // Ensure redis is connected and store reset token
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (e) {}

  await redisClient.setEx(`reset:${resetToken}`, 3600, JSON.stringify({
    userId: user.id,
    email: user.email
  }));

  // Send reset email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      data: {
        name: user.firstName || user.memberId,
        resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
      }
    });
  } catch (emailError) {
    console.error('Failed to send reset email:', emailError);
    return res.status(500).json({
      error: 'Email Service Error',
      message: 'Failed to send password reset email'
    });
  }

  res.json({
    message: 'If an account with this email exists, a password reset link has been sent'
  });
}));

// Reset password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const { token, password } = req.body;

  // Ensure redis is connected and get reset token data
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (e) {}

  const resetData = await redisClient.get(`reset:${token}`);
  if (!resetData) {
    return res.status(400).json({
      error: 'Invalid Reset Token',
      message: 'The reset token is invalid or has expired'
    });
  }

  const { userId } = JSON.parse(resetData);
  const user = await User.findByPk(userId);

  if (!user) {
    return res.status(400).json({
      error: 'User Not Found',
      message: 'User associated with this reset token not found'
    });
  }

  // Update password
  user.passwordHash = password; // Will be hashed by model hook
  await user.save();

  // Delete reset token (best-effort)
  try {
    await redisClient.del(`reset:${token}`);
  } catch (e) {}

  res.json({
    message: 'Password reset successfully'
  });
}));

// Verify email
router.get('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      error: 'Invalid Request',
      message: 'Verification token is required'
    });
  }

  // Find user with this token
  const user = await User.findOne({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: {
        [Op.gt]: new Date()
      }
    }
  });

  if (!user) {
    return res.status(400).json({
      error: 'Invalid or Expired Token',
      message: 'The verification link is invalid or has expired. Please request a new verification email.'
    });
  }

  // Update user status and clear verification token
  await user.update({
    status: 'active',
    emailVerified: true,
    emailVerificationToken: null,
    emailVerificationExpires: null
  });

  res.json({
    message: 'Email verified successfully! You can now login to your account.',
    user: {
      id: user.id,
      email: user.email,
      memberId: user.memberId,
      status: user.status,
      emailVerified: user.emailVerified
    }
  });
}));

// Manual verification for testing (remove in production)
router.post('/verify-email-manual', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'Invalid Request',
      message: 'Email is required'
    });
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(404).json({
      error: 'User Not Found',
      message: 'No user found with this email address'
    });
  }

  // Auto-verify the user
  await user.update({
    status: 'active',
    emailVerified: true,
    emailVerificationToken: null,
    emailVerificationExpires: null
  });

  res.json({
    message: 'Email verified manually for testing purposes',
    user: {
      id: user.id,
      email: user.email,
      memberId: user.memberId,
      status: user.status,
      emailVerified: user.emailVerified
    }
  });
}));

// Test email configuration
router.post('/test-email', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'Invalid Request',
      message: 'Email is required'
    });
  }

  try {
    await sendEmail({
      to: email,
      subject: 'Test Email - Gold Carnival',
      template: 'welcome',
      data: {
        name: 'Test User',
        memberId: 'TEST123'
      }
    });

    res.json({
      message: 'Test email sent successfully',
      email: email
    });
  } catch (error) {
    console.error('Email test failed:', error);
    res.status(500).json({
      error: 'Email Test Failed',
      message: error.message,
      details: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        username: process.env.MAIL_USERNAME ? 'Set' : 'Not Set',
        password: process.env.MAIL_PASSWORD ? 'Set' : 'Not Set'
      }
    });
  }
}));

export default router; 