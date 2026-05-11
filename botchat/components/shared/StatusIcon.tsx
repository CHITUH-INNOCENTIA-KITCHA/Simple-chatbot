import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MessageStatus } from '../../types';

interface StatusIconProps {
  status: MessageStatus;
}

export const StatusIcon: React.FC<StatusIconProps> = memo(({ status }) => {
  const getStatusDisplay = () => {
    switch (status) {
      case 'sending':
        return { icon: '🕐', color: '#8E8E93' };
      case 'sent':
        return { icon: '✓', color: '#8E8E93' };
      case 'delivered':
        return { icon: '✓✓', color: '#8E8E93' };
      case 'read':
        return { icon: '✓✓', color: '#0084FF' };
      case 'error':
        return { icon: '⚠️', color: '#FF3B30' };
      default:
        return { icon: '', color: '#8E8E93' };
    }
  };

  const { icon, color } = getStatusDisplay();

  return (
    <Text style={[styles.icon, { color }]}>{icon}</Text>
  );
});

const styles = StyleSheet.create({
  icon: {
    fontSize: 12,
    marginLeft: 4,
  },
});
