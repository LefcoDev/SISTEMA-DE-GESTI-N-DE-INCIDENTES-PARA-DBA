import { Router } from 'express';
import {
  createSolution,
  getSolutions,
  getSolutionById,
  updateSolution,
  deleteSolution,
  getTemplates
} from '../controllers/solution.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { body } from 'express-validator';

const router = Router();

router.use(authenticate);

const solutionValidation = [
  body('description').notEmpty().withMessage('Description is required'),
  body('incident_id').optional().isInt().withMessage('Incident ID must be an integer'),
  body('is_template').optional().isBoolean(),
  body('time_spent_minutes').optional().isInt(),
];

router.post('/', solutionValidation, validate, createSolution);
router.get('/', getSolutions);
router.get('/templates', getTemplates);
router.get('/:id', getSolutionById);
router.put('/:id', solutionValidation, validate, updateSolution);
router.delete('/:id', deleteSolution);

export default router;
