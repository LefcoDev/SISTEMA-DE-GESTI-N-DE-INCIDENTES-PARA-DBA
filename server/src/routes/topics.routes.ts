import express from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as topicsController from '../controllers/topics.controller';

const router = express.Router();

router.use(authenticate);

router.get('/', topicsController.getAllTopics);
router.get('/:id', topicsController.getTopic);
router.post('/', topicsController.createTopic);
router.put('/:id', topicsController.updateTopic);
router.delete('/:id', topicsController.deleteTopic);

export default router;
