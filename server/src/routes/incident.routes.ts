import { Router } from 'express';
import {
  getIncidents,
  getIncident,
  getSimilarIncidents,
  createIncident,
  updateIncident,
  deleteIncident,
  uploadAttachment,
} from '../controllers/incident.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { createIncidentValidator, updateIncidentValidator } from '../validators/incident.validator';
import { validate } from '../middlewares/validate.middleware';
import { uploadAttachment as uploadMiddleware } from '../middlewares/upload.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getIncidents);
router.get('/:id/similar', getSimilarIncidents);
router.get('/:id', getIncident);
router.post('/', createIncidentValidator, validate, createIncident);
router.put('/:id', updateIncidentValidator, validate, updateIncident);
router.delete('/:id', deleteIncident);
router.post('/:id/attachments', uploadMiddleware.single('file'), uploadAttachment);

export default router;
