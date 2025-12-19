import { Request, Response, NextFunction } from 'express';
import { ServerService } from '../services/server.service';
import { AuditService } from '../services/audit.service';

const serverService = new ServerService();
const auditService = new AuditService();

export const getServers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const servers = await serverService.findAll();
    res.json(servers);
  } catch (error) {
    next(error);
  }
};

export const getServer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const server = await serverService.findById(Number(req.params.id));
    if (!server) {
      return res.status(404).json({ message: 'Servidor no encontrado' });
    }
    res.json(server);
  } catch (error) {
    next(error);
  }
};

export const createServer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore - user is attached by auth middleware
    const userId = req.user.id;
    const server = await serverService.create(req.body, userId);

    // Log creation
    await auditService.log({
      user_id: userId,
      action: 'CREATE',
      entity_type: 'SERVER',
      entity_id: server.id,
      new_value: server.toJSON(),
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.status(201).json(server);
  } catch (error) {
    next(error);
  }
};

export const updateServer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const oldServer = await serverService.findById(Number(req.params.id));
    const server = await serverService.update(Number(req.params.id), req.body);
    
    if (!server) {
      return res.status(404).json({ message: 'Servidor no encontrado' });
    }

    // Log update
    // @ts-ignore
    const userId = req.user.id;
    await auditService.log({
      user_id: userId,
      action: 'UPDATE',
      entity_type: 'SERVER',
      entity_id: server.id,
      old_value: oldServer?.toJSON(),
      new_value: server.toJSON(),
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json(server);
  } catch (error) {
    next(error);
  }
};

export const deleteServer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const server = await serverService.findById(Number(req.params.id));
    const result = await serverService.delete(Number(req.params.id));
    
    if (!result) {
      return res.status(404).json({ message: 'Servidor no encontrado' });
    }

    // Log deletion
    // @ts-ignore
    const userId = req.user.id;
    await auditService.log({
      user_id: userId,
      action: 'DELETE',
      entity_type: 'SERVER',
      entity_id: Number(req.params.id),
      old_value: server?.toJSON(),
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({ message: 'Servidor eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};
