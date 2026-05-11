import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';
import { OfflineBanner } from '../components/shared/OfflineBanner';

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to home if authenticated
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      <OfflineBanner />
      <Slot />
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ErrorBoundary>
        <ThemeProvider>
          <RootLayoutNav />
        </ThemeProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
