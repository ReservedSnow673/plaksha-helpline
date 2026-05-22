'use client';

import { useEffect, useMemo, useState } from 'react';

import { useWebSocket } from '@/hooks/use-websocket';
import { useAuth } from '@/hooks/use-auth';
import { getApiBaseUrl } from '@/lib/api-config';
import { CampusMap } from './campus-map';

interface IncidentSummary {
  id: string;
  publicCode: string;
  title?: string | null;
  category: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
}

export function LiveBoard() {
  const { token } = useAuth();
  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'P1' | 'P2' | 'P3' | 'P4'>('ALL');

  const { events, connected } = useWebSocket({ token });

  useEffect(() => {
    fetch(`${getApiBaseUrl()}/v1/incidents?status=OPEN,ACK,EN_ROUTE,ON_SCENE`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data: { items?: IncidentSummary[] }) => setIncidents(data.items ?? []))
      .catch(() => setIncidents([]));
  }, [token]);

  useEffect(() => {
    for (const event of events) {
      if (event.type === 'INCIDENT_CREATED') {
        setIncidents((current) => [event.payload as IncidentSummary, ...current]);
      } else if (event.type === 'INCIDENT_STATUS_CHANGED') {
        setIncidents((current) =>
          current.map((i) =>
            i.id === (event.payload as { id: string }).id
              ? { ...i, status: (event.payload as { status: string }).status }
              : i,
          ),
        );
      }
    }
  }, [events]);

  const visible = useMemo(
    () => (filter === 'ALL' ? incidents : incidents.filter((i) => i.priority === filter)),
    [incidents, filter],
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <CampusMap incidents={visible} />
      </div>
      <aside className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4">
        <header className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-900">Active incidents</h2>
          <span
            className={`inline-flex h-2 w-2 rounded-full ${
              connected ? 'bg-emerald-500' : 'bg-zinc-300'
            }`}
            title={connected ? 'Connected' : 'Disconnected'}
          />
        </header>
        <div className="flex gap-1 text-xs">
          {(['ALL', 'P1', 'P2', 'P3', 'P4'] as const).map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => setFilter(opt)}
              className={`rounded-full px-2.5 py-1 ${
                filter === opt
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <ul className="space-y-2 overflow-y-auto pr-1">
          {visible.length === 0 && (
            <li className="rounded-md border border-dashed border-zinc-200 p-4 text-center text-sm text-zinc-500">
              No active incidents.
            </li>
          )}
          {visible.map((incident) => (
            <li
              key={incident.id}
              className="rounded-md border border-zinc-200 p-3 text-sm hover:border-zinc-300"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">
                  {incident.publicCode}
                </span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium">
                  {incident.priority} · {incident.status}
                </span>
              </div>
              <div className="mt-1 text-sm font-medium text-zinc-900">
                {incident.title ?? incident.category}
              </div>
              <div className="text-xs text-zinc-500">
                {new Date(incident.createdAt).toLocaleTimeString()}
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
