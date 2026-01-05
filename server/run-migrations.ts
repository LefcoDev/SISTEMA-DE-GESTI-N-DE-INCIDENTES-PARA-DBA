import sequelize from './src/config/database';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to database');
    
    const queryInterface = sequelize.getQueryInterface();
    const migrationsPath = path.join(__dirname, 'src/migrations');
    
    const files = fs.readdirSync(migrationsPath)
      .filter(f => f.endsWith('.ts'))
      .sort();
    
    console.log(`Found ${files.length} migration(s)`);
    
    for (const file of files) {
      console.log(`\nRunning: ${file}`);
      try {
        const migrationModule = require(path.join(migrationsPath, file));
        const migration = migrationModule.default || migrationModule;
        
        if (typeof migration.up !== 'function') {
          console.log(`⚠ ${file} - No 'up' function found, skipping`);
          continue;
        }
        
        await migration.up(queryInterface, sequelize.constructor);
        console.log(`✓ ${file} completed`);
      } catch (error: any) {
        if (error.message.includes('Duplicate column name')) {
          console.log(`⚠ ${file} - Column already exists, skipping`);
        } else if (error.message.includes('Table') && error.message.includes('already exists')) {
          console.log(`⚠ ${file} - Table already exists, skipping`);
        } else {
          console.error(`✗ ${file} failed:`, error.message);
          throw error;
        }
      }
    }
    
    console.log('\n✓ All migrations completed!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigrations();
