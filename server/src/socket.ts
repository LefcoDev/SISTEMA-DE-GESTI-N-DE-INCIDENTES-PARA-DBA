import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from './utils/logger';

interface DecodedToken {
  id: number;  // El JWT usa 'id' no 'userId'
  email: string;
}

interface UserSocket {
  userId: number;
  socketId: string;
}

// Mapa de usuarios conectados
const connectedUsers = new Map<number, string>();

export const initializeSocket = (server: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
      credentials: true
    }
  });

  // Middleware de autenticación
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as DecodedToken;
      socket.data.userId = decoded.id;  // Usar decoded.id en lugar de decoded.userId
      socket.data.email = decoded.email;
      logger.info(`JWT decoded for user ${decoded.id}: ${decoded.email}`);
      next();
    } catch (error) {
      logger.error('JWT verification error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    logger.info(`User ${userId} connected to WebSocket`);

    // Registrar usuario conectado
    connectedUsers.set(userId, socket.id);
    
    // Notificar a todos que este usuario está online
    io.emit('user:online', { userId });

    // Unirse a sala personal
    socket.join(`user:${userId}`);

    // Manejar nuevos mensajes
    socket.on('message:send', (data) => {
      const { conversationId, recipientIds } = data;
      
      logger.info(`📨 Received message:send from user ${userId}:`, data);
      logger.info(`Connected users:`, Array.from(connectedUsers.keys()));
      
      // Emitir a todos los participantes de la conversación (incluido el sender)
      if (recipientIds && Array.isArray(recipientIds)) {
        // Emitir al sender también
        logger.info(`📤 Emitting message:new to sender ${userId} (room: user:${userId})`);
        io.to(`user:${userId}`).emit('message:new', {
          conversationId,
          senderId: userId
        });
        
        // Emitir a los destinatarios
        recipientIds.forEach((recipientId: number) => {
          logger.info(`📤 Emitting message:new to user ${recipientId} (room: user:${recipientId})`);
          logger.info(`   User ${recipientId} online:`, connectedUsers.has(recipientId));
          io.to(`user:${recipientId}`).emit('message:new', {
            conversationId,
            senderId: userId
          });
        });
      } else {
        logger.warn(`⚠️ No recipientIds provided for conversation ${conversationId}`);
      }
      
      logger.info(`✅ Message sent in conversation ${conversationId} by user ${userId}`);
    });

    // Notificar que usuario está escribiendo
    socket.on('typing:start', (data) => {
      const { conversationId, recipientIds } = data;
      
      if (recipientIds && Array.isArray(recipientIds)) {
        recipientIds.forEach((recipientId: number) => {
          io.to(`user:${recipientId}`).emit('typing:user', {
            conversationId,
            userId,
            isTyping: true
          });
        });
      }
    });

    // Notificar que usuario dejó de escribir
    socket.on('typing:stop', (data) => {
      const { conversationId, recipientIds } = data;
      
      if (recipientIds && Array.isArray(recipientIds)) {
        recipientIds.forEach((recipientId: number) => {
          io.to(`user:${recipientId}`).emit('typing:user', {
            conversationId,
            userId,
            isTyping: false
          });
        });
      }
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      io.emit('user:offline', { userId });
      logger.info(`User ${userId} disconnected from WebSocket`);
    });
  });

  return io;
};

export const getConnectedUsers = (): UserSocket[] => {
  return Array.from(connectedUsers.entries()).map(([userId, socketId]) => ({
    userId,
    socketId
  }));
};

export const isUserOnline = (userId: number): boolean => {
  return connectedUsers.has(userId);
};
