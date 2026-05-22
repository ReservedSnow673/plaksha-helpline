'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { getApiBaseUrl } from '@/lib/api-config';

interface IncidentRow {
  id: string;
  publicCode: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

export function IncidentsTable() {
  const { token } = useAuth();
  const [items, setItems] = useState<IncidentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${getApiBaseUrl()}/v1/incidents?limit=50`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data: { items?: IncidentRow[] }) => setItems(data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-zinc-700">Code</th>
            <th className="px-4 py-2 text-left font-medium text-zinc-700">Category</th>
            <th className="px-4 py-2 text-left font-medium text-zinc-700">Priority</th>
            <th className="px-4 py-2 text-left font-medium text-zinc-700">Status</th>
            <th className="px-4 py-2 text-left font-medium text-zinc-700">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {loading && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                Loading…
              </td>
            </tr>
          )}
          {!loading && items.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                No incidents.
              </td>
            </tr>
          )}
          {items.map((row) => (
            <tr key={row.id} className="hover:bg-zinc-50">
              <td className="px-4 py-2 font-mono text-xs">{row.publicCode}</td>
              <td className="px-4 py-2">{row.category}</td>
              <td className="px-4 py-2">{row.priority}</td>
              <td className="px-4 py-2">{row.status}</td>
              <td className="px-4 py-2 text-zinc-500">{new Date(row.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
