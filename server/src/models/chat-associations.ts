// Configuración de asociaciones entre modelos del chat
import Conversation from './Conversation';
import Message from './Message';
import ConversationParticipant from './ConversationParticipant';
import User from './User';

// Conversation -> Messages
Conversation.hasMany(Message, {
  foreignKey: 'conversation_id',
  as: 'messages'
});
Message.belongsTo(Conversation, {
  foreignKey: 'conversation_id',
  as: 'conversation'
});

// Conversation -> Participants
Conversation.hasMany(ConversationParticipant, {
  foreignKey: 'conversation_id',
  as: 'participants'
});
Conversation.hasMany(ConversationParticipant, {
  foreignKey: 'conversation_id',
  as: 'allParticipants'
});
ConversationParticipant.belongsTo(Conversation, {
  foreignKey: 'conversation_id',
  as: 'conversation'
});

// Message -> User (sender)
Message.belongsTo(User, {
  foreignKey: 'sender_id',
  as: 'sender'
});
User.hasMany(Message, {
  foreignKey: 'sender_id',
  as: 'sentMessages'
});

// ConversationParticipant -> User
ConversationParticipant.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});
User.hasMany(ConversationParticipant, {
  foreignKey: 'user_id',
  as: 'conversations'
});

// Conversation -> User (creator)
Conversation.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});
User.hasMany(Conversation, {
  foreignKey: 'created_by',
  as: 'createdConversations'
});

export {
  Conversation,
  Message,
  ConversationParticipant
};
