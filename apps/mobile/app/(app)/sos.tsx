import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

import { useOfflineQueue } from '@/state/offline-queue';
import { generateIdempotencyKey } from '@/lib/idempotency';

const CATEGORIES = [
  { id: 'SECURITY', label: 'Security threat' },
  { id: 'MEDICAL', label: 'Medical emergency' },
  { id: 'FIRE', label: 'Fire / hazard' },
  { id: 'WOMEN_SAFETY', label: 'Women safety' },
  { id: 'MENTAL_HEALTH', label: 'Mental health' },
  { id: 'ESCORT', label: 'Safe walk / escort' },
  { id: 'MAINTENANCE', label: 'Maintenance' },
  { id: 'ADMIN_ESCALATION', label: 'Other / admin escalation' },
];

export default function Sos() {
  const { enqueue, pendingCount } = useOfflineQueue();
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(
    null,
  );
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      }).catch(() => null);
      if (pos) {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? undefined,
        });
      }
    })();
  }, []);

  async function report(category: string) {
    setSending(true);
    try {
      await enqueue({
        idempotencyKey: generateIdempotencyKey(),
        path: '/v1/incidents',
        method: 'POST',
        body: {
          category,
          channel: 'APP_SOS',
          language: 'en',
          lat: coords?.lat,
          lng: coords?.lng,
          locationAccuracyM: coords?.accuracy,
          anonymous: false,
        },
      });
      Alert.alert('Reported', 'Help is on the way. Stay safe.');
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
        <Text className="text-2xl font-semibold text-zinc-900">Report incident</Text>
        <Text className="text-sm text-zinc-600">
          Choose the closest category. Location {coords ? '✓ captured' : '… capturing'}
          {pendingCount > 0 ? ` · ${pendingCount} pending` : ''}
        </Text>

        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.id}
            disabled={sending}
            onPress={() => report(c.id)}
            className="flex-row items-center justify-between rounded-2xl bg-accent px-5 py-5"
          >
            <Text className="text-base font-semibold uppercase text-white">{c.label}</Text>
            <Text className="text-xs text-white/80">Tap to report</Text>
          </TouchableOpacity>
        ))}

        <View className="mt-4 rounded-xl bg-zinc-50 p-4">
          <Text className="text-xs text-zinc-600">
            If the app cannot reach the network, your report is saved and retried automatically.
            For life-threatening emergencies, dial the helpline directly from the Home tab.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
