import sequelize from '../config/database';

async function updateSchema() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Add server_reachable column
    // We use try-catch in case it already exists or fails
    try {
      await sequelize.query(`
        ALTER TABLE server_health_checks
        ADD COLUMN server_reachable BOOLEAN NOT NULL DEFAULT 0 AFTER server_id;
      `);
      console.log('Added server_reachable column.');
    } catch (e) {
      console.log('Column server_reachable might already exist or error:', e);
    }
    
    console.log('Schema updated successfully.');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    await sequelize.close();
  }
}

updateSchema();
