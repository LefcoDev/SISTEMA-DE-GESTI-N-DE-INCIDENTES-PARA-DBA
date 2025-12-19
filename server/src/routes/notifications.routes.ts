import express from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as notificationsController from '../controllers/notifications.controller';

const router = express.Router();

router.use(authenticate);

router.get('/', notificationsController.getNotifications);
router.patch('/:id/read', notificationsController.markAsRead);
router.delete('/:id', notificationsController.dismissNotification);

export default router;
