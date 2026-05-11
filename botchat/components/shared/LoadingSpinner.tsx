import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'small' | 'large';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  size = 'large',
  color,
}) => {
  const { theme } = useTheme();
  const spinnerColor = color || theme.primary;

  if (fullScreen) {
    return (
      <View style={[styles.fullScreenContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size={size} color={spinnerColor} />
      </View>
    );
  }

  return <ActivityIndicator size={size} color={spinnerColor} />;
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
