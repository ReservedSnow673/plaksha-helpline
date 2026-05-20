import type { Priority } from '@plaksha/shared-types';

import { Badge } from './badge';
import { cn } from './cn';

const COLOR: Record<Priority, string> = {
  P1: 'bg-rose-500/20 text-rose-200 border-rose-500/40',
  P2: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
  P3: 'bg-sky-500/20 text-sky-200 border-sky-500/40',
  P4: 'bg-zinc-500/20 text-zinc-200 border-zinc-500/40',
};

export function PriorityPill({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <Badge variant="outline" className={cn('border font-semibold', COLOR[priority], className)}>
      {priority}
    </Badge>
  );
}
