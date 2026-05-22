import { useEffect, useState } from 'react';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

import { apiFetch } from '@/lib/api';
import { useAuth } from '@/state/auth-provider';

interface Assignment {
  id: string;
  incidentId: string;
  publicCode: string;
  category: string;
  priority: string;
  status: string;
  latitude?: number;
  longitude?: number;
}

export default function Responder() {
  const { user } = useAuth();
  const [onDuty, setOnDuty] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const isResponder = user?.role === 'RESPONDER';

  async function refresh() {
    try {
      const data = await apiFetch<{ data: Assignment[] }>('/v1/me/assignments');
      setAssignments(data.data ?? []);
    } catch {
      setAssignments([]);
    }
  }

  useEffect(() => {
    if (isResponder) refresh();
  }, [isResponder]);

  async function toggleDuty(value: boolean) {
    setOnDuty(value);
    if (value) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location required', 'On-duty responders must share location.');
        setOnDuty(false);
        return;
      }
    }
    try {
      await apiFetch('/v1/responders/me/status', {
        method: 'POST',
        body: JSON.stringify({ status: value ? 'AVAILABLE' : 'OFFLINE' }),
      });
    } catch (err) {
      Alert.alert('Could not update', err instanceof Error ? err.message : 'Unknown error');
      setOnDuty(!value);
    }
  }

  async function respond(assignmentId: string, accept: boolean) {
    try {
      await apiFetch(`/v1/assignments/${assignmentId}/${accept ? 'accept' : 'reject'}`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      refresh();
    } catch (err) {
      Alert.alert('Action failed', err instanceof Error ? err.message : 'Unknown error');
    }
  }

  if (!isResponder) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-center text-base text-zinc-600">
          This tab is for responders only. If you should have responder access, contact your
          dispatcher.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Text className="text-2xl font-semibold text-zinc-900">On duty</Text>

        <View className="flex-row items-center justify-between rounded-xl border border-zinc-200 p-4">
          <View>
            <Text className="text-base font-semibold text-zinc-900">Available for dispatch</Text>
            <Text className="text-xs text-zinc-500">Location sharing is on while on duty.</Text>
          </View>
          <Switch value={onDuty} onValueChange={toggleDuty} />
        </View>

        <Text className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Active assignments
        </Text>
        {assignments.length === 0 && (
          <Text className="text-zinc-500">No active assignments right now.</Text>
        )}
        {assignments.map((a) => (
          <View key={a.id} className="rounded-xl border border-zinc-200 p-4">
            <Text className="font-mono text-xs uppercase tracking-wider text-zinc-500">
              {a.publicCode}
            </Text>
            <Text className="mt-1 text-base font-semibold text-zinc-900">
              {a.priority} · {a.category}
            </Text>
            <View className="mt-3 flex-row gap-2">
              {a.status === 'OFFERED' && (
                <>
                  <TouchableOpacity
                    onPress={() => respond(a.id, true)}
                    className="flex-1 items-center rounded-md bg-primary py-3"
                  >
                    <Text className="font-semibold text-white">Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => respond(a.id, false)}
                    className="flex-1 items-center rounded-md border border-zinc-300 py-3"
                  >
                    <Text className="font-semibold text-zinc-700">Reject</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
