import { Request, Response } from 'express';
import { Op, Sequelize } from 'sequelize';
import Incident from '../models/Incident';
import Server from '../models/Server';
import { startOfMonth, subMonths, format } from 'date-fns';

export const getStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);

    // 1. Active Incidents (not resolved or closed)
    const activeIncidents = await Incident.count({
      where: {
        status: {
          [Op.notIn]: ['resolved', 'closed']
        }
      }
    });

    // 2. Resolved this month
    const resolvedThisMonth = await Incident.count({
      where: {
        status: {
          [Op.in]: ['resolved', 'closed']
        },
        resolved_at: {
          [Op.gte]: startOfCurrentMonth
        }
      }
    });

    // 3. Avg Resolution Time (minutes)
    // We can use the pre-calculated resolution_time_minutes or calculate it on the fly.
    // Let's use the pre-calculated one for simplicity if it's being populated.
    // Assuming it is populated when status changes to resolved.
    const avgResolutionTimeResult: any = await Incident.findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('resolution_time_minutes')), 'avg_time']],
      where: {
        resolution_time_minutes: {
          [Op.ne]: null as any
        }
      }
    });
    const avgResolutionTime = avgResolutionTimeResult?.get('avg_time') || 0;

    // 4. Critical Open Incidents
    const criticalOpen = await Incident.count({
      where: {
        severity: 'critical',
        status: {
          [Op.notIn]: ['resolved', 'closed']
        }
      }
    });

    res.json({
      activeIncidents,
      resolvedThisMonth,
      avgResolutionTime: Math.round(Number(avgResolutionTime)),
      criticalOpen
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Error getting dashboard stats' });
  }
};

export const getIncidentsByMonth = async (req: Request, res: Response) => {
  try {
    const months = 12;
    const startDate = subMonths(new Date(), months);

    // MySQL specific date function
    const incidents = await Incident.findAll({
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m'), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        created_at: {
          [Op.gte]: startDate
        }
      },
      group: [Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m')],
      order: [[Sequelize.col('month'), 'ASC']],
      raw: true
    });

    res.json(incidents);
  } catch (error) {
    console.error('Error getting incidents by month:', error);
    // Fallback for non-SQLite environments or errors
    res.status(500).json({ message: 'Error getting incidents by month' });
  }
};

export const getIncidentsBySeverity = async (req: Request, res: Response) => {
  try {
    const incidents = await Incident.findAll({
      attributes: [
        'severity',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['severity'],
      raw: true
    });
    res.json(incidents);
  } catch (error) {
    console.error('Error getting incidents by severity:', error);
    res.status(500).json({ message: 'Error getting incidents by severity' });
  }
};

export const getIncidentsByType = async (req: Request, res: Response) => {
  try {
    const incidents = await Incident.findAll({
      attributes: [
        'type',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['type'],
      order: [[Sequelize.col('count'), 'DESC']],
      limit: 10,
      raw: true
    });
    res.json(incidents);
  } catch (error) {
    console.error('Error getting incidents by type:', error);
    res.status(500).json({ message: 'Error getting incidents by type' });
  }
};

export const getTopServers = async (req: Request, res: Response) => {
  try {
    const incidents = await Incident.findAll({
      attributes: [
        'server_id',
        [Sequelize.fn('COUNT', Sequelize.col('Incident.id')), 'count']
      ],
      include: [{
        model: Server,
        as: 'server',
        attributes: ['name']
      }],
      group: ['server_id', 'server.id', 'server.name'], // Include Server.id and Server.name in group for strict SQL modes
      order: [[Sequelize.col('count'), 'DESC']],
      limit: 5,
      raw: true,
      nest: true
    });
    
    // Transform to flat structure
    const result = incidents.map((item: any) => ({
      server_name: item.server.name,
      count: item.count
    }));

    res.json(result);
  } catch (error) {
    console.error('Error getting top servers:', error);
    res.status(500).json({ message: 'Error getting top servers' });
  }
};

export const getRecentIncidents = async (req: Request, res: Response) => {
  try {
    const incidents = await Incident.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [{
        model: Server,
        as: 'server',
        attributes: ['name']
      }]
    });
    res.json(incidents);
  } catch (error) {
    console.error('Error getting recent incidents:', error);
    res.status(500).json({ message: 'Error getting recent incidents' });
  }
};
