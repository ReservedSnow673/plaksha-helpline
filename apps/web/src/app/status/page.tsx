import { getApiBaseUrl } from '@/lib/api-config';

async function getStatus() {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/health/ready`, { cache: 'no-store' });
    return res.ok ? { ok: true, message: 'API responding' } : { ok: false, message: `API returned ${res.status}` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Network error' };
  }
}

export default async function StatusPage() {
  const status = await getStatus();
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">System status</h1>
      <div
        className={`mt-6 rounded-md border p-4 text-sm ${
          status.ok
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-red-200 bg-red-50 text-red-700'
        }`}
      >
        {status.ok ? '✓' : '⚠'} {status.message}
      </div>
    </main>
  );
}
