import { Router } from 'express';
import { runHealthChecks, runSingleServerCheck, getServerHealth, getDashboardStats } from '../controllers/monitoring.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/run', runHealthChecks);
router.post('/run/:id', runSingleServerCheck);
router.get('/dashboard', getDashboardStats);
router.get('/server/:serverId', getServerHealth);

export default router;
