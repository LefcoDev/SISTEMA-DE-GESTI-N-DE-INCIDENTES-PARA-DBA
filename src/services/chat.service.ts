import api from '../lib/axios';
import type {
  Conversation,
  Message,
  CreateDirectConversationDto,
  CreateGroupConversationDto,
  SendMessageDto
} from '../types/chat';

export const chatService = {
  // Obtener usuarios disponibles
  getAvailableUsers: async (): Promise<any[]> => {
    const response = await api.get('/chat/users');
    return response.data;
  },

  // Obtener todas las conversaciones del usuario
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  // Crear o obtener conversación directa (1-a-1)
  getOrCreateDirectConversation: async (
    data: CreateDirectConversationDto
  ): Promise<Conversation> => {
    const response = await api.post('/chat/conversations/direct', data);
    return response.data;
  },

  // Crear conversación grupal
  createGroupConversation: async (
    data: CreateGroupConversationDto
  ): Promise<Conversation> => {
    const response = await api.post('/chat/conversations/group', data);
    return response.data;
  },

  // Obtener mensajes de una conversación
  getMessages: async (
    conversationId: number,
    limit?: number,
    before?: string
  ): Promise<Message[]> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (before) params.append('before', before);
    
    const response = await api.get(
      `/chat/conversations/${conversationId}/messages?${params.toString()}`
    );
    return response.data;
  },

  // Enviar mensaje
  sendMessage: async (
    conversationId: number,
    data: SendMessageDto
  ): Promise<Message> => {
    const response = await api.post(
      `/chat/conversations/${conversationId}/messages`,
      data
    );
    return response.data;
  },

  // Marcar como leído
  markAsRead: async (conversationId: number): Promise<void> => {
    await api.post(`/chat/conversations/${conversationId}/read`);
  },

  // Obtener contador de no leídos
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/chat/unread-count');
    return response.data.unreadCount;
  }
};

export default chatService;
