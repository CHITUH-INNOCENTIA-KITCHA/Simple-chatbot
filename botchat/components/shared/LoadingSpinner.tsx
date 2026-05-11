import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Default colors (same as light theme primary)
const DEFAULT_COLOR = '#0084FF';
const DEFAULT_BACKGROUND = '#FFFFFF';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'small' | 'large';
  color?: string;
  backgroundColor?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  size = 'large',
  color = DEFAULT_COLOR,
  backgroundColor = DEFAULT_BACKGROUND,
}) => {
  if (fullScreen) {
    return (
      <View style={[styles.fullScreenContainer, { backgroundColor }]}>
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }

  return <ActivityIndicator size={size} color={color} />;
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
