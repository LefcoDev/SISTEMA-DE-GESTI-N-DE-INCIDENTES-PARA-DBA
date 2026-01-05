export interface Conversation {
  id: number;
  name: string | null;
  type: 'direct' | 'group' | 'global';
  created_by: number;
  created_at: string;
  updated_at: string;
  participants?: ConversationParticipant[];
  allParticipants?: ConversationParticipant[];
  messages?: Message[];
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  sender?: {
    id: number;
    full_name: string;
    email: string;
  };
}

export interface ConversationParticipant {
  id: number;
  conversation_id: number;
  user_id: number;
  last_read_at: string | null;
  joined_at: string;
  user?: {
    id: number;
    full_name: string;
    email: string;
  };
}

export interface CreateDirectConversationDto {
  otherUserId: number;
}

export interface CreateGroupConversationDto {
  name: string;
  participantIds: number[];
}

export interface SendMessageDto {
  content: string;
}
