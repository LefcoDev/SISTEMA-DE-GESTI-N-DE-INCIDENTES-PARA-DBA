import sequelize from '../config/database';

async function checkSchema() {
  try {
    const [results] = await sequelize.query("SHOW COLUMNS FROM servers LIKE 'engine_type'");
    console.log('Column definition:', JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkSchema();