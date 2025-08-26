import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Language = sequelize.define('Language', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nativeName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'native_name'
  },
  direction: {
    type: DataTypes.ENUM('ltr', 'rtl'),
    defaultValue: 'ltr'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_default'
  },
  isSystem: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_system'
  },
  flag: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Flag icon URL or emoji'
  },
  locale: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Locale string (e.g., en-US, es-ES)'
  },
  dateFormat: {
    type: DataTypes.STRING(50),
    defaultValue: 'YYYY-MM-DD',
    field: 'date_format'
  },
  timeFormat: {
    type: DataTypes.STRING(50),
    defaultValue: 'HH:mm:ss',
    field: 'time_format'
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'USD'
  },
  timezone: {
    type: DataTypes.STRING(100),
    defaultValue: 'UTC'
  }
}, {
  tableName: 'languages',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['code']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['is_default']
    }
  ]
});

// Instance methods
Language.prototype.isRTL = function() {
  return this.direction === 'rtl';
};

Language.prototype.getLocale = function() {
  return this.locale || this.code;
};

// Static methods
Language.getDefault = async function() {
  return await this.findOne({
    where: { isDefault: true, isActive: true }
  });
};

Language.getActive = async function() {
  return await this.findAll({
    where: { isActive: true },
    order: [['isDefault', 'DESC'], ['name', 'ASC']]
  });
};

Language.getByCode = async function(code) {
  return await this.findOne({
    where: { code, isActive: true }
  });
};

export default Language; 