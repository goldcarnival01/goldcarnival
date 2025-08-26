import express from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requirePermission } from '../middleware/permissions.js';
import Page from '../models/Page.js';
import Language from '../models/Language.js';

const router = express.Router();

// Get all published pages
router.get('/published', asyncHandler(async (req, res) => {
  const { languageCode = 'en' } = req.query;

  const pages = await Page.findAll({
    where: {
      isPublished: true,
      languageCode
    },
    order: [['sortOrder', 'ASC'], ['title', 'ASC']]
  });

  res.json({
    message: 'Published pages retrieved successfully',
    pages
  });
}));

// Get page by slug
router.get('/slug/:slug', asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { languageCode = 'en' } = req.query;

  const page = await Page.findOne({
    where: {
      slug,
      isPublished: true,
      languageCode
    }
  });

  if (!page) {
    return res.status(404).json({
      error: 'Page Not Found',
      message: 'The requested page does not exist'
    });
  }

  res.json({
    message: 'Page retrieved successfully',
    page
  });
}));

// Get page by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const page = await Page.findByPk(id);

  if (!page) {
    return res.status(404).json({
      error: 'Page Not Found',
      message: 'The requested page does not exist'
    });
  }

  res.json({
    message: 'Page retrieved successfully',
    page
  });
}));

// Create new page (admin only)
router.post('/', requirePermission('page.manage'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('slug').notEmpty().withMessage('Slug is required'),
  body('content').optional(),
  body('metaTitle').optional(),
  body('metaDescription').optional(),
  body('metaKeywords').optional(),
  body('pageType').isIn(['static', 'dynamic', 'system']).withMessage('Invalid page type'),
  body('isPublished').optional().isBoolean().withMessage('isPublished must be boolean'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be boolean'),
  body('requiresAuth').optional().isBoolean().withMessage('requiresAuth must be boolean'),
  body('sortOrder').optional().isInt().withMessage('sortOrder must be integer'),
  body('parentId').optional().isInt().withMessage('parentId must be integer'),
  body('languageCode').optional().isString().withMessage('languageCode must be string'),
  body('template').optional(),
  body('customFields').optional().isObject().withMessage('customFields must be object')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const {
    title,
    slug,
    content,
    metaTitle,
    metaDescription,
    metaKeywords,
    pageType = 'static',
    isPublished = true,
    isPublic = true,
    requiresAuth = false,
    sortOrder = 0,
    parentId,
    languageCode = 'en',
    template,
    customFields
  } = req.body;

  // Check if page with slug already exists
  const existingPage = await Page.findOne({
    where: { slug, languageCode }
  });

  if (existingPage) {
    return res.status(409).json({
      error: 'Page Already Exists',
      message: 'A page with this slug already exists for this language'
    });
  }

  const page = await Page.create({
    title,
    slug,
    content,
    metaTitle,
    metaDescription,
    metaKeywords,
    pageType,
    isPublished,
    isPublic,
    requiresAuth,
    sortOrder,
    parentId,
    languageCode,
    template,
    customFields
  });

  res.status(201).json({
    message: 'Page created successfully',
    page
  });
}));

// Update page (admin only)
router.put('/:id', requirePermission('page.manage'), [
  body('title').optional(),
  body('slug').optional(),
  body('content').optional(),
  body('metaTitle').optional(),
  body('metaDescription').optional(),
  body('metaKeywords').optional(),
  body('pageType').optional().isIn(['static', 'dynamic', 'system']).withMessage('Invalid page type'),
  body('isPublished').optional().isBoolean().withMessage('isPublished must be boolean'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be boolean'),
  body('requiresAuth').optional().isBoolean().withMessage('requiresAuth must be boolean'),
  body('sortOrder').optional().isInt().withMessage('sortOrder must be integer'),
  body('parentId').optional().isInt().withMessage('parentId must be integer'),
  body('template').optional(),
  body('customFields').optional().isObject().withMessage('customFields must be object')
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

  const page = await Page.findByPk(id);

  if (!page) {
    return res.status(404).json({
      error: 'Page Not Found',
      message: 'The requested page does not exist'
    });
  }

  // Check if slug is being updated and if it conflicts
  if (updateData.slug && updateData.slug !== page.slug) {
    const existingPage = await Page.findOne({
      where: { slug: updateData.slug, languageCode: page.languageCode }
    });

    if (existingPage) {
      return res.status(409).json({
        error: 'Page Already Exists',
        message: 'A page with this slug already exists for this language'
      });
    }
  }

  await page.update(updateData);

  res.json({
    message: 'Page updated successfully',
    page
  });
}));

// Delete page (admin only)
router.delete('/:id', requirePermission('page.manage'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const page = await Page.findByPk(id);

  if (!page) {
    return res.status(404).json({
      error: 'Page Not Found',
      message: 'The requested page does not exist'
    });
  }

  // Check if page has children
  const children = await Page.findAll({
    where: { parentId: id }
  });

  if (children.length > 0) {
    return res.status(400).json({
      error: 'Cannot Delete Page',
      message: 'This page has child pages. Please delete them first.'
    });
  }

  await page.destroy();

  res.json({
    message: 'Page deleted successfully'
  });
}));

// Get page hierarchy
router.get('/hierarchy/:languageCode', asyncHandler(async (req, res) => {
  const { languageCode = 'en' } = req.params;

  const pages = await Page.findAll({
    where: {
      isPublished: true,
      languageCode
    },
    order: [['sortOrder', 'ASC'], ['title', 'ASC']]
  });

  // Build hierarchy
  const buildHierarchy = (parentId = null) => {
    return pages
      .filter(page => page.parentId === parentId)
      .map(page => ({
        ...page.toJSON(),
        children: buildHierarchy(page.id)
      }));
  };

  const hierarchy = buildHierarchy();

  res.json({
    message: 'Page hierarchy retrieved successfully',
    hierarchy
  });
}));

export default router; 