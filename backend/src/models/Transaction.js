import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Transaction = sequelize.define('Transaction', {
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
  walletId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'wallet_id',
    references: {
      model: 'wallets',
      key: 'id'
    }
  },
  transactionType: {
    type: DataTypes.ENUM('deposit', 'withdrawal', 'ticket_purchase', 'winning', 'commission', 'bonus', 'refund'),
    allowNull: false,
    field: 'transaction_type'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'USD'
  },
  cryptoType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'crypto_type'
  },
  cryptoAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'crypto_address'
  },
  transactionHash: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'transaction_hash'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
    defaultValue: 'pending'
  },
  referenceId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'reference_id'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  gateway: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  gatewayResponse: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'gateway_response'
  },
  metadata: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'processed_at'
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['transaction_type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['reference_id']
    }
  ]
});

// Instance methods
Transaction.prototype.markAsCompleted = async function() {
  this.status = 'completed';
  this.processedAt = new Date();
  return await this.save();
};

Transaction.prototype.markAsFailed = async function() {
  this.status = 'failed';
  this.processedAt = new Date();
  return await this.save();
};

export default Transaction; 