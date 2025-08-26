import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'json', 'file'),
    defaultValue: 'string',
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'general'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_public'
  },
  isEditable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_editable'
  },
  languageCode: {
    type: DataTypes.STRING(10),
    defaultValue: 'en',
    field: 'language_code'
  },
  group: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Group settings together (e.g., "contact", "social", "legal")'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order'
  }
}, {
  tableName: 'settings',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['key']
    },
    {
      fields: ['category']
    },
    {
      fields: ['language_code']
    },
    {
      fields: ['group']
    }
  ]
});

// Instance methods
Setting.prototype.getValue = function() {
  if (this.type === 'boolean') {
    return this.value === 'true' || this.value === '1';
  }
  if (this.type === 'number') {
    return parseFloat(this.value) || 0;
  }
  if (this.type === 'json') {
    try {
      return JSON.parse(this.value);
    } catch (error) {
      return null;
    }
  }
  return this.value;
};

Setting.prototype.setValue = function(value) {
  if (this.type === 'json' && typeof value === 'object') {
    this.value = JSON.stringify(value);
  } else {
    this.value = String(value);
  }
  return this.save();
};

// Static methods
Setting.getByKey = async function(key, languageCode = 'en') {
  return await this.findOne({
    where: { key, languageCode }
  });
};

Setting.getByCategory = async function(category, languageCode = 'en') {
  return await this.findAll({
    where: { category, languageCode },
    order: [['sortOrder', 'ASC']]
  });
};

Setting.getPublicSettings = async function(languageCode = 'en') {
  return await this.findAll({
    where: { isPublic: true, languageCode },
    order: [['sortOrder', 'ASC']]
  });
};

export default Setting; 