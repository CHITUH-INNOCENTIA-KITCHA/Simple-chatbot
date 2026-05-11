import React, { memo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: ReactNode;
  onBackPress?: () => void;
}

export const Header: React.FC<HeaderProps> = memo(
  ({ title, showBack = false, rightElement, onBackPress }) => {
    const { theme, themeMode } = useTheme();
    const router = useRouter();

    const handleBack = () => {
      if (onBackPress) {
        onBackPress();
      } else {
        router.back();
      }
    };

    return (
      <>
        <StatusBar
          barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme.header}
        />
        <View
          style={[
            styles.container,
            { backgroundColor: theme.header, borderBottomColor: theme.border },
          ]}
        >
          {showBack ? (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={[styles.backIcon, { color: theme.primary }]}>←</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}

          <Text
            style={[styles.title, { color: theme.headerText }]}
            numberOfLines={1}
          >
            {title}
          </Text>

          {rightElement ? (
            <View style={styles.rightContainer}>{rightElement}</View>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
      </>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
    minWidth: 40,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '300',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  rightContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 40,
  },
});
