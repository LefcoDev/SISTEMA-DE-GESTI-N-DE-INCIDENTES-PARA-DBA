import { Request, Response } from 'express';
import { ScriptService } from '../services/script.service';
import { AuditService } from '../services/audit.service';

const scriptService = new ScriptService();
const auditService = new AuditService();

export const createScript = async (req: Request, res: Response) => {
  try {
    const data = {
      ...req.body,
      created_by: req.user?.id
    };
    const script = await scriptService.create(data);

    if (script) {
      // Log creation
      await auditService.log({
        user_id: req.user?.id!,
        action: 'CREATE',
        entity_type: 'SCRIPT',
        entity_id: script.id,
        new_value: script.toJSON(),
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });
    }

    res.status(201).json(script);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getScripts = async (req: Request, res: Response) => {
  try {
    const scripts = await scriptService.findAll(req.query);
    res.json(scripts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getScriptById = async (req: Request, res: Response) => {
  try {
    const script = await scriptService.findById(Number(req.params.id));
    if (!script) {
      return res.status(404).json({ message: 'Script not found' });
    }
    res.json(script);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateScript = async (req: Request, res: Response) => {
  try {
    const oldScript = await scriptService.findById(Number(req.params.id));
    const script = await scriptService.update(Number(req.params.id), req.body);
    
    if (!script) {
      return res.status(404).json({ message: 'Script not found' });
    }

    // Log update
    await auditService.log({
      user_id: req.user?.id!,
      action: 'UPDATE',
      entity_type: 'SCRIPT',
      entity_id: script.id,
      old_value: oldScript?.toJSON(),
      new_value: script.toJSON(),
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json(script);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteScript = async (req: Request, res: Response) => {
  try {
    const script = await scriptService.findById(Number(req.params.id));
    const success = await scriptService.delete(Number(req.params.id));
    
    if (!success) {
      return res.status(404).json({ message: 'Script not found' });
    }

    // Log deletion
    await auditService.log({
      user_id: req.user?.id!,
      action: 'DELETE',
      entity_type: 'SCRIPT',
      entity_id: Number(req.params.id),
      old_value: script?.toJSON(),
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const executeScript = async (req: Request, res: Response) => {
  try {
    const { serverId, username, password } = req.body;
    if (!serverId || !username || !password) {
      return res.status(400).json({ message: 'Server ID and credentials are required' });
    }

    const results = await scriptService.execute(
      Number(req.params.id),
      Number(serverId),
      { username, password },
      req.user?.id // Pass user ID
    );
    res.json({ results });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
