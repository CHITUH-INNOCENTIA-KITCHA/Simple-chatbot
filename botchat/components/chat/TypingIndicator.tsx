import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../shared/Avatar';
import { Bot } from '../../types';

interface TypingIndicatorProps {
  bot: Bot;
}

const Dot = ({ delay }: { delay: number }) => {
  const { theme } = useTheme();
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: theme.textSecondary },
        animatedStyle,
      ]}
    />
  );
};

export const TypingIndicator: React.FC<TypingIndicatorProps> = memo(({ bot }) => {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.container}
    >
      {/* Bot avatar */}
      <View style={styles.avatarContainer}>
        <Avatar
          size={28}
          initials={bot.avatarInitials}
          color={bot.avatarColor}
        />
      </View>

      {/* Typing bubble */}
      <View style={[styles.bubble, { backgroundColor: theme.bubbleBot }]}>
        <View style={styles.dotsContainer}>
          <Dot delay={0} />
          <Dot delay={150} />
          <Dot delay={300} />
        </View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  avatarContainer: {
    marginRight: 8,
    marginBottom: 4,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
});
