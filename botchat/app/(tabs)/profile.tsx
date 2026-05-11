import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  TextInput,
  Modal,
  Pressable,
  StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { signOut } from 'firebase/auth';
import { auth, updateUserDocument, isFirebaseConfigured } from '../../services/firebase';
import { uploadAvatar } from '../../services/supabase';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { Avatar } from '../../components/shared/Avatar';

export default function ProfileScreen() {
  const { theme, themeMode, toggleTheme } = useTheme();
  const { user, setUser } = useAuthStore();
  const { setConversations } = useChatStore();

  const [notifications, setNotifications] = useState(true);
  const [messageSound, setMessageSound] = useState(true);
  const [showEditName, setShowEditName] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [uploading, setUploading] = useState(false);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handlePickImage = useCallback(async () => {
    if (!user || !isFirebaseConfigured()) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);

        // Upload to Supabase
        const publicUrl = await uploadAvatar(result.assets[0].uri, user.uid);

        // Update Firestore
        await updateUserDocument(user.uid, { avatarUrl: publicUrl });

        // Update local state
        setUser({ ...user, avatarUrl: publicUrl });

        setUploading(false);
        Alert.alert('Success', 'Profile picture updated!');
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      setUploading(false);
      Alert.alert('Error', 'Failed to update profile picture');
    }
  }, [user, setUser]);

  const handleSaveName = useCallback(async () => {
    if (!user || !newName.trim() || !isFirebaseConfigured()) {
      setShowEditName(false);
      return;
    }

    try {
      await updateUserDocument(user.uid, { displayName: newName.trim() });
      setUser({ ...user, displayName: newName.trim() });
      setShowEditName(false);
      Alert.alert('Success', 'Name updated!');
    } catch (error) {
      console.error('Error updating name:', error);
      Alert.alert('Error', 'Failed to update name');
    }
  }, [user, newName, setUser]);

  const handleClearAllConversations = useCallback(() => {
    Alert.alert(
      'Clear All Conversations',
      'Are you sure you want to delete all your conversations? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // Clear local state
            setConversations([]);
            Alert.alert('Done', 'All conversations cleared');
          },
        },
      ]
    );
  }, [setConversations]);

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          try {
            if (auth) {
              await signOut(auth);
            }
          } catch (error) {
            console.error('Error signing out:', error);
          }
        },
      },
    ]);
  }, []);

  const handleExportHistory = useCallback(() => {
    Alert.alert('Coming Soon', 'Export chat history will be available in a future update.');
  }, []);

  const SettingRow: React.FC<{
    icon: string;
    label: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    onPress?: () => void;
    rightText?: string;
    destructive?: boolean;
  }> = ({ icon, label, value, onValueChange, onPress, rightText, destructive }) => (
    <TouchableOpacity
      style={[styles.settingRow, { borderBottomColor: theme.border }]}
      onPress={onPress}
      disabled={!onPress && !onValueChange}
    >
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text
        style={[
          styles.settingLabel,
          { color: destructive ? theme.error : theme.text },
        ]}
      >
        {label}
      </Text>
      {onValueChange !== undefined && value !== undefined ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor={theme.textInverse}
        />
      ) : rightText ? (
        <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
          {rightText}
        </Text>
      ) : onPress ? (
        <Text style={[styles.chevron, { color: theme.textSecondary }]}>›</Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.header}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handlePickImage}
            disabled={uploading}
          >
            <Avatar
              size={80}
              imageUrl={user?.avatarUrl}
              initials={getInitials(user?.displayName || 'U')}
              color={theme.primary}
            />
            <View style={[styles.cameraIcon, { backgroundColor: theme.primary }]}>
              <Text style={styles.cameraText}>📷</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowEditName(true)}>
            <Text style={[styles.displayName, { color: theme.text }]}>
              {user?.displayName || 'User'}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.email, { color: theme.textSecondary }]}>
            {user?.email || 'No email'}
          </Text>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            SETTINGS
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.surface }]}>
            <SettingRow
              icon="🌙"
              label="Dark Mode"
              value={themeMode === 'dark'}
              onValueChange={toggleTheme}
            />
            <SettingRow
              icon="🔔"
              label="Notifications"
              value={notifications}
              onValueChange={setNotifications}
            />
            <SettingRow
              icon="💬"
              label="Message Sound"
              value={messageSound}
              onValueChange={setMessageSound}
            />
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>DATA</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.surface }]}>
            <SettingRow
              icon="🗑️"
              label="Clear All Conversations"
              onPress={handleClearAllConversations}
              destructive
            />
            <SettingRow
              icon="📤"
              label="Export Chat History"
              onPress={handleExportHistory}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ABOUT</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.surface }]}>
            <SettingRow icon="ℹ️" label="App Version" rightText="1.0.0" />
            <SettingRow
              icon="🔒"
              label="Privacy Policy"
              onPress={() => Alert.alert('Privacy Policy', 'Coming soon')}
            />
            <SettingRow
              icon="⭐"
              label="Rate BotChat"
              onPress={() => Alert.alert('Rate App', 'Coming soon')}
            />
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.signOutButton, { borderColor: theme.error }]}
          onPress={handleSignOut}
        >
          <Text style={[styles.signOutText, { color: theme.error }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal
        visible={showEditName}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditName(false)}
      >
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}
          onPress={() => setShowEditName(false)}
        >
          <View style={[styles.editNameModal, { backgroundColor: theme.surface }]}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Edit Display Name
              </Text>
              <TextInput
                style={[
                  styles.nameInput,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={newName}
                onChangeText={setNewName}
                placeholder="Enter your name"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="words"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { borderColor: theme.border }]}
                  onPress={() => setShowEditName(false)}
                >
                  <Text style={[styles.modalButtonText, { color: theme.textSecondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.primary }]}
                  onPress={handleSaveName}
                >
                  <Text style={[styles.modalButtonText, { color: theme.textInverse }]}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
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
  scrollContent: {
    paddingBottom: 32,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    fontSize: 14,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
  },
  chevron: {
    fontSize: 20,
    fontWeight: '300',
  },
  signOutButton: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editNameModal: {
    width: '80%',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  nameInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
