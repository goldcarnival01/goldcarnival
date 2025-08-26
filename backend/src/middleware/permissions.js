import { asyncHandler } from './errorHandler.js';
import User from '../models/User.js';
import Role from '../models/Role.js';

// Middleware to check if user has specific permission
export const requirePermission = (permission) => {
  return asyncHandler(async (req, res, next) => {
    try {
      // Get user with role
      const user = await User.findByPk(req.user.id, {
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['id', 'name', 'slug', 'permissions']
          }
        ]
      });

      if (!user || !user.role) {
        return res.status(403).json({
          error: 'Access Denied',
          message: 'User role not found'
        });
      }

      // Check if role has the required permission
      if (!user.role.hasPermission(permission)) {
        return res.status(403).json({
          error: 'Access Denied',
          message: `Insufficient permissions. Required: ${permission}`
        });
      }

      // Add user and role to request for use in route handlers
      req.userWithRole = user;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        error: 'Permission Check Failed',
        message: 'Error checking user permissions'
      });
    }
  });
};

// Middleware to check if user has any of the specified permissions
export const requireAnyPermission = (permissions) => {
  return asyncHandler(async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id, {
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['id', 'name', 'slug', 'permissions']
          }
        ]
      });

      if (!user || !user.role) {
        return res.status(403).json({
          error: 'Access Denied',
          message: 'User role not found'
        });
      }

      // Check if role has any of the required permissions
      const hasAnyPermission = permissions.some(permission => 
        user.role.hasPermission(permission)
      );

      if (!hasAnyPermission) {
        return res.status(403).json({
          error: 'Access Denied',
          message: `Insufficient permissions. Required one of: ${permissions.join(', ')}`
        });
      }

      req.userWithRole = user;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        error: 'Permission Check Failed',
        message: 'Error checking user permissions'
      });
    }
  });
};

// Middleware to check if user has all specified permissions
export const requireAllPermissions = (permissions) => {
  return asyncHandler(async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id, {
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['id', 'name', 'slug', 'permissions']
          }
        ]
      });

      if (!user || !user.role) {
        return res.status(403).json({
          error: 'Access Denied',
          message: 'User role not found'
        });
      }

      // Check if role has all required permissions
      const hasAllPermissions = permissions.every(permission => 
        user.role.hasPermission(permission)
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          error: 'Access Denied',
          message: `Insufficient permissions. Required all: ${permissions.join(', ')}`
        });
      }

      req.userWithRole = user;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        error: 'Permission Check Failed',
        message: 'Error checking user permissions'
      });
    }
  });
};

// Middleware to check if user has specific role
export const requireRole = (roleSlug) => {
  return asyncHandler(async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id, {
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['id', 'name', 'slug', 'permissions']
          }
        ]
      });

      if (!user || !user.role) {
        return res.status(403).json({
          error: 'Access Denied',
          message: 'User role not found'
        });
      }

      if (user.role.slug !== roleSlug) {
        return res.status(403).json({
          error: 'Access Denied',
          message: `Insufficient role. Required: ${roleSlug}`
        });
      }

      req.userWithRole = user;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({
        error: 'Role Check Failed',
        message: 'Error checking user role'
      });
    }
  });
};

// Helper function to get user permissions (for use in route handlers)
export const getUserPermissions = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [
      {
        model: Role,
        as: 'role',
        attributes: ['id', 'name', 'slug', 'permissions']
      }
    ]
  });

  return user?.role?.permissions || [];
}; 