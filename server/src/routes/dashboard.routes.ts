import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/stats', dashboardController.getStats);
router.get('/incidents-by-month', dashboardController.getIncidentsByMonth);
router.get('/incidents-by-severity', dashboardController.getIncidentsBySeverity);
router.get('/incidents-by-type', dashboardController.getIncidentsByType);
router.get('/top-servers', dashboardController.getTopServers);
router.get('/recent-incidents', dashboardController.getRecentIncidents);

export default router;
