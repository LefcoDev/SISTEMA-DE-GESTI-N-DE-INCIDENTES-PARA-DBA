import { Router } from 'express';
import {
  getServers,
  getServer,
  createServer,
  updateServer,
  deleteServer,
} from '../controllers/server.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { createServerValidator, updateServerValidator } from '../validators/server.validator';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getServers);
router.get('/:id', getServer);
router.post('/', createServerValidator, validate, createServer);
router.put('/:id', updateServerValidator, validate, updateServer);
router.delete('/:id', deleteServer);

export default router;
