import { Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAuth } from '@/state/auth-provider';
import { config } from '@/lib/config';

const QUICK_DIAL = [
  { label: 'Campus Security', number: '+911762650770' },
  { label: 'Medical Centre', number: '+911762650772' },
  { label: 'Counselling', number: '+911762650773' },
];

export default function Home() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Text className="text-2xl font-semibold text-zinc-900">
          Hello{user?.firstName ? `, ${user.firstName}` : ''}
        </Text>
        <Text className="text-zinc-600">
          You are signed in to the Plaksha Universal Campus Helpline.
        </Text>

        <TouchableOpacity
          onPress={() => router.push('/(app)/sos')}
          className="mt-4 items-center rounded-2xl bg-accent px-6 py-6"
        >
          <Text className="text-base font-semibold uppercase text-white">Open SOS</Text>
          <Text className="mt-1 text-xs text-white/80">Tap for emergency report</Text>
        </TouchableOpacity>

        <View className="mt-4 gap-3">
          <Text className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Direct dial (works offline)
          </Text>
          {QUICK_DIAL.map((q) => (
            <TouchableOpacity
              key={q.number}
              onPress={() => Linking.openURL(`tel:${q.number}`)}
              className="flex-row items-center justify-between rounded-xl border border-zinc-200 px-4 py-3"
            >
              <Text className="text-base text-zinc-900">{q.label}</Text>
              <Text className="text-zinc-500">{q.number}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mt-6 rounded-xl bg-zinc-50 p-4">
          <Text className="text-xs text-zinc-600">
            For non-emergencies, raise an incident in-app so dispatchers can route it. For
            life-threatening emergencies, call directly.
          </Text>
          <Text className="mt-2 text-xs text-zinc-500">
            Connected to {config.apiBaseUrl}
          </Text>
        </View>

        <TouchableOpacity onPress={signOut} className="mt-8 items-center">
          <Text className="text-sm text-zinc-500 underline">Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
