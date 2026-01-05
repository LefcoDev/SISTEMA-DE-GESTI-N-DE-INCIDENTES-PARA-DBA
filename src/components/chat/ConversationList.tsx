import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChatBubbleLeftRightIcon as MessageCircle, UsersIcon as Users, GlobeAltIcon as Globe } from '@heroicons/react/24/outline';
import type { Conversation } from '../../types/chat';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  currentUserId: number;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  currentUserId
}) => {
  const { t } = useTranslation();

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.name || t('chat.groupChat');
    }
    
    if (conversation.type === 'global') {
      return t('chat.globalChat');
    }

    // Direct chat
    const otherParticipant = conversation.allParticipants?.find(
      p => p.user_id !== currentUserId
    );
    return otherParticipant?.user?.full_name || t('chat.directChat');
  };

  const getLastMessage = (conversation: Conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return t('chat.noMessages');
    }
    
    const lastMessage = conversation.messages[0];
    return lastMessage.content.substring(0, 50) + 
      (lastMessage.content.length > 50 ? '...' : '');
  };

  const formatTime = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return t('chat.yesterday');
    }

    return messageDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getConversationIcon = (type: string) => {
    switch (type) {
      case 'group':
        return <Users className="w-5 h-5" />;
      case 'global':
        return <Globe className="w-5 h-5" />;
      default:
        return <MessageCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-80 border-r bg-white flex-shrink-0 flex flex-col h-full">
      <div className="p-4 border-b flex-shrink-0">
        <h2 className="text-xl font-bold">{t('chat.title')}</h2>
      </div>

      <div className="divide-y overflow-y-auto flex-1">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {t('chat.noConversations')}
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                selectedConversation?.id === conversation.id
                  ? 'bg-blue-50 border-l-4 border-blue-600'
                  : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 text-gray-600">
                  {getConversationIcon(conversation.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold truncate">
                      {getConversationTitle(conversation)}
                    </h3>
                    {conversation.messages && conversation.messages.length > 0 && (
                      <span className="text-xs text-gray-500 ml-2">
                        {formatTime(conversation.messages[0].created_at)}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate">
                    {getLastMessage(conversation)}
                  </p>
                  
                  {conversation.type === 'group' && (
                    <p className="text-xs text-gray-500 mt-1">
                      {conversation.allParticipants?.length || 0} {t('chat.participants')}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
