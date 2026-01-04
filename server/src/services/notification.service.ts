import Reminder from '../models/Reminder';
import NotificationQueue from '../models/NotificationQueue';
import User from '../models/User';
import Incident from '../models/Incident';
import Server from '../models/Server';
import { Op } from 'sequelize';
import logger from '../utils/logger';
import emailService from './email.service';

export class NotificationService {
  // Check for reminders that need to be triggered
  async checkReminders() {
    try {
      const now = new Date();
      
      // Find reminders that should trigger now
      const reminders = await Reminder.findAll({
        where: {
          status: 'pending',
          scheduled_at: {
            [Op.lte]: now
          },
          [Op.or]: [
            { snooze_until: null },
            { snooze_until: { [Op.lte]: now } }
          ]
        } as any,
        include: [{ model: User, attributes: ['id', 'full_name', 'email'] }]
      });

      for (const reminder of reminders) {
        await this.createNotification(reminder);
        
        // Update reminder status or handle recurrence
        if (reminder.type === 'recurring' && reminder.recurrence_pattern) {
          await this.scheduleNextRecurrence(reminder);
        } else {
          // Mark one-time reminders as pending (they stay pending until user marks as complete)
          reminder.last_triggered_at = now;
          await reminder.save();
        }
      }

      logger.info(`Checked ${reminders.length} reminders`);
    } catch (error) {
      logger.error('Error checking reminders:', error);
    }
  }

  // Create notification in the queue
  async createNotification(reminder: Reminder) {
    try {
      const notification = await NotificationQueue.create({
        user_id: reminder.created_by,
        type: 'reminder',
        title: reminder.title,
        message: reminder.description || 'Reminder notification',
        entity_type: 'reminder',
        entity_id: reminder.id,
        action_url: `/reminders/${reminder.id}`,
        status: 'pending',
        priority: reminder.priority,
        scheduled_at: new Date(),
      });

      logger.info(`Created notification for reminder ${reminder.id}`);
      
      // Send email if user has it configured
      const user = await User.findByPk(reminder.created_by);
      if (user?.email) {
        await emailService.sendReminderNotification(user.email, {
          title: reminder.title,
          description: reminder.description,
          scheduled_at: reminder.scheduled_at,
        });
      }

      return notification;
    } catch (error) {
      logger.error(`Error creating notification for reminder ${reminder.id}:`, error);
      throw error;
    }
  }

  // Create notification for incident
  async createIncidentNotification(
    userId: number | number[],
    type: 'incident_created' | 'incident_assigned',
    incidentData: {
      id: number;
      title: string;
      severity: string;
      description?: string;
      assigned_to?: string;
    }
  ) {
    try {
      const userIds = Array.isArray(userId) ? userId : [userId];
      const notifications = [];

      for (const uid of userIds) {
        const notification = await NotificationQueue.create({
          user_id: uid,
          type,
          title: `Incidente #${incidentData.id}: ${incidentData.title}`,
          message: incidentData.description || 'Nuevo incidente registrado',
          entity_type: 'incident',
          entity_id: incidentData.id,
          action_url: `/incidents/${incidentData.id}`,
          status: 'pending',
          priority: incidentData.severity === 'critical' ? 'critical' : incidentData.severity === 'high' ? 'high' : 'medium',
          scheduled_at: new Date(),
        });

        notifications.push(notification);

        // Send email
        const user = await User.findByPk(uid);
        if (user?.email) {
          console.log(`[createIncidentNotification] Sending to user ${uid}: ${user.email}`);
          try {
            const result = await emailService.sendIncidentNotification(user.email, incidentData);
            console.log(`[createIncidentNotification] Result for user ${uid}:`, JSON.stringify(result));
            logger.info(`Incident notification sent to ${user.email} - Email: ${result.email}`);
          } catch (emailError: any) {
            console.error(`[createIncidentNotification] ERROR sending to user ${uid}:`, emailError);
            console.error(emailError.stack);
          }
        } else {
          console.warn(`[createIncidentNotification] User ${uid} has no email configured`);
        }
      }

      logger.info(`Created ${notifications.length} incident notifications`);
      return notifications;
    } catch (error) {
      logger.error('Error creating incident notifications:', error);
      throw error;
    }
  }

  // Create notification for monitoring alert
  async createMonitoringAlert(
    userIds: number[],
    alertData: {
      serverName: string;
      serverType: string;
      status: string;
      message: string;
    }
  ) {
    try {
      const notifications = [];

      for (const userId of userIds) {
        const notification = await NotificationQueue.create({
          user_id: userId,
          type: 'monitoring_alert',
          title: `Alerta: ${alertData.serverName}`,
          message: alertData.message,
          entity_type: 'server',
          action_url: '/monitoring',
          status: 'pending',
          priority: 'high',
          scheduled_at: new Date(),
        });

        notifications.push(notification);

        // Send email
        const user = await User.findByPk(userId);
        if (user?.email) {
          console.log(`[createMonitoringAlert] Sending to user ${userId}: ${user.email}`);
          try {
            const result = await emailService.sendMonitoringAlert(user.email, {
              ...alertData,
              timestamp: new Date(),
            });
            console.log(`[createMonitoringAlert] Result for user ${userId}:`, JSON.stringify(result));
            logger.info(`Alert sent to ${user.email} - Email: ${result.email}`);
          } catch (emailError: any) {
            console.error(`[createMonitoringAlert] ERROR sending to user ${userId}:`, emailError);
            console.error(emailError.stack);
          }
        } else {
          console.warn(`[createMonitoringAlert] User ${userId} has no email configured`);
        }
      }

      logger.info(`Created ${notifications.length} monitoring alert notifications`);
      return notifications;
    } catch (error) {
      logger.error('Error creating monitoring alert notifications:', error);
      throw error;
    }
  }

  // Schedule next occurrence for recurring reminders
  async scheduleNextRecurrence(reminder: Reminder) {
    try {
      const now = new Date();
      const pattern = reminder.recurrence_pattern;
      let nextTrigger: Date | null = null;

      switch (pattern) {
        case 'daily':
          nextTrigger = new Date(reminder.scheduled_at);
          nextTrigger.setDate(nextTrigger.getDate() + 1);
          break;
        case 'weekly':
          nextTrigger = new Date(reminder.scheduled_at);
          nextTrigger.setDate(nextTrigger.getDate() + 7);
          break;
        case 'monthly':
          nextTrigger = new Date(reminder.scheduled_at);
          nextTrigger.setMonth(nextTrigger.getMonth() + 1);
          break;
        case 'yearly':
          nextTrigger = new Date(reminder.scheduled_at);
          nextTrigger.setFullYear(nextTrigger.getFullYear() + 1);
          break;
      }

      if (nextTrigger) {
        reminder.scheduled_at = nextTrigger;
        reminder.next_trigger_at = nextTrigger;
        reminder.last_triggered_at = now;
        await reminder.save();
        
        logger.info(`Scheduled next recurrence for reminder ${reminder.id} at ${nextTrigger}`);
      }
    } catch (error) {
      logger.error(`Error scheduling next recurrence for reminder ${reminder.id}:`, error);
    }
  }

  // Get pending notifications for a user
  async getPendingNotifications(userId: number) {
    try {
      const notifications = await NotificationQueue.findAll({
        where: {
          user_id: userId,
          status: {
            [Op.in]: ['pending', 'sent']
          }
        },
        order: [
          ['priority', 'DESC'],
          ['created_at', 'DESC']
        ],
        limit: 50
      });

      // Filter out orphaned notifications (cleanup on read)
      const validNotifications = [];
      for (const notification of notifications) {
        let isValid = true;
        
        if (notification.entity_type === 'incident' && notification.entity_id) {
           const exists = await Incident.count({ where: { id: notification.entity_id } });
           if (!exists) {
             isValid = false;
             await notification.destroy(); // Auto-cleanup
           }
        } else if (notification.entity_type === 'server' && notification.entity_id) {
           const exists = await Server.count({ where: { id: notification.entity_id } });
           if (!exists) {
             isValid = false;
             await notification.destroy(); // Auto-cleanup
           }
        }

        if (isValid) {
          validNotifications.push(notification);
        }
      }

      return validNotifications;
    } catch (error) {
      logger.error(`Error getting notifications for user ${userId}:`, error);
      return [];
    }
  }

  // Mark notification as sent
  async markAsSent(notificationId: number) {
    try {
      const notification = await NotificationQueue.findByPk(notificationId);
      if (notification) {
        notification.status = 'sent';
        notification.sent_at = new Date();
        await notification.save();
      }
    } catch (error) {
      logger.error(`Error marking notification ${notificationId} as sent:`, error);
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: number) {
    try {
      const notification = await NotificationQueue.findByPk(notificationId);
      if (notification) {
        notification.status = 'read';
        notification.read_at = new Date();
        await notification.save();
      }
    } catch (error) {
      logger.error(`Error marking notification ${notificationId} as read:`, error);
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: number) {
    try {
      await NotificationQueue.update(
        { 
          status: 'read',
          read_at: new Date()
        },
        {
          where: {
            user_id: userId,
            status: { [Op.in]: ['pending', 'sent'] }
          }
        }
      );
    } catch (error) {
      logger.error(`Error marking all notifications as read for user ${userId}:`, error);
      throw error;
    }
  }

  // Dismiss notification
  async dismissNotification(notificationId: number) {
    try {
      const notification = await NotificationQueue.findByPk(notificationId);
      if (notification) {
        notification.status = 'dismissed';
        await notification.save();
      }
    } catch (error) {
      logger.error(`Error dismissing notification ${notificationId}:`, error);
    }
  }

  // Delete notifications for a specific entity (Cleanup)
  async deleteNotificationsForEntity(entityType: string, entityId: number) {
    try {
      await NotificationQueue.destroy({
        where: {
          entity_type: entityType,
          entity_id: entityId
        }
      });
      logger.info(`Deleted notifications for ${entityType} #${entityId}`);
    } catch (error) {
      logger.error(`Error deleting notifications for ${entityType} #${entityId}:`, error);
    }
  }
}

export default new NotificationService();
