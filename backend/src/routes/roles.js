import express from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requirePermission } from '../middleware/permissions.js';
import Role from '../models/Role.js';
import User from '../models/User.js';

const router = express.Router();

// Get all roles
router.get('/', asyncHandler(async (req, res) => {
  const roles = await Role.findAll({
    where: { isActive: true },
    order: [['name', 'ASC']]
  });

  res.json({
    message: 'Roles retrieved successfully',
    roles
  });
}));

// Get role by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const role = await Role.findByPk(id, {
    include: [
      {
        model: User,
        as: 'users',
        attributes: ['id', 'memberId', 'email', 'firstName', 'lastName', 'status']
      }
    ]
  });

  if (!role) {
    return res.status(404).json({
      error: 'Role Not Found',
      message: 'The requested role does not exist'
    });
  }

  res.json({
    message: 'Role retrieved successfully',
    role
  });
}));

// Create new role (admin only)
router.post('/', requirePermission('role.manage'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('slug').notEmpty().withMessage('Slug is required'),
  body('description').optional(),
  body('permissions').optional().isArray().withMessage('Permissions must be an array'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be boolean')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const { name, slug, description, permissions = [], isActive = true, isDefault = false } = req.body;

  // Check if role with slug already exists
  const existingRole = await Role.findOne({
    where: { slug }
  });

  if (existingRole) {
    return res.status(409).json({
      error: 'Role Already Exists',
      message: 'A role with this slug already exists'
    });
  }

  // If this is set as default, unset other default roles
  if (isDefault) {
    await Role.update(
      { isDefault: false },
      { where: { isDefault: true } }
    );
  }

  const role = await Role.create({
    name,
    slug,
    description,
    permissions,
    isActive,
    isDefault
  });

  res.status(201).json({
    message: 'Role created successfully',
    role
  });
}));

// Update role (admin only)
router.put('/:id', requirePermission('role.manage'), [
  body('name').optional(),
  body('slug').optional(),
  body('description').optional(),
  body('permissions').optional().isArray().withMessage('Permissions must be an array'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be boolean')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const { id } = req.params;
  const updateData = req.body;

  const role = await Role.findByPk(id);

  if (!role) {
    return res.status(404).json({
      error: 'Role Not Found',
      message: 'The requested role does not exist'
    });
  }

  // Check if slug is being updated and if it conflicts
  if (updateData.slug && updateData.slug !== role.slug) {
    const existingRole = await Role.findOne({
      where: { slug: updateData.slug }
    });

    if (existingRole) {
      return res.status(409).json({
        error: 'Role Already Exists',
        message: 'A role with this slug already exists'
      });
    }
  }

  // If this is set as default, unset other default roles
  if (updateData.isDefault) {
    await Role.update(
      { isDefault: false },
      { where: { isDefault: true, id: { [require('sequelize').Op.ne]: id } } }
    );
  }

  await role.update(updateData);

  res.json({
    message: 'Role updated successfully',
    role
  });
}));

// Delete role (admin only)
router.delete('/:id', requirePermission('role.manage'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const role = await Role.findByPk(id);

  if (!role) {
    return res.status(404).json({
      error: 'Role Not Found',
      message: 'The requested role does not exist'
    });
  }

  // Check if role is default
  if (role.isDefault) {
    return res.status(400).json({
      error: 'Cannot Delete Default Role',
      message: 'Cannot delete the default role'
    });
  }

  // Check if role has users
  const usersWithRole = await User.count({
    where: { roleId: id }
  });

  if (usersWithRole > 0) {
    return res.status(400).json({
      error: 'Cannot Delete Role',
      message: 'This role is assigned to users. Please reassign them first.'
    });
  }

  await role.destroy();

  res.json({
    message: 'Role deleted successfully'
  });
}));

// Get users with specific role
router.get('/:id/users', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const role = await Role.findByPk(id);

  if (!role) {
    return res.status(404).json({
      error: 'Role Not Found',
      message: 'The requested role does not exist'
    });
  }

  const users = await User.findAll({
    where: { roleId: id },
    attributes: ['id', 'memberId', 'email', 'firstName', 'lastName', 'status', 'createdAt'],
    order: [['createdAt', 'DESC']]
  });

  res.json({
    message: 'Users with role retrieved successfully',
    role,
    users
  });
}));

// Add permission to role
router.post('/:id/permissions', requirePermission('role.manage'), [
  body('permission').notEmpty().withMessage('Permission is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const { id } = req.params;
  const { permission } = req.body;

  const role = await Role.findByPk(id);

  if (!role) {
    return res.status(404).json({
      error: 'Role Not Found',
      message: 'The requested role does not exist'
    });
  }

  await role.addPermission(permission);

  res.json({
    message: 'Permission added successfully',
    role
  });
}));

// Remove permission from role
router.delete('/:id/permissions/:permission', requirePermission('role.manage'), asyncHandler(async (req, res) => {
  const { id, permission } = req.params;

  const role = await Role.findByPk(id);

  if (!role) {
    return res.status(404).json({
      error: 'Role Not Found',
      message: 'The requested role does not exist'
    });
  }

  await role.removePermission(permission);

  res.json({
    message: 'Permission removed successfully',
    role
  });
}));

export default router; 