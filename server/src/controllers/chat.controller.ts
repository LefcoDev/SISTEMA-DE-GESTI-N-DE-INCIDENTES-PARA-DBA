import { Request, Response } from 'express';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import ConversationParticipant from '../models/ConversationParticipant';
import User from '../models/User';
import { Op } from 'sequelize';

// Obtener lista de usuarios disponibles para chat
export const getAvailableUsers = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.id;

    const users = await User.findAll({
      where: {
        id: { [Op.ne]: currentUserId },
        is_active: true
      },
      attributes: ['id', 'full_name', 'email', 'role', 'updated_at'],
      order: [['full_name', 'ASC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching available users:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Obtener todas las conversaciones del usuario actual
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const conversations = await Conversation.findAll({
      include: [
        {
          model: ConversationParticipant,
          as: 'participants',
          where: { user_id: userId },
          required: true
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['created_at', 'DESC']],
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'full_name', 'email']
            }
          ]
        },
        {
          model: ConversationParticipant,
          as: 'allParticipants',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'full_name', 'email']
            }
          ]
        }
      ],
      order: [['updated_at', 'DESC']]
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Error al obtener conversaciones' });
  }
};

// Crear o obtener conversación directa (1-a-1)
export const getOrCreateDirectConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ error: 'Se requiere el ID del otro usuario' });
    }

    if (userId === otherUserId) {
      return res.status(400).json({ error: 'No puedes crear una conversación contigo mismo' });
    }

    // Buscar conversación directa existente
    const existingConversation = await Conversation.findOne({
      where: { type: 'direct' },
      include: [
        {
          model: ConversationParticipant,
          as: 'participants',
          where: { user_id: { [Op.in]: [userId, otherUserId] } },
          required: true
        }
      ]
    });

    if (existingConversation) {
      // Verificar que ambos usuarios estén en la conversación
      const participants = await ConversationParticipant.findAll({
        where: { conversation_id: existingConversation.id }
      });

      if (participants.length === 2) {
        return res.json(existingConversation);
      }
    }

    // Crear nueva conversación
    const conversation = await Conversation.create({
      type: 'direct',
      created_by: userId
    });

    // Agregar participantes
    await ConversationParticipant.bulkCreate([
      { conversation_id: conversation.id, user_id: userId },
      { conversation_id: conversation.id, user_id: otherUserId }
    ]);

    const conversationWithData = await Conversation.findByPk(conversation.id, {
      include: [
        {
          model: ConversationParticipant,
          as: 'allParticipants',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'full_name', 'email']
            }
          ]
        }
      ]
    });

    res.status(201).json(conversationWithData);
  } catch (error) {
    console.error('Error creating direct conversation:', error);
    res.status(500).json({ error: 'Error al crear conversación' });
  }
};

// Crear conversación grupal
export const createGroupConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, participantIds } = req.body;

    if (!name || !participantIds || !Array.isArray(participantIds)) {
      return res.status(400).json({ error: 'Se requiere nombre y participantes' });
    }

    // Crear conversación
    const conversation = await Conversation.create({
      type: 'group',
      name,
      created_by: userId
    });

    // Agregar creador y participantes
    const allParticipants = [...new Set([userId, ...participantIds])];
    await ConversationParticipant.bulkCreate(
      allParticipants.map(id => ({
        conversation_id: conversation.id,
        user_id: id
      }))
    );

    const conversationWithData = await Conversation.findByPk(conversation.id, {
      include: [
        {
          model: ConversationParticipant,
          as: 'allParticipants',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'full_name', 'email']
            }
          ]
        }
      ]
    });

    res.status(201).json(conversationWithData);
  } catch (error) {
    console.error('Error creating group conversation:', error);
    res.status(500).json({ error: 'Error al crear conversación grupal' });
  }
};

// Obtener mensajes de una conversación
export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;

    // Verificar que el usuario es participante
    const participant = await ConversationParticipant.findOne({
      where: {
        conversation_id: conversationId,
        user_id: userId
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'No eres participante de esta conversación' });
    }

    // Obtener mensajes
    const whereClause: any = {
      conversation_id: conversationId,
      is_deleted: false
    };

    if (before) {
      whereClause.created_at = { [Op.lt]: new Date(before as string) };
    }

    const messages = await Message.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'full_name', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: Number(limit)
    });

    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

// Enviar mensaje
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }

    // Verificar que el usuario es participante
    const participant = await ConversationParticipant.findOne({
      where: {
        conversation_id: conversationId,
        user_id: userId
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'No eres participante de esta conversación' });
    }

    // Crear mensaje
    const message = await Message.create({
      conversation_id: Number(conversationId),
      sender_id: userId,
      content: content.trim()
    });

    // Actualizar timestamp de la conversación
    await Conversation.update(
      { updated_at: new Date() },
      { where: { id: conversationId } }
    );

    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    res.status(201).json(messageWithSender);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
};

// Marcar mensajes como leídos
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;

    await ConversationParticipant.update(
      { last_read_at: new Date() },
      {
        where: {
          conversation_id: conversationId,
          user_id: userId
        }
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ error: 'Error al marcar como leído' });
  }
};

// Obtener contador de mensajes no leídos
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const participants = await ConversationParticipant.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Conversation,
          as: 'conversation',
          include: [
            {
              model: Message,
              as: 'messages',
              where: {
                is_deleted: false
              },
              required: false
            }
          ]
        }
      ]
    });

    let totalUnread = 0;

    for (const participant of participants) {
      const lastRead = participant.last_read_at || participant.joined_at;
      const conversation: any = participant.get('conversation');
      
      if (conversation && conversation.messages) {
        const unreadCount = conversation.messages.filter(
          (msg: any) => msg.created_at > lastRead && msg.sender_id !== userId
        ).length;
        totalUnread += unreadCount;
      }
    }

    res.json({ unreadCount: totalUnread });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Error al obtener mensajes no leídos' });
  }
};
