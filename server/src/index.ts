// Load environment variables from root .env file (only in development)
// In production (Electron), .env is loaded by the main process
if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv');
  const path = require('path');
  const envPath = path.join(__dirname, '../../.env');
  dotenv.config({ path: envPath });
  console.log('Loading .env from:', envPath);
}

console.log('DB Config:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  db: process.env.DB_NAME
});

import app from './app';
import logger from './utils/logger';
import sequelize, { ensureDatabaseExists } from './config/database';
import { MonitoringService } from './services/monitoring.service';
import notificationService from './services/notification.service';
import { initDefaultAvatar } from './scripts/init-default-avatar';
import { initializeSocket } from './socket';
// Import chat associations to register them
import './models/chat-associations';
import fs from 'fs';
import path from 'path';
import { createServer } from 'http';

const BASE_PORT = parseInt(process.env.PORT || '3001', 10);
const MAX_PORT_ATTEMPTS = 10;

// Function to run migrations
async function runMigrations() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const databaseMigrationsPath = path.join(__dirname, '../../database/migrations');
    const serverMigrationsPath = path.join(__dirname, './migrations');
    
    // Check if migrations table exists, if not create it
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'SequelizeMeta'");
    if (!tables.length) {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS SequelizeMeta (
          name VARCHAR(255) NOT NULL PRIMARY KEY
        )
      `);
      logger.info('Created SequelizeMeta table');
    }
    
    // Get executed migrations
    const [executedMigrations] = await sequelize.query(
      'SELECT name FROM SequelizeMeta ORDER BY name'
    );
    const executedNames = new Set(executedMigrations.map((m: any) => m.name));
    
    // Get all migration files from both directories
    const databaseMigrationFiles = fs.existsSync(databaseMigrationsPath) 
      ? fs.readdirSync(databaseMigrationsPath).filter(file => file.endsWith('.js')).map(f => ({ file: f, path: databaseMigrationsPath }))
      : [];
    
    const serverMigrationFiles = fs.existsSync(serverMigrationsPath)
      ? fs.readdirSync(serverMigrationsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js')).map(f => ({ file: f, path: serverMigrationsPath }))
      : [];
    
    const allMigrations = [...databaseMigrationFiles, ...serverMigrationFiles].sort((a, b) => a.file.localeCompare(b.file));
    
    // Run pending migrations
    let executed = 0;
    for (const { file, path: migrationPath } of allMigrations) {
      if (!executedNames.has(file)) {
        logger.info(`Running migration: ${file}`);
        try {
          const migrationModule = require(path.join(migrationPath, file));
          // Handle both default export and module.exports
          const migration = migrationModule.default || migrationModule;
          
          if (typeof migration.up === 'function') {
            await migration.up(queryInterface, sequelize.constructor);
            await sequelize.query(
              'INSERT INTO SequelizeMeta (name) VALUES (?)',
              { replacements: [file] }
            );
            executed++;
            logger.info(`Migration ${file} completed successfully`);
          } else {
            logger.warn(`Migration ${file} does not have an 'up' function, skipping...`);
          }
        } catch (error) {
          logger.error(`Error running migration ${file}:`, error);
          throw error;
        }
      }
    }
    
    if (executed > 0) {
      logger.info(`Executed ${executed} migration(s)`);
    } else {
      logger.info('Database schema is up to date');
    }
  } catch (error) {
    logger.error('Error running migrations:', error);
    throw error;
  }
}

// Function to find an available port
async function findAvailablePort(startPort: number, maxAttempts: number): Promise<number> {
  const net = require('net');
  
  return new Promise((resolve, reject) => {
    let currentPort = startPort;
    let attempts = 0;

    const tryPort = () => {
      if (attempts >= maxAttempts) {
        reject(new Error(`No available port found after ${maxAttempts} attempts starting from ${startPort}`));
        return;
      }

      const server = net.createServer();
      
      server.once('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          logger.warn(`Port ${currentPort} is already in use, trying ${currentPort + 1}...`);
          attempts++;
          currentPort++;
          tryPort();
        } else {
          reject(err);
        }
      });
      
      server.once('listening', () => {
        server.close();
        resolve(currentPort);
      });
      
      server.listen(currentPort);
    };

    tryPort();
  });
}

const startServer = async () => {
  try {
    // Initialize default avatar
    initDefaultAvatar();
    
    // Ensure database exists before connecting
    logger.info('Ensuring database exists...');
    await ensureDatabaseExists();
    
    // Authenticate database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Sync models without forcing (preserve data)
    // Usar alter: false para evitar cambios automáticos que causan problemas con índices
    await sequelize.sync({ alter: false });
    logger.info('Database schema synchronized');

    // Find an available port
    const PORT = await findAvailablePort(BASE_PORT, MAX_PORT_ATTEMPTS);
    logger.info(`Using port ${PORT}`);

    // Create HTTP server
    const httpServer = createServer(app);
    
    // Initialize Socket.IO
    const io = initializeSocket(httpServer);
    logger.info('WebSocket server initialized');

    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      
      // Start monitoring scheduler
      const monitoringService = new MonitoringService();
      const MONITORING_INTERVAL = 1 * 60 * 1000; // 1 minute
      
      logger.info('Starting monitoring scheduler...');
      
      // Run immediately on startup
      logger.info('Running initial health checks...');
      monitoringService.checkAllServers().catch(err => {
        logger.error('Error in initial monitoring check:', err);
      });

      setInterval(() => {
        logger.info('Running scheduled health checks...');
        monitoringService.checkAllServers().catch(err => {
          logger.error('Error in monitoring scheduler:', err);
        });
      }, MONITORING_INTERVAL);

      // Start notification checker for reminders
      const REMINDER_CHECK_INTERVAL = 1 * 60 * 1000; // 1 minute
      logger.info('Starting reminder notification scheduler...');
      
      // Run immediately on startup
      notificationService.checkReminders().catch(err => {
        logger.error('Error in initial reminder check:', err);
      });

      setInterval(() => {
        notificationService.checkReminders().catch(err => {
          logger.error('Error in reminder scheduler:', err);
        });
      }, REMINDER_CHECK_INTERVAL);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      logger.error('UNHANDLED REJECTION! 💥');
      logger.error(err.name, err.message);
      // Do not exit the process in Electron environment as it kills the main window
      if (process.env.NODE_ENV !== 'production') {
        // server.close(() => {
        //   process.exit(1);
        // });
      }
    });

  } catch (error) {
    logger.error('Unable to start server:', error);
    // process.exit(1);
  }
};

startServer();

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥');
  logger.error(err.name, err.message);
  // process.exit(1);
});
