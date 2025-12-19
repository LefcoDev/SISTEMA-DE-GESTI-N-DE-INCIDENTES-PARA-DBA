import { Router } from 'express';
import authRoutes from './auth.routes';
import serverRoutes from './server.routes';
import incidentRoutes from './incident.routes';
import solutionRoutes from './solution.routes';
import scriptRoutes from './script.routes';
import dashboardRoutes from './dashboard.routes';
import searchRoutes from './search.routes';
import tagRoutes from './tag.routes';
import backupRoutes from './backup.routes';
import userRoutes from './user.routes';
import reportRoutes from './report.routes';
import auditRoutes from './audit.routes';
import monitoringRoutes from './monitoring.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/servers', serverRoutes);
router.use('/incidents', incidentRoutes);
router.use('/solutions', solutionRoutes);
router.use('/scripts', scriptRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/search', searchRoutes);
router.use('/tags', tagRoutes);
router.use('/backups', backupRoutes);
router.use('/users', userRoutes);
router.use('/reports', reportRoutes);
router.use('/audit', auditRoutes);
router.use('/monitoring', monitoringRoutes);

export default router;
