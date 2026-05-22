import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/state/auth-provider';
import { config } from '@/lib/config';

export default function Settings() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Text className="text-2xl font-semibold text-zinc-900">Settings</Text>

        <View className="rounded-xl border border-zinc-200 p-4">
          <Text className="text-xs uppercase tracking-wider text-zinc-500">Signed in as</Text>
          <Text className="mt-1 text-base text-zinc-900">{user?.email}</Text>
          <Text className="text-xs text-zinc-500">{user?.role}</Text>
        </View>

        <View className="rounded-xl border border-zinc-200 p-4">
          <Text className="text-xs uppercase tracking-wider text-zinc-500">Environment</Text>
          <Text className="mt-1 text-sm text-zinc-700">{config.apiBaseUrl}</Text>
        </View>

        <TouchableOpacity
          onPress={signOut}
          className="mt-2 items-center rounded-md border border-zinc-300 py-3"
        >
          <Text className="font-semibold text-zinc-700">Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
