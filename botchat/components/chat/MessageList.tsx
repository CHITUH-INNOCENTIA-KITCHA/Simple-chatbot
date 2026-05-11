import React, { memo, useRef, useCallback, useMemo } from 'react';
import {
  FlatList,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MessageBubble } from './MessageBubble';
import { DateSeparator } from './DateSeparator';
import { TypingIndicator } from './TypingIndicator';
import { Message, Bot } from '../../types';
import { isSameDay } from 'date-fns';

interface MessageListProps {
  messages: Message[];
  bot: Bot;
  isTyping: boolean;
  loading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}

type ListItem =
  | { type: 'message'; message: Message; showAvatar: boolean }
  | { type: 'date'; date: Date };

export const MessageList: React.FC<MessageListProps> = memo(
  ({ messages, bot, isTyping, loading, onLoadMore, hasMore }) => {
    const { theme } = useTheme();
    const flatListRef = useRef<FlatList>(null);

    // Transform messages into list items with date separators
    const listItems = useMemo(() => {
      const items: ListItem[] = [];
      let lastDate: Date | null = null;

      messages.forEach((message, index) => {
        // Check if we need a date separator
        if (!lastDate || !isSameDay(lastDate, message.timestamp)) {
          items.push({ type: 'date', date: message.timestamp });
          lastDate = message.timestamp;
        }

        // Check if next message is from the same sender
        const nextMessage = messages[index + 1];
        const showAvatar =
          message.role === 'assistant' &&
          (!nextMessage ||
            nextMessage.role !== 'assistant' ||
            !isSameDay(message.timestamp, nextMessage.timestamp));

        items.push({ type: 'message', message, showAvatar });
      });

      return items;
    }, [messages]);

    const scrollToBottom = useCallback(() => {
      if (flatListRef.current && listItems.length > 0) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, [listItems.length]);

    // Scroll to bottom when new messages arrive
    React.useEffect(() => {
      if (messages.length > 0) {
        setTimeout(scrollToBottom, 100);
      }
    }, [messages.length]);

    const renderItem = useCallback(
      ({ item }: { item: ListItem }) => {
        if (item.type === 'date') {
          return <DateSeparator date={item.date} />;
        }
        return (
          <MessageBubble
            message={item.message}
            bot={bot}
            showAvatar={item.showAvatar}
          />
        );
      },
      [bot]
    );

    const keyExtractor = useCallback((item: ListItem, index: number) => {
      if (item.type === 'date') {
        return `date-${item.date.getTime()}-${index}`;
      }
      return item.message.id;
    }, []);

    const ListHeaderComponent = useCallback(() => {
      if (!hasMore || loading) return null;
      return (
        <View style={styles.loadMoreContainer}>
          <ActivityIndicator size="small" color={theme.primary} />
        </View>
      );
    }, [hasMore, loading, theme.primary]);

    const ListFooterComponent = useCallback(() => {
      if (!isTyping) return null;
      return <TypingIndicator bot={bot} />;
    }, [isTyping, bot]);

    return (
      <FlatList
        ref={flatListRef}
        data={listItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={15}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  loadMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
