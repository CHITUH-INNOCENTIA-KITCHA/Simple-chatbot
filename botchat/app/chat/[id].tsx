import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { useChat } from '../../hooks/useChat';
import { useChatStore } from '../../store/chatStore';
import { MessageList } from '../../components/chat/MessageList';
import { ChatInput } from '../../components/chat/ChatInput';
import { Avatar } from '../../components/shared/Avatar';
import { EmptyState } from '../../components/shared/EmptyState';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { BOTS } from '../../constants/bots';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme, themeMode } = useTheme();
  const { conversations } = useChatStore();

  const [showMenu, setShowMenu] = useState(false);
  const [showBotInfo, setShowBotInfo] = useState(false);

  // Find the conversation and bot
  const conversation = conversations.find((c) => c.id === id);
  const bot = conversation?.bot || BOTS[0];

  const {
    messages,
    loading,
    isTyping,
    error,
    sendMessage,
    loadMoreMessages,
    hasMoreMessages,
    clearChat,
  } = useChat(id || '', bot);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleMenuPress = useCallback(() => {
    setShowMenu(true);
  }, []);

  const handleClearChat = useCallback(() => {
    Alert.alert(
      'Clear Chat',
      `Are you sure you want to delete all messages with ${bot.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            clearChat();
          },
        },
      ]
    );
    setShowMenu(false);
  }, [bot.name, clearChat]);

  const handleBotInfo = useCallback(() => {
    setShowMenu(false);
    setShowBotInfo(true);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.header}
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.header, borderBottomColor: theme.border },
        ]}
      >
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={[styles.backIcon, { color: theme.primary }]}>←</Text>
        </TouchableOpacity>

        {/* Bot info */}
        <TouchableOpacity style={styles.botInfoContainer} onPress={handleBotInfo}>
          <Avatar size={36} initials={bot.avatarInitials} color={bot.avatarColor} />
          <View style={styles.botTextContainer}>
            <Text style={[styles.botName, { color: theme.headerText }]}>{bot.name}</Text>
            {isTyping ? (
              <Animated.Text
                entering={FadeIn}
                exiting={FadeOut}
                style={[styles.botStatus, { color: theme.primary }]}
              >
                typing...
              </Animated.Text>
            ) : (
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: bot.isOnline ? theme.online : theme.offline },
                  ]}
                />
                <Text style={[styles.botStatus, { color: theme.textSecondary }]}>
                  {bot.isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Menu button */}
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
          <Text style={[styles.menuIcon, { color: theme.headerText }]}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner color={theme.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
          </View>
        ) : messages.length === 0 ? (
          <EmptyState
            icon="👋"
            title={`Say hello to ${bot.name}!`}
            subtitle="Start the conversation"
          />
        ) : (
          <MessageList
            messages={messages}
            bot={bot}
            isTyping={isTyping}
            loading={loading}
            onLoadMore={loadMoreMessages}
            hasMore={hasMoreMessages}
          />
        )}
      </View>

      {/* Chat Input */}
      <ChatInput onSend={sendMessage} disabled={loading} />

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}
          onPress={() => setShowMenu(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor: theme.surface }]}>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: theme.border }]}
              onPress={handleBotInfo}
            >
              <Text style={[styles.menuItemText, { color: theme.text }]}>Bot Info</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: theme.border }]}
              onPress={handleClearChat}
            >
              <Text style={[styles.menuItemText, { color: theme.error }]}>Clear Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowMenu(false)}
            >
              <Text style={[styles.menuItemText, { color: theme.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Bot Info Modal */}
      <Modal
        visible={showBotInfo}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBotInfo(false)}
      >
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}
          onPress={() => setShowBotInfo(false)}
        >
          <View style={[styles.botInfoModal, { backgroundColor: theme.surface }]}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.botInfoHeader}>
                <Avatar size={64} initials={bot.avatarInitials} color={bot.avatarColor} />
                <Text style={[styles.botInfoName, { color: theme.text }]}>{bot.name}</Text>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: bot.avatarColor + '20' },
                  ]}
                >
                  <Text style={[styles.categoryText, { color: bot.avatarColor }]}>
                    {bot.categoryLabel}
                  </Text>
                </View>
              </View>

              <ScrollView style={styles.botInfoContent}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Description
                </Text>
                <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
                  {bot.description}
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Personality
                </Text>
                <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
                  {bot.personality}
                </Text>
              </ScrollView>

              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.primary }]}
                onPress={() => setShowBotInfo(false)}
              >
                <Text style={[styles.closeButtonText, { color: theme.textInverse }]}>
                  Close
                </Text>
              </TouchableOpacity>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '300',
  },
  botInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  botTextContainer: {
    marginLeft: 12,
  },
  botName: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  botStatus: {
    fontSize: 12,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 16,
    textAlign: 'center',
  },
  botInfoModal: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 24,
    padding: 24,
  },
  botInfoHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  botInfoName: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  botInfoContent: {
    maxHeight: 300,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  closeButton: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
