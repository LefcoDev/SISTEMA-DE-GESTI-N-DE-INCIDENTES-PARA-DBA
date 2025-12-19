import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  createNugget,
  getNuggets,
  getNuggetById,
  updateNugget,
  deleteNugget,
  verifyNugget,
  markHelpful,
  rateNugget
} from '../controllers/knowledge.controller';

const router = Router();

router.use(authenticate);

router.post('/', createNugget);
router.get('/', getNuggets);
router.get('/:id', getNuggetById);
router.put('/:id', updateNugget);
router.delete('/:id', deleteNugget);
router.patch('/:id/verify', verifyNugget);
router.post('/:id/helpful', markHelpful);
router.post('/:id/rate', rateNugget);

export default router;
