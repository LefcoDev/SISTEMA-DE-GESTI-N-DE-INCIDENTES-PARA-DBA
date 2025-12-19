import sequelize from '../config/database';

async function forceUpdate() {
  try {
    console.log('Force updating schema...');
    await sequelize.query("ALTER TABLE servers MODIFY COLUMN engine_type VARCHAR(50) NOT NULL");
    console.log('Schema updated successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

forceUpdate();