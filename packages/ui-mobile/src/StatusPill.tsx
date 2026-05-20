import type { IncidentStatus } from '@plaksha/shared-types';
import { Text, View } from 'react-native';

const COLOR: Record<IncidentStatus, { bg: string; text: string }> = {
  CREATED: { bg: 'bg-amber-500/20', text: 'text-amber-200' },
  ACKNOWLEDGED: { bg: 'bg-blue-500/20', text: 'text-blue-200' },
  RESPONDER_ASSIGNED: { bg: 'bg-indigo-500/20', text: 'text-indigo-200' },
  EN_ROUTE: { bg: 'bg-cyan-500/20', text: 'text-cyan-200' },
  ARRIVED: { bg: 'bg-emerald-500/20', text: 'text-emerald-200' },
  RESOLVED: { bg: 'bg-green-500/20', text: 'text-green-200' },
  CLOSED: { bg: 'bg-zinc-500/20', text: 'text-zinc-200' },
  ARCHIVED: { bg: 'bg-zinc-700/30', text: 'text-zinc-400' },
  CANCELLED: { bg: 'bg-zinc-500/20', text: 'text-zinc-200' },
  FALSE_ALARM: { bg: 'bg-rose-500/20', text: 'text-rose-200' },
};

const LABEL: Record<IncidentStatus, string> = {
  CREATED: 'New',
  ACKNOWLEDGED: 'Acknowledged',
  RESPONDER_ASSIGNED: 'Assigned',
  EN_ROUTE: 'En route',
  ARRIVED: 'On scene',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  ARCHIVED: 'Archived',
  CANCELLED: 'Cancelled',
  FALSE_ALARM: 'False alarm',
};

export function StatusPill({ status }: { status: IncidentStatus }) {
  const c = COLOR[status];
  return (
    <View className={`self-start rounded-md px-2 py-1 ${c.bg}`}>
      <Text className={`text-xs font-medium ${c.text}`}>{LABEL[status]}</Text>
    </View>
  );
}
