import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/generate', reportController.generateReport);
router.get('/trends', reportController.getTrendAnalysis);

export default router;
