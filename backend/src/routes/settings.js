import express from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requirePermission } from '../middleware/permissions.js';
import Setting from '../models/Setting.js';
import Language from '../models/Language.js';

const router = express.Router();

// Get all public settings
router.get('/public', asyncHandler(async (req, res) => {
  const { languageCode = 'en' } = req.query;
  
  const settings = await Setting.getPublicSettings(languageCode);
  
  const settingsObject = settings.reduce((acc, setting) => {
    acc[setting.key] = setting.getValue();
    return acc;
  }, {});

  res.json({
    message: 'Public settings retrieved successfully',
    settings: settingsObject
  });
}));

// Get settings by category
router.get('/category/:category', asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { languageCode = 'en' } = req.query;

  const settings = await Setting.getByCategory(category, languageCode);

  res.json({
    message: 'Settings retrieved successfully',
    settings
  });
}));

// Get setting by key
router.get('/key/:key', asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { languageCode = 'en' } = req.query;

  const setting = await Setting.getByKey(key, languageCode);

  if (!setting) {
    return res.status(404).json({
      error: 'Setting Not Found',
      message: 'The requested setting does not exist'
    });
  }

  res.json({
    message: 'Setting retrieved successfully',
    setting: {
      ...setting.toJSON(),
      value: setting.getValue()
    }
  });
}));

// Update setting (admin only)
router.put('/key/:key', requirePermission('setting.manage'), [
  body('value').notEmpty().withMessage('Value is required'),
  body('languageCode').optional().isString().withMessage('Language code must be a string')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const { key } = req.params;
  const { value, languageCode = 'en' } = req.body;

  const setting = await Setting.getByKey(key, languageCode);

  if (!setting) {
    return res.status(404).json({
      error: 'Setting Not Found',
      message: 'The requested setting does not exist'
    });
  }

  if (!setting.isEditable) {
    return res.status(403).json({
      error: 'Setting Not Editable',
      message: 'This setting cannot be modified'
    });
  }

  await setting.setValue(value);

  res.json({
    message: 'Setting updated successfully',
    setting: {
      ...setting.toJSON(),
      value: setting.getValue()
    }
  });
}));

// Create new setting (admin only)
router.post('/', requirePermission('setting.manage'), [
  body('key').notEmpty().withMessage('Key is required'),
  body('value').notEmpty().withMessage('Value is required'),
  body('type').isIn(['string', 'number', 'boolean', 'json', 'file']).withMessage('Invalid type'),
  body('category').notEmpty().withMessage('Category is required'),
  body('languageCode').optional().isString().withMessage('Language code must be a string')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const { key, value, type, category, description, isPublic = true, languageCode = 'en' } = req.body;

  // Check if setting already exists
  const existingSetting = await Setting.getByKey(key, languageCode);
  if (existingSetting) {
    return res.status(409).json({
      error: 'Setting Already Exists',
      message: 'A setting with this key already exists for this language'
    });
  }

  const setting = await Setting.create({
    key,
    value,
    type,
    category,
    description,
    isPublic,
    languageCode
  });

  res.status(201).json({
    message: 'Setting created successfully',
    setting: {
      ...setting.toJSON(),
      value: setting.getValue()
    }
  });
}));

// Get all languages
router.get('/languages', asyncHandler(async (req, res) => {
  const languages = await Language.getActive();

  res.json({
    message: 'Languages retrieved successfully',
    languages
  });
}));

// Get default language
router.get('/languages/default', asyncHandler(async (req, res) => {
  const language = await Language.getDefault();

  if (!language) {
    return res.status(404).json({
      error: 'Default Language Not Found',
      message: 'No default language is configured'
    });
  }

  res.json({
    message: 'Default language retrieved successfully',
    language
  });
}));

export default router; 