import React, { memo } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ConversationItem } from './ConversationItem';
import { Conversation } from '../../types';

interface ConversationListProps {
  conversations: Conversation[];
  onDelete: (id: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = memo(
  ({ conversations, onDelete, onRefresh, refreshing }) => {
    const { theme } = useTheme();

    const renderItem = ({ item }: { item: Conversation }) => (
      <ConversationItem conversation={item} onDelete={onDelete} />
    );

    const keyExtractor = (item: Conversation) => item.id;

    return (
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={15}
        ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
      />
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
