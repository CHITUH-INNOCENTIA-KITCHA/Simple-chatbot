import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useConversations } from '../../hooks/useConversations';
import { ConversationList } from '../../components/conversations/ConversationList';
import { BotPickerModal } from '../../components/conversations/BotPickerModal';
import { EmptyState } from '../../components/shared/EmptyState';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { Bot } from '../../types';

export default function HomeScreen() {
  const { theme, themeMode } = useTheme();
  const {
    conversations,
    loading,
    error,
    startConversation,
    deleteConversation,
    refreshConversations,
  } = useConversations();

  const [showBotPicker, setShowBotPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fabScale = useSharedValue(1);
  const searchHeight = useSharedValue(0);

  const filteredConversations = searchQuery
    ? conversations.filter((conv) =>
        conv.bot.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    refreshConversations();
    setTimeout(() => setRefreshing(false), 500);
  }, [refreshConversations]);

  const handleFabPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fabScale.value = withSpring(0.9, {}, () => {
      fabScale.value = withSpring(1);
    });
    setShowBotPicker(true);
  }, []);

  const handleSelectBot = useCallback(
    (bot: Bot) => {
      startConversation(bot);
    },
    [startConversation]
  );

  const toggleSearch = useCallback(() => {
    if (showSearch) {
      searchHeight.value = withTiming(0, { duration: 200 });
      setSearchQuery('');
    } else {
      searchHeight.value = withSpring(50);
    }
    setShowSearch(!showSearch);
  }, [showSearch]);

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const searchAnimatedStyle = useAnimatedStyle(() => ({
    height: searchHeight.value,
    opacity: searchHeight.value > 0 ? 1 : 0,
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.header}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.header, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.headerText }]}>BotChat</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={toggleSearch}>
            <Text style={{ fontSize: 20 }}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowBotPicker(true)}>
            <Text style={{ fontSize: 20 }}>✏️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <Animated.View style={[styles.searchContainer, searchAnimatedStyle]}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.inputBackground,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder="Search conversations..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner color={theme.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
              onPress={handleRefresh}
            >
              <Text style={[styles.retryButtonText, { color: theme.textInverse }]}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : filteredConversations.length === 0 ? (
          <EmptyState
            icon="💬"
            title={searchQuery ? 'No results found' : 'No conversations yet'}
            subtitle={
              searchQuery
                ? 'Try a different search term'
                : 'Start by picking a bot to chat with'
            }
            actionLabel={searchQuery ? undefined : 'Browse Bots'}
            onAction={searchQuery ? undefined : () => setShowBotPicker(true)}
          />
        ) : (
          <ConversationList
            conversations={filteredConversations}
            onDelete={deleteConversation}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        )}
      </View>

      {/* Floating Action Button */}
      <Animated.View style={[styles.fabContainer, fabAnimatedStyle]}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={handleFabPress}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Bot Picker Modal */}
      <BotPickerModal
        visible={showBotPicker}
        onClose={() => setShowBotPicker(false)}
        onSelectBot={handleSelectBot}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  searchInput: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
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
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },
});
