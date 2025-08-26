import User from './User.js';
import Role from './Role.js';
import Wallet from './Wallet.js';
import Transaction from './Transaction.js';
import Jackpot from './Jackpot.js';
import Ticket from './Ticket.js';
import Page from './Page.js';
import Setting from './Setting.js';
import Language from './Language.js';
import Plan from './Plan.js';
import UserPlan from './UserPlan.js';

// User associations
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
User.belongsTo(User, { foreignKey: 'referredBy', as: 'referrer' });
User.hasMany(User, { foreignKey: 'referredBy', as: 'referrals' });
User.hasMany(Wallet, { foreignKey: 'userId', as: 'wallets' });
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
User.hasMany(Ticket, { foreignKey: 'userId', as: 'tickets' });

// Role associations
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

// Wallet associations
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Wallet.hasMany(Transaction, { foreignKey: 'walletId', as: 'transactions' });

// Transaction associations
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Transaction.belongsTo(Wallet, { foreignKey: 'walletId', as: 'wallet' });

// Jackpot associations
Jackpot.hasMany(Ticket, { foreignKey: 'jackpotId', as: 'tickets' });

// Ticket associations
Ticket.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Ticket.belongsTo(Jackpot, { foreignKey: 'jackpotId', as: 'jackpot' });

// Page associations (self-referencing for parent-child relationships)
Page.belongsTo(Page, { foreignKey: 'parentId', as: 'parent' });
Page.hasMany(Page, { foreignKey: 'parentId', as: 'children' });

// Language associations
Language.hasMany(Page, { foreignKey: 'languageCode', sourceKey: 'code', as: 'pages' });
Language.hasMany(Setting, { foreignKey: 'languageCode', sourceKey: 'code', as: 'settings' });

// Setting associations
Setting.belongsTo(Language, { foreignKey: 'languageCode', targetKey: 'code', as: 'language' });

// UserPlan associations
UserPlan.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserPlan.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });
User.hasMany(UserPlan, { foreignKey: 'userId', as: 'userPlans' });
Plan.hasMany(UserPlan, { foreignKey: 'planId', as: 'userPlans' });

export {
  User,
  Role,
  Wallet,
  Transaction,
  Jackpot,
  Ticket,
  Page,
  Setting,
  Language,
  Plan,
  UserPlan
}; 