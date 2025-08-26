import Role from '../models/Role.js';
import User from '../models/User.js';
import Language from '../models/Language.js';
import Setting from '../models/Setting.js';
import Jackpot from '../models/Jackpot.js';
import Plan from '../models/Plan.js';
import UserPlan from '../models/UserPlan.js';

export const seedInitialData = async () => {
  try {
    console.log('🌱 Seeding initial data...');

    // Seed Roles
    const roles = await Role.bulkCreate([
      {
        name: 'Super Admin',
        slug: 'super-admin',
        description: 'Full system access',
        permissions: [
          'user.manage',
          'role.manage',
          'jackpot.manage',
          'plan.manage',
          'transaction.manage',
          'setting.manage',
          'page.manage',
          'language.manage'
        ],
        isActive: true,
        isDefault: false
      },
      {
        name: 'Admin',
        slug: 'admin',
        description: 'Administrative access',
        permissions: [
          'user.view',
          'jackpot.manage',
          'plan.manage',
          'transaction.view',
          'setting.view'
        ],
        isActive: true,
        isDefault: false
      },
      {
        name: 'User',
        slug: 'user',
        description: 'Standard user access',
        permissions: [
          'ticket.purchase',
          'wallet.view',
          'profile.manage'
        ],
        isActive: true,
        isDefault: true
      }
    ], { ignoreDuplicates: true });

    console.log('✅ Roles seeded');

    // Ensure critical role permissions exist even if roles already existed
    // This avoids "Access Denied" errors after schema/permission changes
    const requiredRolePermissions = [
      {
        slug: 'super-admin',
        description: 'Full system access',
        permissions: [
          'user.manage',
          'role.manage',
          'jackpot.manage',
          'plan.manage',
          'transaction.manage',
          'setting.manage',
          'page.manage',
          'language.manage'
        ],
        isDefault: false
      },
      {
        slug: 'admin',
        description: 'Administrative access',
        permissions: [
          'user.view',
          'jackpot.manage',
          'plan.manage',
          'transaction.view',
          'setting.view'
        ],
        isDefault: false
      },
      {
        slug: 'user',
        description: 'Standard user access',
        permissions: [
          'ticket.purchase',
          'wallet.view',
          'profile.manage'
        ],
        isDefault: true
      }
    ];

    for (const roleTemplate of requiredRolePermissions) {
      const existing = await Role.findOne({ where: { slug: roleTemplate.slug } });
      if (existing) {
        const currentPermissions = Array.isArray(existing.permissions) ? existing.permissions : [];
        const mergedPermissions = Array.from(new Set([...currentPermissions, ...roleTemplate.permissions]));
        const updatePayload = {
          description: roleTemplate.description,
          permissions: mergedPermissions,
          isActive: true
        };
        // Keep default role assignment consistent with template
        if (typeof roleTemplate.isDefault === 'boolean') {
          updatePayload.isDefault = roleTemplate.isDefault;
        }
        await existing.update(updatePayload);
      }
    }

    // Seed Languages
    const languages = await Language.bulkCreate([
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        direction: 'ltr',
        isActive: true,
        isDefault: true,
        isSystem: true,
        flag: '🇺🇸',
        locale: 'en-US',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: 'HH:mm:ss',
        currency: 'USD',
        timezone: 'UTC'
      },
      {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        direction: 'ltr',
        isActive: true,
        isDefault: false,
        isSystem: false,
        flag: '🇪🇸',
        locale: 'es-ES',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm:ss',
        currency: 'EUR',
        timezone: 'Europe/Madrid'
      },
      {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        direction: 'ltr',
        isActive: true,
        isDefault: false,
        isSystem: false,
        flag: '🇫🇷',
        locale: 'fr-FR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm:ss',
        currency: 'EUR',
        timezone: 'Europe/Paris'
      },
      {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية',
        direction: 'rtl',
        isActive: true,
        isDefault: false,
        isSystem: false,
        flag: '🇸🇦',
        locale: 'ar-SA',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm:ss',
        currency: 'SAR',
        timezone: 'Asia/Riyadh'
      }
    ], { ignoreDuplicates: true });

    console.log('✅ Languages seeded');

    // Seed Settings
    const settings = await Setting.bulkCreate([
      // Contact Information
      {
        key: 'site_name',
        value: 'Gold Carnival',
        type: 'string',
        category: 'general',
        description: 'Website name',
        isPublic: true,
        languageCode: 'en'
      },
      {
        key: 'site_description',
        value: 'Your chance to win big with our jackpot platform',
        type: 'string',
        category: 'general',
        description: 'Website description',
        isPublic: true,
        languageCode: 'en'
      },
      {
        key: 'contact_email',
        value: 'support@goldcarnival.com',
        type: 'string',
        category: 'contact',
        description: 'Contact email address',
        isPublic: true,
        languageCode: 'en'
      },
      {
        key: 'contact_phone',
        value: '+1-800-GOLD-CARNIVAL',
        type: 'string',
        category: 'contact',
        description: 'Contact phone number',
        isPublic: true,
        languageCode: 'en'
      },
      {
        key: 'contact_address',
        value: '123 Carnival Street, Gaming City, GC 12345',
        type: 'string',
        category: 'contact',
        description: 'Contact address',
        isPublic: true,
        languageCode: 'en'
      },
      // Social Links
      {
        key: 'social_facebook',
        value: 'https://facebook.com/goldcarnival',
        type: 'string',
        category: 'social',
        description: 'Facebook page URL',
        isPublic: true,
        languageCode: 'en'
      },
      {
        key: 'social_twitter',
        value: 'https://twitter.com/goldcarnival',
        type: 'string',
        category: 'social',
        description: 'Twitter page URL',
        isPublic: true,
        languageCode: 'en'
      },
      {
        key: 'social_instagram',
        value: 'https://instagram.com/goldcarnival',
        type: 'string',
        category: 'social',
        description: 'Instagram page URL',
        isPublic: true,
        languageCode: 'en'
      },
      // Legal Pages
      {
        key: 'privacy_policy',
        value: 'Our privacy policy ensures your data is protected...',
        type: 'string',
        category: 'legal',
        description: 'Privacy Policy content',
        isPublic: true,
        languageCode: 'en'
      },
      {
        key: 'terms_conditions',
        value: 'By using our service, you agree to these terms...',
        type: 'string',
        category: 'legal',
        description: 'Terms and Conditions content',
        isPublic: true,
        languageCode: 'en'
      },
      {
        key: 'fairplay_policy',
        value: 'We are committed to fair play and responsible gaming...',
        type: 'string',
        category: 'legal',
        description: 'Fairplay Policy content',
        isPublic: true,
        languageCode: 'en'
      },
      {
        key: 'responsible_gambling',
        value: 'Gambling should be entertaining and not a way to make money...',
        type: 'string',
        category: 'legal',
        description: 'Responsible Gambling content',
        isPublic: true,
        languageCode: 'en'
      },
      // System Settings
      {
        key: 'maintenance_mode',
        value: 'false',
        type: 'boolean',
        category: 'system',
        description: 'Maintenance mode status',
        isPublic: false,
        languageCode: 'en'
      },
      {
        key: 'registration_enabled',
        value: 'true',
        type: 'boolean',
        category: 'system',
        description: 'User registration status',
        isPublic: true,
        languageCode: 'en'
      },
      {
        key: 'referral_bonus_percentage',
        value: '10',
        type: 'number',
        category: 'system',
        description: 'Referral bonus percentage',
        isPublic: true,
        languageCode: 'en'
      },
      {
        key: 'minimum_deposit',
        value: '1.00',
        type: 'number',
        category: 'system',
        description: 'Minimum deposit amount',
        isPublic: true,
        languageCode: 'en'
      },
      {
        key: 'minimum_withdrawal',
        value: '10.00',
        type: 'number',
        category: 'system',
        description: 'Minimum withdrawal amount',
        isPublic: true,
        languageCode: 'en'
      }
    ], { ignoreDuplicates: true });

    console.log('✅ Settings seeded');

    // Seed default Users (Super Admin, Admin, User)
    const superAdminRole = await Role.findOne({ where: { slug: 'super-admin' } });
    const adminRole = await Role.findOne({ where: { slug: 'admin' } });
    const userRole = await Role.findOne({ where: { slug: 'user' } });

    await Promise.all([
      // Super Admin
      User.findOrCreate({
        where: { email: 'superadmin@goldcarnival.com' },
        defaults: {
          memberId: 'GC0001',
          email: 'superadmin@goldcarnival.com',
          passwordHash: 'SuperAdmin@123', // will be hashed by model hook
          firstName: 'Super',
          lastName: 'Admin',
          roleId: superAdminRole?.id || null,
          status: 'active',
          emailVerified: true,
          profileCompleted: true
        }
      }),
      // Admin
      User.findOrCreate({
        where: { email: 'admin@goldcarnival.com' },
        defaults: {
          memberId: 'GC0002',
          email: 'admin@goldcarnival.com',
          passwordHash: 'Admin@123',
          firstName: 'Site',
          lastName: 'Admin',
          roleId: adminRole?.id || null,
          status: 'active',
          emailVerified: true,
          profileCompleted: true
        }
      }),
      // Regular User
      User.findOrCreate({
        where: { email: 'user@goldcarnival.com' },
        defaults: {
          memberId: 'GC0003',
          email: 'user@goldcarnival.com',
          passwordHash: 'User@123',
          firstName: 'Regular',
          lastName: 'User',
          roleId: userRole?.id || null,
          status: 'active',
          emailVerified: true,
          profileCompleted: true
        }
      }),
      // Test Admin
      User.findOrCreate({
        where: { email: 'test@goldcarnival.com' },
        defaults: {
          memberId: 'GC0004',
          email: 'test@goldcarnival.com',
          passwordHash: 'test123',
          firstName: 'Test',
          lastName: 'Admin',
          roleId: superAdminRole?.id || null,
          status: 'active',
          emailVerified: true,
          profileCompleted: true
        }
      })
    ]);

    console.log('✅ Default users seeded');

    // Seed Jackpots (idempotent by name)
    const jackpotSeeds = [
      {
        name: 'MEGA JACKPOT',
        amount: 100000.00,
        ticketPrice: 3.00,
        maxWinners: 20,
        drawNumber: 52,
        status: 'active',
        drawTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        description: 'Mega jackpot with $100,000 prize pool. 20 winners will be selected.',
        isActive: true
      },
      {
        name: 'ROYAL JACKPOT',
        amount: 500000.00,
        ticketPrice: 15.00,
        maxWinners: 25,
        drawNumber: 52,
        status: 'active',
        drawTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        description: 'Royal jackpot with $500,000 prize pool. 25 winners will be selected.',
        isActive: true
      },
      {
        name: 'JUMBO JACKPOT',
        amount: 1000000.00,
        ticketPrice: 30.00,
        maxWinners: 30,
        drawNumber: 52,
        status: 'active',
        drawTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        description: 'Jumbo jackpot with $1 Million prize pool. 30 winners will be selected.',
        isActive: true
      }
    ];

    for (const data of jackpotSeeds) {
      const existingJackpot = await Jackpot.findOne({ where: { name: data.name } });
      if (existingJackpot) {
        await existingJackpot.update({
          amount: data.amount,
          ticketPrice: data.ticketPrice,
          maxWinners: data.maxWinners,
          drawNumber: data.drawNumber,
          status: data.status,
          description: data.description,
          isActive: true
        });
      } else {
        await Jackpot.create(data);
      }
    }

    console.log('✅ Jackpots seeded (idempotent)');

    // Seed Plans (idempotent by name)
    const planSeeds = [
      // Exclusive Plans
      {
        name: 'Basic Plan',
        type: 'Basic',
        amount: 100.00,
        price: 3.00,
        monthlyIncome: 5.00,
        category: 'EXCLUSIVE_PLAN',
        features: [
          { icon: "💰", text: "$5 Monthly Income" },
          { icon: "🎁", text: "Win Daily Basis" }
        ],
        badge: 'Basic',
        isActive: true,
        sortOrder: 1
      },
      {
        name: 'Ultra Plan',
        type: 'Ultra',
        amount: 300.00,
        price: 15.00,
        monthlyIncome: 21.00,
        category: 'EXCLUSIVE_PLAN',
        features: [
          { icon: "💰", text: "$21 Monthly Income" },
          { icon: "🎁", text: "Win Daily Basis" }
        ],
        badge: 'Ultra',
        isActive: true,
        sortOrder: 2
      },
      {
        name: 'Elite Plan',
        type: 'Elite',
        amount: 500.00,
        price: 30.00,
        monthlyIncome: 35.00,
        category: 'EXCLUSIVE_PLAN',
        features: [
          { icon: "💰", text: "$35 Monthly Income" },
          { icon: "🎁", text: "Win Daily Basis" }
        ],
        badge: 'Elite',
        isActive: true,
        sortOrder: 3
      },
      {
        name: 'Royal Plan',
        type: 'Royal',
        amount: 1000.00,
        price: 30.00,
        monthlyIncome: 70.00,
        category: 'EXCLUSIVE_PLAN',
        features: [
          { icon: "💰", text: "$70 Monthly Income" },
          { icon: "🎁", text: "Win Daily Basis" }
        ],
        badge: 'Royal',
        isActive: true,
        sortOrder: 4
      },
      // Premium Plans
      {
        name: 'Premium Basic',
        type: 'Premium',
        amount: 2000.00,
        monthlyIncome: 140.00,
        bonusReward: 35.00,
        category: 'PREMIUM_PLAN',
        features: [
          { icon: "💰", text: "$140 Monthly Income" },
          { icon: "🎁", text: "$35 Bonus Reward" }
        ],
        isActive: true,
        sortOrder: 1
      },
      {
        name: 'Premium Advanced',
        type: 'Premium',
        amount: 3000.00,
        monthlyIncome: 210.00,
        bonusReward: 50.00,
        category: 'PREMIUM_PLAN',
        features: [
          { icon: "💰", text: "$210 Monthly Income" },
          { icon: "🎁", text: "$50 Bonus Reward" }
        ],
        isActive: true,
        sortOrder: 2
      },
      {
        name: 'Premium Elite',
        type: 'Premium',
        amount: 5000.00,
        monthlyIncome: 350.00,
        bonusReward: 99.00,
        category: 'PREMIUM_PLAN',
        features: [
          { icon: "💰", text: "$350 Monthly Income" },
          { icon: "🎁", text: "$99 Bonus Reward" }
        ],
        isActive: true,
        sortOrder: 3
      }
    ];

    for (const data of planSeeds) {
      const existingPlan = await Plan.findOne({ where: { name: data.name } });
      if (existingPlan) {
        await existingPlan.update({
          type: data.type,
          amount: data.amount,
          price: data.price ?? null,
          monthlyIncome: data.monthlyIncome ?? null,
          bonusReward: data.bonusReward ?? null,
          category: data.category,
          features: data.features,
          badge: data.badge ?? null,
          isActive: true,
          sortOrder: data.sortOrder ?? 0
        });
      } else {
        await Plan.create(data);
      }
    }

    console.log('✅ Plans seeded (idempotent)');

    // Seed a basic plan purchase for superadmin user
    const adminUser = await User.findOne({ where: { email: 'admin@goldcarnival.com' } });
    const basicPlan = await Plan.findOne({ where: { type: 'Basic' } });

    if (adminUser && basicPlan) {
      const existingPurchase = await UserPlan.findOne({
        where: {
          userId: adminUser.id,
          planId: basicPlan.id
        }
      });

      if (!existingPurchase) {
        await UserPlan.create({
          userId: adminUser.id,
          planId: basicPlan.id,
          purchaseDate: new Date(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          purchasePrice: basicPlan.price,
          paymentMethod: 'admin',
          transactionId: 'SEED_BASIC_PLAN_001',
          status: 'active',
          isActive: true,
          notes: 'Seeded basic plan for admin user'
        });
        console.log('✅ Basic plan seeded for admin user');
      } else {
        console.log('ℹ️ Admin user already has basic plan');
      }
    }

    console.log('🎉 Initial data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding initial data:', error);
    throw error;
  }
}; 