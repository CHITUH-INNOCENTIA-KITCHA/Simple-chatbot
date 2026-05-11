export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error';
export type BotCategory = 'assistant' | 'companion' | 'expert' | 'fun';
export type ThemeMode = 'light' | 'dark';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: Date;
}

export interface Bot {
  id: string;
  name: string;
  description: string;
  avatarColor: string;
  avatarInitials: string;
  personality: string;
  category: BotCategory;
  isOnline: boolean;
  categoryLabel: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  status: MessageStatus;
  mediaUrl?: string | null;
}

export interface Conversation {
  id: string;
  userId: string;
  botId: string;
  bot: Bot;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  createdAt: Date;
}

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  primary: string;
  primaryDark: string;
  text: string;
  textSecondary: string;
  textInverse: string;
  bubbleUser: string;
  bubbleUserText: string;
  bubbleBot: string;
  bubbleBotText: string;
  border: string;
  online: string;
  offline: string;
  unreadBadge: string;
  inputBackground: string;
  header: string;
  headerText: string;
  error: string;
  success: string;
  warning: string;
  overlay: string;
}
