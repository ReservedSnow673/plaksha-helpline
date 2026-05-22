'use client';

import { useState } from 'react';

import { getApiBaseUrl } from '@/lib/api-config';

const INSTITUTIONAL_DOMAIN = 'plaksha.edu.in';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setError(null);
    if (!email.toLowerCase().endsWith(`@${INSTITUTIONAL_DOMAIN}`)) {
      setError(`Use your @${INSTITUTIONAL_DOMAIN} email to sign in.`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/v1/auth/magic-link/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, platform: 'WEB' }),
      });
      if (!res.ok) {
        const detail = await res.text();
        if (res.status === 503 || res.status === 502) {
          throw new Error(
            'API is unavailable. Ensure Docker, Postgres, Redis, and `pnpm dev` are running.',
          );
        }
        throw new Error(detail || `Sign-in failed (${res.status})`);
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Sign in</h1>
        <p className="text-sm text-zinc-600">
          Enter your <span className="font-medium">@{INSTITUTIONAL_DOMAIN}</span> email and we
          will send you a one-time sign-in link.
        </p>

        {sent ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Check your inbox. The link is valid for 15 minutes.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-zinc-700">
                Institutional email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`yourname@${INSTITUTIONAL_DOMAIN}`}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? 'Sending link…' : 'Send sign-in link'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
