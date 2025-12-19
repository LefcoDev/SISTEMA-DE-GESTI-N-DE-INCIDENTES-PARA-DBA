import sequelize from './config/database';
import migration from './migrations/20251219_000000_create_notes_module';

async function runMigration() {
  try {
    console.log('Starting migration...');
    await sequelize.authenticate();
    console.log('Database connected.');

    await migration.up(sequelize.getQueryInterface());
    
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
