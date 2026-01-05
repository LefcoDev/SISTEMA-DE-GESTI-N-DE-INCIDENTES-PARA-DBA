import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PaperAirplaneIcon as Send } from '@heroicons/react/24/outline';
import { ArrowPathIcon as Loader2 } from '@heroicons/react/24/outline';
import chatService from '../../services/chat.service';
import type { Conversation, Message } from '../../types/chat';
import { useSocket } from '../../context/SocketContext';

interface ChatWindowProps {
  conversation: Conversation;
  currentUserId: number;
  onMessagesUpdate?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  currentUserId,
  onMessagesUpdate
}) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket, connected } = useSocket();
  const shouldScrollRef = useRef(true); // Control manual del scroll

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Solo hacer scroll automático en casos específicos
  useEffect(() => {
    if (shouldScrollRef.current) {
      scrollToBottom('auto'); // Scroll instantáneo en carga inicial
      shouldScrollRef.current = false;
    }
  }, [messages]);

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (mounted) {
        shouldScrollRef.current = true; // Permitir scroll en carga inicial
        await loadMessages();
        await markAsRead();
      }
    };
    
    loadData();
    
    return () => {
      mounted = false;
    };
  }, [conversation.id]);

  // Escuchar nuevos mensajes por WebSocket
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewMessage = async (data: { conversationId: number; senderId: number }) => {
      console.log('📨 WebSocket: Nuevo mensaje recibido', data);
      
      // Solo recargar si el mensaje NO es del usuario actual (para evitar recargas innecesarias)
      if (data.senderId === currentUserId) {
        console.log('⏭️ Mensaje enviado por mi, no recargar');
        return;
      }
      
      if (data.conversationId === conversation.id) {
        console.log('✅ Mensaje es de esta conversación, cargando nuevo mensaje...');
        
        // En lugar de recargar todos los mensajes, solo obtener el último
        try {
          const allMessages = await chatService.getMessages(conversation.id);
          const lastMessage = allMessages[allMessages.length - 1];
          
          // Solo agregar si no existe ya
          setMessages(prev => {
            const exists = prev.some(m => m.id === lastMessage.id);
            if (exists) return prev;
            return [...prev, lastMessage];
          });
          
          markAsRead();
        } catch (error) {
          console.error('Error loading new message:', error);
        }
      } else {
        console.log('⚠️ Mensaje de otra conversación:', data.conversationId, 'vs', conversation.id);
      }
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [socket, connected, conversation.id, currentUserId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await chatService.getMessages(conversation.id);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await chatService.markAsRead(conversation.id);
      // No llamar onMessagesUpdate aquí para evitar bucle infinito
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const message = await chatService.sendMessage(conversation.id, {
        content: newMessage.trim()
      });
      
      setMessages([...messages, message]);
      setNewMessage('');
      
      // Hacer scroll suave cuando TÚ envías un mensaje
      setTimeout(() => scrollToBottom('smooth'), 100);
      
      // Emitir evento de nuevo mensaje por WebSocket
      if (socket && connected) {
        // Obtener IDs de los otros participantes
        const allParticipants = conversation.allParticipants || conversation.participants || [];
        const recipientIds = allParticipants
          .filter(p => p.id !== currentUserId)
          .map(p => p.id);
        
        console.log('📤 Emitiendo message:send', {
          conversationId: conversation.id,
          recipientIds,
          currentUserId,
          allParticipants: allParticipants.map(p => p.id),
          socketConnected: connected,
          socketId: socket.id
        });
        
        socket.emit('message:send', {
          conversationId: conversation.id,
          recipientIds
        });
      } else {
        console.warn('⚠️ No se puede emitir mensaje: socket:', !!socket, 'connected:', connected);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const getConversationTitle = () => {
    if (conversation.type === 'group') {
      return conversation.name || t('chat.groupChat');
    }
    
    if (conversation.type === 'global') {
      return t('chat.globalChat');
    }

    // Direct chat - show other user's name
    const otherParticipant = conversation.allParticipants?.find(
      p => p.user_id !== currentUserId
    );
    return otherParticipant?.user?.full_name || t('chat.directChat');
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b p-4 bg-white flex-shrink-0">
        <h2 className="text-lg font-semibold">{getConversationTitle()}</h2>
        {conversation.type === 'group' && (
          <p className="text-sm text-gray-500">
            {conversation.allParticipants?.length || 0} {t('chat.participants')}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            {t('chat.noMessages')}
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isOwn
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 shadow'
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-semibold mb-1 opacity-75">
                      {message.sender?.full_name}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t p-4 bg-white flex gap-2"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={t('chat.typeMessage')}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              {t('chat.send')}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
