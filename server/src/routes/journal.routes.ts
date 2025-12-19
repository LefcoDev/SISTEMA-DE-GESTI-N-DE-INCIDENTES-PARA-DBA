import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  createOrUpdateEntry,
  getEntries,
  getEntryByDate
} from '../controllers/journal.controller';

const router = Router();

router.use(authenticate);

router.post('/', createOrUpdateEntry);
router.get('/', getEntries);
router.get('/:date', getEntryByDate);

export default router;
