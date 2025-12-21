import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.join(__dirname, '../../../.env');
dotenv.config({ path: envPath });

import sequelize from '../config/database';
import '../models'; // Import all models

async function resetAndInitDB() {
  try {
    console.log('🔄 Resetting and initializing database...\n');

    // Drop all tables with foreign key checks disabled
    console.log('1️⃣ Dropping all tables...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await sequelize.drop();
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('✓ All tables dropped\n');

    // Create all tables fresh (no alter, just force sync)
    console.log('2️⃣ Creating fresh tables...');
    await sequelize.sync({ force: true });
    console.log('✓ All tables created\n');

    console.log('✅ Database reset complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Login will auto-create admin user');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetAndInitDB();
