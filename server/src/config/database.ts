import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import logger from '../utils/logger';
import mysql from 'mysql2/promise';

// Only load .env if not in production (Electron handles env vars in production)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, '../../../.env') });
}

// Function to create database if it doesn't exist
async function ensureDatabaseExists() {
  const dbName = process.env.DB_NAME || 'dba_incident_manager';
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    logger.info(`Database '${dbName}' verified/created successfully`);
  } catch (error) {
    logger.error('Error creating database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'dba_incident_manager',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: parseInt(process.env.DB_PORT || '3306'),
    logging: (msg) => logger.debug(msg),
    dialectOptions: {
      ssl: process.env.DB_HOST?.includes('aivencloud.com') ? {
        rejectUnauthorized: true,
      } : undefined
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export { ensureDatabaseExists };
export default sequelize;
