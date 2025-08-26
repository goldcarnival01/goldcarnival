import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Ticket = sequelize.define('Ticket', {
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
  jackpotId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'jackpot_id',
    references: {
      model: 'jackpots',
      key: 'id'
    }
  },
  ticketNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'ticket_number'
  },
  purchaseAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'purchase_amount'
  },
  status: {
    type: DataTypes.ENUM('active', 'won', 'lost'),
    defaultValue: 'active'
  },
  winningAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'winning_amount'
  },
  isWinner: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_winner'
  },
  drawNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'draw_number'
  },
  purchasedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'purchased_at'
  }
}, {
  tableName: 'tickets',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['jackpot_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['ticket_number']
    }
  ]
});

// Instance methods
Ticket.prototype.generateTicketNumber = function() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TKT${timestamp}${random}`;
};

export default Ticket; 