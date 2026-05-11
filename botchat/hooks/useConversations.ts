import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { db, isFirebaseConfigured } from '../services/firebase';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { Conversation, Bot } from '../types';
import { generateId } from '../utils/generateId';

export const useConversations = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { conversations, setConversations, removeConversation } = useChatStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user || !isFirebaseConfigured() || !db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('userId', '==', user.uid),
        orderBy('lastMessageTime', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const convs: Conversation[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              userId: data.userId,
              botId: data.botId,
              bot: data.bot,
              lastMessage: data.lastMessage,
              lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
              unreadCount: data.unreadCount || 0,
              createdAt: data.createdAt?.toDate() || new Date(),
            };
          });
          setConversations(convs);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching conversations:', err);
          setError('Failed to load conversations');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up conversations listener:', err);
      setError('Failed to load conversations');
      setLoading(false);
    }
  }, [user]);

  const startConversation = useCallback(async (bot: Bot) => {
    if (!user || !isFirebaseConfigured() || !db) {
      console.warn('Cannot start conversation: Firebase not configured');
      return;
    }

    try {
      // Check if conversation with this bot already exists
      const existingConv = conversations.find(
        (conv) => conv.botId === bot.id
      );

      if (existingConv) {
        // Navigate to existing conversation
        router.push(`/chat/${existingConv.id}`);
        return;
      }

      // Create new conversation
      const conversationsRef = collection(db, 'conversations');
      const newConv = {
        userId: user.uid,
        botId: bot.id,
        bot: bot,
        lastMessage: '',
        lastMessageTime: Timestamp.now(),
        unreadCount: 0,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(conversationsRef, newConv);

      // Navigate to the new conversation
      router.push(`/chat/${docRef.id}`);
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError('Failed to start conversation');
    }
  }, [user, conversations, router]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!isFirebaseConfigured() || !db) {
      console.warn('Cannot delete conversation: Firebase not configured');
      return;
    }

    try {
      // Delete all messages in the conversation
      const messagesRef = collection(db, 'messages', conversationId, 'msgs');
      const messagesSnapshot = await getDocs(messagesRef);

      const deletePromises = messagesSnapshot.docs.map((msgDoc) =>
        deleteDoc(doc(db, 'messages', conversationId, 'msgs', msgDoc.id))
      );
      await Promise.all(deletePromises);

      // Delete the conversation document
      await deleteDoc(doc(db, 'conversations', conversationId));

      // Update local state
      removeConversation(conversationId);
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError('Failed to delete conversation');
    }
  }, [removeConversation]);

  const refreshConversations = useCallback(() => {
    // The real-time listener handles refreshes automatically
    // This is mainly for pull-to-refresh UI feedback
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  }, []);

  return {
    conversations,
    loading,
    error,
    startConversation,
    deleteConversation,
    refreshConversations,
  };
};
