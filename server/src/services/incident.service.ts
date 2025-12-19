import { Op } from 'sequelize';
import Incident from '../models/Incident';
import Server from '../models/Server';
import User from '../models/User';

import Solution from '../models/Solution';
import IncidentHistory from '../models/IncidentHistory';
import Attachment from '../models/Attachment';
import Tag from '../models/Tag';

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
        { model: Solution, include: [{ model: User, attributes: ['full_name'] }] },
        { model: IncidentHistory, include: [{ model: User, attributes: ['full_name'] }] },
        { model: Attachment, include: [{ model: User, attributes: ['full_name'] }] },
        { model: Tag, through: { attributes: [] } }
      ],
      order: [
        [IncidentHistory, 'changed_at', 'DESC'],
        [Solution, 'created_at', 'DESC']
      ]
    });
  }

  async create(data: any, userId: number) {
    return await Incident.create({
      ...data,
      created_by: userId,
      status: 'new', // Default status
    });
  }

  async update(id: number, data: any) {
    const incident = await Incident.findByPk(id);
    if (!incident) return null;
    return await incident.update(data);
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
        { model: Solution, required: false } // Include solutions if any
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
