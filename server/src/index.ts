import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root .env file
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });
console.log('Loading .env from:', envPath);
console.log('DB Config:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  db: process.env.DB_NAME
});

import app from './app';
import logger from './utils/logger';
import sequelize from './config/database';
import { MonitoringService } from './services/monitoring.service';
import notificationService from './services/notification.service';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Sync database
    await sequelize.sync({ alter: true });
    logger.info('Database synced successfully');

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      
      // Start monitoring scheduler
      const monitoringService = new MonitoringService();
      const MONITORING_INTERVAL = 5 * 60 * 1000; // 5 minutes
      
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
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
      logger.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});
