'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { getApiBaseUrl } from '@/lib/api-config';

const STORAGE_KEY = 'plaksha.auth.tokens';

function AuthCompleteInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setError('Missing token in callback URL.');
      return;
    }
    fetch(`${getApiBaseUrl()}/v1/auth/magic-link/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, platform: 'WEB' }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(
        (body: {
          data: {
            tokens: {
              accessToken: string;
              refreshToken: string;
              accessExpiresInSeconds: number;
            };
          };
        }) => {
          const expiresAt = new Date(
            Date.now() + body.data.tokens.accessExpiresInSeconds * 1000,
          ).toISOString();
          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              accessToken: body.data.tokens.accessToken,
              refreshToken: body.data.tokens.refreshToken,
              expiresAt,
            }),
          );
          router.replace('/dispatch');
        },
      )
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to sign in'));
  }, [params, router]);

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : (
        <div className="text-sm text-zinc-600">Signing you in…</div>
      )}
    </main>
  );
}

export default function AuthCompletePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center px-6 py-16 text-center">
          <div className="text-sm text-zinc-600">Signing you in…</div>
        </main>
      }
    >
      <AuthCompleteInner />
    </Suspense>
  );
}
