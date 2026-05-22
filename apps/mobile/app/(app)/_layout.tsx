import { Tabs } from 'expo-router';

import { useAuth } from '@/state/auth-provider';
import { Redirect } from 'expo-router';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#0e2356', headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="sos" options={{ title: 'SOS' }} />
      <Tabs.Screen name="incidents" options={{ title: 'My incidents' }} />
      <Tabs.Screen name="responder" options={{ title: 'On duty' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
