import React, { useState, useCallback, memo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = memo(({ onSend, disabled }) => {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const sendScale = useSharedValue(1);

  const canSend = text.trim().length > 0 && !disabled;

  const handleSend = useCallback(() => {
    if (!canSend) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendScale.value = withSpring(0.9, {}, () => {
      sendScale.value = withSpring(1);
    });

    onSend(text.trim());
    setText('');
  }, [text, canSend, onSend]);

  const sendButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
  }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
          },
        ]}
      >
        {/* Attachment button */}
        <TouchableOpacity style={styles.attachButton} disabled>
          <View style={styles.iconContainer}>
            <Animated.Text style={styles.attachIcon}>📎</Animated.Text>
          </View>
        </TouchableOpacity>

        {/* Text input */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBackground,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder="Message..."
          placeholderTextColor={theme.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={4000}
          editable={!disabled}
        />

        {/* Send button */}
        <Animated.View style={sendButtonStyle}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: canSend ? theme.primary : 'transparent',
              },
            ]}
            onPress={handleSend}
            disabled={!canSend}
          >
            <Animated.Text
              style={[
                styles.sendIcon,
                { color: canSend ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              ➤
            </Animated.Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  attachButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 120,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    borderWidth: 1,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendIcon: {
    fontSize: 18,
    marginLeft: 2,
  },
});
