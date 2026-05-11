import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatDateSeparator } from '../../utils/formatTime';

interface DateSeparatorProps {
  date: Date;
}

export const DateSeparator: React.FC<DateSeparatorProps> = memo(({ date }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: theme.border }]} />
      <View style={[styles.labelContainer, { backgroundColor: theme.surfaceSecondary }]}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {formatDateSeparator(date)}
        </Text>
      </View>
      <View style={[styles.line, { backgroundColor: theme.border }]} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  line: {
    flex: 1,
    height: 1,
  },
  labelContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});
