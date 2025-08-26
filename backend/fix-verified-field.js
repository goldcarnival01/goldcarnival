import { sequelize } from './src/config/database.js';
import { UserPlan } from './src/models/associations.js';

async function fixVerifiedField() {
  try {
    console.log('🔧 Starting to fix verified field in user_plans table...');
    
    // Check if verified field exists and has values
    const result = await sequelize.query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(verified) as records_with_verified,
        COUNT(CASE WHEN verified IS NULL THEN 1 END) as null_verified
      FROM user_plans
    `);
    
    console.log('📊 Current status:', result[0][0]);
    
    // Update records where verified is NULL to 'pending'
    const updateResult = await sequelize.query(`
      UPDATE user_plans 
      SET verified = 'pending' 
      WHERE verified IS NULL
    `);
    
    console.log('✅ Updated records with NULL verified field');
    
    // Verify the fix
    const verifyResult = await sequelize.query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(verified) as records_with_verified,
        COUNT(CASE WHEN verified IS NULL THEN 1 END) as null_verified
      FROM user_plans
    `);
    
    console.log('📊 After fix:', verifyResult[0][0]);
    
    console.log('🎉 Verified field fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing verified field:', error);
  } finally {
    await sequelize.close();
  }
}

fixVerifiedField();
