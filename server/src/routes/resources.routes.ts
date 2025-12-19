import express from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as resourcesController from '../controllers/resources.controller';

const router = express.Router();

router.use(authenticate);

router.get('/topic/:topicId', resourcesController.getResourcesByTopic);
router.post('/', resourcesController.createResource);
router.put('/:id', resourcesController.updateResource);
router.patch('/:id/toggle-complete', resourcesController.toggleResourceComplete);
router.delete('/:id', resourcesController.deleteResource);

export default router;
