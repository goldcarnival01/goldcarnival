import express from 'express';
import { Plan } from '../models/associations.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = express.Router();

// Get all plans (public route for frontend display)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    const whereClause = { isActive: true };
    if (category) {
      whereClause.category = category;
    }

    const plans = await Plan.findAll({
      where: whereClause,
      order: [['category', 'ASC'], ['sortOrder', 'ASC'], ['id', 'ASC']]
    });

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plans',
      error: error.message
    });
  }
});

// Get plan by ID (public route)
router.get('/:id', async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plan',
      error: error.message
    });
  }
});

// Admin routes (require authentication and admin role)
// Get all plans for admin (including inactive)
router.get('/admin/all', authenticateToken, requirePermission('plan.manage'), async (req, res) => {
  try {
    const plans = await Plan.findAll({
      order: [['category', 'ASC'], ['sortOrder', 'ASC'], ['id', 'ASC']]
    });

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error fetching admin plans:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plans',
      error: error.message
    });
  }
});

// Create new plan
router.post('/admin', authenticateToken, requirePermission('plan.manage'), async (req, res) => {
  try {
    const {
      name,
      type,
      amount,
      price,
      monthlyIncome,
      bonusReward,
      category,
      features,
      badge,
      isActive,
      sortOrder
    } = req.body;

    // Validate required fields
    if (!name || !type || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, amount, and category are required'
      });
    }

    const plan = await Plan.create({
      name,
      type,
      amount,
      price,
      monthlyIncome,
      bonusReward,
      category,
      features: features || [],
      badge,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0
    });

    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: plan
    });
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating plan',
      error: error.message
    });
  }
});

// Update plan
router.put('/admin/:id', authenticateToken, requirePermission('plan.manage'), async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    const {
      name,
      type,
      amount,
      price,
      monthlyIncome,
      bonusReward,
      category,
      features,
      badge,
      isActive,
      sortOrder
    } = req.body;

    await plan.update({
      name: name || plan.name,
      type: type || plan.type,
      amount: amount !== undefined ? amount : plan.amount,
      price: price !== undefined ? price : plan.price,
      monthlyIncome: monthlyIncome !== undefined ? monthlyIncome : plan.monthlyIncome,
      bonusReward: bonusReward !== undefined ? bonusReward : plan.bonusReward,
      category: category || plan.category,
      features: features !== undefined ? features : plan.features,
      badge: badge !== undefined ? badge : plan.badge,
      isActive: isActive !== undefined ? isActive : plan.isActive,
      sortOrder: sortOrder !== undefined ? sortOrder : plan.sortOrder
    });

    res.json({
      success: true,
      message: 'Plan updated successfully',
      data: plan
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating plan',
      error: error.message
    });
  }
});

// Delete plan
router.delete('/admin/:id', authenticateToken, requirePermission('plan.manage'), async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    await plan.destroy();

    res.json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting plan',
      error: error.message
    });
  }
});

// Toggle plan status
router.patch('/admin/:id/toggle', authenticateToken, requirePermission('plan.manage'), async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    await plan.update({
      isActive: !plan.isActive
    });

    res.json({
      success: true,
      message: `Plan ${plan.isActive ? 'activated' : 'deactivated'} successfully`,
      data: plan
    });
  } catch (error) {
    console.error('Error toggling plan status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating plan status',
      error: error.message
    });
  }
});

export default router;
