import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChatBubbleLeftRightIcon as MessageCircle } from '@heroicons/react/24/outline';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';
import UsersList from '../../components/chat/UsersList';
import chatService from '../../services/chat.service';
import type { Conversation } from '../../types/chat';
import { useSocket } from '../../context/SocketContext';

const Chat: React.FC = () => {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const { socket, connected } = useSocket();
  
  // Obtener ID del usuario actual del localStorage o contexto
  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;

  useEffect(() => {
    let mounted = true;
    
    const load = async () => {
      if (mounted) {
        await loadConversations();
      }
    };
    
    load();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Escuchar nuevos mensajes por WebSocket
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewMessage = () => {
      // Recargar conversaciones cuando llega un nuevo mensaje
      loadConversations();
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [socket, connected]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await chatService.getConversations();
      setConversations(data);
      
      // Si hay una conversación seleccionada, actualizarla
      if (selectedConversation) {
        const updated = data.find(c => c.id === selectedConversation.id);
        if (updated) {
          setSelectedConversation(updated);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSelectUser = async (userId: number) => {
    try {
      setLoading(true);
      // Crear o obtener conversación directa
      const conversation = await chatService.getOrCreateDirectConversation({
        otherUserId: userId
      });
      
      // Recargar conversaciones para que aparezca en la lista
      await loadConversations();
      
      // Seleccionar la conversación
      setSelectedConversation(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-100 overflow-hidden">
      {/* Lista de usuarios */}
      <div className="w-64 border-r bg-white flex-shrink-0 overflow-y-auto h-full">
        <UsersList onSelectUser={handleSelectUser} />
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-shrink-0">
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          currentUserId={currentUserId}
        />
      </div>

      {/* Ventana de chat */}
      {selectedConversation ? (
        <ChatWindow
          conversation={selectedConversation}
          currentUserId={currentUserId}
          onMessagesUpdate={loadConversations}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <MessageCircle className="w-24 h-24 mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold mb-2">{t('chat.selectConversation')}</h3>
          <p className="text-sm">{t('chat.selectConversationDesc')}</p>
        </div>
      )}

      {/* Botón flotante para nuevo chat */}
      {/* TODO: Implementar modal de nuevo chat */}
      {/*
      <button
        onClick={() => setShowNewChatModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        title={t('chat.newChat')}
      >
        <Plus className="w-6 h-6" />
      </button>
      */}
    </div>
  );
};

export default Chat;
