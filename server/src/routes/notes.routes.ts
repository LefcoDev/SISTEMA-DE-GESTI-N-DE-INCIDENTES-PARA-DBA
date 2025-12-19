import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  togglePinNote,
  toggleArchiveNote,
  updateKanbanPosition,
  duplicateNote
} from '../controllers/notes.controller';

const router = Router();

router.use(authenticate);

router.post('/', createNote);
router.get('/', getNotes);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.patch('/:id/pin', togglePinNote);
router.patch('/:id/archive', toggleArchiveNote);
router.patch('/:id/kanban', updateKanbanPosition);
router.post('/:id/duplicate', duplicateNote);

export default router;
