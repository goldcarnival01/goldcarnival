import express from 'express';
import { UserPlan, Plan, User } from '../models/associations.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = express.Router();

// Get user's purchased plans
router.get('/my-plans', authenticateToken, async (req, res) => {
  try {
    const userPlans = await UserPlan.findAll({
      where: { 
        userId: req.user.id,
        isActive: true
      },
      attributes: [
        'id', 'userId', 'planId', 'purchaseDate', 'expiryDate', 'status', 
        'purchasePrice', 'transactionId', 'paymentMethod', 'walletAddress', 
        'notes', 'isActive', 'verified', 'createdAt', 'updatedAt'
      ],
      include: [
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'name', 'type', 'amount', 'monthlyIncome', 'bonusReward', 'category', 'features', 'badge']
        }
      ],
      order: [['purchaseDate', 'DESC']]
    });

    res.json({
      success: true,
      data: userPlans
    });
  } catch (error) {
    console.error('Error fetching user plans:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user plans',
      error: error.message
    });
  }
});

// Get user's plan history (including expired/cancelled)
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.id };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await UserPlan.findAndCountAll({
      where: whereClause,
      attributes: [
        'id', 'userId', 'planId', 'purchaseDate', 'expiryDate', 'status', 
        'purchasePrice', 'transactionId', 'paymentMethod', 'walletAddress', 
        'notes', 'isActive', 'verified', 'createdAt', 'updatedAt'
      ],
      include: [
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'name', 'type', 'amount', 'category', 'features', 'badge']
        }
      ],
      order: [['purchaseDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        userPlans: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user plan history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user plan history',
      error: error.message
    });
  }
});

// Purchase a plan
router.post('/purchase', authenticateToken, async (req, res) => {
  try {
    const { planId, paymentMethod, transactionId, walletAddress, purchasePrice } = req.body;
    console.log('🧾 User plan purchase payload:', {
      planId,
      paymentMethod,
      transactionId,
      walletAddress,
      purchasePrice
    });

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required'
      });
    }

    // Get plan details
    const plan = await Plan.findByPk(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found or not active'
      });
    }

    // Check if user already has this plan (for exclusive plans)
    if (plan.category === 'EXCLUSIVE_PLAN') {
      const existingPlan = await UserPlan.findOne({
        where: {
          userId: req.user.id,
          planId: planId,
          status: 'active',
          isActive: true
        }
      });

      if (existingPlan) {
        return res.status(400).json({
          success: false,
          message: 'You already have this plan active'
        });
      }
    }

    // Calculate expiry date (1 year from purchase for now)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Create user plan
    const userPlan = await UserPlan.create({
      userId: req.user.id,
      planId: planId,
      purchasePrice: purchasePrice !== undefined && purchasePrice !== null && !isNaN(parseFloat(purchasePrice))
        ? parseFloat(purchasePrice)
        : (plan.price || plan.amount),
      expiryDate: expiryDate,
      paymentMethod: paymentMethod || 'wallet',
      transactionId: transactionId,
      walletAddress: walletAddress,
      status: 'active',
      isActive: true,
      verified: 'pending'
    });

    // Fetch the complete user plan with plan details
    const completePlan = await UserPlan.findByPk(userPlan.id, {
      include: [
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'name', 'type', 'amount', 'category', 'features', 'badge']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Plan purchased successfully',
      data: completePlan
    });
  } catch (error) {
    console.error('Error purchasing plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error purchasing plan',
      error: error.message
    });
  }
});

// Cancel a user plan
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const userPlan = await UserPlan.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!userPlan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    if (userPlan.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Plan is not active'
      });
    }

    await userPlan.update({
      status: 'cancelled',
      isActive: false
    });

    res.json({
      success: true,
      message: 'Plan cancelled successfully',
      data: userPlan
    });
  } catch (error) {
    console.error('Error cancelling plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling plan',
      error: error.message
    });
  }
});

// Admin routes - Get all user plans
router.get('/admin/all', authenticateToken, requirePermission('plan.manage'), async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, planId, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (userId) whereClause.userId = userId;
    if (planId) whereClause.planId = planId;
    if (status) whereClause.status = status;

    const { count, rows } = await UserPlan.findAndCountAll({
      where: whereClause,
      attributes: [
        'id', 'userId', 'planId', 'purchaseDate', 'expiryDate', 'status', 
        'purchasePrice', 'transactionId', 'paymentMethod', 'walletAddress', 
        'notes', 'isActive', 'verified', 'createdAt', 'updatedAt'
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'memberId', 'email', 'firstName', 'lastName']
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'name', 'type', 'amount', 'category', 'badge']
        }
      ],
      order: [['purchaseDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        userPlans: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin user plans:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user plans',
      error: error.message
    });
  }
});

// Admin route - Create user plan
router.post('/admin/create', authenticateToken, requirePermission('plan.manage'), async (req, res) => {
  try {
    const { userId, planId, purchasePrice, expiryDate, paymentMethod, transactionId, notes } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Plan ID are required'
      });
    }

    // Verify user and plan exist
    const user = await User.findByPk(userId);
    const plan = await Plan.findByPk(planId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    const userPlan = await UserPlan.create({
      userId,
      planId,
      purchasePrice: purchasePrice || plan.price || plan.amount,
      expiryDate: expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year default
      paymentMethod: paymentMethod || 'admin',
      transactionId,
      notes,
      status: 'active',
      isActive: true
    });

    // Fetch the complete user plan with user and plan details
    const completePlan = await UserPlan.findByPk(userPlan.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'memberId', 'email', 'firstName', 'lastName']
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'name', 'type', 'amount', 'category', 'badge']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'User plan created successfully',
      data: completePlan
    });
  } catch (error) {
    console.error('Error creating user plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user plan',
      error: error.message
    });
  }
});

// Admin route - Verify user plan
router.patch('/admin/:id/verify', authenticateToken, requirePermission('plan.manage'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const userPlan = await UserPlan.findByPk(id);
    if (!userPlan) {
      return res.status(404).json({
        success: false,
        message: 'User plan not found'
      });
    }

    // Update verification status to verified
    await userPlan.update({
      verified: 'verified'
    });

    res.json({
      success: true,
      message: 'User plan verified successfully',
      data: userPlan
    });
  } catch (error) {
    console.error('Error verifying user plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying user plan',
      error: error.message
    });
  }
});

// Admin route - Reject user plan
router.delete('/admin/:id/reject', authenticateToken, requirePermission('plan.manage'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const userPlan = await UserPlan.findByPk(id);
    if (!userPlan) {
      return res.status(404).json({
        success: false,
        message: 'User plan not found'
      });
    }

    // Delete the rejected plan
    await userPlan.destroy();

    res.json({
      success: true,
      message: 'User plan rejected and deleted successfully'
    });
  } catch (error) {
    console.error('Error rejecting user plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting user plan',
      error: error.message
    });
  }
});

export default router;
