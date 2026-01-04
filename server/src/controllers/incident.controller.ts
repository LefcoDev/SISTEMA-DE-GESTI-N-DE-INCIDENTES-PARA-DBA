import { Request, Response, NextFunction } from 'express';
import { IncidentService } from '../services/incident.service';
import { AuditService } from '../services/audit.service';
import similarityService from '../services/similarity.service';

const incidentService = new IncidentService();
const auditService = new AuditService();

export const getIncidents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      status: req.query.status,
      server_id: req.query.server_id,
      severity: req.query.severity,
      type: req.query.type,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    const incidents = await incidentService.findAll(filters);
    res.json(incidents);
  } catch (error) {
    next(error);
  }
};

export const getIncident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const incident = await incidentService.findById(Number(req.params.id));
    if (!incident) {
      return res.status(404).json({ message: 'Incidente no encontrado' });
    }
    res.json(incident);
  } catch (error) {
    next(error);
  }
};

export const createIncident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const incident = await incidentService.create(req.body, userId);

    // Log creation
    await auditService.log({
      user_id: userId,
      action: 'CREATE',
      entity_type: 'INCIDENT',
      entity_id: incident.id,
      new_value: incident.toJSON(),
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.status(201).json(incident);
  } catch (error) {
    next(error);
  }
};

export const updateIncident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const oldIncident = await incidentService.findById(Number(req.params.id));
    const incident = await incidentService.update(Number(req.params.id), req.body);
    
    if (!incident) {
      return res.status(404).json({ message: 'Incidente no encontrado' });
    }

    // Log update
    // @ts-ignore
    const userId = req.user.id;
    await auditService.log({
      user_id: userId,
      action: 'UPDATE',
      entity_type: 'INCIDENT',
      entity_id: incident.id,
      old_value: oldIncident?.toJSON(),
      new_value: incident.toJSON(),
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json(incident);
  } catch (error) {
    next(error);
  }
};

export const deleteIncident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const incident = await incidentService.findById(Number(req.params.id));
    const result = await incidentService.delete(Number(req.params.id));
    
    if (!result) {
      return res.status(404).json({ message: 'Incidente no encontrado' });
    }

    // Log deletion
    // @ts-ignore
    const userId = req.user.id;
    await auditService.log({
      user_id: userId,
      action: 'DELETE',
      entity_type: 'INCIDENT',
      entity_id: Number(req.params.id),
      old_value: incident?.toJSON(),
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({ message: 'Incidente eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

export const getSimilarIncidents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const incidentId = Number(req.params.id);
    const limit = req.query.limit ? Number(req.query.limit) : 5;

    if (!incidentId || isNaN(incidentId)) {
      return res.status(400).json({ message: 'Valid incident ID is required' });
    }

    const similarIncidents = await similarityService.findSimilarIncidents(incidentId, limit);
    res.json(similarIncidents);
  } catch (error) {
    next(error);
  }
};

export const uploadAttachment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const incidentId = Number(req.params.id);
    // @ts-ignore
    const userId = req.user.id;

    const attachment = await incidentService.addAttachment(incidentId, {
      filename: req.file.originalname,
      file_path: req.file.filename,
      file_type: req.file.mimetype,
      file_size: req.file.size,
      uploaded_by: userId
    });

    // Log upload
    await auditService.log({
      user_id: userId,
      action: 'UPDATE',
      entity_type: 'INCIDENT',
      entity_id: incidentId,
      new_value: { attachment: attachment.toJSON() },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.status(201).json(attachment);
  } catch (error) {
    next(error);
  }
};
