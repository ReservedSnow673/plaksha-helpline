import type { IncidentStatus } from '@plaksha/shared-types';

import { Badge } from './badge';
import { cn } from './cn';

const STATUS_COLOR: Record<IncidentStatus, string> = {
  CREATED: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  ACKNOWLEDGED: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  RESPONDER_ASSIGNED: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  EN_ROUTE: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  ARRIVED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  RESOLVED: 'bg-green-500/15 text-green-300 border-green-500/30',
  CLOSED: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
  ARCHIVED: 'bg-zinc-700/30 text-zinc-400 border-zinc-700/40',
  CANCELLED: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
  FALSE_ALARM: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

const STATUS_LABEL: Record<IncidentStatus, string> = {
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

export function StatusPill({ status, className }: { status: IncidentStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn('border', STATUS_COLOR[status], className)}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
