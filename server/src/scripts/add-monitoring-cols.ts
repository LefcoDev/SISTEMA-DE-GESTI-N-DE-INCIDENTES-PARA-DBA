
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'dba_incident_manager',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: console.log,
  }
);

async function runMigration() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    const queryInterface = sequelize.getQueryInterface();

    console.log('Adding monitoring_user column...');
    await queryInterface.addColumn('servers', 'monitoring_user', {
      type: DataTypes.STRING(100),
      allowNull: true,
    });

    console.log('Adding monitoring_password column...');
    await queryInterface.addColumn('servers', 'monitoring_password', {
      type: DataTypes.STRING(100),
      allowNull: true,
    });

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Unable to connect to the database or run migration:', error);
  } finally {
    await sequelize.close();
  }
}

runMigration();
