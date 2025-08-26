import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Page = sequelize.define('Page', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metaTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'meta_title'
  },
  metaDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'meta_description'
  },
  metaKeywords: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'meta_keywords'
  },
  pageType: {
    type: DataTypes.ENUM('static', 'dynamic', 'system'),
    defaultValue: 'static',
    field: 'page_type'
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_published'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_public'
  },
  requiresAuth: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'requires_auth'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order'
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'parent_id',
    references: {
      model: 'pages',
      key: 'id'
    }
  },
  languageCode: {
    type: DataTypes.STRING(10),
    defaultValue: 'en',
    field: 'language_code'
  },
  template: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Template name for rendering'
  },
  customFields: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'custom_fields',
    comment: 'JSON object for custom page fields'
  }
}, {
  tableName: 'pages',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['slug']
    },
    {
      fields: ['page_type']
    },
    {
      fields: ['is_published']
    },
    {
      fields: ['language_code']
    },
    {
      fields: ['parent_id']
    }
  ]
});

// Instance methods
Page.prototype.getFullPath = function() {
  if (this.parentId) {
    // This would need to be implemented with a recursive query
    return `/${this.slug}`;
  }
  return `/${this.slug}`;
};

Page.prototype.isAccessible = function(user = null) {
  if (!this.isPublished) return false;
  if (this.requiresAuth && !user) return false;
  return true;
};

export default Page; 