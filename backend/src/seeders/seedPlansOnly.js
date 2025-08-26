import dotenv from 'dotenv';
import { sequelize } from '../../src/config/database.js';
import Plan from '../../src/models/Plan.js';

dotenv.config();

async function seedPlansOnly() {
  try {
    await sequelize.authenticate();

    const planSeeds = [
      {
        name: 'Basic Plan', type: 'Basic', amount: 100.00, price: 3.00,
        monthlyIncome: 5.00, category: 'EXCLUSIVE_PLAN',
        features: [{ icon: '💰', text: '$5 Monthly Income' }, { icon: '🎁', text: 'Win Daily Basis' }],
        badge: 'Basic', isActive: true, sortOrder: 1
      },
      {
        name: 'Ultra Plan', type: 'Ultra', amount: 300.00, price: 15.00,
        monthlyIncome: 21.00, category: 'EXCLUSIVE_PLAN',
        features: [{ icon: '💰', text: '$21 Monthly Income' }, { icon: '🎁', text: 'Win Daily Basis' }],
        badge: 'Ultra', isActive: true, sortOrder: 2
      },
      {
        name: 'Elite Plan', type: 'Elite', amount: 500.00, price: 30.00,
        monthlyIncome: 35.00, category: 'EXCLUSIVE_PLAN',
        features: [{ icon: '💰', text: '$35 Monthly Income' }, { icon: '🎁', text: 'Win Daily Basis' }],
        badge: 'Elite', isActive: true, sortOrder: 3
      },
      {
        name: 'Royal Plan', type: 'Royal', amount: 1000.00, price: 30.00,
        monthlyIncome: 70.00, category: 'EXCLUSIVE_PLAN',
        features: [{ icon: '💰', text: '$70 Monthly Income' }, { icon: '🎁', text: 'Win Daily Basis' }],
        badge: 'Royal', isActive: true, sortOrder: 4
      },
      {
        name: 'Premium Basic', type: 'Premium', amount: 2000.00,
        monthlyIncome: 140.00, bonusReward: 35.00, category: 'PREMIUM_PLAN',
        features: [{ icon: '💰', text: '$140 Monthly Income' }, { icon: '🎁', text: '$35 Bonus Reward' }],
        isActive: true, sortOrder: 1
      },
      {
        name: 'Premium Advanced', type: 'Premium', amount: 3000.00,
        monthlyIncome: 210.00, bonusReward: 50.00, category: 'PREMIUM_PLAN',
        features: [{ icon: '💰', text: '$210 Monthly Income' }, { icon: '🎁', text: '$50 Bonus Reward' }],
        isActive: true, sortOrder: 2
      },
      {
        name: 'Premium Elite', type: 'Premium', amount: 5000.00,
        monthlyIncome: 350.00, bonusReward: 99.00, category: 'PREMIUM_PLAN',
        features: [{ icon: '💰', text: '$350 Monthly Income' }, { icon: '🎁', text: '$99 Bonus Reward' }],
        isActive: true, sortOrder: 3
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
        console.log(`↻ Updated plan: ${data.name}`);
      } else {
        await Plan.create(data);
        console.log(`✓ Created plan: ${data.name}`);
      }
    }

    console.log('✅ Plans seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
    process.exit(1);
  }
}

seedPlansOnly();


