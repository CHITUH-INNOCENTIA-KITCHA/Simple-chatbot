import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useChatStore } from '../../store/chatStore';
import { Avatar } from '../shared/Avatar';
import { Conversation } from '../../types';
import { formatMessageTime } from '../../utils/formatTime';

interface ConversationItemProps {
  conversation: Conversation;
  onDelete: (id: string) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = memo(
  ({ conversation, onDelete }) => {
    const { theme } = useTheme();
    const router = useRouter();
    const { clearUnread } = useChatStore();

    const handlePress = useCallback(() => {
      clearUnread(conversation.id);
      router.push(`/chat/${conversation.id}`);
    }, [conversation.id, clearUnread, router]);

    const handleLongPress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert(
        'Delete Conversation',
        `Are you sure you want to delete your conversation with ${conversation.bot.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => onDelete(conversation.id),
          },
        ]
      );
    }, [conversation, onDelete]);

    return (
      <TouchableOpacity
        style={[styles.container, { backgroundColor: theme.background }]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
      >
        {/* Avatar with online indicator */}
        <View style={styles.avatarContainer}>
          <Avatar
            size={48}
            initials={conversation.bot.avatarInitials}
            color={conversation.bot.avatarColor}
          />
          <View
            style={[
              styles.onlineIndicator,
              {
                backgroundColor: conversation.bot.isOnline
                  ? theme.online
                  : theme.offline,
                borderColor: theme.background,
              },
            ]}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text
              style={[styles.botName, { color: theme.text }]}
              numberOfLines={1}
            >
              {conversation.bot.name}
            </Text>
            <Text style={[styles.timestamp, { color: theme.textSecondary }]}>
              {formatMessageTime(conversation.lastMessageTime)}
            </Text>
          </View>
          <View style={styles.bottomRow}>
            <Text
              style={[styles.lastMessage, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {conversation.lastMessage || 'Start a conversation'}
            </Text>
            {conversation.unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: theme.unreadBadge }]}>
                <Text style={styles.unreadCount}>
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Separator */}
        <View
          style={[
            styles.separator,
            { backgroundColor: theme.border },
          ]}
        />
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  botName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    position: 'absolute',
    bottom: 0,
    left: 76, // Align with text, not avatar
    right: 0,
    height: 1,
  },
});
