import { Op } from 'sequelize';
import Incident from '../models/Incident';
import Server from '../models/Server';
import User from '../models/User';

import Solution from '../models/Solution';
import IncidentHistory from '../models/IncidentHistory';
import Attachment from '../models/Attachment';
import Tag from '../models/Tag';
import notificationService from './notification.service';
import logger from '../utils/logger';

export class IncidentService {
  async findAll(filters: any = {}) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.server_id) where.server_id = filters.server_id;
    if (filters.severity) where.severity = filters.severity;
    if (filters.type) where.type = filters.type;
    
    if (filters.startDate || filters.endDate) {
      where.created_at = {};
      if (filters.startDate) where.created_at[Op.gte] = new Date(filters.startDate);
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.created_at[Op.lte] = endDate;
      }
    }

    return await Incident.findAll({
      where,
      include: [
        { model: Server, as: 'server', attributes: ['id', 'name', 'host'] },
        { model: User, as: 'assignee', attributes: ['id', 'full_name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'full_name', 'email'] },
        { model: Tag, through: { attributes: [] } }
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async findById(id: number) {
    return await Incident.findByPk(id, {
      include: [
        { model: Server, as: 'server' },
        { model: User, as: 'assignee', attributes: ['id', 'full_name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'full_name', 'email'] },
        { 
          model: Solution, 
          as: 'solutions', 
          include: [{ model: User, as: 'applicator', foreignKey: 'applied_by', attributes: ['full_name'] }] 
        },
        { 
          model: IncidentHistory, 
          include: [{ model: User, foreignKey: 'changed_by', attributes: ['full_name'] }] 
        },
        { 
          model: Attachment, 
          include: [{ model: User, foreignKey: 'uploaded_by', attributes: ['full_name'] }] 
        },
        { model: Tag, through: { attributes: [] } }
      ]
    });
  }

  async create(data: any, userId: number) {
    const incident = await Incident.create({
      ...data,
      created_by: userId,
      status: 'new', // Default status
    });

    // Notify all users about new incident
    const allUsers = await User.findAll();
    const notifyUserIds = allUsers.map(u => u.id);

    // Send notifications
    if (notifyUserIds.length > 0) {
      try {
        const assignedUser = data.assigned_to ? await User.findByPk(data.assigned_to) : null;
        await notificationService.createIncidentNotification(
          notifyUserIds,
          'incident_created',
          {
            id: incident.id,
            title: data.title,
            severity: data.severity,
            description: data.description,
            assigned_to: assignedUser?.full_name,
          }
        );
        logger.info(`Sent incident creation notifications to ${notifyUserIds.length} users`);
      } catch (error) {
        logger.error('Failed to send incident creation notifications:', error);
      }
    }

    return incident;
  }

  async update(id: number, data: any) {
    const incident = await Incident.findByPk(id);
    if (!incident) return null;

    const oldAssignedTo = incident.assigned_to;
    const newAssignedTo = data.assigned_to;

    const updatedIncident = await incident.update(data);

    // If assigned_to changed, notify the new assignee
    if (newAssignedTo && newAssignedTo !== oldAssignedTo) {
      try {
        const assignedUser = await User.findByPk(newAssignedTo);
        if (assignedUser) {
          await notificationService.createIncidentNotification(
            [newAssignedTo],
            'incident_assigned',
            {
              id: incident.id,
              title: incident.title,
              severity: incident.severity,
              description: incident.description,
              assigned_to: assignedUser.full_name,
            }
          );
          logger.info(`Sent incident assignment notification to user ${newAssignedTo}`);
        }
      } catch (error) {
        logger.error('Failed to send incident assignment notification:', error);
      }
    }

    return updatedIncident;
  }

  async delete(id: number) {
    const incident = await Incident.findByPk(id);
    if (!incident) return null;
    return await incident.destroy();
  }

  async findSimilar(criteria: { title?: string; type?: string; server_id?: number }) {
    const where: any = {};
    const orConditions = [];

    if (criteria.title && criteria.title.length > 3) {
      // Simple keyword matching
      const keywords = criteria.title.split(' ')
        .filter(w => w.length > 3)
        .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); // Escape regex chars

      if (keywords.length > 0) {
        orConditions.push({
          title: { [Op.regexp]: keywords.join('|') }
        });
        orConditions.push({
          description: { [Op.regexp]: keywords.join('|') }
        });
      }
    }

    if (criteria.type) {
      orConditions.push({ type: criteria.type });
    }

    if (criteria.server_id) {
      orConditions.push({ server_id: criteria.server_id });
    }

    if (orConditions.length === 0) return [];

    where[Op.or] = orConditions;

    return await Incident.findAll({
      where,
      limit: 5,
      include: [
        { model: Solution, as: 'solutions', required: false } // Include solutions if any
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async addAttachment(incidentId: number, data: any) {
    const incident = await Incident.findByPk(incidentId);
    if (!incident) throw new Error('Incident not found');

    return await Attachment.create({
      ...data,
      incident_id: incidentId
    });
  }
}
