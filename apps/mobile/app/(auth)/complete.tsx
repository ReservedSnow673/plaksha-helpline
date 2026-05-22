import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAuth } from '@/state/auth-provider';

export default function Complete() {
  const router = useRouter();
  const { token, email } = useLocalSearchParams<{ token?: string; email?: string }>();
  const { completeMagicLink } = useAuth();

  useEffect(() => {
    if (!token || !email) return;
    completeMagicLink(email, token)
      .then(() => router.replace('/(app)/home'))
      .catch(() => router.replace('/(auth)/sign-in'));
  }, [token, email, completeMagicLink, router]);

  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <ActivityIndicator color="#ffffff" />
      <Text className="mt-3 text-white">Signing you in…</Text>
    </View>
  );
}
