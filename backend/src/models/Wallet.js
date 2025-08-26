import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Wallet = sequelize.define('Wallet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  walletType: {
    type: DataTypes.ENUM('deposit', 'winnings', 'ticket_bonus'),
    allowNull: false,
    field: 'wallet_type'
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'USD'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'wallets',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'wallet_type']
    }
  ]
});

// Instance methods
Wallet.prototype.addBalance = async function(amount) {
  this.balance = parseFloat(this.balance) + parseFloat(amount);
  return await this.save();
};

Wallet.prototype.deductBalance = async function(amount) {
  if (parseFloat(this.balance) < parseFloat(amount)) {
    throw new Error('Insufficient balance');
  }
  this.balance = parseFloat(this.balance) - parseFloat(amount);
  return await this.save();
};

export default Wallet; 