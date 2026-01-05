import { Router } from 'express';
import * as chatController from '../controllers/chat.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Usuarios disponibles
router.get('/users', chatController.getAvailableUsers);

// Conversaciones
router.get('/conversations', chatController.getConversations);
router.post('/conversations/direct', chatController.getOrCreateDirectConversation);
router.post('/conversations/group', chatController.createGroupConversation);

// Mensajes
router.get('/conversations/:conversationId/messages', chatController.getMessages);
router.post('/conversations/:conversationId/messages', chatController.sendMessage);
router.post('/conversations/:conversationId/read', chatController.markAsRead);

// No leídos
router.get('/unread-count', chatController.getUnreadCount);

export default router;
