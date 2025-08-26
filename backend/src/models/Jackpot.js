import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Jackpot = sequelize.define('Jackpot', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  ticketPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'ticket_price'
  },
  maxWinners: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'max_winners'
  },
  drawNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'draw_number'
  },
  status: {
    type: DataTypes.ENUM('active', 'drawing', 'completed'),
    defaultValue: 'active'
  },
  drawTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'draw_time'
  },
  totalTicketsSold: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_tickets_sold'
  },
  totalRevenue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    field: 'total_revenue'
  },
  winnersSelected: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'winners_selected'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'jackpots',
  timestamps: true,
  underscored: true
});

// Instance methods
Jackpot.prototype.getDrawTimeRemaining = function() {
  if (!this.drawTime) return null;
  
  const now = new Date();
  const drawTime = new Date(this.drawTime);
  const diff = drawTime - now;
  
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds };
};

Jackpot.prototype.isDrawTimeReached = function() {
  if (!this.drawTime) return false;
  return new Date() >= new Date(this.drawTime);
};

Jackpot.prototype.getWinningAmount = function() {
  return parseFloat(this.amount) / this.maxWinners;
};

export default Jackpot; 