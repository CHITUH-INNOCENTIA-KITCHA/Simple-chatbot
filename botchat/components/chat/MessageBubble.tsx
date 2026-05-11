import React, { memo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeIn, SlideInLeft, SlideInRight } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../shared/Avatar';
import { StatusIcon } from '../shared/StatusIcon';
import { Message, Bot } from '../../types';
import { format } from 'date-fns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_BUBBLE_WIDTH = SCREEN_WIDTH * 0.75;

interface MessageBubbleProps {
  message: Message;
  bot?: Bot;
  showAvatar?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = memo(
  ({ message, bot, showAvatar = true }) => {
    const { theme } = useTheme();
    const isUser = message.role === 'user';

    const timestamp = format(message.timestamp, 'HH:mm');

    const entering = isUser
      ? FadeIn.duration(250).springify()
      : FadeIn.duration(250).springify();

    return (
      <Animated.View
        entering={entering}
        style={[
          styles.container,
          isUser ? styles.containerRight : styles.containerLeft,
        ]}
      >
        {/* Bot avatar (left side only) */}
        {!isUser && showAvatar && bot && (
          <View style={styles.avatarContainer}>
            <Avatar
              size={28}
              initials={bot.avatarInitials}
              color={bot.avatarColor}
            />
          </View>
        )}

        <View style={styles.bubbleWrapper}>
          {/* Message bubble */}
          <View
            style={[
              styles.bubble,
              isUser
                ? [styles.bubbleUser, { backgroundColor: theme.bubbleUser }]
                : [styles.bubbleBot, { backgroundColor: theme.bubbleBot }],
            ]}
          >
            <Text
              style={[
                styles.messageText,
                {
                  color: isUser ? theme.bubbleUserText : theme.bubbleBotText,
                },
              ]}
            >
              {message.content}
            </Text>
          </View>

          {/* Timestamp and status */}
          <View
            style={[
              styles.metaRow,
              isUser ? styles.metaRight : styles.metaLeft,
            ]}
          >
            <Text style={[styles.timestamp, { color: theme.textSecondary }]}>
              {timestamp}
            </Text>
            {isUser && <StatusIcon status={message.status} />}
          </View>
        </View>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  containerLeft: {
    justifyContent: 'flex-start',
  },
  containerRight: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 18,
  },
  bubbleWrapper: {
    maxWidth: MAX_BUBBLE_WIDTH,
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleUser: {
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  metaLeft: {
    justifyContent: 'flex-start',
  },
  metaRight: {
    justifyContent: 'flex-end',
  },
  timestamp: {
    fontSize: 11,
  },
});
