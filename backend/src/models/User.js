import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Encryption helpers for storing a reversible copy of user passwords
const ENCRYPTION_KEY = (process.env.PASSWORD_ENCRYPTION_KEY || process.env.JWT_SECRET || 'changemechangemechangemechangeme').slice(0, 32); // 32 bytes
const IV_LENGTH = 16; // AES-256-CBC IV length in bytes

function encryptPassword(plainText) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(plainText, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return `${iv.toString('base64')}:${encrypted}`;
  } catch (err) {
    return null;
  }
}

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  memberId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'member_id'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash'
  },
  passwordEncrypted: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'password_encrypted'
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'last_name'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  referralCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    field: 'referral_code'
  },
  referredBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'referred_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'role_id',
    references: {
      model: 'roles',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'pending'),
    defaultValue: 'pending'
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'email_verified'
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login_at'
  },
  profileCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'profile_completed'
  },
  emailVerificationToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'email_verification_token'
  },
  emailVerificationExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'email_verification_expires'
  }
  ,
  passwordResetToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'password_reset_token'
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'password_reset_expires'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.passwordHash) {
        const plain = user.passwordHash;
        user.passwordEncrypted = encryptPassword(plain);
        user.passwordHash = await bcrypt.hash(plain, 12);
      }
      if (!user.referralCode) {
        user.referralCode = generateReferralCode();
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('passwordHash')) {
        const plain = user.passwordHash;
        user.passwordEncrypted = encryptPassword(plain);
        user.passwordHash = await bcrypt.hash(plain, 12);
      }
    }
  }
});

// Instance methods
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.passwordHash;
  delete values.passwordEncrypted;
  return values;
};

// Generate referral code
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'JUMBO';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Associations will be set up in a separate file
export default User; 