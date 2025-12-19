import { Router } from 'express';
import { getAuditLogs, deleteAuditLog } from '../controllers/audit.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize('admin')); // Only admins can view audit logs

router.get('/', getAuditLogs);
router.delete('/:id', deleteAuditLog);

export default router;
