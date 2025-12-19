import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder,
  completeReminder,
  snoozeReminder
} from '../controllers/reminders.controller';

const router = Router();

router.use(authenticate);

router.post('/', createReminder);
router.get('/', getReminders);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);
router.patch('/:id/complete', completeReminder);
router.patch('/:id/snooze', snoozeReminder);

export default router;
