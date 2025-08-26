import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  slug: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'JSON array of permission strings'
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
  }
}, {
  tableName: 'roles',
  timestamps: true,
  underscored: true
});

// Instance methods
Role.prototype.hasPermission = function(permission) {
  if (!this.permissions) return false;
  return this.permissions.includes(permission);
};

Role.prototype.addPermission = function(permission) {
  if (!this.permissions) this.permissions = [];
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
  }
  return this.save();
};

Role.prototype.removePermission = function(permission) {
  if (this.permissions) {
    this.permissions = this.permissions.filter(p => p !== permission);
  }
  return this.save();
};

export default Role; 