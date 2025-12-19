import { Request, Response } from 'express';
import { SolutionService } from '../services/solution.service';
import { AuditService } from '../services/audit.service';

const solutionService = new SolutionService();
const auditService = new AuditService();

export const createSolution = async (req: Request, res: Response) => {
  try {
    const data = {
      ...req.body,
      applied_by: req.user?.id // Assuming auth middleware adds user to req
    };
    const solution = await solutionService.create(data);

    // Log creation
    await auditService.log({
      user_id: req.user?.id!,
      action: 'CREATE',
      entity_type: 'SOLUTION',
      entity_id: solution.id,
      new_value: solution.toJSON(),
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.status(201).json(solution);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSolutions = async (req: Request, res: Response) => {
  try {
    const solutions = await solutionService.findAll(req.query);
    res.json(solutions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSolutionById = async (req: Request, res: Response) => {
  try {
    const solution = await solutionService.findById(Number(req.params.id));
    if (!solution) {
      return res.status(404).json({ message: 'Solution not found' });
    }
    res.json(solution);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSolution = async (req: Request, res: Response) => {
  try {
    const oldSolution = await solutionService.findById(Number(req.params.id));
    const solution = await solutionService.update(Number(req.params.id), req.body);
    
    if (!solution) {
      return res.status(404).json({ message: 'Solution not found' });
    }

    // Log update
    await auditService.log({
      user_id: req.user?.id!,
      action: 'UPDATE',
      entity_type: 'SOLUTION',
      entity_id: solution.id,
      old_value: oldSolution?.toJSON(),
      new_value: solution.toJSON(),
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json(solution);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSolution = async (req: Request, res: Response) => {
  try {
    const solution = await solutionService.findById(Number(req.params.id));
    const success = await solutionService.delete(Number(req.params.id));
    
    if (!success) {
      return res.status(404).json({ message: 'Solution not found' });
    }

    // Log deletion
    await auditService.log({
      user_id: req.user?.id!,
      action: 'DELETE',
      entity_type: 'SOLUTION',
      entity_id: Number(req.params.id),
      old_value: solution?.toJSON(),
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await solutionService.getTemplates();
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
