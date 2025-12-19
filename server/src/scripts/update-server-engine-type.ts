
import sequelize from '../config/database';

async function updateSchema() {
  try {
    console.log('Updating servers table schema...');
    
    // Alter engine_type column to be VARCHAR instead of ENUM to support OS names
    await sequelize.query(`
      ALTER TABLE servers 
      MODIFY COLUMN engine_type VARCHAR(50) NOT NULL;
    `);

    console.log('Schema updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
}

updateSchema();
