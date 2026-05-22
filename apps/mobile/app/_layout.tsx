import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import '../global.css';
import { AuthProvider } from '@/state/auth-provider';
import { OfflineQueueProvider } from '@/state/offline-queue';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <OfflineQueueProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }} />
        </OfflineQueueProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
