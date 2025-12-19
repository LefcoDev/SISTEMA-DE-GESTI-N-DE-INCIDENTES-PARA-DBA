import { Request, Response } from 'express';
import { MonitoringService } from '../services/monitoring.service';
import { ServerHealth, Server } from '../models';

const monitoringService = new MonitoringService();

export const runHealthChecks = async (req: Request, res: Response) => {
  try {
    const results = await monitoringService.checkAllServers();
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const runSingleServerCheck = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await monitoringService.checkServerById(Number(id));
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getServerHealth = async (req: Request, res: Response) => {
  try {
    const { serverId } = req.params;
    const health = await ServerHealth.findAll({
      where: { server_id: serverId },
      order: [['checked_at', 'DESC']],
      limit: 50
    });
    res.json(health);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Get latest status for each server
    const servers = await Server.findAll({
      where: { status: 'active' },
      include: [
        {
          model: ServerHealth,
          as: 'healthChecks',
          limit: 1,
          order: [['id', 'DESC']]
        }
      ]
    });

    const stats = {
      total: servers.length,
      online: 0,
      offline: 0,
      avgResponseTime: 0
    };

    let totalResponseTime = 0;
    let respondingServers = 0;

    servers.forEach((server: any) => {
      const lastCheck = server.healthChecks?.[0];
      if (lastCheck?.is_online) {
        stats.online++;
        totalResponseTime += lastCheck.response_time_ms;
        respondingServers++;
      } else {
        stats.offline++;
      }
    });

    stats.avgResponseTime = respondingServers > 0 ? Math.round(totalResponseTime / respondingServers) : 0;

    res.json({ servers, stats });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
