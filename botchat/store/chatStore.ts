import { create } from 'zustand';
import { Conversation } from '../types';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  updateLastMessage: (conversationId: string, message: string, time: Date) => void;
  incrementUnread: (conversationId: string) => void;
  clearUnread: (conversationId: string) => void;
  removeConversation: (conversationId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  updateLastMessage: (conversationId, message, time) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, lastMessage: message, lastMessageTime: time }
          : conv
      ),
    })),

  incrementUnread: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, unreadCount: conv.unreadCount + 1 }
          : conv
      ),
    })),

  clearUnread: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      ),
    })),

  removeConversation: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.filter((conv) => conv.id !== conversationId),
    })),
}));
