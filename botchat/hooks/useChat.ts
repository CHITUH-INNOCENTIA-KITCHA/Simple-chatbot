import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  getDocs,
  startAfter,
  deleteDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../services/firebase';
import { sendMessageToBot } from '../services/anthropic';
import { Message, Bot, AnthropicMessage } from '../types';
import { generateId } from '../utils/generateId';

const MESSAGES_PER_PAGE = 20;

export const useChat = (conversationId: string, bot: Bot) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const lastDocRef = useRef<any>(null);

  useEffect(() => {
    if (!conversationId || !isFirebaseConfigured() || !db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const messagesRef = collection(db, 'messages', conversationId, 'msgs');
      const q = query(
        messagesRef,
        orderBy('timestamp', 'desc'),
        limit(MESSAGES_PER_PAGE)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const msgs: Message[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              conversationId: data.conversationId,
              content: data.content,
              role: data.role,
              timestamp: data.timestamp?.toDate() || new Date(),
              status: data.status,
              mediaUrl: data.mediaUrl || null,
            };
          });

          // Store last doc for pagination
          if (snapshot.docs.length > 0) {
            lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
          }

          // Sort ascending for display (newest at bottom)
          setMessages(msgs.reverse());
          setHasMoreMessages(snapshot.docs.length >= MESSAGES_PER_PAGE);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching messages:', err);
          setError('Failed to load messages');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up messages listener:', err);
      setError('Failed to load messages');
      setLoading(false);
    }
  }, [conversationId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !conversationId || !isFirebaseConfigured() || !db) {
        return;
      }

      const messageId = generateId();
      const timestamp = new Date();

      // Create user message
      const userMessage: Message = {
        id: messageId,
        conversationId,
        content: content.trim(),
        role: 'user',
        timestamp,
        status: 'sending',
      };

      // Optimistic update
      setMessages((prev) => [...prev, userMessage]);

      try {
        // Save user message to Firestore
        const messagesRef = collection(db, 'messages', conversationId, 'msgs');
        await addDoc(messagesRef, {
          ...userMessage,
          timestamp: Timestamp.fromDate(timestamp),
        });

        // Update user message status to sent
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, status: 'sent' } : msg
          )
        );

        // Update conversation with last message
        const convRef = doc(db, 'conversations', conversationId);
        await updateDoc(convRef, {
          lastMessage: content.trim(),
          lastMessageTime: Timestamp.fromDate(timestamp),
        });

        // Show typing indicator
        setIsTyping(true);

        // Calculate realistic typing delay
        const delay = Math.min(500 + content.length * 10, 3000);
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Build messages array for Anthropic
        const anthropicMessages: AnthropicMessage[] = [
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: content.trim() },
        ];

        // Get bot response
        const botResponse = await sendMessageToBot(
          anthropicMessages,
          bot.personality
        );

        // Create bot message
        const botMessageId = generateId();
        const botTimestamp = new Date();
        const botMessage: Message = {
          id: botMessageId,
          conversationId,
          content: botResponse,
          role: 'assistant',
          timestamp: botTimestamp,
          status: 'delivered',
        };

        // Save bot message to Firestore
        await addDoc(messagesRef, {
          ...botMessage,
          timestamp: Timestamp.fromDate(botTimestamp),
        });

        // Update user message status to read
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, status: 'read' } : msg
          )
        );

        // Update conversation with bot's reply
        await updateDoc(convRef, {
          lastMessage: botResponse.slice(0, 50) + (botResponse.length > 50 ? '...' : ''),
          lastMessageTime: Timestamp.fromDate(botTimestamp),
        });

        setIsTyping(false);
      } catch (err) {
        console.error('Error sending message:', err);
        setIsTyping(false);

        // Update message status to error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, status: 'error' } : msg
          )
        );

        // Add error message from bot
        const errorMessage: Message = {
          id: generateId(),
          conversationId,
          content: "I'm having trouble responding right now. Please try again.",
          role: 'assistant',
          timestamp: new Date(),
          status: 'delivered',
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    },
    [conversationId, bot, messages]
  );

  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || loading || !lastDocRef.current || !isFirebaseConfigured() || !db) {
      return;
    }

    try {
      const messagesRef = collection(db, 'messages', conversationId, 'msgs');
      const q = query(
        messagesRef,
        orderBy('timestamp', 'desc'),
        startAfter(lastDocRef.current),
        limit(MESSAGES_PER_PAGE)
      );

      const snapshot = await getDocs(q);

      if (snapshot.docs.length > 0) {
        lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];

        const olderMessages: Message[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            conversationId: data.conversationId,
            content: data.content,
            role: data.role,
            timestamp: data.timestamp?.toDate() || new Date(),
            status: data.status,
            mediaUrl: data.mediaUrl || null,
          };
        });

        // Add older messages at the beginning
        setMessages((prev) => [...olderMessages.reverse(), ...prev]);
      }

      setHasMoreMessages(snapshot.docs.length >= MESSAGES_PER_PAGE);
    } catch (err) {
      console.error('Error loading more messages:', err);
    }
  }, [conversationId, hasMoreMessages, loading]);

  const clearChat = useCallback(async () => {
    if (!conversationId || !isFirebaseConfigured() || !db) {
      return;
    }

    try {
      const messagesRef = collection(db, 'messages', conversationId, 'msgs');
      const snapshot = await getDocs(messagesRef);

      const deletePromises = snapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, 'messages', conversationId, 'msgs', docSnap.id))
      );
      await Promise.all(deletePromises);

      // Update conversation
      const convRef = doc(db, 'conversations', conversationId);
      await updateDoc(convRef, {
        lastMessage: '',
        lastMessageTime: Timestamp.now(),
      });

      setMessages([]);
    } catch (err) {
      console.error('Error clearing chat:', err);
      setError('Failed to clear chat');
    }
  }, [conversationId]);

  return {
    messages,
    loading,
    isTyping,
    error,
    sendMessage,
    loadMoreMessages,
    hasMoreMessages,
    clearChat,
  };
};
