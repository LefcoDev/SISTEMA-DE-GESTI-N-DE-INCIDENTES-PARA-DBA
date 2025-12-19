import { Router } from 'express';
import { createBackup, listBackups, restoreBackup, deleteBackup } from '../controllers/backup.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', listBackups);
router.post('/', createBackup);
router.post('/restore', restoreBackup);
router.delete('/:filename', deleteBackup);

export default router;
