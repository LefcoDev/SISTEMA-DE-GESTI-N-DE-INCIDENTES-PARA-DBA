import { Router } from 'express';
import {
  createScript,
  getScripts,
  getScriptById,
  updateScript,
  deleteScript,
  executeScript
} from '../controllers/script.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { body } from 'express-validator';

const router = Router();

router.use(authenticate);

const scriptValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('language').isIn(['sql', 'bash', 'powershell', 'python']).withMessage('Invalid language'),
  body('code').notEmpty().withMessage('Code is required'),
  body('category').isIn(['maintenance', 'monitoring', 'backup', 'performance', 'administration']).withMessage('Invalid category'),
];

router.post('/', scriptValidation, validate, createScript);
router.get('/', getScripts);
router.get('/:id', getScriptById);
router.put('/:id', scriptValidation, validate, updateScript);
router.delete('/:id', deleteScript);
router.post('/:id/execute', executeScript);

export default router;
