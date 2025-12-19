import { Request, Response } from 'express';
import { AuditService } from '../services/audit.service';

const auditService = new AuditService();

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await auditService.findAll(req.query);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAuditLog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await auditService.delete(Number(id));
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
