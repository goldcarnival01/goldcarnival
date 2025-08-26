import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Plan = sequelize.define('Plan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false // Basic, Ultra, Elite, Royal for exclusive plans
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true // Only for exclusive plans
  },
  monthlyIncome: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'monthly_income'
  },
  bonusReward: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'bonus_reward'
  },
  category: {
    type: DataTypes.ENUM('EXCLUSIVE_PLAN', 'PREMIUM_PLAN'),
    allowNull: false,
    defaultValue: 'EXCLUSIVE_PLAN'
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  badge: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order'
  }
}, {
  tableName: 'plans',
  timestamps: true,
  underscored: true
});

export default Plan;
