import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../shared/Avatar';
import { Bot, BotCategory } from '../../types';
import { BOTS } from '../../constants/bots';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BotPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectBot: (bot: Bot) => void;
}

const getCategoryColor = (category: BotCategory): string => {
  switch (category) {
    case 'assistant':
      return '#0084FF';
    case 'expert':
      return '#FF6B35';
    case 'companion':
      return '#9B59B6';
    case 'fun':
      return '#E74C3C';
    default:
      return '#8E8E93';
  }
};

export const BotPickerModal: React.FC<BotPickerModalProps> = memo(
  ({ visible, onClose, onSelectBot }) => {
    const { theme } = useTheme();
    const translateY = useSharedValue(SCREEN_HEIGHT);

    React.useEffect(() => {
      if (visible) {
        translateY.value = withSpring(0, {
          damping: 25,
          stiffness: 200,
        });
      } else {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 });
      }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const handleSelectBot = (bot: Bot) => {
      onSelectBot(bot);
      onClose();
    };

    if (!visible) return null;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        <Pressable style={[styles.overlay, { backgroundColor: theme.overlay }]} onPress={onClose}>
          <Animated.View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.surface },
              animatedStyle,
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              {/* Handle bar */}
              <View style={styles.handleContainer}>
                <View style={[styles.handle, { backgroundColor: theme.border }]} />
              </View>

              {/* Title */}
              <Text style={[styles.title, { color: theme.text }]}>Choose a Bot</Text>

              {/* Bot list */}
              <ScrollView style={styles.botList} showsVerticalScrollIndicator={false}>
                {BOTS.map((bot) => (
                  <TouchableOpacity
                    key={bot.id}
                    style={[styles.botItem, { borderBottomColor: theme.border }]}
                    onPress={() => handleSelectBot(bot)}
                    activeOpacity={0.7}
                  >
                    {/* Avatar */}
                    <Avatar
                      size={48}
                      initials={bot.avatarInitials}
                      color={bot.avatarColor}
                    />

                    {/* Info */}
                    <View style={styles.botInfo}>
                      <View style={styles.botNameRow}>
                        <Text style={[styles.botName, { color: theme.text }]}>
                          {bot.name}
                        </Text>
                        <View
                          style={[
                            styles.categoryBadge,
                            { backgroundColor: getCategoryColor(bot.category) + '20' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.categoryText,
                              { color: getCategoryColor(bot.category) },
                            ]}
                          >
                            {bot.categoryLabel}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[styles.botDescription, { color: theme.textSecondary }]}
                        numberOfLines={1}
                      >
                        {bot.description}
                      </Text>
                    </View>

                    {/* Online indicator and chevron */}
                    <View style={styles.rightSection}>
                      <View
                        style={[
                          styles.onlineDot,
                          {
                            backgroundColor: bot.isOnline ? theme.online : theme.offline,
                          },
                        ]}
                      />
                      <Text style={[styles.chevron, { color: theme.textSecondary }]}>›</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: SCREEN_HEIGHT * 0.7,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  botList: {
    paddingHorizontal: 16,
  },
  botItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  botInfo: {
    flex: 1,
    marginLeft: 12,
  },
  botNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  botName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  botDescription: {
    fontSize: 14,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
});
