import { Router } from 'express';
import * as searchController from '../controllers/search.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', searchController.searchGlobal);

export default router;
