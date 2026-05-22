import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiFetch } from '@/lib/api';

interface MyIncident {
  id: string;
  publicCode: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
}

export default function MyIncidents() {
  const [items, setItems] = useState<MyIncident[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRefreshing(true);
    try {
      const data = await apiFetch<{ items: MyIncident[] }>('/v1/incidents/mine?limit=50');
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-semibold text-zinc-900">My incidents</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        ItemSeparatorComponent={() => <View className="h-2" />}
        ListEmptyComponent={
          <Text className="text-zinc-500">You have not reported any incidents yet.</Text>
        }
        renderItem={({ item }) => (
          <View className="rounded-xl border border-zinc-200 p-4">
            <Text className="font-mono text-xs uppercase tracking-wider text-zinc-500">
              {item.publicCode}
            </Text>
            <Text className="mt-1 text-base font-semibold text-zinc-900">{item.category}</Text>
            <Text className="mt-1 text-xs text-zinc-600">
              {item.priority} · {item.status} · {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
