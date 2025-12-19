import { Request, Response } from 'express';
import { Op, Sequelize } from 'sequelize';
import Incident from '../models/Incident';
import Server from '../models/Server';
import User from '../models/User';

export class ReportController {
  public async generateReport(req: Request, res: Response) {
    try {
      const { startDate, endDate, server_id, type, severity, status, format } = req.body;

      const where: any = {};
      
      if (startDate || endDate) {
        where.created_at = {};
        if (startDate) where.created_at[Op.gte] = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          where.created_at[Op.lte] = end;
        }
      }

      if (server_id) where.server_id = server_id;
      if (type) where.type = type;
      if (severity) where.severity = severity;
      if (status) where.status = status;

      // Fetch raw data
      const incidents = await Incident.findAll({
        where,
        include: [
          { model: Server, as: 'server', attributes: ['name', 'host'] },
          { model: User, as: 'assignee', attributes: ['full_name'] },
          { model: User, as: 'creator', attributes: ['full_name'] }
        ],
        order: [['created_at', 'DESC']]
      });

      // Calculate statistics
      const totalIncidents = incidents.length;
      
      const bySeverity = incidents.reduce((acc: any, curr) => {
        acc[curr.severity] = (acc[curr.severity] || 0) + 1;
        return acc;
      }, {});

      const byStatus = incidents.reduce((acc: any, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {});

      const byType = incidents.reduce((acc: any, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
      }, {});

      // Calculate MTTR (Mean Time To Resolution) for resolved incidents
      const resolvedIncidents = incidents.filter(i => i.status === 'resolved' || i.status === 'closed');
      let totalResolutionTime = 0;
      let resolvedCount = 0;

      resolvedIncidents.forEach(i => {
        if (i.resolution_time_minutes) {
          totalResolutionTime += i.resolution_time_minutes;
          resolvedCount++;
        }
      });

      const mttr = resolvedCount > 0 ? Math.round(totalResolutionTime / resolvedCount) : 0;

      const reportData = {
        generated_at: new Date(),
        filters: { startDate, endDate, server_id, type, severity, status },
        statistics: {
          total: totalIncidents,
          by_severity: bySeverity,
          by_status: byStatus,
          by_type: byType,
          mttr_minutes: mttr
        },
        incidents: incidents
      };

      res.json(reportData);
    } catch (error: any) {
      console.error('Error generating report:', error);
      res.status(500).json({ message: 'Error generating report' });
    }
  }

  public async getTrendAnalysis(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(end.getDate() - 30));
      end.setHours(23, 59, 59, 999);
      start.setHours(0, 0, 0, 0);

      // Previous period for comparison
      const duration = end.getTime() - start.getTime();
      const prevEnd = new Date(start.getTime() - 1);
      const prevStart = new Date(prevEnd.getTime() - duration);

      // Helper to get stats for a period
      const getStats = async (s: Date, e: Date) => {
        const where = { created_at: { [Op.between]: [s, e] } };
        
        const [total, byType, byServer] = await Promise.all([
          Incident.count({ where }),
          Incident.findAll({
            where,
            attributes: ['type', [Sequelize.fn('COUNT', Sequelize.col('Incident.id')), 'count']],
            group: ['type']
          }),
          Incident.findAll({
            where,
            attributes: ['server_id', [Sequelize.fn('COUNT', Sequelize.col('Incident.id')), 'count']],
            include: [{ model: Server, as: 'server', attributes: ['name'] }],
            group: ['server_id', 'server.id'],
            order: [[Sequelize.literal('count'), 'DESC']],
            limit: 5
          })
        ]);
        return { total, byType, byServer };
      };

      const currentStats = await getStats(start, end);
      const previousStats = await getStats(prevStart, prevEnd);

      // Recurrent incidents (only for current period)
      const recurrentIncidents = await Incident.findAll({
        where: { created_at: { [Op.between]: [start, end] } },
        attributes: [
          'server_id',
          'type',
          [Sequelize.fn('COUNT', Sequelize.col('Incident.id')), 'count']
        ],
        include: [{ model: Server, as: 'server', attributes: ['name'] }],
        group: ['server_id', 'server.id', 'type'],
        having: Sequelize.literal('count > 1'),
        order: [[Sequelize.literal('count'), 'DESC']],
        limit: 10
      });

      // Peak hours (only for current period)
      const peakHours = await Incident.findAll({
        where: { created_at: { [Op.between]: [start, end] } },
        attributes: [
          [Sequelize.fn('HOUR', Sequelize.col('created_at')), 'hour'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: [Sequelize.fn('HOUR', Sequelize.col('created_at'))],
        order: [[Sequelize.literal('count'), 'DESC']]
      });

      res.json({
        period: { start, end },
        previousPeriod: { start: prevStart, end: prevEnd },
        currentStats,
        previousStats,
        recurrentIncidents,
        peakHours
      });

    } catch (error: any) {
      console.error('Error generating trend analysis:', error);
      res.status(500).json({ message: 'Error generating trend analysis' });
    }
  }
}

export const reportController = new ReportController();
