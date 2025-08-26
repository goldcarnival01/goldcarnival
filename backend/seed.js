import { sequelize } from './src/config/database.js';
import { seedInitialData } from './src/seeders/initialData.js';
import Plan from './src/models/Plan.js';
import Jackpot from './src/models/Jackpot.js';

const runSeeder = async () => {
  try {
    console.log('🚀 Starting fresh database seeding...');
    
    // Sync database (this will drop and recreate tables)
    console.log('📊 Syncing database...');
    await sequelize.sync({ force: true });
    console.log('✅ Database synced successfully');
    
    // Run the seeder
    console.log('🌱 Running initial data seeder...');
    await seedInitialData();
    
    console.log('🎉 Fresh seeding completed successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ Super Admin: admin@jumboticket.com     │');
    console.log('│ Password: admin123                     │');
    console.log('│ Member ID: JUMBO0001                  │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ Manager: manager@jumboticket.com       │');
    console.log('│ Password: manager123                   │');
    console.log('│ Member ID: JUMBO0002                  │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ Test Admin: test@jumboticket.com       │');
    console.log('│ Password: test123                      │');
    console.log('│ Member ID: JUMBO0004                  │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ Regular User: user@jumboticket.com     │');
    console.log('│ Password: user123                      │');
    console.log('│ Member ID: JUMBO0003                  │');
    console.log('└─────────────────────────────────────────┘');
    console.log('\n📦 Seeded counts (post-seed):');
    console.log('  Plans:', await Plan.count());
    console.log('  Jackpots:', await Jackpot.count());
    console.log('\n🌐 Access admin panel at: http://localhost:5173/admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

runSeeder();
